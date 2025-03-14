import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Truck, Building2, Mail, Lock, User, Phone, ArrowLeft, CheckCircle2, MapPin } from 'lucide-react-native';
import { api } from '@/services/api';
import { Picker } from '@react-native-picker/picker';

// Lista de filiais da Borgno Transportes no Brasil
const FILIAIS = [
  { cidade: 'Goiânia', estado: 'GO' },
  { cidade: 'Caucaia', estado: 'CE' },
  { cidade: 'Uberaba', estado: 'MG' },
  { cidade: 'Porto Nacional', estado: 'TO' },
  { cidade: 'Dourados', estado: 'MS' },
  { cidade: 'Itajaí', estado: 'SC' },
  { cidade: 'Laranjeiras', estado: 'SE' },
  { cidade: 'Primavera do Leste', estado: 'MT' },
  { cidade: 'Imperatriz', estado: 'MA' }
];

export default function AdminSignupScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { login } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [invalidEmail, setInvalidEmail] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [unidade, setUnidade] = useState<'matriz' | 'filial' | ''>('');
  const [filial, setFilial] = useState('');
  const [phone, setPhone] = useState('');
  
  const validateAdminEmail = (email: string) => {
    return email.includes('@borgnotransportes.com.br');
  };
  
  const handleSignUp = async () => {
    setError('');
    setInvalidEmail(false);
    
    // Validação básica
    if (!name || !email || !password || !confirmPassword || !unidade || !phone) {
      setError('Todos os campos são obrigatórios');
      return;
    }
    
    // Verificar se o email contém @borgnotransportes.com.br
    if (!validateAdminEmail(email)) {
      setInvalidEmail(true);
      return;
    }
    
    // Se for filial, verificar se selecionou qual filial
    if (unidade === 'filial' && !filial) {
      setError('Por favor, selecione a filial');
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
      
      // Chamar API para registrar o admin
      const response = await api.registerAdmin({
        name,
        email,
        password,
        unidade,
        filial: unidade === 'filial' ? filial : undefined,
        phone
      });
      
      // Login automático após cadastro bem-sucedido
      await login(response.token, 'admin');
      
      // Redirecionar para o app principal
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro durante o cadastro');
    } finally {
      setLoading(false);
    }
  };
  
  const redirectToDriverSignup = () => {
    setInvalidEmail(false);
    router.replace('/onboarding/driver-signup');
  };
  
  const closeInvalidEmailDialog = () => {
    setInvalidEmail(false);
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
          <Building2 size={40} color={colors.primary} />
        </View>
      </View>
      
      <Text style={[styles.title, { color: colors.text }]}>Cadastro de Administrador</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Crie sua conta para gerenciar sua frota
      </Text>
      
      {error ? (
        <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        </View>
      ) : null}
      
      {invalidEmail ? (
        <View style={[styles.modalBackground, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalText, { color: colors.text }]}>
              Ops, parece que você está no lugar errado, deseja ir para registro de motoristas?
            </Text>
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={redirectToDriverSignup}
              >
                <Text style={styles.modalButtonText}>Sim</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.border }]}
                onPress={closeInvalidEmailDialog}
              >
                <Text style={styles.modalButtonText}>Não</Text>
              </TouchableOpacity>
            </View>
          </View>
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
        
        <Text style={[styles.fieldLabel, { color: colors.text }]}>Tipo de Unidade:</Text>
        <View style={styles.optionsContainer}>
          <Pressable
            style={[
              styles.optionButton,
              unidade === 'matriz' && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
            ]}
            onPress={() => setUnidade('matriz')}
          >
            <View style={styles.optionContent}>
              {unidade === 'matriz' && <CheckCircle2 size={20} color={colors.primary} style={styles.checkIcon} />}
              <Text style={[
                styles.optionText, 
                { color: unidade === 'matriz' ? colors.primary : colors.text }
              ]}>
                Matriz (Goiânia)
              </Text>
            </View>
          </Pressable>
          
          <Pressable
            style={[
              styles.optionButton,
              unidade === 'filial' && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
            ]}
            onPress={() => setUnidade('filial')}
          >
            <View style={styles.optionContent}>
              {unidade === 'filial' && <CheckCircle2 size={20} color={colors.primary} style={styles.checkIcon} />}
              <Text style={[
                styles.optionText, 
                { color: unidade === 'filial' ? colors.primary : colors.text }
              ]}>
                Filial
              </Text>
            </View>
          </Pressable>
        </View>
        
        {unidade === 'filial' && (
          <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
            <MapPin size={20} color={colors.textSecondary} style={{ marginLeft: 16 }} />
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={filial}
                onValueChange={(itemValue: string) => setFilial(itemValue)}
                style={[styles.picker, { color: colors.text }]}
                dropdownIconColor={colors.text}
              >
                <Picker.Item label="Selecione a filial" value="" color={colors.textSecondary} />
                {FILIAIS.map((item, index) => (
                  <Picker.Item 
                    key={index} 
                    label={`${item.cidade} - ${item.estado}`} 
                    value={`${item.cidade}-${item.estado}`}
                    color={colors.text}
                  />
                ))}
              </Picker>
            </View>
          </View>
        )}
        
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
        
        <TouchableOpacity
          style={[
            styles.signupButton,
            { backgroundColor: colors.primary },
            loading && { opacity: 0.7 }
          ]}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.signupButtonText}>Criar Conta</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.loginLink}
          onPress={() => router.push('/login')}
        >
          <Text style={{ color: colors.textSecondary }}>
            Já tem uma conta? <Text style={{ color: colors.primary, fontWeight: '500' }}>Entrar</Text>
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
    paddingBottom: 40,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
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
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  optionButton: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    marginRight: 8,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    height: 56,
  },
  pickerWrapper: {
    flex: 1,
    paddingLeft: 12,
  },
  picker: {
    height: 56,
    width: '100%',
  },
  signupButton: {
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  signupButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  errorContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
