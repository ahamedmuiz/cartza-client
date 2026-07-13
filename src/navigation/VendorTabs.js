import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import KitchenQueue from '../screens/vendor/KitchenQueue';
import MenuManager from '../screens/vendor/MenuManager';

const Tab = createBottomTabNavigator();

export default function VendorTabs() {
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
          if (route.name === 'Queue') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Manage Menu') {
            iconName = focused ? 'create' : 'create-outline';
          }
          return <Ionicons name={iconName} size={28} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Queue" component={KitchenQueue} />
      <Tab.Screen name="Manage Menu" component={MenuManager} />
    </Tab.Navigator>
  );
}