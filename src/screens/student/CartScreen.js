import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, clearCart } from '../../store/slices/cartSlice';
import { useCreateOrderMutation } from '../../store/api/orderApi';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function CartScreen({ navigation }) {
  const cartItems = useSelector((state) => state.cart.items);
  const totalPrice = useSelector((state) => state.cart.totalPrice);
  const dispatch = useDispatch();
  
  const [createOrder, { isLoading }] = useCreateOrderMutation();

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add some items to your cart first.');
      return;
    }

    // SAFEGUARD: Ensure we grab the ID correctly and default quantity to 1
    const orderPayload = {
      items: cartItems.map(item => ({
        menuItem: item._id || item.id, 
        quantity: item.quantity || 1
      })),
      totalPrice: totalPrice
    };

    try {
      await createOrder(orderPayload).unwrap();
      
      dispatch(clearCart());
      Alert.alert('Success!', 'Your order has been sent to the kitchen.');
      navigation.navigate('Orders'); 
      
    } catch (error) {
      console.log("🔥 Checkout Error:", JSON.stringify(error, null, 2));
      Alert.alert('Checkout Failed', error.data?.message || 'Could not place order. Please try again.');
    }
  };

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={100} color="#ccc" />
        <Text style={styles.emptyText}>Your cart is empty.</Text>
        <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('Menu')}>
          <Text style={styles.browseText}>Browse Menu</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Cart 🛒</Text>
        <TouchableOpacity onPress={() => dispatch(clearCart())}>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={cartItems}
        // SAFEGUARD: Fallback to index if ID is somehow still missing to prevent React crashes
        keyExtractor={(item, index) => item._id ? item._id.toString() : index.toString()}
        contentContainerStyle={{ padding: 15 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.title || 'Unknown Item'}</Text>
              <Text style={styles.itemPrice}>LKR {item.price || 0} x {item.quantity || 1}</Text>
            </View>
            <View style={styles.itemTotal}>
              <Text style={styles.totalPrice}>LKR {(item.price || 0) * (item.quantity || 1)}</Text>
              <TouchableOpacity onPress={() => dispatch(removeFromCart(item._id || item.id))} style={styles.removeBtn}>
                <Ionicons name="trash-outline" size={20} color="#e74c3c" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total to Pay:</Text>
          <Text style={styles.totalAmount}>LKR {totalPrice}</Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.checkoutBtn, isLoading && { opacity: 0.7 }]} 
          onPress={handleCheckout} 
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.checkoutText}>Slide to Checkout 🚀</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  clearText: { color: '#e74c3c', fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f6f8' },
  emptyText: { fontSize: 18, color: '#888', marginTop: 20, marginBottom: 20 },
  browseBtn: { backgroundColor: '#ff6b6b', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  browseText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  card: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
  itemInfo: { flex: 2 },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  itemPrice: { fontSize: 14, color: '#666' },
  itemTotal: { flex: 1, alignItems: 'flex-end', justifyContent: 'space-between' },
  totalPrice: { fontSize: 16, fontWeight: 'bold', color: '#28a745' },
  removeBtn: { padding: 5, marginTop: 5 },
  footer: { backgroundColor: '#fff', padding: 20, borderTopWidth: 1, borderColor: '#eee' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  totalLabel: { fontSize: 18, color: '#666' },
  totalAmount: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  checkoutBtn: { backgroundColor: '#333', paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
  checkoutText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});