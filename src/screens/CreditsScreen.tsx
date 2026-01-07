import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { creditService } from '../services/credit.service';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Payment } from '../types/api';

type RootStackParamList = {
  Credits: undefined;
  Recharge: undefined;
  CreditHistory: undefined;
  Home: undefined;
  PIXPayment: {
    payment: Payment;
  };
};

type CreditsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Credits'
>;

export default function CreditsScreen() {
  const navigation = useNavigation<CreditsScreenNavigationProp>();

  const {
    data: balance,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['creditBalance'],
    queryFn: () => creditService.getBalance(),
  });

  const {
    data: pendingPaymentsData,
    isLoading: isLoadingPending,
    refetch: refetchPending,
  } = useQuery({
    queryKey: ['pendingPayments'],
    queryFn: () => creditService.getPendingPayments(),
  });

  const pendingPayments = pendingPaymentsData?.data || [];

  const formatBalance = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" translucent={false} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching || false}
              onRefresh={() => {
                refetch();
                refetchPending();
              }}
              tintColor="#ffffff"
              colors={['#0066CC']}
            />
          }
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <IconSymbol name="chevron.left" size={24} color="#0066CC" />
            </TouchableOpacity>
            <Text style={styles.title}>Créditos</Text>
          </View>

      <View style={styles.content}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo Disponível</Text>
          {isLoading ? (
            <ActivityIndicator size="large" color="#0066CC" style={styles.loader} />
          ) : (
            <Text style={styles.balanceValue}>
              {formatBalance(balance?.balance || 0)}
            </Text>
          )}
          {balance && (
            <Text style={styles.balanceUpdated}>
              Atualizado em {new Date(balance.lastUpdated).toLocaleDateString('pt-BR')}
            </Text>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Recharge')}
          >
            <Text style={styles.actionButtonIcon}>💰</Text>
            <Text style={styles.actionButtonText}>Recarregar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={() => navigation.navigate('CreditHistory')}
          >
            <Text style={styles.actionButtonIcon}>📋</Text>
            <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>
              Histórico
            </Text>
          </TouchableOpacity>
        </View>

        {/* Pending Payments Section */}
        {pendingPayments.length > 0 && (
          <View style={styles.pendingSection}>
            <Text style={styles.pendingSectionTitle}>Pagamentos Pendentes</Text>
            {pendingPayments.map((payment) => {
              const expiresAt = new Date(payment.expiresAt);
              const now = new Date();
              const timeRemaining = expiresAt.getTime() - now.getTime();
              const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
              const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

              return (
                <TouchableOpacity
                  key={payment.id}
                  style={styles.pendingPaymentCard}
                  onPress={() => {
                    navigation.navigate('PIXPayment', {
                      payment: payment as any,
                    });
                  }}
                >
                  <View style={styles.pendingPaymentHeader}>
                    <View style={styles.pendingPaymentInfo}>
                      <Text style={styles.pendingPaymentAmount}>
                        R$ {payment.amount.toFixed(2).replace('.', ',')}
                      </Text>
                      <Text style={styles.pendingPaymentMethod}>
                        {payment.method.toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.pendingPaymentBadge}>
                      <Text style={styles.pendingPaymentBadgeText}>Pendente</Text>
                    </View>
                  </View>
                  <View style={styles.pendingPaymentFooter}>
                    <Text style={styles.pendingPaymentTime}>
                      {hoursRemaining > 0
                        ? `${hoursRemaining}h ${minutesRemaining}min restantes`
                        : `${minutesRemaining}min restantes`}
                    </Text>
                    <IconSymbol name="chevron.right" androidName="chevron-forward" size={20} color="#0066CC" />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Como funciona?</Text>
          <Text style={styles.infoText}>
            • Os créditos são usados para pagar estacionamentos
          </Text>
          <Text style={styles.infoText}>
            • Recarregue quando precisar adicionar mais créditos
          </Text>
          <Text style={styles.infoText}>
            • Visualize todas as transações no histórico
          </Text>
        </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#0066CC',
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
  },
  content: {
    padding: 16,
  },
  balanceCard: {
    backgroundColor: '#0066CC',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#0066CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#E6F4FE',
    marginBottom: 8,
    fontWeight: '500',
  },
  balanceValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  balanceUpdated: {
    fontSize: 12,
    color: '#B3D9FF',
  },
  loader: {
    marginVertical: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#0066CC',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0066CC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonSecondary: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#333333',
  },
  actionButtonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  actionButtonTextSecondary: {
    color: '#ffffff',
  },
  infoCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066CC',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 8,
    lineHeight: 20,
  },
  pendingSection: {
    marginBottom: 24,
  },
  pendingSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  pendingPaymentCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  pendingPaymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  pendingPaymentInfo: {
    flex: 1,
  },
  pendingPaymentAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066CC',
    marginBottom: 4,
  },
  pendingPaymentMethod: {
    fontSize: 12,
    color: '#999999',
    textTransform: 'uppercase',
  },
  pendingPaymentBadge: {
    backgroundColor: '#FFA500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pendingPaymentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  pendingPaymentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  pendingPaymentTime: {
    fontSize: 14,
    color: '#999999',
  },
});



