import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import { useLoginMutation } from '../../store/api/authApi';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async () => {
    try {
      const response = await login({ email, password }).unwrap();
      
      // 1. PRINT THE RESPONSE TO YOUR LAPTOP TERMINAL
      console.log("🔥 RAW BACKEND RESPONSE:", response);

      // 2. FOOLPROOF EXTRACTION (Handles different backend structures)
      const token = response.token || response.accessToken || response.data?.token;
      const user = response.user || response.data?.user || response;

      if (!token) {
         Alert.alert('Auth Error', 'Server did not return a token!');
         return;
      }

      // 3. SAVE TO REDUX
      dispatch(setCredentials({ user, token }));
      
    } catch (err) {
      console.log("Login Error:", err);
      Alert.alert('Login Failed', err.data?.message || 'Invalid credentials');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>CartZA 🍔</Text>
        <Text style={styles.subtitle}>Skip the queue. Order ahead.</Text>

        <TextInput
          style={styles.input}
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#999"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#999"
        />

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log In</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.signupContainer} onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.signupText}>Don't have an account? <Text style={styles.signupHighlight}>Sign up</Text></Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  formContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  title: { fontSize: 42, fontWeight: '900', color: '#ff6b6b', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#6c757d', textAlign: 'center', marginBottom: 40 },
  input: { backgroundColor: '#f4f6f8', padding: 18, borderRadius: 12, marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: '#e1e4e8' },
  forgotPasswordContainer: { alignSelf: 'flex-end', marginBottom: 25 },
  forgotPasswordText: { color: '#ff6b6b', fontWeight: 'bold' },
  button: { backgroundColor: '#ff6b6b', padding: 18, borderRadius: 12, alignItems: 'center', shadowColor: '#ff6b6b', shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  signupContainer: { alignItems: 'center', marginTop: 30 },
  signupText: { fontSize: 15, color: '#666' },
  signupHighlight: { color: '#ff6b6b', fontWeight: 'bold' }
});