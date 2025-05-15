import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import Payment from '../../src/screens/PaymentScreen';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Api from '../../src/utils/Api';

const mockReplace = jest.fn();
const mockNavigate = jest.fn();

// Mocks
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ replace: mockReplace, navigate: mockNavigate }),
  useRoute: () => ({
    params: {
      url: 'https://paymentgateway.com/checkout',
      session: 'abc123',
    },
  }),
}));

jest.mock('react-native-webview', () => 'WebView');
jest.spyOn(Alert, 'alert');
jest.spyOn(Api, 'GetSubscriptionStatus').mockImplementation(jest.fn());

describe('Payment Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders WebView with correct URL', () => {
    const { getByTestId } = render(<Payment />);
    expect(getByTestId('payment-screen')).toBeTruthy();
  });

  it('handles success and updates user subscription', async () => {
    const user = { name: 'Test', premiumSubscribed: false };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(user));
    (Api.GetSubscriptionStatus as jest.Mock).mockResolvedValueOnce({ status: 'active' });

    const { getByTestId } = render(<Payment />);
    const navState = { url: 'http://localhost:5173/success?session_id=abc123' };
    const instance = getByTestId('payment-screen').props.children.props;
    await waitFor(() => instance.onNavigationStateChange(navState));

    expect(Api.GetSubscriptionStatus).toHaveBeenCalledWith('abc123');
    expect(AsyncStorage.setItem).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('HomePage');
  });

  it('handles missing user data in AsyncStorage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    (Api.GetSubscriptionStatus as jest.Mock).mockResolvedValueOnce({ status: 'active' });

    const { getByTestId } = render(<Payment />);
    const navState = { url: 'http://localhost:5173/success?session_id=abc123' };
    const instance = getByTestId('payment-screen').props.children.props;
    await waitFor(() => instance.onNavigationStateChange(navState));

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'User data not found. Please log in again.');
  });

  it('handles API failure during subscription status fetch', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('{"name":"Test"}');
    (Api.GetSubscriptionStatus as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { getByTestId } = render(<Payment />);
    const navState = { url: 'http://localhost:5173/success?session_id=abc123' };
    const instance = getByTestId('payment-screen').props.children.props;
    await waitFor(() => instance.onNavigationStateChange(navState));

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'An error occurred while verifying your payment.');
  });

  it('handles payment cancellation URL', async () => {
    const { getByTestId } = render(<Payment />);
    const navState = { url: 'https://example.com/cancel' };
    const instance = getByTestId('payment-screen').props.children.props;

    await waitFor(() => instance.onNavigationStateChange(navState));
    expect(Alert.alert).toHaveBeenCalledWith('Payment Cancelled', 'Your payment was cancelled.');
    expect(mockNavigate).toHaveBeenCalledWith('HomePage');
  });
});
