import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Ionicons from '@expo/vector-icons/Ionicons';
import { avulsoParkingService } from '../../services/avulsoParking.service';
import { CashParkingNotSettled } from '../../types/api';
import FiscalHeader from '../../components/fiscal/FiscalHeader';
import StatsCard from '../../components/fiscal/StatsCard';
import CashParkingCard from '../../components/fiscal/CashParkingCard';
import PeriodFilter, { PeriodOption } from '../../components/fiscal/PeriodFilter';

type FiscalStackParamList = {
  Accountability: undefined;
  AvulsoParkingDetails: { parkingId: string } | undefined;
};

type AccountabilityNavigationProp = NativeStackNavigationProp<
  FiscalStackParamList,
  'Accountability'
>;

export default function AccountabilityScreen() {
  const navigation = useNavigation<AccountabilityNavigationProp>();
  const queryClient = useQueryClient();

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>('month');
  const [settlingParkingId, setSettlingParkingId] = useState<string | null>(null);

  // Calculate date filters based on period
  const getDateFilters = () => {
    const now = new Date();
    let dateFrom: Date | undefined;
    let dateTo: Date | undefined = now;

    switch (selectedPeriod) {
      case 'today':
        dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'custom':
        // For now, use month as default for custom
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    return {
      dateFrom: dateFrom?.toISOString().split('T')[0],
      dateTo: dateTo?.toISOString().split('T')[0],
    };
  };

  const dateFilters = getDateFilters();

  // Fetch accountability stats
  const {
    data: accountabilityData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['accountability', selectedPeriod, dateFilters.dateFrom, dateFilters.dateTo],
    queryFn: () =>
      avulsoParkingService.getAccountabilityStats({
        dateFrom: dateFilters.dateFrom,
        dateTo: dateFilters.dateTo,
      }),
  });

  // Settle parking mutation
  const settleMutation = useMutation({
    mutationFn: (parkingId: string) => avulsoParkingService.settleAvulsoParking(parkingId),
    onSuccess: (_, parkingId) => {
      setSettlingParkingId(null);
      queryClient.invalidateQueries({
        queryKey: ['accountability', selectedPeriod, dateFilters.dateFrom, dateFilters.dateTo],
      });
      Alert.alert('Sucesso', 'Estacionamento marcado como prestado com sucesso!');
    },
    onError: (error: any) => {
      setSettlingParkingId(null);
      Alert.alert('Erro', error.message || 'Não foi possível marcar o estacionamento como prestado.');
    },
  });

  const handleSettle = (parkingId: string) => {
    Alert.alert(
      'Confirmar Prestação de Contas',
      'Tem certeza que deseja marcar este estacionamento como prestado?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Confirmar',
          onPress: () => {
            setSettlingParkingId(parkingId);
            settleMutation.mutate(parkingId);
          },
        },
      ]
    );
  };

  const handleViewDetails = (parkingId: string) => {
    navigation.navigate('AvulsoParkingDetails', { parkingId });
  };

  const handleRefresh = () => {
    refetch();
  };

  const statistics = accountabilityData?.statistics;
  const cashParkings = accountabilityData?.cashParkingsNotSettled || [];

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#1a1a1a"
        translucent={false}
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <FiscalHeader
          title="Prestação de Contas"
          showBackButton
          onBackPress={() => navigation.goBack()}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />
          }
        >
          {/* Period Filter */}
          <PeriodFilter
            selectedPeriod={selectedPeriod}
            onSelectPeriod={setSelectedPeriod}
            showLabel={false}

          />

          {/* Statistics Section */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2196F3" />
              <Text style={styles.loadingText}>Carregando estatísticas...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#f44336" />
              <Text style={styles.errorText}>
                {error instanceof Error ? error.message : 'Erro ao carregar estatísticas'}
              </Text>
              <Text style={styles.retryText} onPress={handleRefresh}>
                Tentar Novamente
              </Text>
            </View>
          ) : statistics ? (
            <>
              {/* Quick Summary Cards - Top Level */}
              <View style={styles.quickStatsContainer}>
                <View style={styles.quickStatCard}>
                  <View style={styles.quickStatIconContainer}>
                    <Ionicons name="car-outline" size={24} color="#2196F3" />
                  </View>
                  <View style={styles.quickStatContent}>
                    <Text style={styles.quickStatValue}>{statistics.totalParkings}</Text>
                    <Text style={styles.quickStatLabel}>Estacionamentos</Text>
                  </View>
                </View>
                <View style={styles.quickStatCard}>
                  <View style={[styles.quickStatIconContainer, { backgroundColor: '#4CAF5020' }]}>
                    <Ionicons name="cash-outline" size={24} color="#4CAF50" />
                  </View>
                  <View style={styles.quickStatContent}>
                    <Text style={[styles.quickStatValue, styles.quickStatValueMoney]}>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        maximumFractionDigits: 0,
                      }).format(statistics.totalAmount)}
                    </Text>
                    <Text style={styles.quickStatLabel}>Total Arrecadado</Text>
                  </View>
                </View>
              </View>

              {/* Detailed Statistics */}
              <View style={styles.statsContainer}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="analytics-outline" size={20} color="#666" />
                  <Text style={styles.sectionTitle}>Detalhamento por Método</Text>
                </View>

                <View style={styles.statsGrid}>
                  <StatsCard
                    title="Com Saldo"
                    value={statistics.totalBalanceParkings || 0}
                    icon="wallet-outline"
                    iconColor="#2196F3"
                    subtitle={`${new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(statistics.totalBalanceAmount || 0)}`}
                  />
                  <StatsCard
                    title="Dinheiro"
                    value={statistics.totalCashParkings}
                    icon="cash-outline"
                    iconColor="#FF9800"
                    subtitle={`${new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(statistics.totalCashAmount)}`}
                  />
                  <StatsCard
                    title="PIX"
                    value={statistics.totalPixParkings}
                    icon="qr-code-outline"
                    iconColor="#4CAF50"
                    subtitle={`${new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(statistics.totalPixAmount)}`}
                  />
                </View>
              </View>

              {/* Cash Parkings Not Settled */}
              <View style={styles.parkingsContainer}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="time-outline" size={20} color="#FF9800" />
                  <View style={styles.sectionHeaderText}>
                    <Text style={styles.sectionTitle}>
                      Pendentes de Baixa
                    </Text>
                    <Text style={styles.sectionSubtitle}>
                      {cashParkings.length} {cashParkings.length === 1 ? 'estacionamento' : 'estacionamentos'} em dinheiro
                    </Text>
                  </View>
                  {cashParkings.length > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{cashParkings.length}</Text>
                    </View>
                  )}
                </View>

                {cashParkings.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconContainer}>
                      <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
                    </View>
                    <Text style={styles.emptyTitle}>Tudo em dia!</Text>
                    <Text style={styles.emptyText}>
                      Todos os estacionamentos em dinheiro foram baixados
                    </Text>
                  </View>
                ) : (
                  <>
                    <View style={styles.infoBanner}>
                      <Ionicons name="information-circle-outline" size={18} color="#2196F3" />
                      <Text style={styles.infoBannerText}>
                        Toque em &quot;Dar baixa&quot; para marcar estacionamentos como prestados
                      </Text>
                    </View>
                    {cashParkings.map((parking: CashParkingNotSettled) => (
                      <CashParkingCard
                        key={parking.id}
                        parking={parking}
                        onSettle={handleSettle}
                        onViewDetails={handleViewDetails}
                        isSettling={settlingParkingId === parking.id}
                      />
                    ))}
                  </>
                )}
              </View>
            </>
          ) : null}
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
  retryText: {
    marginTop: 16,
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  quickStatsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  quickStatIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2196F320',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickStatContent: {
    flex: 1,
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  quickStatValueMoney: {
    fontSize: 20,
    color: '#4CAF50',
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  statsContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#FF9800',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsGrid: {
    gap: 12,
  },
  parkingsContainer: {
    marginTop: 8,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  emptyIconContainer: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
});
