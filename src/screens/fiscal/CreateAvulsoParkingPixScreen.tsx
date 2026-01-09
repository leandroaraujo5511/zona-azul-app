import React, { useState } from 'react';
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
import { UserByCpf } from '../../services/user.service';
import { zoneService } from '../../services/zone.service';
import { Zone } from '../../types/api';
import FiscalHeader from '../../components/fiscal/FiscalHeader';
import PlateInput from '../../components/fiscal/PlateInput';
import CpfInput from '../../components/fiscal/CpfInput';
import ZoneSelector from '../../components/fiscal/ZoneSelector';
import ValueCalculator from '../../components/fiscal/ValueCalculator';
import TimeSelector from '../../components/fiscal/TimeSelector';

type FiscalStackParamList = {
  CreateAvulsoParkingPix: { plate?: string; cpf?: string; user?: UserByCpf | null } | undefined;
  AvulsoParkingPixDetails: { parkingId: string; paymentId: string } | undefined;
};

type CreateAvulsoParkingPixNavigationProp = NativeStackNavigationProp<
  FiscalStackParamList,
  'CreateAvulsoParkingPix'
>;

export default function CreateAvulsoParkingPixScreen() {
  const navigation = useNavigation<CreateAvulsoParkingPixNavigationProp>();
  const route = useRoute();
  const params = route.params as { plate?: string; cpf?: string; user?: UserByCpf | null } | undefined;

  const [plate, setPlate] = useState(params?.plate || '');
  const [cpf, setCpf] = useState(params?.cpf || '');
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [requestedMinutes, setRequestedMinutes] = useState('60');

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

  const isValidCpf = cpf.replace(/[^0-9]/g, '').length === 11;

  // Create parking mutation
  const createMutation = useMutation({
    mutationFn: () =>
      avulsoParkingService.createAvulsoParkingPix({
        plate,
        zoneId: selectedZone!.id,
        requestedMinutes: parseInt(requestedMinutes, 10),
        cpf: cpf.replace(/[^0-9]/g, ''),
      }),
    onSuccess: (result) => {
        navigation.navigate('AvulsoParkingPixDetails', {
            parkingId: result.parking.id,
            paymentId: result.payment.id,
          });
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

    if (!isValidCpf) {
      Alert.alert('Erro', 'Por favor, informe um CPF válido');
      return;
    }

    if (!selectedZone) {
      Alert.alert('Erro', 'Por favor, selecione uma zona');
      return;
    }

    const minutes = parseInt(requestedMinutes, 10);
    const minTime = 15;
    const maxTime = selectedZone?.maxTimeMinutes || 480;
    if (isNaN(minutes) || minutes < minTime || minutes > maxTime) {
      Alert.alert(
        'Erro',
        `O tempo deve ser entre ${minTime} e ${maxTime} minutos para esta zona`
      );
      return;
    }

    createMutation.mutate();
  };

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#1a1a1a"
        translucent={true}
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <FiscalHeader
            title="Criar Estacionamento Avulso (PIX)"
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
              editable={!createMutation.isPending}
            />

            {/* CPF Input */}
            <CpfInput
              value={cpf}
              onChangeText={setCpf}
              label="CPF *"
              editable={!createMutation.isPending}
            />

            {/* User Info (if found) */}
            {params?.user && (
              <View style={styles.userCard}>
                <View style={styles.userCardHeader}>
                  <Ionicons name="person-circle-outline" size={20} color="#2196F3" />
                  <Text style={styles.userCardTitle}>Usuário Encontrado</Text>
                </View>
                <Text style={styles.userCardText}>{params.user.name}</Text>
                <Text style={styles.userCardText}>{params.user.email}</Text>
              </View>
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
                minMinutes={15}
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
                  !isValidCpf ||
                  !selectedZone ||
                  !requestedMinutes) &&
                  styles.buttonDisabled,
              ]}
              onPress={handleCreate}
              disabled={
                createMutation.isPending ||
                !plate.trim() ||
                !isValidCpf ||
                !selectedZone ||
                !requestedMinutes
              }
            >
              {createMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="qr-code-outline" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Criar e Gerar QR Code PIX</Text>
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
    backgroundColor: '#f5f5f5',

  },
  scrollContent: {
    padding: 16,
  },
  userCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  userCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  userCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
  },
  userCardText: {
    fontSize: 14,
    color: '#1a1a1a',
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

