import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Truck, Mail, Lock, User, Phone, ArrowLeft, Calendar, Home } from 'lucide-react-native';
import { api } from '@/services/api';

export default function DriverSignupScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { login } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [license, setLicense] = useState('');
  const [licenseDueDate, setLicenseDueDate] = useState('');
  const [address, setAddress] = useState('');
  
  const handleSignUp = async () => {
    setError('');
    
    // Validação básica
    if (!name || !email || !password || !confirmPassword || !phone || !license) {
      setError('Os campos nome, email, senha, telefone e CNH são obrigatórios');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    try {
      setLoading(true);
      
      // Chamar API para registrar o motorista
      const response = await api.registerDriver({
        name,
        email,
        password,
        phone,
        license,
        licenseDueDate,
        address
      });
      
      // Login automático após cadastro bem-sucedido
      await login(response.token, 'driver');
      
      // Redirecionar para o app principal
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro durante o cadastro');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <ArrowLeft size={24} color={colors.text} />
      </TouchableOpacity>
      
      <View style={styles.iconContainer}>
        <View style={[styles.iconBackground, { backgroundColor: colors.primary + '20' }]}>
          <Truck size={40} color={colors.primary} />
        </View>
      </View>
      
      <Text style={[styles.title, { color: colors.text }]}>Cadastro de Motorista</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Crie sua conta para utilizar o aplicativo
      </Text>
      
      {error ? (
        <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        </View>
      ) : null}
      
      <View style={styles.form}>
        <View style={[styles.inputContainer, { borderColor: colors.border }]}>
          <User size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Nome completo"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>
        
        <View style={[styles.inputContainer, { borderColor: colors.border }]}>
          <Mail size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Email"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        <View style={[styles.inputContainer, { borderColor: colors.border }]}>
          <Lock size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Senha"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        
        <View style={[styles.inputContainer, { borderColor: colors.border }]}>
          <Lock size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Confirmar senha"
            placeholderTextColor={colors.textSecondary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>
        
        <View style={[styles.inputContainer, { borderColor: colors.border }]}>
          <Phone size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Telefone"
            placeholderTextColor={colors.textSecondary}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>
        
        <View style={[styles.inputContainer, { borderColor: colors.border }]}>
          <Truck size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Número da CNH"
            placeholderTextColor={colors.textSecondary}
            value={license}
            onChangeText={setLicense}
          />
        </View>
        
        <View style={[styles.inputContainer, { borderColor: colors.border }]}>
          <Calendar size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Validade da CNH (DD/MM/AAAA)"
            placeholderTextColor={colors.textSecondary}
            value={licenseDueDate}
            onChangeText={setLicenseDueDate}
            keyboardType="numeric"
          />
        </View>
        
        <View style={[styles.inputContainer, { borderColor: colors.border }]}>
          <Home size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Endereço (opcional)"
            placeholderTextColor={colors.textSecondary}
            value={address}
            onChangeText={setAddress}
          />
        </View>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Cadastrar</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => router.replace('/login')}
        >
          <Text style={[styles.loginLinkText, { color: colors.textSecondary }]}>
            Já tem uma conta? <Text style={{ color: colors.primary }}>Entrar</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    paddingLeft: 12,
    fontSize: 16,
  },
  button: {
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 14,
  },
  errorContainer: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
  },
});
