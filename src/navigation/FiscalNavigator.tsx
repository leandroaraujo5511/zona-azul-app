import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Fiscal Screens
import FiscalDashboardScreen from '../screens/fiscal/FiscalDashboardScreen';
import VehicleInspectionScreen from '../screens/fiscal/VehicleInspectionScreen';
import CreateNotificationScreen from '../screens/fiscal/CreateNotificationScreen';
import NotificationsListScreen from '../screens/fiscal/NotificationsListScreen';
import NotificationDetailsScreen from '../screens/fiscal/NotificationDetailsScreen';
import SelectUserScreen from '../screens/fiscal/SelectUserScreen';
import CreateAvulsoParkingScreen from '../screens/fiscal/CreateAvulsoParkingScreen';
import AvulsoParkingDetailsScreen from '../screens/fiscal/AvulsoParkingDetailsScreen';
import CollectCpfScreen from '../screens/fiscal/CollectCpfScreen';
import CreateAvulsoParkingPixScreen from '../screens/fiscal/CreateAvulsoParkingPixScreen';
import AvulsoParkingPixDetailsScreen from '../screens/fiscal/AvulsoParkingPixDetailsScreen';
import CreateAvulsoParkingCashScreen from '../screens/fiscal/CreateAvulsoParkingCashScreen';
import AccountabilityScreen from '../screens/fiscal/AccountabilityScreen';

import { Notification } from '../services/notification.service';
import { UserByCpf } from '../services/user.service';

export type FiscalStackParamList = {
  FiscalDashboard: undefined;
  VehicleInspection: undefined;
  CreateNotification: { plate?: string } | undefined;
  NotificationsList: undefined;
  NotificationDetails: { notification: Notification } | { notificationId: string } | undefined;
  SelectUser: { plate?: string } | undefined;
  CreateAvulsoParking: { plate?: string; userId?: string; user?: any } | undefined;
  AvulsoParkingDetails: { parkingId: string } | undefined;
  CollectCpf: { plate?: string } | undefined;
  CreateAvulsoParkingPix: { plate?: string; cpf?: string; user?: UserByCpf | null } | undefined;
  AvulsoParkingPixDetails: { parkingId: string; paymentId: string } | undefined;
  CreateAvulsoParkingCash: { plate?: string } | undefined;
  Accountability: undefined;
};

const Stack = createNativeStackNavigator<FiscalStackParamList>();

export default function FiscalNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="FiscalDashboard"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="FiscalDashboard" component={FiscalDashboardScreen} />
      <Stack.Screen
        name="VehicleInspection"
        component={VehicleInspectionScreen}
        options={{ title: 'Fiscalizar Veículo' }}
      />
      <Stack.Screen
        name="CreateNotification"
        component={CreateNotificationScreen}
        options={{ title: 'Criar Notificação' }}
      />
      <Stack.Screen
        name="NotificationsList"
        component={NotificationsListScreen}
        options={{ title: 'Minhas Notificações' }}
      />
      <Stack.Screen
        name="NotificationDetails"
        component={NotificationDetailsScreen}
        options={{ title: 'Detalhes da Notificação' }}
      />
      <Stack.Screen
        name="SelectUser"
        component={SelectUserScreen}
        options={{ title: 'Selecionar Usuário' }}
      />
      <Stack.Screen
        name="CreateAvulsoParking"
        component={CreateAvulsoParkingScreen}
        options={{ title: 'Criar Estacionamento Avulso' }}
      />
      <Stack.Screen
        name="AvulsoParkingDetails"
        component={AvulsoParkingDetailsScreen}
        options={{ title: 'Detalhes do Estacionamento' }}
      />
      <Stack.Screen
        name="CollectCpf"
        component={CollectCpfScreen}
        options={{ title: 'Informar CPF' }}
      />
      <Stack.Screen
        name="CreateAvulsoParkingPix"
        component={CreateAvulsoParkingPixScreen}
        options={{ title: 'Criar Estacionamento (PIX)' }}
      />
      <Stack.Screen
        name="AvulsoParkingPixDetails"
        component={AvulsoParkingPixDetailsScreen}
        options={{ title: 'QR Code PIX' }}
      />
      <Stack.Screen
        name="CreateAvulsoParkingCash"
        component={CreateAvulsoParkingCashScreen}
        options={{ title: 'Criar Estacionamento (Dinheiro)' }}
      />
      <Stack.Screen
        name="Accountability"
        component={AccountabilityScreen}
        options={{ title: 'Prestação de Contas' }}
      />
    </Stack.Navigator>
  );
}

