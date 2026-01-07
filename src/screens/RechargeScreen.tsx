import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  TextInput,
  StatusBar,
 Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { creditService } from '../services/credit.service';
import ScreenHeader from '../components/ScreenHeader';
import { RechargeResponse } from '../types/api';

type RootStackParamList = {
  Recharge: undefined;
  Credits: undefined;
  PIXPayment: {
    payment: RechargeResponse['payment'];
  };
};

type RechargeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Recharge'
>;

const PREDEFINED_AMOUNTS = [
  { amount: 10, label: 'R$ 10,00' },
  { amount: 20, label: 'R$ 20,00' },
  { amount: 50, label: 'R$ 50,00' },
  { amount: 100, label: 'R$ 100,00' },
];

const PAYMENT_METHODS = [
  { value: 'pix' as const, label: 'PIX', icon: '💳' },
  // { value: 'credit_card' as const, label: 'Cartão de Crédito', icon: '💳' },
  // { value: 'debit_card' as const, label: 'Cartão de Débito', icon: '💳' },
];

const MIN_AMOUNT = 5.0;
const MAX_AMOUNT = 500.0;

export default function RechargeScreen() {
  const navigation = useNavigation<RechargeScreenNavigationProp>();
  const queryClient = useQueryClient();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'pix' | 'credit_card' | 'debit_card'>('pix');

  const rechargeMutation = useMutation({
    mutationFn: (data: { amount: number; paymentMethod: 'pix' | 'credit_card' | 'debit_card' }) =>
      creditService.recharge(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['creditBalance'] });
      queryClient.invalidateQueries({ queryKey: ['creditTransactions'] });
      
      // If PIX payment, navigate to PIX payment screen
      if (data.payment.method === 'pix' && data.payment.qrCode) {
        navigation.navigate('PIXPayment', { payment: data.payment });
      } else if (data.payment.paymentUrl) {
        // For other payment methods with URL
        Alert.alert(
          'Recarga Iniciada',
          `Pagamento de R$ ${data.payment.amount.toFixed(2)} criado com sucesso!\n\nEscolha como deseja pagar:`,
          [
            {
              text: 'Cancelar',
              style: 'cancel',
              onPress: () => navigation.goBack(),
            },
            {
              text: 'Abrir Link de Pagamento',
              onPress: () => {
                Linking.openURL(data.payment.paymentUrl!);
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        Alert.alert('Sucesso', 'Recarga iniciada com sucesso!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    },
    onError: (error: any) => {
      Alert.alert('Erro', error.message || 'Erro ao processar recarga');
    },
  });

  const handleRecharge = () => {
    const amount = selectedAmount || parseFloat(customAmount.replace(',', '.'));

    if (!amount || isNaN(amount)) {
      Alert.alert('Erro', 'Selecione ou insira um valor válido');
      return;
    }

    if (amount < MIN_AMOUNT) {
      Alert.alert('Erro', `Valor mínimo é R$ ${MIN_AMOUNT.toFixed(2)}`);
      return;
    }

    if (amount > MAX_AMOUNT) {
      Alert.alert('Erro', `Valor máximo é R$ ${MAX_AMOUNT.toFixed(2)}`);
      return;
    }

    Alert.alert(
      'Confirmar Recarga',
      `Deseja recarregar R$ ${amount.toFixed(2)} via ${PAYMENT_METHODS.find((m) => m.value === selectedPaymentMethod)?.label}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            rechargeMutation.mutate({
              amount,
              paymentMethod: selectedPaymentMethod,
            });
          },
        },
      ]
    );
  };

  const formatCustomAmount = (text: string) => {
    // Remove tudo exceto números e vírgula
    const cleaned = text.replace(/[^\d,]/g, '');
    // Garante apenas uma vírgula
    const parts = cleaned.split(',');
    if (parts.length > 2) {
      return parts[0] + ',' + parts.slice(1).join('');
    }
    return cleaned;
  };

  const getFinalAmount = () => {
    if (selectedAmount) return selectedAmount;
    if (customAmount) {
      const parsed = parseFloat(customAmount.replace(',', '.'));
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const finalAmount = getFinalAmount();
  const isValidAmount = finalAmount >= MIN_AMOUNT && finalAmount <= MAX_AMOUNT;

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" translucent={false} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
          <ScreenHeader title="Recarregar Créditos" />

      <View style={styles.content}>
        {/* Amount Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Valor da Recarga</Text>
          
          <View style={styles.predefinedAmounts}>
            {PREDEFINED_AMOUNTS.map((option) => {
              const isSelected = selectedAmount === option.amount;
              return (
                <TouchableOpacity
                  key={option.amount}
                  style={[
                    styles.amountOption,
                    isSelected && styles.amountOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedAmount(option.amount);
                    setCustomAmount('');
                  }}
                >
                  <Text
                    style={[
                      styles.amountOptionText,
                      isSelected && styles.amountOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.orText}>ou</Text>

          <View style={styles.customAmountContainer}>
            <Text style={styles.customAmountLabel}>Valor personalizado</Text>
            <View style={styles.customAmountInputContainer}>
              <Text style={styles.currencySymbol}>R$</Text>
              <TextInput
                style={styles.customAmountInput}
                value={customAmount}
                onChangeText={(text) => {
                  const formatted = formatCustomAmount(text);
                  setCustomAmount(formatted);
                  setSelectedAmount(null);
                }}
                placeholder="0,00"
                placeholderTextColor="#666666"
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
            <Text style={styles.amountHint}>
              Mínimo: R$ {MIN_AMOUNT.toFixed(2)} | Máximo: R$ {MAX_AMOUNT.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Payment Method Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Forma de Pagamento</Text>
          <View style={styles.paymentMethods}>
            {PAYMENT_METHODS.map((method) => {
              const isSelected = selectedPaymentMethod === method.value;
              return (
                <TouchableOpacity
                  key={method.value}
                  style={[
                    styles.paymentMethodOption,
                    isSelected && styles.paymentMethodOptionSelected,
                  ]}
                  onPress={() => setSelectedPaymentMethod(method.value)}
                >
                  <Text style={styles.paymentMethodIcon}>{method.icon}</Text>
                  <Text
                    style={[
                      styles.paymentMethodText,
                      isSelected && styles.paymentMethodTextSelected,
                    ]}
                  >
                    {method.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Summary */}
        {finalAmount > 0 && (
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Valor:</Text>
              <Text style={styles.summaryValue}>R$ {finalAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Forma de Pagamento:</Text>
              <Text style={styles.summaryValue}>
                {PAYMENT_METHODS.find((m) => m.value === selectedPaymentMethod)?.label}
              </Text>
            </View>
          </View>
        )}

        {/* Recharge Button */}
        <TouchableOpacity
          style={[
            styles.rechargeButton,
            (!isValidAmount || rechargeMutation.isPending) && styles.rechargeButtonDisabled,
          ]}
          onPress={handleRecharge}
          disabled={!isValidAmount || rechargeMutation.isPending}
        >
          {rechargeMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.rechargeButtonText}>Recarregar</Text>
          )}
        </TouchableOpacity>
      </View>
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
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  predefinedAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amountOption: {
    flex: 1,
    minWidth: '45%',
    borderWidth: 2,
    borderColor: '#333333',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
  },
  amountOptionSelected: {
    borderColor: '#0066CC',
    backgroundColor: '#0066CC',
  },
  amountOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999999',
  },
  amountOptionTextSelected: {
    color: '#ffffff',
  },
  orText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666666',
    marginVertical: 16,
  },
  customAmountContainer: {
    marginTop: 8,
  },
  customAmountLabel: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 8,
  },
  customAmountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333333',
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: '#2a2a2a',
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: '#999999',
    marginRight: 8,
  },
  customAmountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    paddingVertical: 16,
  },
  amountHint: {
    fontSize: 12,
    color: '#666666',
    marginTop: 8,
  },
  paymentMethods: {
    gap: 12,
  },
  paymentMethodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333333',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#2a2a2a',
  },
  paymentMethodOptionSelected: {
    borderColor: '#0066CC',
    backgroundColor: '#0066CC',
  },
  paymentMethodIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#999999',
  },
  paymentMethodTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  summary: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#999999',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  rechargeButton: {
    backgroundColor: '#0066CC',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0066CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  rechargeButtonDisabled: {
    opacity: 0.6,
  },
  rechargeButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});



