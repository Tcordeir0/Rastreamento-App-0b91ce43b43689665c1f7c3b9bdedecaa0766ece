import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { Truck, Briefcase } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';

const { width } = Dimensions.get('window');

export default function ProfileSelectionScreen() {
  const { colors, theme } = useTheme();
  
  // Animações
  const titleOpacity = useSharedValue(0);
  const cardsOpacity = useSharedValue(0);
  
  const titleAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: titleOpacity.value,
      transform: [{ translateY: (1 - titleOpacity.value) * 20 }],
    };
  });
  
  const cardsAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: cardsOpacity.value,
      transform: [{ translateY: (1 - cardsOpacity.value) * 30 }],
    };
  });
  
  // Iniciar animações quando o componente montar
  useEffect(() => {
    titleOpacity.value = withTiming(1, { duration: 800 });
    
    // Usando setTimeout para o efeito de delay
    const animationTimeout = setTimeout(() => {
      cardsOpacity.value = withTiming(1, { duration: 800 });
    }, 400);
    
    return () => clearTimeout(animationTimeout);
  }, []);
  
  const handleSelectProfile = async (profile: 'admin' | 'driver') => {
    // Salvar o perfil selecionado
    await AsyncStorage.setItem('@RastreioApp:userProfile', profile);
    
    // Navegar para a tela de cadastro específica conforme o perfil
    if (profile === 'admin') {
      router.replace('/onboarding/admin-signup');
    } else {
      router.replace('/onboarding/driver-signup');
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={titleAnimatedStyle}>
        <Text style={[styles.title, { color: colors.text }]}>Quem é você?</Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Selecione o seu perfil para continuar
        </Text>
      </Animated.View>
      
      <Animated.View style={[styles.cardsContainer, cardsAnimatedStyle]}>
        <TouchableOpacity 
          style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => handleSelectProfile('admin')}
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Briefcase size={48} color={colors.primary} />
          </View>
          <Text style={[styles.profileTitle, { color: colors.text }]}>
            Administrador
          </Text>
          <Text style={[styles.profileDescription, { color: colors.text }]}>
            Gerencie sua frota, motoristas e tenha acesso a todos os relatórios
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => handleSelectProfile('driver')}
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Truck size={48} color={colors.primary} />
          </View>
          <Text style={[styles.profileTitle, { color: colors.text }]}>
            Motorista
          </Text>
          <Text style={[styles.profileDescription, { color: colors.text }]}>
            Veja suas rotas, receba notificações de viagens e compartilhe sua localização
          </Text>
        </TouchableOpacity>
      </Animated.View>
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={[styles.backButtonText, { color: colors.primary }]}>
          Voltar
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
  cardsContainer: {
    width: '100%',
    paddingHorizontal: 10,
  },
  profileCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  profileDescription: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  backButton: {
    marginTop: 20,
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
  },
});
