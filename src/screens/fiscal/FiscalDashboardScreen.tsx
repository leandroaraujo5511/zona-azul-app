import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import FiscalHeader from '../../components/fiscal/FiscalHeader';

type FiscalStackParamList = {
  FiscalDashboard: undefined;
  VehicleInspection: undefined;
  CreateNotification: undefined;
  NotificationsList: undefined;
  CreateAvulsoParking: undefined;
  SelectUser: undefined;
  CollectCpf: undefined;
  CreateAvulsoParkingCash: undefined;
  Accountability: undefined;
};

type FiscalDashboardNavigationProp = NativeStackNavigationProp<
  FiscalStackParamList,
  'FiscalDashboard'
>;

export default function FiscalDashboardScreen() {
  const navigation = useNavigation<FiscalDashboardNavigationProp>();

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#000000"
        translucent={true}
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.container}>
          {/* Header */}
          <FiscalHeader showLogoutButton />

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Fiscalização Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#4CAF50" />
                <Text style={styles.sectionTitle}>Fiscalização</Text>
              </View>
              <View style={styles.sectionCards}>
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => navigation.navigate('VehicleInspection')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.cardIconContainer, { backgroundColor: '#E8F5E9' }]}>
                    <Ionicons name="search" size={28} color="#4CAF50" />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>Fiscalizar Veículo</Text>
                    <Text style={styles.cardDescription}>
                      Verificar estacionamento ativo
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.card}
                  onPress={() => navigation.navigate('CreateNotification')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.cardIconContainer, { backgroundColor: '#FFF3E0' }]}>
                    <Ionicons name="document-text" size={28} color="#FF9800" />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>Criar Notificação</Text>
                    <Text style={styles.cardDescription}>
                      Registrar irregularidade
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Estacionamentos Avulsos Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="car-sport-outline" size={20} color="#2196F3" />
                <Text style={styles.sectionTitle}>Estacionamentos Avulsos</Text>
              </View>
              <View style={styles.sectionCards}>
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => navigation.navigate('SelectUser')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.cardIconContainer, { backgroundColor: '#E3F2FD' }]}>
                    <Ionicons name="wallet" size={28} color="#2196F3" />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>Estacionamento (Saldo)</Text>
                    <Text style={styles.cardDescription}>
                      Criar usando saldo do usuário
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.card}
                  onPress={() => navigation.navigate('CollectCpf')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.cardIconContainer, { backgroundColor: '#E8F5E9' }]}>
                    <Ionicons name="qr-code" size={28} color="#4CAF50" />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>Estacionamento (PIX)</Text>
                    <Text style={styles.cardDescription}>
                      Criar com pagamento via PIX
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.card}
                  onPress={() => navigation.navigate('CreateAvulsoParkingCash')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.cardIconContainer, { backgroundColor: '#FFF3E0' }]}>
                    <Ionicons name="cash" size={28} color="#FF9800" />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>Estacionamento (Dinheiro)</Text>
                    <Text style={styles.cardDescription}>
                      Criar com pagamento em dinheiro
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Relatórios e Consultas Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="document-text-outline" size={20} color="#9C27B0" />
                <Text style={styles.sectionTitle}>Relatórios e Consultas</Text>
              </View>
              <View style={styles.sectionCards}>
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => navigation.navigate('NotificationsList')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.cardIconContainer, { backgroundColor: '#F3E5F5' }]}>
                    <Ionicons name="list" size={28} color="#9C27B0" />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>Minhas Notificações</Text>
                    <Text style={styles.cardDescription}>
                      Visualizar todas as notificações criadas
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.card}
                  onPress={() => navigation.navigate('Accountability')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.cardIconContainer, { backgroundColor: '#FFEBEE' }]}>
                    <Ionicons name="calculator" size={28} color="#F44336" />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>Prestação de Contas</Text>
                    <Text style={styles.cardDescription}>
                      Gerenciar estacionamentos e valores
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  sectionCards: {
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});

