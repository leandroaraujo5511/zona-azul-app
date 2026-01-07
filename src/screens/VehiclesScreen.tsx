import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleService } from '../services/vehicle.service';
import { Vehicle } from '../types/api';
import ScreenHeader from '../components/ScreenHeader';

type RootStackParamList = {
  Vehicles: undefined;
  VehicleForm: { vehicleId?: string } | undefined;
  Home: undefined;
  Zones: undefined;
  StartParking: { zoneId: string };
  ActiveParking: undefined;
};

type VehiclesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Vehicles'>;

export default function VehiclesScreen() {
  const navigation = useNavigation<VehiclesScreenNavigationProp>();
  const queryClient = useQueryClient();

  const {
    data: vehicles,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehicleService.getAllVehicles(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => vehicleService.deleteVehicle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      Alert.alert('Sucesso', 'Veículo excluído com sucesso');
    },
    onError: (error: any) => {
      Alert.alert('Erro', error.message || 'Erro ao excluir veículo');
    },
  });

  const handleDelete = (vehicle: Vehicle) => {
    Alert.alert(
      'Confirmar exclusão',
      `Deseja realmente excluir o veículo ${vehicle.plate}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(vehicle.id),
        },
      ]
    );
  };

  const formatVehicleType = (type: string) => {
    const types: { [key: string]: string } = {
      car: 'Carro',
      motorcycle: 'Moto',
      other: 'Outro',
    };
    return types[type] || type;
  };

  const renderVehicle = ({ item }: { item: Vehicle }) => (
    <View style={styles.vehicleCard}>
      <View style={styles.vehicleHeader}>
        <View style={styles.vehicleInfo}>
          <Text style={styles.plate}>{item.plate}</Text>
          {item.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>Padrão</Text>
            </View>
          )}
        </View>
        <Text style={styles.vehicleType}>{formatVehicleType(item.vehicleType)}</Text>
      </View>
      {item.nickname && <Text style={styles.nickname}>{item.nickname}</Text>}
      <View style={styles.vehicleActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('VehicleForm', { vehicleId: item.id })}
        >
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item)}
        >
          <Text style={styles.deleteButtonText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading && !vehicles) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" translucent={false} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
        </View>
      </>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" translucent={false} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.container}>
      <ScreenHeader
        title="Meus Veículos"
        rightAction={
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('VehicleForm')}
          >
            <Text style={styles.addButtonText}>+ Adicionar</Text>
          </TouchableOpacity>
        }
      />

      {vehicles && vehicles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum veículo cadastrado</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate('VehicleForm')}
          >
            <Text style={styles.emptyButtonText}>Cadastrar primeiro veículo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={vehicles}
          renderItem={renderVehicle}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isFetching || false} onRefresh={refetch} />
          }
        />
      )}
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
    backgroundColor: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  addButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#0066CC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  list: {
    padding: 16,
  },
  vehicleCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  plate: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 2,
  },
  defaultBadge: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  defaultBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  vehicleType: {
    fontSize: 14,
    color: '#999999',
  },
  nickname: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  vehicleActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  editButtonText: {
    color: '#0066CC',
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#2a1a1a',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#443333',
  },
  deleteButtonText: {
    color: '#ff4444',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#0066CC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
});

