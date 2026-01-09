import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import Ionicons from '@expo/vector-icons/Ionicons';
import { notificationService, Notification } from '../../services/notification.service';
import FiscalHeader from '../../components/fiscal/FiscalHeader';
import NotificationStatusBadge from '../../components/fiscal/NotificationStatusBadge';

type FiscalStackParamList = {
  NotificationDetails: { notification?: Notification; notificationId?: string } | undefined;
};

type NotificationDetailsNavigationProp = NativeStackNavigationProp<
  FiscalStackParamList,
  'NotificationDetails'
>;

export default function NotificationDetailsScreen() {
  const navigation = useNavigation<NotificationDetailsNavigationProp>();
  const route = useRoute();
  const params = route.params as { notification?: Notification; notificationId?: string };

  // If we have the full notification object, use it directly
  // Otherwise, fetch by ID
  const { data: notification, isLoading } = useQuery({
    queryKey: ['notification', params.notification?.id || params.notificationId],
    queryFn: () => {
      if (params.notification) {
        return Promise.resolve(params.notification);
      }
      if (params.notificationId) {
        return notificationService.getNotificationById(params.notificationId);
      }
      throw new Error('Notificação não fornecida');
    },
    enabled: !!(params.notification || params.notificationId),
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (isLoading) {
    return (
      <>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#1a1a1a"
          translucent={false}
        />
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <FiscalHeader
            title="Detalhes da Notificação"
            showBackButton
            onBackPress={() => navigation.goBack()}
          />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF9800" />
            <Text style={styles.loadingText}>Carregando...</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (!notification) {
    return (
      <>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#1a1a1a"
          translucent={false}
        />
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <FiscalHeader
            title="Detalhes da Notificação"
            showBackButton
            onBackPress={() => navigation.goBack()}
          />
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Notificação não encontrada</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#1a1a1a"
        translucent={false}
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <FiscalHeader
          title="Detalhes da Notificação"
          showBackButton
          onBackPress={() => navigation.goBack()}
        />

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Header Card */}
          <View style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.notificationNumber}>
                #{notification.notificationNumber}
              </Text>
              <NotificationStatusBadge status={notification.status} />
            </View>
          </View>

          {/* Information Card */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Informações</Text>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="car-outline" size={20} color="#666" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Placa</Text>
                  <Text style={styles.infoValue}>{notification.plate}</Text>
                </View>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="cash-outline" size={20} color="#666" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Valor</Text>
                  <Text style={styles.infoValue}>
                    {formatCurrency(notification.amount)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="calendar-outline" size={20} color="#666" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Data de Criação</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(notification.createdAt)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={20} color="#666" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Válido até</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(notification.expiresAt)}
                  </Text>
                </View>
              </View>
            </View>

            {notification.paidAt && (
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#4CAF50" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Data de Pagamento</Text>
                    <Text style={styles.infoValue}>
                      {formatDate(notification.paidAt)}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Location Card */}
          {notification.location?.address && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Localização</Text>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={20} color="#666" />
                <Text style={styles.locationText}>{notification.location.address}</Text>
              </View>
            </View>
          )}

          {/* Observations Card */}
          {notification.observations && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Observações</Text>
              <Text style={styles.observationsText}>{notification.observations}</Text>
            </View>
          )}
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
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  infoRow: {
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  locationText: {
    fontSize: 14,
    color: '#1a1a1a',
    flex: 1,
  },
  observationsText: {
    fontSize: 14,
    color: '#1a1a1a',
    lineHeight: 20,
  },
});
