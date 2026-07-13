import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useGetMyOrdersQuery, useCancelOrderMutation } from '../../store/api/orderApi';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';

export default function OrdersScreen() {
  const { data: orders, isLoading, refetch } = useGetMyOrdersQuery(undefined, { pollingInterval: 5000 });
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders?.filter(item => 
    item._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.status.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleWithdraw = (orderId) => {
    Alert.alert('Withdraw Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: async () => {
          try {
            // Unwraps the promise to check for errors returned by the updated server configuration
            await cancelOrder(orderId).unwrap();
            Alert.alert('Success', 'Your order was successfully withdrawn.');
            refetch();
          } catch (error) {
            Alert.alert('Error', error.data?.message || 'Could not withdraw order.');
          }
      }}
    ]);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return '#f39c12';
      case 'Preparing': return '#3498db';
      case 'Ready': return '#2ecc71';
      case 'Cancelled': return '#e74c3c';
      case 'Picked Up': return '#95a5a6';
      default: return '#95a5a6';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders 🧾</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput} 
          placeholder="Search by Order ID or Status..." 
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {isLoading ? <ActivityIndicator size="large" color="#ff6b6b" style={{ marginTop: 20 }} /> : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 15 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No orders found.</Text>}
          renderItem={({ item }) => (
            <View style={[styles.card, { borderLeftColor: getStatusColor(item.status), borderLeftWidth: 5 }, item.status === 'Cancelled' && { opacity: 0.6 }]}>
              <View style={styles.cardHeader}>
                <Text style={styles.orderId}>Order #{item._id.slice(-6).toUpperCase()}</Text>
                <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}>
                  <Text style={styles.badgeText}>{item.status}</Text>
                </View>
              </View>
              
              <View style={styles.itemsList}>
                {item.items.map((cartItem, index) => (
                  <Text key={index} style={styles.foodItem}>
                    {cartItem.quantity}x {cartItem.menuItem?.title || 'Item Unavailable'}
                  </Text>
                ))}
              </View>
              
              <View style={styles.footerRow}>
                <Text style={styles.totalText}>Total: LKR {item.totalPrice}</Text>
                
                {item.status === 'Pending' && (
                  <TouchableOpacity 
                    style={styles.withdrawBtn} 
                    onPress={() => handleWithdraw(item._id)}
                    disabled={isCancelling}
                  >
                    <Text style={styles.withdrawText}>Withdraw</Text>
                  </TouchableOpacity>
                )}
              </View>

              {item.status === 'Ready' && (
                <View style={styles.qrContainer}>
                  <Text style={styles.qrText}>Scan at counter to pickup!</Text>
                  <QRCode value={item._id} size={150} color="#333" backgroundColor="#fff" />
                </View>
              )}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  searchContainer: { flexDirection: 'row', backgroundColor: '#fff', margin: 15, borderRadius: 10, paddingHorizontal: 15, alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16 },
  emptyText: { fontSize: 16, color: '#888', textAlign: 'center', marginTop: 20 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 15, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  orderId: { fontSize: 16, fontWeight: 'bold', color: '#666' },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  itemsList: { marginBottom: 15 },
  foodItem: { fontSize: 16, color: '#444', marginBottom: 5 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: '#eee', paddingTop: 10 },
  totalText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  withdrawBtn: { paddingHorizontal: 15, paddingVertical: 8, backgroundColor: '#ffe3e3', borderRadius: 8 },
  withdrawText: { color: '#e74c3c', fontWeight: 'bold', fontSize: 14 },
  qrContainer: { alignItems: 'center', marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderColor: '#eee' },
  qrText: { color: '#2ecc71', fontWeight: 'bold', marginBottom: 10 }
});