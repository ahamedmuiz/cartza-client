import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { logout } from '../store/slices/authSlice';
import LoginScreen from '../screens/auth/LoginScreen';
import MenuScreen from '../screens/student/MenuScreen';
import KitchenQueue from '../screens/vendor/MenuManager';
import StudentTabs from './StudentTabs';
import VendorTabs from './VendorTabs';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import SignupScreen from '../screens/auth/SignupScreen';


const Stack = createNativeStackNavigator();


export default function AppNavigator() {
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        // Auth Stack
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      ) : role === 'vendor' ? (
        <Stack.Screen name="VendorHome" component={VendorTabs} />
      ) : (
        <Stack.Screen name="StudentHome" component={StudentTabs} />
      )}
    </Stack.Navigator>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  logoutBtn: { backgroundColor: '#343a40', padding: 10, borderRadius: 8, marginTop: 20 },
  logoutText: { color: '#fff', fontWeight: 'bold' }
});