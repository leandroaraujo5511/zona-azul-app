import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { UserByPlate } from '../../services/avulsoParking.service';

// Helper to get user ID (can be userId or id)
const getUserId = (user: UserByPlate): string => {
  return (user as any).userId || (user as any).id || '';
};

interface UserCardProps {
  user: UserByPlate;
  onSelect: () => void;
}

export default function UserCard({ user, onSelect }: UserCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const hasSufficientBalance = user.balance > 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onSelect} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </View>

      <View style={styles.balanceContainer}>
        <View style={styles.balanceInfo}>
          <Ionicons
            name={hasSufficientBalance ? 'checkmark-circle' : 'close-circle'}
            size={20}
            color={hasSufficientBalance ? '#4CAF50' : '#F44336'}
          />
          <View style={styles.balanceTextContainer}>
            <Text style={styles.balanceLabel}>Saldo disponível:</Text>
            <Text
              style={[
                styles.balanceValue,
                !hasSufficientBalance && styles.balanceValueInsufficient,
              ]}
            >
              {formatCurrency(user.balance)}
            </Text>
          </View>
        </View>
        {!hasSufficientBalance && (
          <View style={styles.insufficientBadge}>
            <Text style={styles.insufficientText}>Saldo insuficiente</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  balanceContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  balanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceTextContainer: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  balanceValueInsufficient: {
    color: '#F44336',
  },
  insufficientBadge: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FFEBEE',
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  insufficientText: {
    fontSize: 12,
    color: '#F44336',
    fontWeight: '500',
  },
});

