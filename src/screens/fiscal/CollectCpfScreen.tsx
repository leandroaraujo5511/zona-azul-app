import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import Ionicons from '@expo/vector-icons/Ionicons';
import { userService, UserByCpf } from '../../services/user.service';
import FiscalHeader from '../../components/fiscal/FiscalHeader';
import CpfInput from '../../components/fiscal/CpfInput';

type FiscalStackParamList = {
  CollectCpf: { plate?: string } | undefined;
  CreateAvulsoParkingPix: { plate: string; cpf: string; user?: UserByCpf | null } | undefined;
};

type CollectCpfNavigationProp = NativeStackNavigationProp<FiscalStackParamList, 'CollectCpf'>;

export default function CollectCpfScreen() {
  const navigation = useNavigation<CollectCpfNavigationProp>();
  const route = useRoute();
  const params = route.params as { plate?: string } | undefined;

  const [cpf, setCpf] = useState('');

  // Validate CPF format (11 digits)
  const isValidCpf = cpf.replace(/[^0-9]/g, '').length === 11;

  // Search user by CPF
  const [searchedCpf, setSearchedCpf] = useState<string>('');
  const { data: user, isLoading: isLoadingUser, isError, error } = useQuery({
    queryKey: ['userByCpf', searchedCpf],
    queryFn: () => userService.getUserByCpf(searchedCpf),
    enabled: !!searchedCpf && searchedCpf.replace(/[^0-9]/g, '').length === 11,
    retry: false,
  });

  const handleContinue = () => {
    if (!cpf.trim()) {
      Alert.alert('Erro', 'Por favor, informe o CPF');
      return;
    }

    if (!isValidCpf) {
      Alert.alert('Erro', 'CPF inválido. Deve conter 11 dígitos');
      return;
    }

    // Navigate to next screen with CPF and user data (if found)
    navigation.navigate('CreateAvulsoParkingPix', {
      plate: params?.plate || '',
      cpf: cpf.replace(/[^0-9]/g, ''),
      user: user || null,
    });
  };

  const handleSearchUser = () => {
    if (!cpf.trim()) {
      Alert.alert('Erro', 'Por favor, informe o CPF');
      return;
    }

    if (!isValidCpf) {
      Alert.alert('Erro', 'CPF inválido. Deve conter 11 dígitos');
      return;
    }

    // Trigger search by updating searchedCpf
    setSearchedCpf(cpf.replace(/[^0-9]/g, ''));
  };

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#1a1a1a"
        translucent={true}
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <FiscalHeader
            title="Informar CPF"
            showBackButton
            onBackPress={() => navigation.goBack()}
          />

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.description}>
              Informe o CPF do usuário que irá pagar o estacionamento via PIX
            </Text>

            {/* CPF Input */}
            <CpfInput
              value={cpf}
              onChangeText={setCpf}
              label="CPF *"
              placeholder="000.000.000-00"
              autoFocus
            />

            {/* Search User Button */}
            <TouchableOpacity
              style={[styles.searchButton, (!isValidCpf || isLoadingUser) && styles.searchButtonDisabled]}
              onPress={handleSearchUser}
              disabled={!isValidCpf || isLoadingUser}
            >
              {isLoadingUser ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="search-outline" size={20} color="#fff" />
                  <Text style={styles.searchButtonText}>Buscar Usuário</Text>
                </>
              )}
            </TouchableOpacity>

            {/* User Found Display */}
            {user && user.id && user.name && user.email && (
              <View style={styles.userCard}>
                <View style={styles.userCardHeader}>
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  <Text style={styles.userCardTitle}>Usuário Encontrado</Text>
                </View>
                <View style={styles.userCardContent}>
                  <Text style={styles.userCardLabel}>Nome:</Text>
                  <Text style={styles.userCardValue}>{user.name}</Text>
                  <Text style={styles.userCardLabel}>E-mail:</Text>
                  <Text style={styles.userCardValue}>{user.email}</Text>
                  {user.phone && (
                    <>
                      <Text style={styles.userCardLabel}>Telefone:</Text>
                      <Text style={styles.userCardValue}>{user.phone}</Text>
                    </>
                  )}
                </View>
              </View>
            )}

            {/* User Not Found Message */}
            {searchedCpf && 
             searchedCpf.replace(/[^0-9]/g, '').length === 11 && 
             !isLoadingUser && 
             !user && 
             !isError && (
              <View style={styles.infoCard}>
                <Ionicons name="information-circle-outline" size={24} color="#2196F3" />
                <Text style={styles.infoText}>
                  Usuário não encontrado. O pagamento será vinculado ao fiscal.
                </Text>
              </View>
            )}

            {/* Error Message */}
            {isError && error && (
              <View style={styles.errorCard}>
                <Ionicons name="alert-circle-outline" size={24} color="#f44336" />
                <Text style={styles.errorText}>
                  Erro ao buscar usuário. Tente novamente.
                </Text>
              </View>
            )}

            {/* Continue Button */}
            <TouchableOpacity
              style={[styles.button, (!isValidCpf) && styles.buttonDisabled]}
              onPress={handleContinue}
              disabled={!isValidCpf}
            >
              <Ionicons name="arrow-forward" size={20} color="#fff" />
              <Text style={styles.buttonText}>Continuar</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',

  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  searchButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  userCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  userCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  userCardContent: {
    gap: 4,
  },
  userCardLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginTop: 8,
  },
  userCardValue: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#f44336',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

