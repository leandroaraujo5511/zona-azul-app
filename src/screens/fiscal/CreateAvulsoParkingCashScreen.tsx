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
import { zoneService } from '../../services/zone.service';
import { Zone } from '../../types/api';
import FiscalHeader from '../../components/fiscal/FiscalHeader';
import PlateInput from '../../components/fiscal/PlateInput';
import ZoneSelector from '../../components/fiscal/ZoneSelector';
import ValueCalculator from '../../components/fiscal/ValueCalculator';
import TimeSelector from '../../components/fiscal/TimeSelector';
import LocationInput from '../../components/fiscal/LocationInput';
import ObservationsInput from '../../components/fiscal/ObservationsInput';

type FiscalStackParamList = {
  CreateAvulsoParkingCash: { plate?: string } | undefined;
  AvulsoParkingDetails: { parkingId: string } | undefined;
};

type CreateAvulsoParkingCashNavigationProp = NativeStackNavigationProp<
  FiscalStackParamList,
  'CreateAvulsoParkingCash'
>;

export default function CreateAvulsoParkingCashScreen() {
  const navigation = useNavigation<CreateAvulsoParkingCashNavigationProp>();
  const route = useRoute();
  const params = route.params as { plate?: string } | undefined;

  const [plate, setPlate] = useState(params?.plate || '');
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [requestedMinutes, setRequestedMinutes] = useState('60');
  const [location, setLocation] = useState('');
  const [observations, setObservations] = useState('');

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

  // Create parking mutation
  const createMutation = useMutation({
    mutationFn: () =>
      avulsoParkingService.createAvulsoParkingCash({
        plate,
        zoneId: selectedZone!.id,
        requestedMinutes: parseInt(requestedMinutes, 10),
        location: location.trim() ? { address: location.trim() } : undefined,
        observations: observations.trim() || undefined,
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
        translucent={false}
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <FiscalHeader
            title="Criar Estacionamento Avulso (Dinheiro)"
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

            {/* Location Input */}
            <LocationInput
              value={location}
              onChangeText={setLocation}
              label="Localização"
              editable={!createMutation.isPending}
            />

            {/* Observations Input */}
            <ObservationsInput
              value={observations}
              onChangeText={setObservations}
              label="Observações"
              editable={!createMutation.isPending}
              maxLength={500}
            />

            {/* Create Button */}
            <TouchableOpacity
              style={[
                styles.button,
                (createMutation.isPending ||
                  !plate.trim() ||
                  !selectedZone ||
                  !requestedMinutes) &&
                  styles.buttonDisabled,
              ]}
              onPress={handleCreate}
              disabled={
                createMutation.isPending ||
                !plate.trim() ||
                !selectedZone ||
                !requestedMinutes
              }
            >
              {createMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="cash-outline" size={20} color="#fff" />
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
    backgroundColor: '#4CAF50',
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

