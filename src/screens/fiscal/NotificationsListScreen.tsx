import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { notificationService, NotificationStatus, Notification } from '../../services/notification.service';
import FiscalHeader from '../../components/fiscal/FiscalHeader';
import NotificationCard from '../../components/fiscal/NotificationCard';

type FiscalStackParamList = {
  FiscalDashboard: undefined;
  NotificationsList: undefined;
  NotificationDetails: { notification?: Notification; notificationId?: string } | undefined;
};

type NotificationsListNavigationProp = NativeStackNavigationProp<
  FiscalStackParamList,
  'NotificationsList'
>;

export default function NotificationsListScreen() {
  const navigation = useNavigation<NotificationsListNavigationProp>();
  const [statusFilter, setStatusFilter] = useState<NotificationStatus | undefined>(undefined);
  const [page, setPage] = useState(1);
  const limit = 20;

  const {
    data: notificationsData,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['notifications', statusFilter, page],
    queryFn: () =>
      notificationService.listNotifications({
        status: statusFilter,
        page,
        limit,
      }),
  });

  const handleRefresh = () => {
    refetch();
  };

  const handleLoadMore = () => {
    if (
      notificationsData?.pagination &&
      page < notificationsData.pagination.totalPages
    ) {
      setPage((prev) => prev + 1);
    }
  };

  const handleNotificationPress = (notification: any) => {
    // Pass the full notification object to avoid another API call
    navigation.navigate('NotificationDetails', { notification });
  };

  const renderNotification = ({ item }: { item: any }) => (
    <NotificationCard
      notification={item}
      onPress={() => handleNotificationPress(item)}
    />
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#FF9800" />
          <Text style={styles.emptyText}>Carregando notificações...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Nenhuma notificação encontrada</Text>
        <Text style={styles.emptySubtext}>
          {statusFilter
            ? 'Tente alterar o filtro de status'
            : 'Crie uma notificação para começar'}
        </Text>
      </View>
    );
  };

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#1a1a1a"
        translucent={false}
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <FiscalHeader
          title="Minhas Notificações"
          showBackButton
          onBackPress={() => navigation.goBack()}
        />

        <View style={styles.container}>
          {/* Status Filter */}
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Filtrar por status:</Text>
            <FlatList
              data={[
                { value: undefined, label: 'Todas' },
                { value: 'pending' as NotificationStatus, label: 'Pendente' },
                { value: 'recognized' as NotificationStatus, label: 'Reconhecida' },
                { value: 'paid' as NotificationStatus, label: 'Paga' },
                { value: 'expired' as NotificationStatus, label: 'Expirada' },
              ]}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterButtons}
              keyExtractor={(item) => item.value || 'all'}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    statusFilter === item.value && styles.filterButtonActive,
                  ]}
                  onPress={() => setStatusFilter(item.value)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      statusFilter === item.value && styles.filterButtonTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>

          {/* Notifications List */}
          <FlatList
            data={notificationsData?.data || []}
            renderItem={renderNotification}
            keyExtractor={(item) => item.id}
            contentContainerStyle={
              (!notificationsData?.data || notificationsData.data.length === 0) &&
              styles.listContent
            }
            ListEmptyComponent={renderEmpty}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              notificationsData?.pagination &&
              page < notificationsData.pagination.totalPages ? (
                <View style={styles.footer}>
                  <ActivityIndicator size="small" color="#FF9800" />
                </View>
              ) : null
            }
          />
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
    backgroundColor: '#f5f5f5',
  },
  filterContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  filterButtons: {
    gap: 8,
    paddingRight: 16,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonActive: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
});
