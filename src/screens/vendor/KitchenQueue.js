import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { useGetVendorOrdersQuery, useUpdateOrderStatusMutation } from '../../store/api/vendorApi';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function KitchenQueue() {
  const { data: orders, isLoading, refetch } = useGetVendorOrdersQuery(undefined, { pollingInterval: 5000 });
  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [permission, requestPermission] = useCameraPermissions();
  const [isScannerVisible, setScannerVisible] = useState(false);
  const [scanned, setScanned] = useState(false);

  // OPTIMIZATION: Hide Picked Up and Cancelled orders from the live queue!
  const activeOrders = orders?.filter(o => o.status !== 'Picked Up' && o.status !== 'Cancelled') || [];

  const filteredOrders = activeOrders.filter(item => 
    item._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStatusChange = (orderId, newStatus) => {
    Alert.alert('Confirm Action', `Mark order as ${newStatus}?`, [
      { text: 'No', style: 'cancel' },
      { text: 'Yes', onPress: async () => {
          try {
            await updateOrderStatus({ id: orderId, status: newStatus }).unwrap();
            refetch();
          } catch (error) {
            Alert.alert('Error', 'Could not update order status.');
          }
      }}
    ]);
  };

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setScannerVisible(false);
    
    const matchedOrder = orders?.find(o => o._id === data && o.status === 'Ready');
    
    if (matchedOrder) {
      handleStatusChange(data, 'Picked Up');
    } else {
      Alert.alert('Invalid QR', 'This order was not found or is not Ready for pickup.');
      setTimeout(() => setScanned(false), 2000);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return '#f39c12';
      case 'Preparing': return '#3498db';
      case 'Ready': return '#2ecc71';
      default: return '#95a5a6';
    }
  };

  if (isLoading) return <ActivityIndicator size="large" color="#ff6b6b" style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live Orders 🔥</Text>
        <TouchableOpacity style={styles.scanBtn} onPress={() => {
          if (!permission?.granted) requestPermission();
          setScanned(false);
          setScannerVisible(true);
        }}>
          <Ionicons name="qr-code-outline" size={20} color="#fff" />
          <Text style={styles.scanText}>Scan Pickup</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput} 
          placeholder="Search by ID or Status..." 
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 15 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: '#888' }}>Queue is empty!</Text>}
        renderItem={({ item }) => (
          <View style={[styles.ticket, { borderTopColor: getStatusColor(item.status) }]}>
            <View style={styles.ticketHeader}>
              <Text style={styles.studentName}>Order #{item._id.slice(-6).toUpperCase()}</Text>
              <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.badgeText}>{item.status}</Text>
              </View>
            </View>

            <View style={styles.itemsList}>
              {item.items.map((cartItem, index) => (
                <Text key={index} style={styles.foodItem}>
                  • {cartItem.quantity}x {cartItem.menuItem?.title || 'Item Unavailable'}
                </Text>
              ))}
            </View>

            <View style={styles.ticketFooter}>
              <Text style={styles.totalText}>LKR {item.totalPrice}</Text>
              <View style={{ flexDirection: 'row' }}>
                {item.status === 'Pending' && (
                  <>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => handleStatusChange(item._id, 'Cancelled')}>
                      <Text style={styles.btnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#3498db' }]} onPress={() => handleStatusChange(item._id, 'Preparing')}>
                      <Text style={styles.btnText}>Accept</Text>
                    </TouchableOpacity>
                  </>
                )}
                {item.status === 'Preparing' && (
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#2ecc71' }]} onPress={() => handleStatusChange(item._id, 'Ready')}>
                    <Text style={styles.btnText}>Mark Ready</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}
      />

      {/* FIXED CAMERA MODAL (Padding added for status bar clearance) */}
      <Modal visible={isScannerVisible} animationType="slide">
        <View style={{ flex: 1, backgroundColor: '#000', paddingTop: 50 }}>
          <View style={styles.scannerHeader}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Scan Student QR</Text>
            <TouchableOpacity onPress={() => setScannerVisible(false)} style={{ padding: 10 }}>
              <Text style={{ color: '#ff6b6b', fontWeight: 'bold', fontSize: 18 }}>Close</Text>
            </TouchableOpacity>
          </View>
          <CameraView 
            style={{ flex: 1 }} 
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  scanBtn: { flexDirection: 'row', backgroundColor: '#333', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  scanText: { color: '#fff', marginLeft: 5, fontWeight: 'bold' },
  searchContainer: { flexDirection: 'row', backgroundColor: '#fff', margin: 15, borderRadius: 10, paddingHorizontal: 15, alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16 },
  ticket: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 15, borderTopWidth: 5, elevation: 4 },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  studentName: { fontSize: 16, fontWeight: 'bold' },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15 },
  badgeText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  itemsList: { marginBottom: 15, backgroundColor: '#f8f9fa', padding: 10, borderRadius: 8 },
  foodItem: { fontSize: 16, color: '#444', marginBottom: 5 },
  ticketFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: '#eee', paddingTop: 15 },
  totalText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  cancelBtn: { backgroundColor: '#e74c3c', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8, marginRight: 10 },
  actionBtn: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  scannerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 15, backgroundColor: '#000' }
});