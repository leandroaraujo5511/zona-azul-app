import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { avulsoParkingService } from '../../services/avulsoParking.service';
import FiscalHeader from '../../components/fiscal/FiscalHeader';
import PlateInput from '../../components/fiscal/PlateInput';
import UserCard from '../../components/fiscal/UserCard';

type FiscalStackParamList = {
  SelectUser: { plate?: string } | undefined;
  CreateAvulsoParking: { plate: string; userId: string; user: any } | undefined;
};

type SelectUserNavigationProp = NativeStackNavigationProp<
  FiscalStackParamList,
  'SelectUser'
>;

export default function SelectUserScreen() {
  const navigation = useNavigation<SelectUserNavigationProp>();
  const route = useRoute();
  const params = route.params as { plate?: string } | undefined;

  const [plate, setPlate] = useState(params?.plate || '');
  const [searchPlate, setSearchPlate] = useState(params?.plate || '');

  const {
    data: users,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['users-by-plate', searchPlate],
    queryFn: () => avulsoParkingService.getUsersByPlate(searchPlate),
    enabled: false, // Only fetch when manually triggered
    retry: false,
  });

  const handleSearch = () => {
    const normalized = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (normalized.length < 7) {
      Alert.alert('Erro', 'Por favor, informe uma placa válida');
      return;
    }
    setSearchPlate(normalized);
    refetch();
  };

  useEffect(() => {
    if (searchPlate.length >= 7) {
      refetch();
    }
  }, [searchPlate]);

  const handleSelectUser = (user: any) => {
    const userId = user.userId;
    
    if (user.balance <= 0) {
      Alert.alert(
        'Saldo Insuficiente',
        'Este usuário não possui saldo disponível. Deseja continuar mesmo assim?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Continuar',
            onPress: () => {
              navigation.navigate('CreateAvulsoParking', {
                plate: searchPlate,
                userId,
                user,
              });
            },
          },
        ]
      );
      return;
    }

    navigation.navigate('CreateAvulsoParking', {
      plate: searchPlate,
      userId,
      user,
    });
  };

  const renderUser = ({ item }: { item: any }) => (
    <UserCard user={item} onSelect={() => handleSelectUser(item)} />
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.emptyText}>Buscando usuários...</Text>
        </View>
      );
    }

    if (searchPlate) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum usuário encontrado</Text>
          <Text style={styles.emptySubtext}>
            Não há usuários cadastrados com esta placa
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Digite uma placa para buscar usuários</Text>
      </View>
    );
  };

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#1a1a1a"
        translucent={true}
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <FiscalHeader
          title="Selecionar Usuário"
          showBackButton
          onBackPress={() => navigation.goBack()}
        />

        <View style={styles.container}>
          {/* Search Section */}
          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <View style={styles.inputContainer}>
                <PlateInput
                  value={plate}
                  onChangeText={setPlate}
                  label="Placa do Veículo"
                  editable={!isLoading}
                />
              </View>
              <TouchableOpacity
                style={[styles.searchButton, isLoading && styles.searchButtonDisabled]}
                onPress={handleSearch}
                disabled={isLoading || !plate.trim()}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Ionicons name="search" size={24} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Users List */}
          <FlatList
            data={users || []}
            renderItem={renderUser}
            keyExtractor={(item, index) => item.userId || `user-${index}`}
            contentContainerStyle={
              (!users || users.length === 0) && styles.listContent
            }
            ListEmptyComponent={renderEmpty}
          />
        </View>
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
  searchSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
  },
  searchButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    width: 56,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  listContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

