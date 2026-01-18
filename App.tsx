import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { HomeScreen } from './src/screens/HomeScreen';
import { EditorScreen } from './src/screens/EditorScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { LockScreen } from './src/components/common/LockScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLocked, setIsLocked] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkLockStatus();
  }, []);

  const checkLockStatus = async () => {
    try {
      const biometricEnabled = await AsyncStorage.getItem('biometricEnabled');
      const password = await SecureStore.getItemAsync('appPassword');

      // 如果启用了生物识别或设置了密码，则显示锁屏
      if (biometricEnabled === 'true' || password) {
        setIsLocked(true);
      } else {
        setIsLocked(false);
      }
    } catch (error) {
      console.error('检查锁定状态失败:', error);
      setIsLocked(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlock = () => {
    setIsLocked(false);
  };

  if (isLoading) {
    return null;
  }

  if (isLocked) {
    return <LockScreen onUnlock={handleUnlock} />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Editor" component={EditorScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
