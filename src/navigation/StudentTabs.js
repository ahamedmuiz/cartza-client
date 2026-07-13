import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import MenuScreen from '../screens/student/MenuScreen';
import CartScreen from '../screens/student/CartScreen';
import OrdersScreen from '../screens/student/OrdersScreen'; // <-- IMPORT NEW SCREEN

const Tab = createBottomTabNavigator();

export default function StudentTabs() {
  const cartItemsCount = useSelector((state) => state.cart.items.reduce((total, item) => total + item.quantity, 0));

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#ff6b6b',
        tabBarInactiveTintColor: '#a1a1aa',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          elevation: 10,
          height: 65,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Menu') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'receipt' : 'receipt-outline'; // <-- NEW ICON
          }
          return <Ionicons name={iconName} size={28} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Menu" component={MenuScreen} />
      <Tab.Screen 
        name="Cart" 
        component={CartScreen} 
        options={{
          tabBarBadge: cartItemsCount > 0 ? cartItemsCount : null,
          tabBarBadgeStyle: { backgroundColor: '#ff6b6b', color: '#fff' }
        }} 
      />
      {/* ADD THE NEW ORDERS TAB HERE */}
      <Tab.Screen name="Orders" component={OrdersScreen} />
    </Tab.Navigator>
  );
}