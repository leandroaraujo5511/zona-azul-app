import React, { useState } from 'react';
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
import { parkingService } from '../services/parking.service';
import { zoneService } from '../services/zone.service';
import ScreenHeader from '../components/ScreenHeader';

type RootStackParamList = {
  RenewParking: { parkingId: string };
  ActiveParking: undefined;
};

type RenewParkingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RenewParking'
>;
type RenewParkingScreenRouteProp = RouteProp<RootStackParamList, 'RenewParking'>;

const TIME_OPTIONS = [
  { minutes: 60, label: '+1 hora' },
  { minutes: 120, label: '+2 horas' },
];

export default function RenewParkingScreen() {
  const navigation = useNavigation<RenewParkingScreenNavigationProp>();
  const route = useRoute<RenewParkingScreenRouteProp>();
  const queryClient = useQueryClient();
  const { parkingId } = route.params;

  const [selectedMinutes, setSelectedMinutes] = useState<number>(60);

  // Load parking
  const { data: parking, isLoading: isLoadingParking } = useQuery({
    queryKey: ['parking', parkingId],
    queryFn: () => parkingService.getParkingById(parkingId),
  });

  // Load zone to get pricing
  const { data: zone } = useQuery({
    queryKey: ['zone', parking?.zoneId],
    queryFn: async () => {
      if (!parking?.zoneId) {
        throw new Error('Zone ID não disponível');
      }
      return await zoneService.getZoneById(parking.zoneId);
    },
    enabled: !!parking?.zoneId,
  });

  // Renew mutation
  const renewMutation = useMutation({
    mutationFn: (additionalMinutes: number) =>
      parkingService.renewParking(parkingId, additionalMinutes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeParking'] });
      queryClient.invalidateQueries({ queryKey: ['parking', parkingId] });
      queryClient.invalidateQueries({ queryKey: ['parkings'] });
      Alert.alert('Sucesso', 'Estacionamento renovado com sucesso!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('ActiveParking'),
        },
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Erro', error.message || 'Erro ao renovar estacionamento');
    },
  });

  const calculatePrice = (minutes: number) => {
    if (!zone) return 0;
    const periods = Math.ceil(minutes / zone.periodMinutes);
    return periods * zone.pricePerPeriod;
  };

  const handleRenew = () => {
    if (!parking || !zone) {
      Alert.alert('Erro', 'Dados do estacionamento não encontrados');
      return;
    }

    // Calculate time remaining from current expectedEndTime
    const now = new Date().getTime();
    const expectedEndTime = parking.expectedEndTime 
      ? new Date(parking.expectedEndTime).getTime()
      : null;
    
    if (!expectedEndTime) {
      Alert.alert('Erro', 'Não foi possível calcular o tempo restante');
      return;
    }

    const timeRemaining = Math.max(0, Math.floor((expectedEndTime - now) / (1000 * 60)));
    
    // Calculate total time: remaining time + additional minutes
    const totalTime = timeRemaining + selectedMinutes;

    if (totalTime > zone.maxTimeMinutes) {
      Alert.alert('Erro', `Tempo total (${totalTime} min) excede o máximo permitido de ${zone.maxTimeMinutes} minutos`);
      return;
    }

    // Format time remaining for display
    const hoursRemaining = Math.floor(timeRemaining / 60);
    const minutesRemaining = timeRemaining % 60;
    const timeRemainingText = hoursRemaining > 0 
      ? `${hoursRemaining}h ${minutesRemaining}min`
      : `${minutesRemaining}min`;
    
    const totalHours = Math.floor(totalTime / 60);
    const totalMinutes = totalTime % 60;
    const totalTimeText = totalHours > 0
      ? `${totalHours}h ${totalMinutes}min`
      : `${totalMinutes}min`;

    Alert.alert(
      'Confirmar Renovação',
      `Tempo restante: ${timeRemainingText}\nAdicionar: ${selectedMinutes} minutos\n\nTempo total após renovação: ${totalTimeText}\nValor adicional: R$ ${calculatePrice(selectedMinutes)?.toFixed(2)}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            renewMutation.mutate(selectedMinutes);
          },
        },
      ]
    );
  };

  const isLoading = isLoadingParking || renewMutation.isPending;

  if (isLoading && !parking) {
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

  if (!parking || !zone) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" translucent={false} />
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.container}>
            <ScreenHeader title="Renovar Estacionamento" />
            <View style={styles.content}>
              <Text style={styles.errorText}>Estacionamento não encontrado</Text>
            </View>
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
          <ScreenHeader title="Renovar Estacionamento" />

      <View style={styles.content}>
        {/* Current Parking Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estacionamento Atual</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Placa:</Text>
              <Text style={styles.infoValue}>{parking.plate}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Duração Atual:</Text>
              <Text style={styles.infoValue}>{parking.duration} minutos</Text>
            </View>
          </View>
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adicionar Tempo</Text>
          <View style={styles.timeOptions}>
            {TIME_OPTIONS.map((option) => {
              const isSelected = selectedMinutes === option.minutes;
              
              // Check if total time would exceed max
              // Calculate time remaining from current expectedEndTime
              const now = new Date().getTime();
              const expectedEndTime = parking.expectedEndTime 
                ? new Date(parking.expectedEndTime).getTime()
                : null;
              
              let isDisabled = false;
              if (expectedEndTime) {
                const timeRemaining = Math.max(0, Math.floor((expectedEndTime - now) / (1000 * 60)));
                const totalTime = timeRemaining + option.minutes;
                isDisabled = totalTime > zone.maxTimeMinutes;
              }

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
            Tempo máximo total: {zone.maxTimeMinutes} minutos
          </Text>
        </View>

        {/* Price Summary */}
        <View style={styles.summary}>
          {(() => {
            const now = new Date().getTime();
            const expectedEndTime = parking.expectedEndTime 
              ? new Date(parking.expectedEndTime).getTime()
              : null;
            const timeRemaining = expectedEndTime 
              ? Math.max(0, Math.floor((expectedEndTime - now) / (1000 * 60)))
              : 0;
            const totalTime = timeRemaining + selectedMinutes;
            const hoursRemaining = Math.floor(timeRemaining / 60);
            const minutesRemaining = timeRemaining % 60;
            const timeRemainingText = hoursRemaining > 0 
              ? `${hoursRemaining}h ${minutesRemaining}min`
              : `${minutesRemaining}min`;
            const totalHours = Math.floor(totalTime / 60);
            const totalMinutes = totalTime % 60;
            const totalTimeText = totalHours > 0
              ? `${totalHours}h ${totalMinutes}min`
              : `${totalMinutes}min`;

            return (
              <>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tempo Restante:</Text>
                  <Text style={styles.summaryValue}>{timeRemainingText}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tempo Adicional:</Text>
                  <Text style={styles.summaryValue}>+{selectedMinutes} min</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tempo Total:</Text>
                  <Text style={[styles.summaryValue, styles.summaryValueBold]}>{totalTimeText}</Text>
                </View>
                <View style={[styles.summaryRow, styles.summaryRowLast]}>
                  <Text style={styles.summaryLabel}>Valor Adicional:</Text>
                  <Text style={[styles.summaryValue, styles.summaryValueBold]}>
                    R$ {calculatePrice(selectedMinutes)?.toFixed(2)}
                  </Text>
                </View>
              </>
            );
          })()}
        </View>

        {/* Renew Button */}
        <TouchableOpacity
          style={[styles.renewButton, isLoading && styles.renewButtonDisabled]}
          onPress={handleRenew}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.renewButtonText}>Renovar Estacionamento</Text>
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
  infoCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#999999',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
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
    minWidth: 100,
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
  summaryRowLast: {
    marginBottom: 0,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#999999',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  summaryValueBold: {
    fontWeight: 'bold',
    color: '#0066CC',
  },
  renewButton: {
    backgroundColor: '#0066CC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  renewButtonDisabled: {
    opacity: 0.6,
  },
  renewButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
    marginTop: 32,
  },
});

