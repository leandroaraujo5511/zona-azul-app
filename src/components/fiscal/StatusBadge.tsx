import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

type ParkingStatus = 'active' | 'expiring' | 'expired' | 'completed' | 'cancelled';

interface StatusBadgeProps {
  status: ParkingStatus;
  size?: 'small' | 'medium' | 'large';
}

export default function StatusBadge({ status, size = 'medium' }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          label: 'Ativo',
          color: '#4CAF50',
          icon: 'checkmark-circle',
          bgColor: '#E8F5E9',
        };
      case 'expiring':
        return {
          label: 'Expirando',
          color: '#FF9800',
          icon: 'time-outline',
          bgColor: '#FFF3E0',
        };
      case 'expired':
        return {
          label: 'Expirado',
          color: '#F44336',
          icon: 'close-circle',
          bgColor: '#FFEBEE',
        };
      case 'completed':
        return {
          label: 'Finalizado',
          color: '#2196F3',
          icon: 'checkmark-done-circle',
          bgColor: '#E3F2FD',
        };
      case 'cancelled':
        return {
          label: 'Cancelado',
          color: '#9E9E9E',
          icon: 'ban-outline',
          bgColor: '#F5F5F5',
        };
      default:
        return {
          label: 'Desconhecido',
          color: '#9E9E9E',
          icon: 'help-circle-outline',
          bgColor: '#F5F5F5',
        };
    }
  };

  const config = getStatusConfig();
  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;
  const fontSize = size === 'small' ? 12 : size === 'large' ? 16 : 14;
  const padding = size === 'small' ? 6 : size === 'large' ? 12 : 8;

  return (
    <View style={[styles.badge, { backgroundColor: config.bgColor, padding }]}>
      <Ionicons name={config.icon as any} size={iconSize} color={config.color} />
      <Text style={[styles.label, { color: config.color, fontSize }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    gap: 6,
  },
  label: {
    fontWeight: '600',
  },
});

