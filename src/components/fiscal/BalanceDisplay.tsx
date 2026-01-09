import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface BalanceDisplayProps {
  balance: number;
  requiredAmount?: number;
}

export default function BalanceDisplay({ balance, requiredAmount }: BalanceDisplayProps) {
  const formatCurrency = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) {
      return 'R$ 0,00';
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Ensure balance is a valid number
  const safeBalance = typeof balance === 'number' && !isNaN(balance) ? balance : 0;
  const safeRequiredAmount = requiredAmount && typeof requiredAmount === 'number' && !isNaN(requiredAmount) ? requiredAmount : undefined;

  const hasSufficientBalance = safeRequiredAmount ? safeBalance >= safeRequiredAmount : safeBalance > 0;
  const isInsufficient = safeRequiredAmount ? safeBalance < safeRequiredAmount : false;

  return (
    <View style={styles.container}>
      <View style={styles.balanceRow}>
        <Ionicons
          name={hasSufficientBalance ? 'checkmark-circle' : 'close-circle'}
          size={24}
          color={hasSufficientBalance ? '#4CAF50' : '#F44336'}
        />
        <View style={styles.balanceInfo}>
          <Text style={styles.balanceLabel}>Saldo disponível:</Text>
          <Text
            style={[
              styles.balanceValue,
              isInsufficient && styles.balanceValueInsufficient,
            ]}
          >
            {formatCurrency(safeBalance)}
          </Text>
        </View>
      </View>

      {safeRequiredAmount !== undefined && (
        <View style={styles.requiredRow}>
          <Text style={styles.requiredLabel}>Valor necessário:</Text>
          <Text style={styles.requiredValue}>{formatCurrency(safeRequiredAmount)}</Text>
        </View>
      )}

      {isInsufficient && safeRequiredAmount !== undefined && (
        <View style={styles.warningContainer}>
          <Ionicons name="warning" size={16} color="#F44336" />
          <Text style={styles.warningText}>
            Saldo insuficiente. Faltam {formatCurrency(safeRequiredAmount - safeBalance)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  balanceValueInsufficient: {
    color: '#F44336',
  },
  requiredRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  requiredLabel: {
    fontSize: 14,
    color: '#666',
  },
  requiredValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#F44336',
    fontWeight: '500',
  },
});

