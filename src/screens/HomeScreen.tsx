import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons'
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { vehicleService } from '../services/vehicle.service';
import { creditService } from '../services/credit.service';
import { parkingService } from '../services/parking.service';
import { IconSymbol } from '@/components/ui/icon-symbol';
import LoadingScreen from '../components/LoadingScreen';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Vehicles: undefined;
  VehicleForm: { vehicleId?: string } | undefined;
  Zones: undefined;
  StartParking: { zoneId: string };
  ActiveParking: undefined;
  RenewParking: { parkingId: string };
  ParkingHistory: undefined;
  Credits: undefined;
  CreditHistory: undefined;
  Recharge: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user, logout } = useAuth();
  const isIOS = Platform.OS === 'ios' && false;
  // Load vehicles to get default vehicle
  const { data: vehicles, isLoading: isLoadingVehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehicleService.getAllVehicles(),
  });

  // Load credit balance
  const {
    data: balance,
    isLoading: isLoadingBalance,
    refetch: refetchBalance,
    isRefetching: isRefetchingBalance,
  } = useQuery({
    queryKey: ['creditBalance'],
    queryFn: () => creditService.getBalance(),
  });

  // Load active parkings (active, expiring, and expired)
  const {
    data: activeParkingsData,
    isLoading: isLoadingActiveParkings,
    refetch: refetchActiveParkings,
    isRefetching: isRefetchingActiveParkings,
  } = useQuery({
    queryKey: ['activeParkings'],
    queryFn: () => parkingService.getAllParkings({ status: 'active', limit: 10 }),
  });

  const {
    data: expiringParkingsData,
    isLoading: isLoadingExpiringParkings,
    refetch: refetchExpiringParkings,
    isRefetching: isRefetchingExpiringParkings,
  } = useQuery({
    queryKey: ['expiringParkings'],
    queryFn: () => parkingService.getAllParkings({ status: 'expiring', limit: 10 }),
  });

  const {
    data: expiredParkingsData,
    isLoading: isLoadingExpiredParkings,
    refetch: refetchExpiredParkings,
    isRefetching: isRefetchingExpiredParkings,
  } = useQuery({
    queryKey: ['expiredParkings'],
    queryFn: () => parkingService.getAllParkings({ status: 'expired', limit: 10 }),
  });

  // Combine active, expiring, and expired parkings, removing duplicates
  const activeParkings = [
    ...(activeParkingsData?.data || []),
    ...(expiringParkingsData?.data || []),
    ...(expiredParkingsData?.data || []),
  ].filter((parking, index, self) => 
    index === self.findIndex((p) => p.id === parking.id)
  );

  const isLoadingParking = isLoadingActiveParkings || isLoadingExpiringParkings || isLoadingExpiredParkings;
  const isRefetchingParkings = isRefetchingActiveParkings || isRefetchingExpiringParkings || isRefetchingExpiredParkings;

  // Mostra loading enquanto carrega os dados iniciais
  const isLoading = isLoadingVehicles || isLoadingBalance || isLoadingParking;

  const defaultVehicle = vehicles?.find((v) => v.isDefault) || vehicles?.[0];

  const formatBalance = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.navigate('Login');
          },
        },
      ]
    );
  };

  // Mostra loading personalizado enquanto carrega dados iniciais
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" translucent={false} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Olá,</Text>
              <Text style={styles.userName}>{`${user?.name?.split(' ')[0]} ${user?.name?.split(' ')[1]} `|| 'Usuário'}</Text>
            </View>
            <TouchableOpacity style={styles.menuButton} onPress={handleLogout}>
                {isIOS ? (
                  <IconSymbol name="power" size={24} color="#cc0000" />
                ) : (
                  <Ionicons name="power" size={24} color="#cc0000" />
                )}

            </TouchableOpacity>
          </View>
        </View>
        
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetchingBalance || isRefetchingParkings}
            onRefresh={() => {
              refetchBalance();
              refetchActiveParkings();
              refetchExpiringParkings();
              refetchExpiredParkings();
            }}
            tintColor="#ffffff"
            colors={['#0066CC']}
          />
        }
        >
       
      {/* Vehicle Section */}
      {defaultVehicle && (
        <TouchableOpacity style={styles.vehicleSection} onPress={() => navigation.navigate('Vehicles')}>
          <View style={styles.vehicleCard}>
            <View style={styles.vehicleIconContainer}>
              <Text style={styles.vehicleIcon}>🚗</Text>
            </View>
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleLabel}>Veículo</Text>
              <Text style={styles.vehiclePlate}>{defaultVehicle.plate}</Text>
              {defaultVehicle.nickname && (
                <Text style={styles.vehicleNickname}>{defaultVehicle.nickname}</Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* Quick Actions Grid */}
      <View style={styles.content}>
        {/* Credit Card - Prominent */}
        <TouchableOpacity
          style={styles.creditCard}
          onPress={() => navigation.navigate('Credits')}
        >
          <View style={styles.creditCardHeader}>
            <View style={styles.creditCardIconContainer}>
              <Text style={styles.creditCardIcon}>💰</Text>
            </View>
            <View style={styles.creditCardInfo}>
              <Text style={styles.creditCardTitle}>Créditos</Text>
              {isLoadingBalance ? (
                <ActivityIndicator size="small" color="#ffffff" style={styles.creditBalanceLoader} />
              ) : (
                <Text style={styles.creditCardBalance}>
                  Saldo {formatBalance(balance?.balance || 0)}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.creditCardFooter}>
            <Text style={styles.creditCardAction}>Ver detalhes ›</Text>
          </View>
        </TouchableOpacity>

        {/* Active Parkings List */}
        {activeParkings.length > 0 && (
          <View style={styles.activeParkingsSection}>
            <Text style={styles.activeParkingsSectionTitle}>
              Estacionamentos Ativos ({activeParkings.length})
            </Text>
            {activeParkings.map((parking) => {
              // Calculate time remaining
              let timeRemainingText = '';
              if (parking.timeRemaining !== undefined) {
                const hours = Math.floor(parking.timeRemaining / 60);
                const minutes = parking.timeRemaining % 60;
                timeRemainingText = hours > 0 
                  ? `${hours}h ${minutes}m restantes`
                  : `${minutes} min restantes`;
              } else if (parking.expectedEndTime) {
                const now = new Date().getTime();
                const endTime = new Date(parking.expectedEndTime).getTime();
                const remaining = Math.max(0, Math.floor((endTime - now) / (1000 * 60)));
                const hours = Math.floor(remaining / 60);
                const minutes = remaining % 60;
                timeRemainingText = hours > 0 
                  ? `${hours}h ${minutes}m restantes`
                  : `${minutes} min restantes`;
              }

              // Get status color for badge
              const getStatusColor = (status: string) => {
                switch (status) {
                  case 'active':
                    return '#28a745';
                  case 'expiring':
                    return '#ffc107';
                  case 'expired':
                    return '#ff4444';
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
                  default:
                    return status;
                }
              };

              return (
                <TouchableOpacity
                  key={parking.id}
                  style={[
                    styles.activeParkingCard,
                    { borderColor: getStatusColor(parking.status) },
                  ]}
                  onPress={() => navigation.navigate('ActiveParking')}
                >
                  <View style={styles.activeParkingIconContainer}>
                    <Text style={styles.activeParkingIcon}>⏱️</Text>
                  </View>
                  <View style={styles.activeParkingInfo}>
                    <Text style={styles.activeParkingTitle}>Estacionamento Ativo</Text>
                    <Text style={styles.activeParkingPlate}>{parking.plate}</Text>
                    {parking.zone && (
                      <Text style={styles.activeParkingZone}>{parking.zone.name}</Text>
                    )}
                    {timeRemainingText && (
                      <Text style={[
                        styles.activeParkingTime,
                        parking.status === 'expiring' && styles.activeParkingTimeWarning,
                        parking.status === 'expired' && styles.activeParkingTimeExpired,
                      ]}>
                        {timeRemainingText}
                      </Text>
                    )}
                  </View>
                  <View style={[
                    styles.activeParkingBadge,
                    { backgroundColor: getStatusColor(parking.status) },
                  ]}>
                    <Text style={styles.activeParkingBadgeText}>
                      {getStatusLabel(parking.status)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Services Grid */}
        <View style={styles.servicesGrid}>
          {/* Zone Parking */}
          <TouchableOpacity
            style={[styles.serviceCard, styles.serviceCardPrimary]}
            onPress={() => navigation.navigate('Zones')}
          >
            <View style={styles.serviceIconCircle}>
              <Text style={styles.serviceIcon}>📍</Text>
            </View>
            <Text style={styles.serviceTitle}>Zona Azul</Text>
            <Text style={styles.serviceDescription}>Estacionar</Text>
          </TouchableOpacity>

          {/* Vehicles */}
          <TouchableOpacity
            style={[styles.serviceCard, styles.serviceCardGray]}
            onPress={() => navigation.navigate('Vehicles')}
          >
            <View style={styles.serviceIconCircle}>
              <Text style={styles.serviceIcon}>🚗</Text>
            </View>
            <Text style={styles.serviceTitle}>Veículos</Text>
            <Text style={styles.serviceDescription}>Gerenciar</Text>
          </TouchableOpacity>

          {/* History */}
          <TouchableOpacity
            style={[styles.serviceCard, styles.serviceCardGray]}
            onPress={() => navigation.navigate('ParkingHistory')}
          >
            <View style={styles.serviceIconCircle}>
              <Text style={styles.serviceIcon}>📋</Text>
            </View>
            <Text style={styles.serviceTitle}>Histórico</Text>
            <Text style={styles.serviceDescription}>Estacionamentos</Text>
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollContent: {
    paddingBottom: 64,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1a1a1a',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 16,
    color: '#999999',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 20,
    color: '#ffffff',
  },
  vehicleSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  vehicleIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  vehicleIcon: {
    fontSize: 32,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 4,
  },
  vehiclePlate: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 2,
  },
  vehicleNickname: {
    fontSize: 14,
    color: '#999999',
    marginTop: 2,
  },
  vehicleEditButton: {
    padding: 8,
  },
  vehicleEditIcon: {
    fontSize: 16,
    color: '#999999',
  },
  content: {
    paddingHorizontal: 20,
  },
  creditCard: {
    backgroundColor: '#0066CC',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#0066CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  creditCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  creditCardIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  creditCardIcon: {
    fontSize: 28,
  },
  creditCardInfo: {
    flex: 1,
  },
  creditCardTitle: {
    fontSize: 16,
    color: '#E6F4FE',
    marginBottom: 4,
  },
  creditCardBalance: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  creditBalanceLoader: {
    marginTop: 8,
  },
  creditCardFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 12,
  },
  creditCardAction: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  activeParkingsSection: {
    marginBottom: 20,
  },
  activeParkingsSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  activeParkingCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#28a745',
  },
  activeParkingIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#28a74520',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activeParkingIcon: {
    fontSize: 28,
  },
  activeParkingInfo: {
    flex: 1,
  },
  activeParkingTitle: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 4,
  },
  activeParkingPlate: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  activeParkingZone: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 4,
  },
  activeParkingTime: {
    fontSize: 12,
    color: '#28a745',
  },
  activeParkingTimeWarning: {
    color: '#ffc107',
  },
  activeParkingTimeExpired: {
    color: '#ff4444',
  },
  activeParkingBadge: {
    backgroundColor: '#28a745',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  activeParkingBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceCard: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  serviceCardPrimary: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
  },
  serviceCardGray: {
    backgroundColor: '#2a2a2a',
    borderColor: '#333333',
  },
  serviceIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceIcon: {
    fontSize: 28,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 12,
    color: '#999999',
  },
});
