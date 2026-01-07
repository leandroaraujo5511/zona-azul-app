import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { zoneService } from '../services/zone.service';
import { Zone } from '../types/api';
import ScreenHeader from '../components/ScreenHeader';

type RootStackParamList = {
  Zones: undefined;
  StartParking: { zoneId: string };
  Home: undefined;
};

type ZonesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Zones'>;

export default function ZonesScreen() {
  const navigation = useNavigation<ZonesScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: zonesData,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['zones'],
    queryFn: () => zoneService.getAllZones({ status: 'active', limit: 100 }),
  });

  const zones = zonesData?.data || [];

  const filteredZones = zones.filter((zone) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      zone.name.toLowerCase().includes(query) ||
      zone.address.toLowerCase().includes(query) ||
      zone.code.toLowerCase().includes(query)
    );
  });

  const formatPrice = (pricePerPeriod: number, periodMinutes: number) => {
    const pricePerHour = (pricePerPeriod / periodMinutes) * 60;
    return `R$ ${pricePerHour.toFixed(2)}/hora`;
  };

  const renderZone = ({ item }: { item: Zone }) => {
    const availableSpots = item.totalSpots - (item.occupiedSpots || 0);
    const isFull = availableSpots <= 0;

    return (
      <TouchableOpacity
        style={[styles.zoneCard, isFull && styles.zoneCardFull]}
        onPress={() => navigation.navigate('StartParking', { zoneId: item.id })}
        disabled={isFull}
      >
        <View style={styles.zoneHeader}>
          <View style={styles.zoneInfo}>
            <Text style={styles.zoneName}>{item.name}</Text>
            <Text style={styles.zoneCode}>{item.code}</Text>
          </View>
          {isFull && (
            <View style={styles.fullBadge}>
              <Text style={styles.fullBadgeText}>Lotado</Text>
            </View>
          )}
        </View>

        <Text style={styles.zoneAddress}>{item.address}</Text>

        <View style={styles.zoneDetails}>
          <View style={styles.zoneDetailItem}>
            <Text style={styles.zoneDetailLabel}>Preço:</Text>
            <Text style={styles.zoneDetailValue}>
              {formatPrice(item.pricePerPeriod, item.periodMinutes)}
            </Text>
          </View>
          <View style={styles.zoneDetailItem}>
            <Text style={styles.zoneDetailLabel}>Vagas:</Text>
            <Text
              style={[
                styles.zoneDetailValue,
                isFull && styles.zoneDetailValueFull,
              ]}
            >
              {availableSpots}/{item.totalSpots}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading && !zonesData) {
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
      <ScreenHeader title="Zonas de Estacionamento" />

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar zona..."
          placeholderTextColor="#666666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {filteredZones.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery ? 'Nenhuma zona encontrada' : 'Nenhuma zona disponível'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredZones}
          renderItem={renderZone}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
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
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    backgroundColor: '#1a1a1a',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#2a2a2a',
    color: '#ffffff',
  },
  list: {
    padding: 16,
  },
  zoneCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  zoneCardFull: {
    opacity: 0.5,
  },
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  zoneInfo: {
    flex: 1,
  },
  zoneName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  zoneCode: {
    fontSize: 14,
    color: '#999999',
    fontWeight: '600',
  },
  fullBadge: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  fullBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  zoneAddress: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 12,
  },
  zoneDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  zoneDetailItem: {
    flex: 1,
  },
  zoneDetailLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  zoneDetailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066CC',
  },
  zoneDetailValueFull: {
    color: '#ff4444',
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



