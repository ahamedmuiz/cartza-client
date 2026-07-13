import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { useForgotPasswordMutation } from '../../store/api/authApi';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleReset = async () => {
    if (!email) {
      Alert.alert('Email Required', 'Please enter your registered email address.');
      return;
    }

    try {
      await forgotPassword({ email }).unwrap();
      Alert.alert('Link Sent!', 'Check your email for password reset instructions.');
      navigation.navigate('Login');
    } catch (err) {
      Alert.alert('Request Failed', err.data?.message || 'Something went wrong.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>

        <View style={styles.iconContainer}>
          <Ionicons name="lock-closed" size={80} color="#ff6b6b" />
        </View>

        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Enter your email address and we will send you instructions to reset your password.</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#999"
        />

        <TouchableOpacity style={styles.primaryButton} onPress={handleReset} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Send Reset Link</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  content: { flex: 1, padding: 25, justifyContent: 'center' },
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  iconContainer: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 15 },
  subtitle: { fontSize: 16, color: '#6c757d', textAlign: 'center', marginBottom: 40, lineHeight: 24, paddingHorizontal: 10 },
  input: { backgroundColor: '#f4f6f8', padding: 18, borderRadius: 12, marginBottom: 25, fontSize: 16, color: '#333', borderWidth: 1, borderColor: '#e1e4e8' },
  primaryButton: { backgroundColor: '#333', padding: 18, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  primaryButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});