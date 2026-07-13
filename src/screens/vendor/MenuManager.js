import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert, Image, Modal, ScrollView, Switch } from 'react-native';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useCreateMenuItemMutation, useUpdateMenuItemMutation, useDeleteMenuItemMutation } from '../../store/api/vendorApi';
import { useGetMenuQuery } from '../../store/api/menuApi';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

export default function MenuManager() {
  const dispatch = useDispatch();
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true); // <-- Maps to your MongoDB schema
  
  // Edit State
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [isUploading, setIsUploading] = useState(false);

  const [createMenuItem, { isLoading: isCreating }] = useCreateMenuItemMutation();
  const [updateMenuItem, { isLoading: isUpdating }] = useUpdateMenuItemMutation();
  const [deleteMenuItem] = useDeleteMenuItemMutation();
  
  const { data: menuItems, isLoading: isMenuLoading, refetch } = useGetMenuQuery();

  // ADDED: Logout Confirmation
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out of the Kitchen Dashboard?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => dispatch(logout()) }
    ]);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5, 
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadToCloudinary = async (uri) => {
    if (!uri || uri.startsWith('http')) return uri; 
    
    setIsUploading(true);
    const data = new FormData();
    data.append('file', { uri: uri, type: 'image/jpeg', name: 'food_image.jpg' });
    data.append('upload_preset', 'cartza_mobile_upload'); 
    data.append('cloud_name', 'djsmhvy5u'); 

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/djsmhvy5u/image/upload', {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json', 'Content-Type': 'multipart/form-data' }
      });
      const cloudData = await res.json();
      setIsUploading(false);
      return cloudData.secure_url; 
    } catch (err) {
      setIsUploading(false);
      return 'https://via.placeholder.com/150';
    }
  };

  const clearForm = () => {
    setTitle('');
    setDescription('');
    setPrice('');
    setCategory('');
    setImageUri(null);
    setEditingId(null);
    setIsAvailable(true); // Reset toggle
  };

  const handleSave = async () => {
    if (!title || !price || !category) {
      Alert.alert('Error', 'Please fill in title, price, and category');
      return;
    }

    const uploadedImageUrl = await uploadToCloudinary(imageUri);
    // Pass isAvailable to the backend
    const payload = { title, description, price: Number(price), category, imageUrl: uploadedImageUrl, isAvailable };

    try {
      if (editingId) {
        await updateMenuItem({ id: editingId, ...payload }).unwrap();
        Alert.alert('Success', 'Item updated!');
        setEditModalVisible(false);
      } else {
        await createMenuItem(payload).unwrap();
        Alert.alert('Success', 'Item added to menu!');
      }
      clearForm();
      refetch(); 
    } catch (err) {
      Alert.alert('Error', 'Failed to save item');
    }
  };

  const openEditModal = (item) => {
    setEditingId(item._id);
    setTitle(item.title);
    setDescription(item.description || '');
    setPrice(item.price.toString());
    setCategory(item.category);
    setImageUri(item.imageUrl);
    setIsAvailable(item.isAvailable !== false); // Handle older items that might lack the field
    setEditModalVisible(true);
  };

  const handleDelete = (id) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to permanently remove this item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await deleteMenuItem(id).unwrap();
            refetch();
          } catch (err) {
            Alert.alert('Error', 'Failed to delete item.');
          }
      }}
    ]);
  };

  const renderForm = (isEditMode = false) => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
        ) : (
          <Text style={styles.imagePickerText}>📷 Tap to Pick Food Image</Text>
        )}
      </TouchableOpacity>

      <TextInput style={styles.input} placeholder="Food Title (e.g., Chicken Kottu)" value={title} onChangeText={setTitle} />
      <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TextInput style={[styles.input, { flex: 1, marginRight: 10 }]} placeholder="Price (LKR)" value={price} onChangeText={setPrice} keyboardType="numeric" />
        <TextInput style={[styles.input, { flex: 1 }]} placeholder="Category (e.g., Lunch)" value={category} onChangeText={setCategory} />
      </View>

      {/* ADDED: Out of Stock Toggle */}
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>{isAvailable ? '✅ Item is In Stock' : '❌ Mark as Out of Stock'}</Text>
        <Switch
          value={isAvailable}
          onValueChange={setIsAvailable}
          trackColor={{ false: "#e74c3c", true: "#2ecc71" }}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={isCreating || isUpdating || isUploading}>
        {isCreating || isUpdating || isUploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{isEditMode ? 'Save Changes' : 'Add to Menu'}</Text>
        )}
      </TouchableOpacity>
      
      {isEditMode && (
        <TouchableOpacity style={styles.cancelButton} onPress={() => { setEditModalVisible(false); clearForm(); }}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Menu 🍳</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Add New Menu Item</Text>
        {renderForm(false)}
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Current Menu</Text>
        {isMenuLoading ? <ActivityIndicator size="large" color="#ff6b6b" /> : (
          <FlatList
            data={menuItems}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View style={[styles.card, !item.isAvailable && { opacity: 0.6 }]}>
                <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/50' }} style={styles.smallThumb} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardPrice}>
                    LKR {item.price} {!item.isAvailable && <Text style={{color: '#e74c3c', fontSize: 12}}> (Out of stock)</Text>}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => openEditModal(item)} style={styles.iconBtn}>
                  <Ionicons name="pencil" size={22} color="#3498db" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.iconBtn}>
                  <Ionicons name="trash" size={22} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>

      <Modal visible={isEditModalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.sectionTitle}>Edit Menu Item</Text>
          {renderForm(true)}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  modalContainer: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  logoutText: { color: '#ff6b6b', fontWeight: 'bold', alignSelf: 'center' },
  formSection: { padding: 20, backgroundColor: '#fff', marginBottom: 10, maxHeight: '47%' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  input: { backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#dee2e6' },
  switchContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#dee2e6' },
  switchLabel: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  button: { backgroundColor: '#ff6b6b', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 5 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelButton: { padding: 15, alignItems: 'center', marginTop: 5 },
  cancelButtonText: { color: '#888', fontWeight: 'bold', fontSize: 16 },
  listContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  cardPrice: { color: '#28a745', marginTop: 4, fontWeight: 'bold' },
  imagePicker: { height: 120, backgroundColor: '#e9ecef', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 15, overflow: 'hidden' },
  imagePickerText: { color: '#6c757d', fontWeight: 'bold' },
  previewImage: { width: '100%', height: '100%' },
  smallThumb: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  iconBtn: { padding: 8, marginLeft: 5 }
});