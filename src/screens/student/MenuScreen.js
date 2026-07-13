import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image, RefreshControl, TextInput, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useGetMenuQuery } from '../../store/api/menuApi';
import { addToCart } from '../../store/slices/cartSlice';
import { logout } from '../../store/slices/authSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function MenuScreen({ navigation }) { 
  // Added pollingInterval to auto-sync menu changes every 5 seconds
  const { data: menuItems, isLoading, error, refetch } = useGetMenuQuery(undefined, {
    pollingInterval: 5000, 
  });
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart.items);
  const cartTotal = useSelector(state => state.cart.totalPrice);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => dispatch(logout()) }
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filteredMenu = menuItems?.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Campus Menu 🍔</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput} 
          placeholder="Search food or category..." 
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {isLoading && !refreshing && <ActivityIndicator size="large" color="#ff6b6b" style={{ marginTop: 50 }} />}

      {!isLoading && !error && (
        <FlatList
          data={filteredMenu}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ff6b6b" />}
          ListEmptyComponent={<Text style={styles.empty}>No matching food found.</Text>}
          renderItem={({ item }) => {
            const isOutOfStock = item.isAvailable === false; 

            return (
              <View style={[styles.card, isOutOfStock && styles.cardOutOfStock]}>
                <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }} style={[styles.itemImage, isOutOfStock && { opacity: 0.5 }]} />
                <View style={{ flex: 1, paddingLeft: 15 }}>
                  <Text style={styles.itemName}>{item.title}</Text>
                  <Text style={styles.itemCategory}>{item.category}</Text>
                  <Text style={styles.itemPrice}>LKR {item.price}</Text>
                  
                  {isOutOfStock ? (
                    <Text style={styles.outOfStockText}>Out of Stock</Text>
                  ) : (
                    <TouchableOpacity style={styles.addButton} onPress={() => dispatch(addToCart(item))}>
                      <Text style={styles.addText}>+ Add</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}

      {cartItems.length > 0 && (
        <View style={styles.cartBar}>
          <Text style={styles.cartText}>{cartItems.length} items | LKR {cartTotal}</Text>
          <TouchableOpacity style={styles.checkoutBtn} onPress={() => navigation.navigate('Cart')}>
            <Text style={styles.checkoutText}>View Cart</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold' },
  logout: { color: '#ff6b6b', fontWeight: 'bold', alignSelf: 'center' },
  searchContainer: { flexDirection: 'row', backgroundColor: '#fff', margin: 15, borderRadius: 10, paddingHorizontal: 15, alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16 },
  empty: { textAlign: 'center', marginTop: 40, color: '#6c757d', fontSize: 16 },
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, elevation: 2 },
  cardOutOfStock: { backgroundColor: '#f1f3f5', opacity: 0.8 },
  itemImage: { width: 100, height: 100, borderRadius: 10, backgroundColor: '#eee' },
  itemName: { fontSize: 18, fontWeight: 'bold' },
  itemCategory: { color: '#888', marginBottom: 5 },
  itemPrice: { fontSize: 16, color: '#28a745', fontWeight: 'bold', marginBottom: 10 },
  addButton: { backgroundColor: '#ff6b6b', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8, alignSelf: 'flex-start' },
  addText: { color: '#fff', fontWeight: 'bold' },
  outOfStockText: { color: '#e74c3c', fontWeight: 'bold', fontSize: 14, marginTop: 5 },
  cartBar: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#343a40', padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cartText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  checkoutBtn: { backgroundColor: '#28a745', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  checkoutText: { color: '#fff', fontWeight: 'bold' }
});