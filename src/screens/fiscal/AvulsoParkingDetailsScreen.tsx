import React from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useMutation } from '@tanstack/react-query';
import Ionicons from '@expo/vector-icons/Ionicons';
import { avulsoParkingService } from '../../services/avulsoParking.service';
import FiscalHeader from '../../components/fiscal/FiscalHeader';
import StatusBadge from '../../components/fiscal/StatusBadge';
import { FiscalStackParamList } from '../../navigation/FiscalNavigator';

type AvulsoParkingDetailsNavigationProp = NativeStackNavigationProp<
  FiscalStackParamList,
  'AvulsoParkingDetails'
>;

export default function AvulsoParkingDetailsScreen() {
  const navigation = useNavigation<AvulsoParkingDetailsNavigationProp>();
  const route = useRoute();
  const params = route.params as { parkingId: string } | undefined;

  // Fetch parking details
  const { data: parking, isLoading, error, refetch } = useQuery({
    queryKey: ['avulsoParking', params?.parkingId],
    queryFn: () => avulsoParkingService.getAvulsoParkingById(params!.parkingId),
    enabled: !!params?.parkingId,
  });

  // Cancel parking mutation
  const cancelMutation = useMutation({
    mutationFn: () => avulsoParkingService.cancelAvulsoParking(params!.parkingId),
    onSuccess: () => {
      Alert.alert('Sucesso', 'Estacionamento cancelado com sucesso', [
        {
          text: 'OK',
          onPress: () => {
            refetch();
          },
        },
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Erro', error.message || 'Não foi possível cancelar o estacionamento.');
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatDuration = (minutes: number | null | undefined) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) {
      return `${mins} min`;
    } else if (mins === 0) {
      return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    } else {
      return `${hours}h ${mins}min`;
    }
  };

  const canCancel = parking?.status === 'active';

  const handleHome = () => {
    // Navigate to FiscalDashboard, resetting the navigation stack
    navigation.reset({
      index: 0,
      routes: [{ name: 'FiscalDashboard' as keyof FiscalStackParamList }],
    });
  };

  if (!params?.parkingId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <FiscalHeader title="Erro" showBackButton onBackPress={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>ID do estacionamento não fornecido</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#1a1a1a"
        translucent={false}
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <FiscalHeader
          title="Detalhes do Estacionamento"
          showBackButton
          onBackPress={() => navigation.goBack()}
        />

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2196F3" />
              <Text style={styles.loadingText}>Carregando informações...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#f44336" />
              <Text style={styles.errorText}>
                {error instanceof Error ? error.message : 'Erro ao carregar estacionamento'}
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => refetch()}
              >
                <Text style={styles.retryButtonText}>Tentar Novamente</Text>
              </TouchableOpacity>
            </View>
          ) : parking ? (
            <>
              {/* Status Card */}
              <View style={styles.statusCard}>
                <View style={styles.statusHeader}>
                  <StatusBadge status={parking.status as any} />
                  <Text style={styles.statusTitle}>Status do Estacionamento</Text>
                </View>
              </View>

              {/* Basic Info */}
              <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>Informações Básicas</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Placa:</Text>
                  <Text style={styles.infoValue}>{parking.plate}</Text>
                </View>
                {parking.zone && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Zona:</Text>
                    <Text style={styles.infoValue}>{parking.zone.name}</Text>
                  </View>
                )}
                {parking.zone?.address && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Endereço:</Text>
                    <Text style={styles.infoValue}>{parking.zone.address}</Text>
                  </View>
                )}
              </View>

              {/* Time Info */}
              <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>Tempo</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Tempo Solicitado:</Text>
                  <Text style={styles.infoValue}>{formatDuration(parking.requestedMinutes)}</Text>
                </View>
                {parking.actualMinutes !== undefined && parking.actualMinutes !== null && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Tempo Real:</Text>
                    <Text style={styles.infoValue}>{formatDuration(parking.actualMinutes)}</Text>
                  </View>
                )}
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Início:</Text>
                  <Text style={styles.infoValue}>{formatDate(parking.startTime)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Fim Esperado:</Text>
                  <Text style={styles.infoValue}>{formatDate(parking.expectedEndTime)}</Text>
                </View>
                {parking.actualEndTime !== undefined && parking.actualEndTime !== null && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Fim Real:</Text>
                    <Text style={styles.infoValue}>{formatDate(parking.actualEndTime)}</Text>
                  </View>
                )}
              </View>

              {/* Payment Info */}
              {((parking.creditsUsed !== undefined && parking.creditsUsed !== null) || 
                (parking.amount !== undefined && parking.amount !== null)) && (
                <View style={styles.infoCard}>
                  <Text style={styles.cardTitle}>Pagamento</Text>
                  {parking.creditsUsed !== undefined && parking.creditsUsed !== null && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Créditos Utilizados:</Text>
                      <Text style={styles.infoValue}>{formatCurrency(parking.creditsUsed)}</Text>
                    </View>
                  )}
                  {parking.amount !== undefined && parking.amount !== null && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Valor:</Text>
                      <Text style={styles.infoValue}>{formatCurrency(parking.amount)}</Text>
                    </View>
                  )}
                  {parking.creditsRefunded !== undefined && 
                   parking.creditsRefunded !== null && 
                   parking.creditsRefunded > 0 && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Créditos Reembolsados:</Text>
                      <Text style={styles.infoValue}>{formatCurrency(parking.creditsRefunded)}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Location and Observations - Only if available in response */}
              {(parking as any).location && (
                <View style={styles.infoCard}>
                  <Text style={styles.cardTitle}>Localização</Text>
                  {(parking as any).location.address && (
                    <Text style={styles.infoText}>{(parking as any).location.address}</Text>
                  )}
                  {(parking as any).location.latitude && (parking as any).location.longitude && (
                    <Text style={styles.infoText}>
                      {(parking as any).location.latitude.toFixed(6)}, {(parking as any).location.longitude.toFixed(6)}
                    </Text>
                  )}
                </View>
              )}

              {/* Observations */}
              {(parking as any).observations && (
                <View style={styles.infoCard}>
                  <Text style={styles.cardTitle}>Observações</Text>
                  <Text style={styles.infoText}>{(parking as any).observations}</Text>
                </View>
              )}

              {/* Dates */}
              <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>Datas</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Criado em:</Text>
                  <Text style={styles.infoValue}>{formatDate(parking.createdAt)}</Text>
                </View>
                {parking.updatedAt !== undefined && parking.updatedAt !== null && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Atualizado em:</Text>
                    <Text style={styles.infoValue}>{formatDate(parking.updatedAt)}</Text>
                  </View>
                )}
              </View>

              {/* Actions */}
              {canCancel && (
                <TouchableOpacity
                  style={[styles.button, styles.homeButton]}
                  onPress={handleHome}
                  disabled={cancelMutation.isPending}
                >
                  {cancelMutation.isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="home-outline" size={20} color="#fff" />
                      <Text style={styles.buttonText}>Voltar para o início</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#f44336" />
              <Text style={styles.errorText}>Estacionamento não encontrado</Text>
            </View>
          )}
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
  scrollView: {
      flex: 1,
      backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#f44336',
    fontWeight: '600',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2196F3',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  infoText: {
    fontSize: 14,
    color: '#1a1a1a',
    lineHeight: 20,
    marginTop: 4,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  homeButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
