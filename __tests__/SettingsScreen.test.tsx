import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SettingsScreen } from '../src/screens/SettingsScreen';

declare const describe: any;
declare const beforeEach: any;
declare const it: any;
declare const expect: any;
declare const jest: any;

const navigation = {
  goBack: jest.fn(),
};

describe('SettingsScreen', () => {
  beforeEach(() => {
    const localAuth =
      jest.requireMock('expo-local-authentication') as jest.Mocked<
        typeof LocalAuthentication
      >;
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    localAuth.hasHardwareAsync.mockResolvedValue(true);
    localAuth.isEnrolledAsync.mockResolvedValue(true);
    localAuth.authenticateAsync.mockResolvedValue({ success: true } as any);
    (AsyncStorage.getItem as any).mockResolvedValue(null);
  });

  it('enables biometric after authentication', async () => {
    const { getByLabelText } = render(
      <SettingsScreen navigation={navigation} />
    );

    await waitFor(() => {
      expect(LocalAuthentication.hasHardwareAsync).toHaveBeenCalled();
    });

    const switchControl = getByLabelText('faceid-switch');
    fireEvent(switchControl, 'valueChange', true);

    await waitFor(() => {
      expect(LocalAuthentication.authenticateAsync).toHaveBeenCalled();
    });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('biometricEnabled', 'true');
  });

  it('shows system language hint', async () => {
    const { getByText } = render(<SettingsScreen navigation={navigation} />);

    await waitFor(() => {
      expect(LocalAuthentication.hasHardwareAsync).toHaveBeenCalled();
    });

    expect(getByText('跟随系统')).toBeTruthy();
  });
});
