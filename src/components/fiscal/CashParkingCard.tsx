import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { CashParkingNotSettled } from '../../types/api';
import StatusBadge from './StatusBadge';

interface CashParkingCardProps {
  parking: CashParkingNotSettled;
  onSettle: (parkingId: string) => void;
  onViewDetails: (parkingId: string) => void;
  isSettling?: boolean;
}

export default function CashParkingCard({
  parking,
  onSettle,
  onViewDetails,
  isSettling = false,
}: CashParkingCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const isSettled = parking.payment?.status === 'completed';

  return (
    <View style={[styles.container, !isSettled && styles.containerPending]}>
      <View style={styles.header}>
        <View style={styles.plateContainer}>
          <View style={styles.plateIconContainer}>
            <Ionicons name="car" size={20} color="#2196F3" />
          </View>
          <View>
            <Text style={styles.plate}>{parking.plate}</Text>
            {parking.zone && (
              <Text style={styles.zoneName}>{parking.zone.name}</Text>
            )}
          </View>
        </View>
        <View style={styles.statusContainer}>
          <StatusBadge status={parking.status} />
          <View style={[styles.settledBadge, isSettled && styles.settledBadgeActive]}>
            <Ionicons
              name={isSettled ? 'checkmark-circle' : 'time-outline'}
              size={14}
              color={isSettled ? '#4CAF50' : '#FF9800'}
            />
            <Text
              style={[
                styles.settledText,
                { color: isSettled ? '#4CAF50' : '#FF9800' },
              ]}
            >
              {isSettled ? 'Baixado' : 'Pendente'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.infoGrid}>
          {parking.payment && (
            <View style={styles.infoItem}>
              <Ionicons name="cash-outline" size={16} color="#666" />
              <View style={styles.infoItemContent}>
                <Text style={styles.infoItemLabel}>Valor</Text>
                <Text style={styles.infoItemValue}>{formatCurrency(parking.payment.amount)}</Text>
              </View>
            </View>
          )}
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <View style={styles.infoItemContent}>
              <Text style={styles.infoItemLabel}>Data</Text>
              <Text style={styles.infoItemValue}>{formatDate(parking.createdAt)}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.actions}>
          {!isSettled && (
            <TouchableOpacity
              style={[styles.button, styles.settleButton]}
              onPress={() => onSettle(parking.id)}
              disabled={isSettling}
            >
              {isSettling ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="checkmark-circle" size={18} color="#fff" />
              )}
              <Text style={styles.buttonText}>
                {isSettling ? 'Baixando...' : 'Dar Baixa'}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.button, styles.detailsButton]}
            onPress={() => onViewDetails(parking.id)}
          >
            <Ionicons name="eye-outline" size={18} color="#2196F3" />
            <Text style={[styles.buttonText, { color: '#2196F3' }]}>
              Detalhes
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  containerPending: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  plateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  plateIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  zoneName: {
    fontSize: 12,
    color: '#666',
  },
  statusContainer: {
    alignItems: 'flex-end',
    gap: 8,
  },
  content: {
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
  },
  infoItemContent: {
    flex: 1,
  },
  infoItemLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  infoItemValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
  },
  settledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FFF3E0',
  },
  settledBadgeActive: {
    backgroundColor: '#E8F5E9',
  },
  settledText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  settleButton: {
    backgroundColor: '#4CAF50',
  },
  detailsButton: {
    backgroundColor: '#f0f0f0',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

