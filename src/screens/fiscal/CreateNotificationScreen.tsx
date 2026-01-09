import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
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
import Ionicons from '@expo/vector-icons/Ionicons';
import { useMutation } from '@tanstack/react-query';
import { notificationService } from '../../services/notification.service';
import FiscalHeader from '../../components/fiscal/FiscalHeader';
import PlateInput from '../../components/fiscal/PlateInput';
import { FiscalStackParamList } from '../../navigation/FiscalNavigator';

type CreateNotificationNavigationProp = NativeStackNavigationProp<
  FiscalStackParamList,
  'CreateNotification'
>;

export default function CreateNotificationScreen() {
  const navigation = useNavigation<CreateNotificationNavigationProp>();
  const route = useRoute();
  const params = route.params as { plate?: string } | undefined;

  const [plate, setPlate] = useState(params?.plate || '');
  const [observations, setObservations] = useState('');
  const [address, setAddress] = useState('');

  const createMutation = useMutation({
    mutationFn: (data: {
      plate: string;
      location?: { address?: string };
      observations?: string;
    }) => notificationService.createNotification(data),
    onSuccess: (notification) => {
      Alert.alert(
        'Notificação Criada',
        `Notificação ${notification.notificationNumber} criada com sucesso!`,
        [
          {
            text: 'Ver Detalhes',
            onPress: () => {
              navigation.navigate('NotificationDetails', {
                notification,
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
      Alert.alert(
        'Erro',
        error.message || 'Não foi possível criar a notificação. Tente novamente.'
      );
    },
  });

  const handleCreate = () => {
    const normalizedPlate = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (normalizedPlate.length < 7) {
      Alert.alert('Erro', 'Por favor, informe uma placa válida');
      return;
    }

    const data: {
      plate: string;
      location?: { address?: string };
      observations?: string;
    } = {
      plate: normalizedPlate,
    };

    if (address.trim()) {
      data.location = { address: address.trim() };
    }

    if (observations.trim()) {
      data.observations = observations.trim();
    }

    createMutation.mutate(data);
  };

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#000000"
        translucent={true}
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <FiscalHeader
            title="Criar Notificação"
            showBackButton
            onBackPress={() => navigation.goBack()}
          />

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.form}>
              <PlateInput
                value={plate}
                onChangeText={setPlate}
                label="Placa do Veículo *"
                editable={!createMutation.isPending}
              />

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Localização (opcional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Rua das Flores, 123"
                  placeholderTextColor="#999"
                  value={address}
                  onChangeText={setAddress}
                  editable={!createMutation.isPending}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Observações (opcional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Adicione observações sobre a irregularidade..."
                  placeholderTextColor="#999"
                  value={observations}
                  onChangeText={setObservations}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={1000}
                  editable={!createMutation.isPending}
                />
                <Text style={styles.charCount}>
                  {observations.length}/1000 caracteres
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  (createMutation.isPending || !plate.trim()) && styles.buttonDisabled,
                ]}
                onPress={handleCreate}
                disabled={createMutation.isPending || !plate.trim()}
              >
                {createMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="document-text" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Criar Notificação</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
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
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
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
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'right',
  },
  button: {
    backgroundColor: '#FF9800',
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
