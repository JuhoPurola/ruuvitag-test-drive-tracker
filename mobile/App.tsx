import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import ActiveDrivesScreen from './screens/ActiveDrivesScreen';
import StartDriveScreen from './screens/StartDriveScreen';
import VehiclesScreen from './screens/VehiclesScreen';
import CustomersScreen from './screens/CustomersScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#FFFFFF',
              borderTopWidth: 1,
              borderTopColor: '#E5E7EB',
              paddingBottom: 8,
              paddingTop: 8,
              height: 65,
            },
            tabBarActiveTintColor: '#3B82F6',
            tabBarInactiveTintColor: '#9CA3AF',
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
            },
          }}
        >
          <Tab.Screen
            name="Active"
            component={ActiveDrivesScreen}
            options={{
              tabBarLabel: 'Active',
              tabBarIcon: ({ color }) => (
                <TabIcon color={color} emoji="🚗" />
              ),
            }}
          />
          <Tab.Screen
            name="Start"
            component={StartDriveScreen}
            options={{
              tabBarLabel: 'Start',
              tabBarIcon: ({ color }) => (
                <TabIcon color={color} emoji="▶️" />
              ),
            }}
          />
          <Tab.Screen
            name="Vehicles"
            component={VehiclesScreen}
            options={{
              tabBarLabel: 'Vehicles',
              tabBarIcon: ({ color }) => (
                <TabIcon color={color} emoji="🔧" />
              ),
            }}
          />
          <Tab.Screen
            name="Customers"
            component={CustomersScreen}
            options={{
              tabBarLabel: 'Customers',
              tabBarIcon: ({ color }) => (
                <TabIcon color={color} emoji="👤" />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}

function TabIcon({ color, emoji }: { color: string; emoji: string }) {
  return (
    <div
      style={{
        fontSize: 24,
        opacity: color === '#3B82F6' ? 1 : 0.5,
      }}
    >
      {emoji}
    </div>
  );
}
