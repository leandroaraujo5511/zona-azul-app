import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { zoneService } from '../services/zone.service';
import { vehicleService } from '../services/vehicle.service';
import { parkingService } from '../services/parking.service';
import { Zone } from '../types/api';
import ScreenHeader from '../components/ScreenHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';

type RootStackParamList = {
  StartParking: { zoneId: string };
  ActiveParking: undefined;
  Zones: undefined;
  Vehicles: undefined;
};

type StartParkingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'StartParking'>;
type StartParkingScreenRouteProp = RouteProp<RootStackParamList, 'StartParking'>;

const TIME_OPTIONS = [
  { minutes: 60, label: '1 hora' },
  { minutes: 120, label: '2 horas' },
  { minutes: 180, label: '3 horas' },
];

export default function StartParkingScreen() {
  const navigation = useNavigation<StartParkingScreenNavigationProp>();
  const route = useRoute<StartParkingScreenRouteProp>();
  const queryClient = useQueryClient();
  const { zoneId } = route.params;

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [selectedMinutes, setSelectedMinutes] = useState<number>(60);
  const [parkingCreated, setParkingCreated] = useState<boolean>(false);

  // Load zone
  const { data: zone, isLoading: isLoadingZone } = useQuery({
    queryKey: ['zone', zoneId],
    queryFn: async (): Promise<Zone> => {
      if (!zoneId) {
        throw new Error('Zone ID não disponível');
      }
      const zoneData = await zoneService.getZoneById(zoneId);
      if (!zoneData) {
        throw new Error('Zona não encontrada');
      }
      return zoneData;
    },
    enabled: !!zoneId && !parkingCreated,
    retry: 1,
  });

  // Load vehicles
  const { data: vehicles, isLoading: isLoadingVehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehicleService.getAllVehicles(),
  });

  // Set default vehicle when vehicles load
  useEffect(() => {
    if (vehicles && vehicles.length > 0 && !selectedVehicleId) {
      const defaultVehicle = vehicles.find((v) => v.isDefault) || vehicles[0];
      setSelectedVehicleId(defaultVehicle.id);
    }
  }, [vehicles, selectedVehicleId]);

  // Create parking mutation
  const createMutation = useMutation({
    mutationFn: (data: { vehicleId: string; zoneId: string; requestedMinutes: number }) =>
      parkingService.createParking(data),
    onSuccess: () => {
      // Marcar como criado para evitar mostrar erro de zona
      setParkingCreated(true);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['parkings'] });
      queryClient.invalidateQueries({ queryKey: ['activeParking'] });
      // Remove zone query to prevent undefined errors
      queryClient.removeQueries({ queryKey: ['zone', zoneId] });
      
      // Substituir a tela atual por ActiveParking para evitar loop de navegação
      navigation.replace('ActiveParking');
      
      // Mostrar alerta após pequeno delay para garantir que a navegação aconteceu
      setTimeout(() => {
        Alert.alert('Sucesso', 'Estacionamento iniciado com sucesso!', [{ text: 'OK' }]);
      }, 500);
    },
    onError: (error: any) => {
      Alert.alert('Erro', error.message || 'Erro ao iniciar estacionamento');
    },
  });

  const calculatePrice = (minutes: number) => {
    if (!zone) return 0;
    const periods = Math.ceil(minutes / zone.periodMinutes);
    return periods * zone.pricePerPeriod;
  };

  const handleStartParking = () => {
    if (!selectedVehicleId) {
      Alert.alert('Erro', 'Selecione um veículo');
      return;
    }

    if (!zone) {
      Alert.alert('Erro', 'Zona não encontrada');
      return;
    }

    if (selectedMinutes > zone.maxTimeMinutes) {
      Alert.alert('Erro', `Tempo máximo é ${zone.maxTimeMinutes} minutos`);
      return;
    }

    Alert.alert(
      'Confirmar Estacionamento',
      `Iniciar estacionamento por ${selectedMinutes} minutos?\n\nValor: R$ ${calculatePrice(selectedMinutes).toFixed(2)}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            createMutation.mutate({
              vehicleId: selectedVehicleId,
              zoneId: zone.id,
              requestedMinutes: selectedMinutes,
            });
          },
        },
      ]
    );
  };

  const isLoading = isLoadingZone || isLoadingVehicles || createMutation.isPending;

  // Se o estacionamento foi criado, não mostrar tela de erro, apenas loading até navegar
  if (parkingCreated) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" translucent={false} />
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066CC" />
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (isLoading && !zone) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" translucent={false} />
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066CC" />
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (!zone && !parkingCreated) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" translucent={false} />
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.container}>
            <ScreenHeader title="Iniciar Estacionamento" />
            <View style={styles.content}>
              <Text style={styles.errorText}>Zona não encontrada</Text>
              <TouchableOpacity
                style={styles.errorButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.errorButtonText}>Voltar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </>
    );
  }

  // Se não tem zone ainda, mostrar loading
  if (!zone) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" translucent={false} />
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066CC" />
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" translucent={false} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
          <ScreenHeader title="Iniciar Estacionamento" />

      <View style={styles.content}>
        {/* Zone Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zona</Text>
          <View style={styles.zoneCard}>
            <Text style={styles.zoneName}>{zone.name}</Text>
            <Text style={styles.zoneAddress}>{zone.address}</Text>
            <Text style={styles.zoneCode}>{zone.code}</Text>
          </View>
        </View>

        {/* Vehicle Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selecione o Veículo</Text>
          {vehicles && vehicles.length === 0 ? (
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('Vehicles')}
            >
              <Text style={styles.emptyButtonText}>Cadastrar Veículo</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.vehicleList}>
              {vehicles?.map((vehicle) => (
                <TouchableOpacity
                  key={vehicle.id}
                  style={[
                    styles.vehicleOption,
                    selectedVehicleId === vehicle.id && styles.vehicleOptionSelected,
                  ]}
                  onPress={() => setSelectedVehicleId(vehicle.id)}
                >
                  <View style={styles.vehicleOptionContent}>
                    <Text style={styles.vehiclePlate}>{vehicle.plate}</Text>
                    {vehicle.nickname && (
                      <Text style={styles.vehicleNickname}>{vehicle.nickname}</Text>
                    )}
                    {vehicle.isDefault && (
                      <Text style={styles.vehicleDefault}>Padrão</Text>
                    )}
                  </View>
                  {selectedVehicleId === vehicle.id && (
                    <IconSymbol name="checkmark.circle.fill" size={24} color="#0066CC" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tempo de Estacionamento</Text>
          <View style={styles.timeOptions}>
            {TIME_OPTIONS.map((option) => {
              const isSelected = selectedMinutes === option.minutes;
              const isDisabled = option.minutes > zone.maxTimeMinutes;
              return (
                <TouchableOpacity
                  key={option.minutes}
                  style={[
                    styles.timeOption,
                    isSelected && styles.timeOptionSelected,
                    isDisabled && styles.timeOptionDisabled,
                  ]}
                  onPress={() => !isDisabled && setSelectedMinutes(option.minutes)}
                  disabled={isDisabled}
                >
                  <Text
                    style={[
                      styles.timeOptionText,
                      isSelected && styles.timeOptionTextSelected,
                      isDisabled && styles.timeOptionTextDisabled,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.maxTimeText}>
            Tempo máximo: {zone.maxTimeMinutes} minutos
          </Text>
        </View>

        {/* Price Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tempo:</Text>
            <Text style={styles.summaryValue}>{selectedMinutes} minutos</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Valor:</Text>
            <Text style={styles.summaryValue}>
              R$ {calculatePrice(selectedMinutes).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          style={[
            styles.startButton,
            (isLoading || !selectedVehicleId) && styles.startButtonDisabled,
          ]}
          onPress={handleStartParking}
          disabled={isLoading || !selectedVehicleId}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.startButtonText}>Iniciar Estacionamento</Text>
          )}
        </TouchableOpacity>
      </View>
        </ScrollView>
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
  scrollContent: {
    paddingBottom: 32,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  zoneCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  zoneName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  zoneAddress: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 4,
  },
  zoneCode: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '600',
  },
  vehicleList: {
    gap: 12,
  },
  vehicleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#333333',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#2a2a2a',
  },
  vehicleOptionSelected: {
    borderColor: '#0066CC',
    backgroundColor: '#1a3a5a',
  },
  vehicleOptionContent: {
    flex: 1,
  },
  vehiclePlate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 2,
    marginBottom: 4,
  },
  vehicleNickname: {
    fontSize: 14,
    color: '#999999',
  },
  vehicleDefault: {
    fontSize: 12,
    color: '#0066CC',
    fontWeight: '600',
    marginTop: 4,
  },
  timeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeOption: {
    borderWidth: 2,
    borderColor: '#333333',
    borderRadius: 12,
    padding: 16,
    minWidth: 80,
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
  },
  timeOptionSelected: {
    borderColor: '#0066CC',
    backgroundColor: '#1a3a5a',
  },
  timeOptionDisabled: {
    opacity: 0.5,
  },
  timeOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999999',
  },
  timeOptionTextSelected: {
    color: '#0066CC',
  },
  timeOptionTextDisabled: {
    color: '#666666',
  },
  maxTimeText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 8,
  },
  summary: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#999999',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  startButton: {
    backgroundColor: '#0066CC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonDisabled: {
    opacity: 0.6,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyButton: {
    backgroundColor: '#0066CC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  errorButton: {
    backgroundColor: '#0066CC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginHorizontal: 32,
  },
  errorButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

