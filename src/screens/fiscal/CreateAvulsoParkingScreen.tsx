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
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useMutation } from '@tanstack/react-query';
import Ionicons from '@expo/vector-icons/Ionicons';
import { avulsoParkingService } from '../../services/avulsoParking.service';
import { zoneService } from '../../services/zone.service';
import { Zone } from '../../types/api';
import FiscalHeader from '../../components/fiscal/FiscalHeader';
import PlateInput from '../../components/fiscal/PlateInput';
import ZoneSelector from '../../components/fiscal/ZoneSelector';
import BalanceDisplay from '../../components/fiscal/BalanceDisplay';
import ValueCalculator from '../../components/fiscal/ValueCalculator';
import TimeSelector from '../../components/fiscal/TimeSelector';

type FiscalStackParamList = {
  CreateAvulsoParking: { plate: string; userId: string; user: any } | undefined;
  SelectUser: { plate?: string } | undefined;
  AvulsoParkingDetails: { parkingId: string } | undefined;
};

type CreateAvulsoParkingNavigationProp = NativeStackNavigationProp<
  FiscalStackParamList,
  'CreateAvulsoParking'
>;

export default function CreateAvulsoParkingScreen() {
  const navigation = useNavigation<CreateAvulsoParkingNavigationProp>();
  const route = useRoute();
  const params = route.params as { plate?: string; userId?: string; user?: any } | undefined;

  const [plate, setPlate] = useState(params?.plate || '');
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [requestedMinutes, setRequestedMinutes] = useState('60');
  const [selectedUser, setSelectedUser] = useState<any>(params?.user || null);

  // Fetch zones
  const { data: zonesData, isLoading: isLoadingZones } = useQuery({
    queryKey: ['zones', 'active'],
    queryFn: () => zoneService.getAllZones({ status: 'active' }),
  });

  const zones = zonesData?.data || [];

  // Calculate parking value
  const calculateValue = () => {
    if (!selectedZone || !requestedMinutes) return 0;
    const minutes = parseInt(requestedMinutes, 10);
    if (isNaN(minutes) || minutes <= 0) return 0;
    const periods = Math.ceil(minutes / selectedZone.periodMinutes);
    return periods * selectedZone.pricePerPeriod;
  };

  const totalValue = calculateValue();
  const userBalance = selectedUser?.balance || 0;
  const hasSufficientBalance = userBalance >= totalValue;

  // Create parking mutation
  const createMutation = useMutation({
    mutationFn: () =>
      avulsoParkingService.createAvulsoParkingWithUser({
        plate,
        zoneId: selectedZone!.id,
        requestedMinutes: parseInt(requestedMinutes, 10),
        userId: (selectedUser as any)?.userId || (selectedUser as any)?.id || selectedUser?.id,
      }),
    onSuccess: (parking) => {
      Alert.alert(
        'Sucesso',
        'Estacionamento avulso criado com sucesso!',
        [
          {
            text: 'Ver Detalhes',
            onPress: () => {
              navigation.navigate('AvulsoParkingDetails', {
                parkingId: parking.id,
              });
            },
          },
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    },
    onError: (error: any) => {
      Alert.alert('Erro', error.message || 'Não foi possível criar o estacionamento. Tente novamente.');
    },
  });

  const handleCreate = () => {
    if (!plate.trim()) {
      Alert.alert('Erro', 'Por favor, informe a placa do veículo');
      return;
    }

    if (!selectedZone) {
      Alert.alert('Erro', 'Por favor, selecione uma zona');
      return;
    }

    if (!selectedUser) {
      Alert.alert('Erro', 'Por favor, selecione um usuário');
      return;
    }

    const minutes = parseInt(requestedMinutes, 10);
    const minTime = 15; // Default minimum
    const maxTime = selectedZone?.maxTimeMinutes || 480;
    if (isNaN(minutes) || minutes < minTime || minutes > maxTime) {
      Alert.alert(
        'Erro',
        `O tempo deve ser entre ${minTime} e ${maxTime} minutos para esta zona`
      );
      return;
    }

    if (!hasSufficientBalance) {
      Alert.alert(
        'Saldo Insuficiente',
        `O saldo disponível (R$ ${userBalance.toFixed(2)}) é menor que o valor necessário (R$ ${totalValue.toFixed(2)}). Deseja continuar mesmo assim?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Continuar',
            onPress: () => createMutation.mutate(),
          },
        ]
      );
      return;
    }

    createMutation.mutate();
  };

  const handleSelectUser = () => {
    navigation.navigate('SelectUser', { plate });
  };

  // Update selected user when returning from SelectUser screen
  useEffect(() => {
    if (params?.user) {
      setSelectedUser(params.user);
    }
    if (params?.plate && params.plate !== plate) {
      setPlate(params.plate);
    }
  }, [params?.user, params?.plate, plate]);

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
          <FiscalHeader
            title="Criar Estacionamento Avulso"
            showBackButton
            onBackPress={() => navigation.goBack()}
          />

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Plate Input */}
            <PlateInput
              value={plate}
              onChangeText={setPlate}
              label="Placa do Veículo *"
              editable={!createMutation.isPending && !selectedUser}
            />

            {/* User Selection */}
            <View style={styles.section}>
              <Text style={styles.label}>Usuário *</Text>
              {selectedUser ? (
                <View style={styles.selectedUserCard}>
                  <View style={styles.selectedUserInfo}>
                    <Text style={styles.selectedUserName}>{selectedUser.name}</Text>
                    <Text style={styles.selectedUserEmail}>{selectedUser.email}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleSelectUser}
                    style={styles.changeUserButton}
                  >
                    <Text style={styles.changeUserText}>Alterar</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.selectUserButton}
                  onPress={handleSelectUser}
                  disabled={!plate.trim()}
                >
                  <Ionicons name="person-add-outline" size={20} color="#2196F3" />
                  <Text style={styles.selectUserText}>Selecionar Usuário</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Balance Display */}
            {selectedUser && (
              <BalanceDisplay 
                balance={userBalance || 0} 
                requiredAmount={totalValue > 0 ? totalValue : undefined} 
              />
            )}

            {/* Zone Selector */}
            <ZoneSelector
              zones={zones}
              selectedZone={selectedZone}
              onSelect={setSelectedZone}
              isLoading={isLoadingZones}
            />

            {/* Time Selector */}
            {selectedZone ? (
              <TimeSelector
                value={requestedMinutes}
                onChange={setRequestedMinutes}
                disabled={createMutation.isPending}
                minMinutes={15} // Default minimum, can be adjusted if zone has minTimeMinutes
                maxMinutes={selectedZone.maxTimeMinutes}
                periodMinutes={selectedZone.periodMinutes}
              />
            ) : (
              <View style={styles.zoneRequiredContainer}>
                <Text style={styles.zoneRequiredText}>
                  Selecione uma zona para escolher o tempo
                </Text>
              </View>
            )}

            {/* Value Calculator */}
            {selectedZone && requestedMinutes && (
              <ValueCalculator
                requestedMinutes={parseInt(requestedMinutes, 10) || 0}
                periodMinutes={selectedZone.periodMinutes}
                pricePerPeriod={selectedZone.pricePerPeriod}
              />
            )}

            {/* Create Button */}
            <TouchableOpacity
              style={[
                styles.button,
                (createMutation.isPending ||
                  !plate.trim() ||
                  !selectedZone ||
                  !selectedUser ||
                  !requestedMinutes) &&
                  styles.buttonDisabled,
              ]}
              onPress={handleCreate}
              disabled={
                createMutation.isPending ||
                !plate.trim() ||
                !selectedZone ||
                !selectedUser ||
                !requestedMinutes
              }
            >
              {createMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="car" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Criar Estacionamento</Text>
                </>
              )}
            </TouchableOpacity>
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
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  selectedUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedUserInfo: {
    flex: 1,
  },
  selectedUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  selectedUserEmail: {
    fontSize: 14,
    color: '#666',
  },
  changeUserButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  changeUserText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  selectUserButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2196F3',
    borderStyle: 'dashed',
  },
  selectUserText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#1a1a1a',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  zoneRequiredContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    marginBottom: 16,
  },
  zoneRequiredText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
