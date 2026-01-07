import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import VehiclesScreen from '../screens/VehiclesScreen';
import VehicleFormScreen from '../screens/VehicleFormScreen';
import ZonesScreen from '../screens/ZonesScreen';
import StartParkingScreen from '../screens/StartParkingScreen';
import ActiveParkingScreen from '../screens/ActiveParkingScreen';
import RenewParkingScreen from '../screens/RenewParkingScreen';
import ParkingHistoryScreen from '../screens/ParkingHistoryScreen';
import CreditsScreen from '../screens/CreditsScreen';
import CreditHistoryScreen from '../screens/CreditHistoryScreen';
import RechargeScreen from '../screens/RechargeScreen';
import PIXPaymentScreen from '../screens/PIXPaymentScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isLoading, isAuthenticated } = useAuth();


  if (isLoading) {
    return <LoadingScreen />;
  }

  const initialRouteName = isAuthenticated ? 'Home' : 'Login';

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen 
          name="Vehicles" 
          component={VehiclesScreen}
          options={{ title: 'Meus Veículos' }}
        />
        <Stack.Screen 
          name="VehicleForm" 
          component={VehicleFormScreen}
          options={{ title: 'Veículo' }}
        />
        <Stack.Screen 
          name="Zones" 
          component={ZonesScreen}
          options={{ title: 'Zonas' }}
        />
        <Stack.Screen 
          name="StartParking" 
          component={StartParkingScreen}
          options={{ title: 'Iniciar Estacionamento' }}
        />
        <Stack.Screen 
          name="ActiveParking" 
          component={ActiveParkingScreen}
          options={{ title: 'Estacionamento Ativo' }}
        />
        <Stack.Screen 
          name="RenewParking" 
          component={RenewParkingScreen}
          options={{ title: 'Renovar Estacionamento' }}
        />
        <Stack.Screen 
          name="ParkingHistory" 
          component={ParkingHistoryScreen}
          options={{ title: 'Histórico' }}
        />
        <Stack.Screen 
          name="Credits" 
          component={CreditsScreen}
          options={{ title: 'Créditos' }}
        />
        <Stack.Screen 
          name="CreditHistory" 
          component={CreditHistoryScreen}
          options={{ title: 'Histórico de Transações' }}
        />
        <Stack.Screen 
          name="Recharge" 
          component={RechargeScreen}
          options={{ title: 'Recarregar Créditos' }}
        />
        <Stack.Screen 
          name="PIXPayment" 
          component={PIXPaymentScreen}
          options={{ title: 'Pagamento PIX' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

