import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import ScreenHeader from '../components/ScreenHeader';
import { Payment } from '../types/api';

type RootStackParamList = {
  PIXPayment: {
    payment: Payment;
  };
};

type PIXPaymentScreenRouteProp = RouteProp<RootStackParamList, 'PIXPayment'>;
type PIXPaymentScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PIXPayment'
>;

export default function PIXPaymentScreen() {
  const navigation = useNavigation<PIXPaymentScreenNavigationProp>();
  const route = useRoute<PIXPaymentScreenRouteProp>();
  const { payment } = route.params;
  const [copied, setCopied] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Calculate time remaining
  useEffect(() => {
    const updateTimeRemaining = () => {
      const now = new Date().getTime();
      const expires = new Date(payment.expiresAt).getTime();
      const remaining = expires - now;

      if (remaining <= 0) {
        setTimeRemaining('Expirado');
        return;
      }

      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

      setTimeRemaining(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [payment.expiresAt]);

  const handleCopyPixCode = async () => {
    if (!payment.qrCodeText) {
      Alert.alert('Erro', 'Código PIX não disponível');
      return;
    }

    try {
      await Clipboard.setStringAsync(payment.qrCodeText);
      setCopied(true);
      Alert.alert('Sucesso', 'Código PIX copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível copiar o código PIX');
    }
  };

  const formatExpirationDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" translucent={false} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.container}>
          <ScreenHeader title="Pagamento PIX" />

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Payment Info Card */}
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Valor a pagar</Text>
              <Text style={styles.infoValue}>R$ {payment.amount.toFixed(2)}</Text>
              <View style={styles.timeContainer}>
                <Text style={styles.timeLabel}>Tempo restante</Text>
                <Text style={styles.timeValue}>{timeRemaining}</Text>
              </View>
              <Text style={styles.expirationText}>
                Expira em: {formatExpirationDate(payment.expiresAt)}
              </Text>
            </View>

            {/* Instructions */}
            <View style={styles.instructionsCard}>
              <Text style={styles.instructionsTitle}>Como pagar</Text>
              <View style={styles.instructionStep}>
                <Text style={styles.stepNumber}>1</Text>
                <Text style={styles.stepText}>Abra o app do seu banco</Text>
              </View>
              <View style={styles.instructionStep}>
                <Text style={styles.stepNumber}>2</Text>
                <Text style={styles.stepText}>
                  Escaneie o QR Code ou copie o código PIX
                </Text>
              </View>
              <View style={styles.instructionStep}>
                <Text style={styles.stepNumber}>3</Text>
                <Text style={styles.stepText}>Confirme o pagamento</Text>
              </View>
              <View style={styles.instructionStep}>
                <Text style={styles.stepNumber}>4</Text>
                <Text style={styles.stepText}>
                  Seus créditos serão creditados automaticamente
                </Text>
              </View>
            </View>

            {/* QRCode */}
            {payment.qrCode && (
              <View style={styles.qrCodeCard}>
                <Text style={styles.qrCodeTitle}>Escaneie o QR Code</Text>
                <View style={styles.qrCodeContainer}>
                  <Image
                    source={{ uri: payment.qrCode }}
                    style={styles.qrCodeImage}
                    resizeMode="contain"
                  />
                </View>
              </View>
            )}

            {/* PIX Copy and Paste Code */}
            {payment.qrCodeText && (
              <View style={styles.pixCodeCard}>
                <Text style={styles.pixCodeTitle}>Ou copie o código PIX</Text>
                <TouchableOpacity
                  style={styles.pixCodeContainer}
                  onPress={handleCopyPixCode}
                  activeOpacity={0.7}
                >
                  <Text style={styles.pixCodeText} numberOfLines={3}>
                    {payment.qrCodeText}
                  </Text>
                  <View style={styles.copyButton}>
                    {copied ? (
                      <Text style={styles.copyButtonText}>✓ Copiado!</Text>
                    ) : (
                      <Text style={styles.copyButtonText}>Copiar código</Text>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* Status Badge */}
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusBadge,
                  payment.status === 'pending' && styles.statusBadgePending,
                  payment.status === 'completed' && styles.statusBadgeCompleted,
                ]}
              >
                <Text style={styles.statusText}>
                  {payment.status === 'pending' && 'Aguardando pagamento'}
                  {payment.status === 'completed' && 'Pagamento confirmado'}
                  {payment.status === 'failed' && 'Pagamento falhou'}
                  {payment.status === 'cancelled' && 'Pagamento cancelado'}
                </Text>
              </View>
            </View>
          </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  infoCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 8,
  },
  infoValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0066CC',
    marginBottom: 16,
  },
  timeContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  timeLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  expirationText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 8,
  },
  instructionsCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0066CC',
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 28,
    marginRight: 12,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 20,
  },
  qrCodeCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
  },
  qrCodeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  qrCodeContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: 280,
    height: 280,
  },
  qrCodeImage: {
    width: 250,
    height: 250,
  },
  pixCodeCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  pixCodeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  pixCodeContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  pixCodeText: {
    fontSize: 12,
    color: '#cccccc',
    fontFamily: 'monospace',
    marginBottom: 12,
    lineHeight: 18,
  },
  copyButton: {
    backgroundColor: '#0066CC',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  copyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusBadgePending: {
    backgroundColor: '#FFA500',
  },
  statusBadgeCompleted: {
    backgroundColor: '#00AA00',
  },
  statusText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

