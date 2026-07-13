import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRegisterMutation } from '../../store/api/authApi';
import { Ionicons } from '@expo/vector-icons';

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [register, { isLoading }] = useRegisterMutation();

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Missing Fields', 'Please fill in all details.');
      return;
    }

    try {
      await register({ name, email, password, role: 'student' }).unwrap();
      Alert.alert('Success!', 'Your account has been created. Please log in.');
      navigation.navigate('Login');
    } catch (err) {
      Alert.alert('Registration Failed', err.data?.message || 'Could not create account.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>

        <View style={styles.headerContainer}>
          <Text style={styles.title}>Join CartZA 🎉</Text>
          <Text style={styles.subtitle}>Create your student account to order ahead.</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            placeholder="Student Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            placeholder="Create Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#999"
          />

          <TouchableOpacity style={styles.primaryButton} onPress={handleSignup} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Sign Up</Text>}
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.footerLink} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.footerText}>Already have an account? <Text style={styles.linkHighlight}>Log in</Text></Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  content: { flex: 1, padding: 25, justifyContent: 'center' },
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  headerContainer: { marginBottom: 40, marginTop: 20 },
  title: { fontSize: 36, fontWeight: '800', color: '#ff6b6b', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#6c757d', lineHeight: 22 },
  form: { marginBottom: 30 },
  input: { backgroundColor: '#f4f6f8', padding: 18, borderRadius: 12, marginBottom: 15, fontSize: 16, color: '#333', borderWidth: 1, borderColor: '#e1e4e8' },
  primaryButton: { backgroundColor: '#ff6b6b', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10, shadowColor: '#ff6b6b', shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  primaryButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  footerLink: { alignItems: 'center', marginTop: 10 },
  footerText: { fontSize: 15, color: '#666' },
  linkHighlight: { color: '#ff6b6b', fontWeight: 'bold' }
});