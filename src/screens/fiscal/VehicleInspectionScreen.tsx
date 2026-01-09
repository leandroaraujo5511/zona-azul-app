import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { fiscalService } from '../../services/fiscal.service';
import FiscalHeader from '../../components/fiscal/FiscalHeader';
import PlateInput from '../../components/fiscal/PlateInput';
import StatusBadge from '../../components/fiscal/StatusBadge';

type FiscalStackParamList = {
  FiscalDashboard: undefined;
  VehicleInspection: undefined;
  CreateNotification: { plate: string } | undefined;
  SelectUser: { plate?: string } | undefined;
  CreateAvulsoParking: { plate?: string; userId?: string; user?: any } | undefined;
  CollectCpf: { plate?: string } | undefined;
  CreateAvulsoParkingCash: { plate?: string } | undefined;
};

type VehicleInspectionNavigationProp = NativeStackNavigationProp<
  FiscalStackParamList,
  'VehicleInspection'
>;

export default function VehicleInspectionScreen() {
  const navigation = useNavigation<VehicleInspectionNavigationProp>();
  const [plate, setPlate] = useState('');
  const [searchPlate, setSearchPlate] = useState('');

  // Query parking by plate
  const {
    data: parkingData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['parking-by-plate', searchPlate],
    queryFn: () => fiscalService.getParkingByPlate(searchPlate),
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
    if (normalized.length >= 7) {
    refetch();
    }
  };

  useEffect(() => {
    if (searchPlate.length >= 7) {
      refetch();
    }
  }, [searchPlate]);

  const handleCreateNotification = () => {
    if (!searchPlate) {
      Alert.alert('Erro', 'Por favor, busque uma placa primeiro');
      return;
    }
    navigation.navigate('CreateNotification', { plate: searchPlate });
  };

  const handleCreateAvulsoParking = () => {
    if (!searchPlate) {
      Alert.alert('Erro', 'Por favor, busque uma placa primeiro');
      return;
    }
    navigation.navigate('SelectUser', { plate: searchPlate });
  };

  const handleCreateAvulsoParkingPix = () => {
    if (!searchPlate) {
      Alert.alert('Erro', 'Por favor, busque uma placa primeiro');
      return;
    }
    navigation.navigate('CollectCpf', { plate: searchPlate });
  };

  const handleCreateAvulsoParkingCash = () => {
    if (!searchPlate) {
      Alert.alert('Erro', 'Por favor, busque uma placa primeiro');
      return;
    }
    navigation.navigate('CreateAvulsoParkingCash', { plate: searchPlate });
  };


  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#1a1a1a"
        translucent={false}
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <FiscalHeader
            title="Fiscalizar Veículo"
            showBackButton
            onBackPress={() => navigation.goBack()}
          />

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
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

            {/* Results Section */}
            {parkingData && (
              <View style={styles.resultsSection}>
                {parkingData.found ? (
                  <>
                    <View style={styles.statusCard}>
                      <View style={styles.statusHeader}>
                        <Ionicons
                          name="checkmark-circle"
                          size={32}
                          color="#4CAF50"
                        />
                        <Text style={styles.statusTitle}>Estacionamento Ativo</Text>
                      </View>
                      {parkingData.parking && (
                        <View style={styles.parkingInfo}>
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Status:</Text>
                            <StatusBadge status={parkingData.parking.status} />
                          </View>
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Zona:</Text>
                            <Text style={styles.infoValue}>
                              {parkingData.parking.zone?.name || 'N/A'}
                            </Text>
                          </View>
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Código da Zona:</Text>
                            <Text style={styles.infoValue}>
                              {parkingData.parking.zone?.code || 'N/A'}
                            </Text>
                          </View>
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Tempo Restante:</Text>
                            <Text style={styles.infoValue}>
                              {parkingData.parking.timeRemaining || 0} minutos
                            </Text>
                          </View>
                          {parkingData.parking.expectedEndTime && (
                            <View style={styles.infoRow}>
                              <Text style={styles.infoLabel}>Válido até:</Text>
                              <Text style={styles.infoValue}>
                                {new Date(parkingData.parking.expectedEndTime).toLocaleString(
                                  'pt-BR'
                                )}
                              </Text>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  </>
                ) : (
                  <View style={styles.statusCard}>
                    <View style={styles.statusHeader}>
                      <Ionicons
                        name="close-circle"
                        size={32}
                        color="#F44336"
                      />
                      <Text style={styles.statusTitle}>Estacionamento Não Encontrado</Text>
                    </View>
                    <Text style={styles.statusDescription}>
                      {parkingData.reason ||
                        'Este veículo não possui estacionamento ativo.'}
                    </Text>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionsContainer}>
                  {!parkingData.found && parkingData.canCreateNotification && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.notificationButton]}
                      onPress={handleCreateNotification}
                    >
                      <Ionicons name="document-text" size={20} color="#fff" />
                      <Text style={styles.actionButtonText}>Criar Notificação</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.actionButton, styles.parkingButton]}
                    onPress={handleCreateAvulsoParking}
                  >
                    <Ionicons name="car" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>
                      Estacionamento Avulso (Saldo)
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.pixButton]}
                    onPress={handleCreateAvulsoParkingPix}
                  >
                    <Ionicons name="qr-code" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>
                      Estacionamento Avulso (PIX)
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.cashButton]}
                    onPress={handleCreateAvulsoParkingCash}
                  >
                    <Ionicons name="cash" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>
                      Estacionamento Avulso (Dinheiro)
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  searchSection: {
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    
  },
  inputContainer: {
    flex: 1,
  },
  searchButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    width: 56,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  resultsSection: {
    marginTop: 8,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  statusDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  parkingInfo: {
    gap: 12,
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  notificationButton: {
    backgroundColor: '#FF9800',
  },
  parkingButton: {
    backgroundColor: '#2196F3',
  },
  pixButton: {
    backgroundColor: '#4CAF50',
  },
  cashButton: {
    backgroundColor: '#FF9800',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

