import React from 'react';
import { Alert } from 'react-native';
import { render, waitFor } from '@testing-library/react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LockScreen } from '../src/components/common/LockScreen';

declare const describe: any;
declare const beforeEach: any;
declare const it: any;
declare const expect: any;
declare const jest: any;

describe('LockScreen', () => {
  beforeEach(() => {
    const localAuth =
      jest.requireMock('expo-local-authentication') as jest.Mocked<
        typeof LocalAuthentication
      >;
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    (AsyncStorage.getItem as any).mockResolvedValue('true');
    localAuth.authenticateAsync.mockResolvedValue({
      success: true,
    } as any);
  });

  it('unlocks after Face ID authentication', async () => {
    const onUnlock = jest.fn();
    render(<LockScreen onUnlock={onUnlock} />);

    await waitFor(() => {
      expect(onUnlock).toHaveBeenCalled();
    });
  });
});
