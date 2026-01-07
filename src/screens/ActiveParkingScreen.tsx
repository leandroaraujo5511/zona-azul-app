import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { parkingService } from '../services/parking.service';
import { Parking } from '../types/api';
import ScreenHeader from '../components/ScreenHeader';

type RootStackParamList = {
  ActiveParking: undefined;
  Home: undefined;
  Zones: undefined;
  RenewParking: { parkingId: string };
  ParkingHistory: undefined;
};

type ActiveParkingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ActiveParking'
>;

export default function ActiveParkingScreen() {
  const navigation = useNavigation<ActiveParkingScreenNavigationProp>();
  const queryClient = useQueryClient();
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  const {
    data: parking,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<Parking | null>({
    queryKey: ['activeParking'],
    queryFn: async (): Promise<Parking | null> => {
      try {
        const activeParking = await parkingService.getActiveParking();
        // Garantir que retorna null em vez de undefined
        return activeParking ?? null;
      } catch (error: any) {
        // Se for erro 404, retornar null (sem estacionamento ativo)
        if (error.response?.status === 404 || error.message?.includes('404')) {
          return null;
        }
        // Para outros erros, relançar
        throw error;
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: (failureCount, error: any) => {
      // Não tentar novamente se for 404 (sem estacionamento)
      if (error.response?.status === 404 || error.message?.includes('404')) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Cancel parking mutation
  const cancelMutation = useMutation({
    mutationFn: (id: string) => parkingService.cancelParking(id),
    onSuccess: (data: { message: string; refund: number }) => {
      queryClient.invalidateQueries({ queryKey: ['activeParking'] });
      queryClient.invalidateQueries({ queryKey: ['parkings'] });
      Alert.alert(
        'Estacionamento Cancelado',
        `Estacionamento cancelado com sucesso.\nReembolso: R$ ${data.refund.toFixed(2)}`,
        [{ text: 'OK' }]
      );
    },
    onError: (error: any) => {
      Alert.alert('Erro', error.message || 'Erro ao cancelar estacionamento');
    },
  });

  // Calculate time remaining
  useEffect(() => {
    if (!parking || parking.status === 'expired' || parking.status === 'completed') {
      setTimeRemaining('00:00:00');
      return;
    }

    const updateTime = () => {
      // Usar expectedEndTime ou calcular a partir de timeRemaining do backend
      let endTime: number | null = null;
      
      if (parking.expectedEndTime) {
        endTime = new Date(parking.expectedEndTime).getTime();
      } else if (parking.timeRemaining !== undefined) {
        // Se o backend já calculou, usar timeRemaining em minutos
        const now = new Date().getTime();
        endTime = now + (parking.timeRemaining * 60 * 1000);
      } else if (parking.endTime) {
        endTime = new Date(parking.endTime).getTime();
      }

      if (!endTime) {
        setTimeRemaining('--:--:--');
        return;
      }

      const now = new Date().getTime();
      const remaining = endTime - now;

      if (remaining <= 0) {
        setTimeRemaining('00:00:00');
        queryClient.invalidateQueries({ queryKey: ['activeParking'] });
        return;
      }

      // Formatar como relógio HH:MM:SS
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

      const formattedHours = String(hours).padStart(2, '0');
      const formattedMinutes = String(minutes).padStart(2, '0');
      const formattedSeconds = String(seconds).padStart(2, '0');

      setTimeRemaining(`${formattedHours}:${formattedMinutes}:${formattedSeconds}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [parking, queryClient]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleRenew = () => {
    if (parking) {
      navigation.navigate('RenewParking', { parkingId: parking.id });
    }
  };

  const handleCancel = () => {
    if (!parking) return;

    Alert.alert(
      'Cancelar Estacionamento',
      'Deseja realmente cancelar este estacionamento?\n\nVocê receberá um reembolso proporcional ao tempo não utilizado.',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, Cancelar',
          style: 'destructive',
          onPress: () => cancelMutation.mutate(parking.id),
        },
      ]
    );
  };

  if (isLoading) {
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

  if (!parking) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" translucent={false} />
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.emptyContainer}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor="#ffffff"
                colors={['#0066CC']}
              />
            }
          >
            <ScreenHeader title="Estacionamento Ativo" />
            <View style={styles.emptyContent}>
              <Text style={styles.emptyTitle}>Nenhum Estacionamento Ativo</Text>
              <Text style={styles.emptyText}>
                Você não possui nenhum estacionamento ativo no momento.
              </Text>
              <Text style={styles.emptyText}>
                Toque em &quot;Iniciar Estacionamento&quot; para começar.
              </Text>

              <View style={styles.emptyActions}>
                <TouchableOpacity
                  style={[styles.emptyButton, styles.emptyButtonSecondary]}
                  onPress={() => navigation.navigate('Home')}
                >
                  <Text style={styles.emptyButtonSecondaryText}>Voltar ao Início</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.emptyButton, styles.emptyButtonPrimary]}
                  onPress={() => navigation.navigate('Zones')}
                >
                  <Text style={styles.emptyButtonPrimaryText}>Iniciar Estacionamento</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" translucent={false} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#ffffff"
              colors={['#0066CC']}
            />
          }
        >
          <ScreenHeader title="Estacionamento Ativo" />

      <View style={styles.content}>
       
        {/* Time Remaining - Clock Format */}
        <View style={styles.timeContainer}>
          <Text style={styles.timeLabel}>Tempo Restante</Text>
          <Text
            style={[
              styles.timeValue,
              parking.status === 'expiring' && styles.timeValueWarning,
              parking.status === 'expired' && styles.timeValueExpired,
            ]}
          >
            {timeRemaining || '--:--:--'}
          </Text>
        </View>

        {/* Parking Info */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Placa:</Text>
            <Text style={styles.cardValue}>{parking.plate}</Text>
          </View>

          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Início:</Text>
            <Text style={styles.cardValue}>{formatDate(parking.startTime)}</Text>
          </View>

          {parking.endTime && (
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Fim Previsto:</Text>
              <Text style={styles.cardValue}>{formatDate(parking.endTime)}</Text>
            </View>
          )}

          {(parking.duration || parking.requestedMinutes) && (
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Duração:</Text>
              <Text style={styles.cardValue}>
                {parking.duration || parking.requestedMinutes} minutos
              </Text>
            </View>
          )}

          <View style={[styles.cardRow, styles.cardRowLast]}>
            <Text style={styles.cardLabel}>Valor Pago:</Text>
            <Text style={styles.cardValue}>
              R${' '}
              {parking.amount != null && parking.amount > 0
                ? parking.amount.toFixed(2)
                : parking.creditsUsed
                ? parking.creditsUsed.toFixed(2)
                : '0.00'}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        {parking.status !== 'completed' && parking.status !== 'cancelled' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.renewButton]}
              onPress={handleRenew}
              disabled={cancelMutation.isPending}
            >
              <Text style={styles.actionButtonText}>Renovar Tempo</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancel}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.actionButtonText}>Cancelar</Text>
              )}
            </TouchableOpacity> */}
          </View>
        )}

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>Instruções</Text>
          <Text style={styles.instructionsText}>
            • Seu estacionamento está ativo e sendo monitorado
          </Text>
          <Text style={styles.instructionsText}>
            • Você receberá notificações quando o tempo estiver expirando
          </Text>
          <Text style={styles.instructionsText}>
            • Renove para adicionar mais tempo
          </Text>
        </View>
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
  timeContainer: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 24,
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#333333',
  },
  timeLabel: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 12,
    fontWeight: '500',
  },
  timeValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#0066CC',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  timeValueWarning: {
    color: '#FFD700',
  },
  timeValueExpired: {
    color: '#ff4444',
  },
  card: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333333',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  cardRowLast: {
    borderBottomWidth: 0,
  },
  cardLabel: {
    fontSize: 14,
    color: '#999999',
  },
  cardValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  instructions: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066CC',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyActions: {
    marginTop: 32,
    width: '100%',
    gap: 12,
  },
  emptyButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyButtonPrimary: {
    backgroundColor: '#0066CC',
  },
  emptyButtonSecondary: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#333333',
  },
  emptyButtonPrimaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyButtonSecondaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  renewButton: {
    backgroundColor: '#0066CC',
  },
  cancelButton: {
    backgroundColor: '#ff4444',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

