import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NotificationStatus } from '../../services/notification.service';

interface NotificationStatusBadgeProps {
  status: NotificationStatus;
  size?: 'small' | 'medium' | 'large';
}

export default function NotificationStatusBadge({
  status,
  size = 'medium',
}: NotificationStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pendente',
          color: '#FF9800',
          icon: 'time-outline',
          bgColor: '#FFF3E0',
        };
      case 'recognized':
        return {
          label: 'Reconhecida',
          color: '#2196F3',
          icon: 'checkmark-circle-outline',
          bgColor: '#E3F2FD',
        };
      case 'paid':
        return {
          label: 'Paga',
          color: '#4CAF50',
          icon: 'checkmark-circle',
          bgColor: '#E8F5E9',
        };
      case 'expired':
        return {
          label: 'Expirada',
          color: '#F44336',
          icon: 'close-circle',
          bgColor: '#FFEBEE',
        };
      case 'converted':
        return {
          label: 'Convertida em Multa',
          color: '#9C27B0',
          icon: 'alert-circle',
          bgColor: '#F3E5F5',
        };
      case 'cancelled':
        return {
          label: 'Cancelada',
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

