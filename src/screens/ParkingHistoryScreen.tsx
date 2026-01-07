import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { parkingService } from '../services/parking.service';
import { Parking } from '../types/api';
import ScreenHeader from '../components/ScreenHeader';

type RootStackParamList = {
  ParkingHistory: undefined;
  Home: undefined;
};

type ParkingHistoryScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ParkingHistory'
>;

const STATUS_FILTERS = [
  { label: 'Todos', value: undefined },
  { label: 'Ativos', value: 'active' as const },
  { label: 'Finalizados', value: 'completed' as const },
  { label: 'Cancelados', value: 'cancelled' as const },
];

export default function ParkingHistoryScreen() {
  const navigation = useNavigation<ParkingHistoryScreenNavigationProp>();
  const [statusFilter, setStatusFilter] = useState<
    'active' | 'expiring' | 'expired' | 'completed' | 'cancelled' | undefined
  >(undefined);

  const {
    data: parkingsData,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['parkings', statusFilter],
    queryFn: () => parkingService.getAllParkings({ status: statusFilter, limit: 50 }),
  });

  const parkings = parkingsData?.data || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#28a745';
      case 'expiring':
        return '#ffc107';
      case 'expired':
        return '#dc3545';
      case 'completed':
        return '#6c757d';
      case 'cancelled':
        return '#dc3545';
      default:
        return '#666666';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'expiring':
        return 'Expirando';
      case 'expired':
        return 'Expirado';
      case 'completed':
        return 'Finalizado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

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

  const getDuration = (parking: Parking): number | null => {
    // Try duration first
    if (parking.duration != null) {
      return parking.duration;
    }
    // Try actualMinutes
    if (parking.actualMinutes != null) {
      return parking.actualMinutes;
    }
    // Calculate from start and end times
    if (parking.startTime && parking.endTime) {
      const start = new Date(parking.startTime);
      const end = new Date(parking.endTime);
      const diffMs = end.getTime() - start.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);
      return diffMinutes;
    }
    // Try requestedMinutes as last resort
    if (parking.requestedMinutes != null) {
      return parking.requestedMinutes;
    }
    return null;
  };

  const formatAmount = (amount: number | null | undefined): string => {
    if (amount == null || isNaN(amount)) {
      return '0,00';
    }
    return amount.toFixed(2).replace('.', ',');
  };

  const renderParking = ({ item }: { item: Parking }) => (
    <View style={styles.parkingCard}>
      <View style={styles.parkingHeader}>
        <View style={styles.parkingInfo}>
          <Text style={styles.plate}>{item.plate}</Text>
          <Text style={styles.date}>{formatDate(item.startTime)}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>

      <View style={styles.parkingDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Duração:</Text>
          <Text style={styles.detailValue}>
            {(() => {
              const duration = getDuration(item);
              return duration != null ? `${duration} min` : '--';
            })()}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Valor:</Text>
          <Text style={styles.detailValue}>
            R$ {formatAmount(item.creditsUsed)}
          </Text>
        </View>
        {item.endTime && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fim:</Text>
            <Text style={styles.detailValue}>{formatDate(item.endTime)}</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (isLoading && !parkingsData) {
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
      <ScreenHeader title="Histórico" />

      {/* Filters */}
      <View style={styles.filters}>
        <FlatList
          horizontal
          data={STATUS_FILTERS}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                statusFilter === item.value && styles.filterButtonActive,
              ]}
              onPress={() => setStatusFilter(item.value)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  statusFilter === item.value && styles.filterButtonTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.label}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        />
      </View>

      {parkings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {statusFilter
              ? 'Nenhum estacionamento encontrado com este filtro'
              : 'Nenhum estacionamento no histórico'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={parkings}
          renderItem={renderParking}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isFetching || false}
              onRefresh={refetch}
              tintColor="#ffffff"
              colors={['#0066CC']}
            />
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
  filters: {
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    paddingVertical: 12,
    backgroundColor: '#1a1a1a',
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333333',
    backgroundColor: '#2a2a2a',
    marginRight: 8,
  },
  filterButtonActive: {
    borderColor: '#0066CC',
    backgroundColor: '#0066CC',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#999999',
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  list: {
    padding: 16,
  },
  parkingCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  parkingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  parkingInfo: {
    flex: 1,
  },
  plate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 2,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#999999',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  parkingDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
    color: '#999999',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
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
    textAlign: 'center',
  },
});

