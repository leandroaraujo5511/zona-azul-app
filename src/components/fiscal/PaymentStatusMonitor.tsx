import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { paymentService } from '../../services/payment.service';
import Ionicons from '@expo/vector-icons/Ionicons';

interface PaymentStatusMonitorProps {
  paymentId: string;
  onStatusChange?: (status: string) => void;
  pollingInterval?: number; // in milliseconds
}

export default function PaymentStatusMonitor({
  paymentId,
  onStatusChange,
  pollingInterval = 5000, // 5 seconds default
}: PaymentStatusMonitorProps) {
  const { data: payment, isLoading } = useQuery({
    queryKey: ['payment', paymentId],
    queryFn: () => paymentService.getPaymentById(paymentId),
    refetchInterval: (query) => {
      const payment = query.state.data;
      // Stop polling if payment is completed, expired, or cancelled
      if (payment && ['completed', 'expired', 'cancelled'].includes(payment.status)) {
        return false;
      }
      return pollingInterval;
    },
  });

  useEffect(() => {
    if (payment && onStatusChange) {
      onStatusChange(payment.status);
    }
  }, [payment?.status, onStatusChange]);

  if (isLoading || !payment) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#2196F3" />
        <Text style={styles.statusText}>Verificando pagamento...</Text>
      </View>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          icon: 'checkmark-circle',
          color: '#4CAF50',
          label: 'Pagamento Confirmado',
          message: 'O pagamento foi confirmado com sucesso!',
        };
      case 'expired':
        return {
          icon: 'time-outline',
          color: '#FF9800',
          label: 'QR Code Expirado',
          message: 'O QR Code expirou. Crie um novo estacionamento.',
        };
      case 'cancelled':
        return {
          icon: 'close-circle',
          color: '#f44336',
          label: 'Pagamento Cancelado',
          message: 'O pagamento foi cancelado.',
        };
      case 'pending':
      default:
        return {
          icon: 'hourglass-outline',
          color: '#2196F3',
          label: 'Aguardando Pagamento',
          message: 'Aguardando confirmação do pagamento...',
        };
    }
  };

  const statusConfig = getStatusConfig(payment.status);

  return (
    <View style={styles.container}>
      <View style={[styles.statusBadge, { backgroundColor: `${statusConfig.color}20` }]}>
        <Ionicons name={statusConfig.icon as any} size={20} color={statusConfig.color} />
        <Text style={[styles.statusLabel, { color: statusConfig.color }]}>
          {statusConfig.label}
        </Text>
      </View>
      <Text style={styles.statusMessage}>{statusConfig.message}</Text>
      {payment.status === 'pending' && (
        <Text style={styles.pollingHint}>
          Verificando automaticamente a cada {pollingInterval / 1000} segundos...
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  statusMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  pollingHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

