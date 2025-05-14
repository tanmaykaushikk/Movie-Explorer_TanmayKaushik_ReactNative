import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CheckoutScreen from "../../src/screens/CheckoutScreen"; // Update the import path as needed
import { Alert } from 'react-native';

// Mock Stripe methods directly
jest.mock('@stripe/stripe-react-native', () => ({
  initPaymentSheet: jest.fn(),
  presentPaymentSheet: jest.fn(),
}));

// Mock global fetch inline
global.fetch = jest.fn();

describe('CheckoutScreen', () => {
  const mockInitPaymentSheet = require('@stripe/stripe-react-native').initPaymentSheet;
  const mockPresentPaymentSheet = require('@stripe/stripe-react-native').presentPaymentSheet;
  const alertSpy = jest.spyOn(Alert, 'alert');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls initPaymentSheet with valid client secret on mount', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({ clientSecret: 'test_secret' }),
    });
    mockInitPaymentSheet.mockResolvedValueOnce({});

    render(<CheckoutScreen />);

    await waitFor(() => {
      expect(mockInitPaymentSheet).toHaveBeenCalledWith({
        merchantDisplayName: 'Demo Store',
        paymentIntentClientSecret: 'test_secret',
      });
    });
  });

  it('does not initialize sheet with invalid clientSecret', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({}),
    });

    render(<CheckoutScreen />);

    await waitFor(() => {
      expect(mockInitPaymentSheet).not.toHaveBeenCalled();
    });
  });

  it('shows success alert on successful payment', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({ clientSecret: 'test_secret' }),
    });
    mockInitPaymentSheet.mockResolvedValueOnce({});
    mockPresentPaymentSheet.mockResolvedValueOnce({});

    const { getByText } = render(<CheckoutScreen />);

    await waitFor(() => expect(getByText('Checkout').props.disabled).toBe(false));

    fireEvent.press(getByText('Checkout'));

    await waitFor(() => {
      expect(mockPresentPaymentSheet).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith('Success', 'Your payment is confirmed!');
    });
  });

  it('shows alert with error code on presentPaymentSheet failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({ clientSecret: 'test_secret' }),
    });
    mockInitPaymentSheet.mockResolvedValueOnce({});
    mockPresentPaymentSheet.mockResolvedValueOnce({
      error: { code: '123', message: 'Something went wrong' },
    });

    const { getByText } = render(<CheckoutScreen />);

    await waitFor(() => expect(getByText('Checkout').props.disabled).toBe(false));
    fireEvent.press(getByText('Checkout'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Error code: 123', 'Something went wrong');
    });
  });

  it('shows fallback alert if exception occurs in presentPaymentSheet', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({ clientSecret: 'test_secret' }),
    });
    mockInitPaymentSheet.mockResolvedValueOnce({});
    mockPresentPaymentSheet.mockRejectedValueOnce(new Error('Unexpected error'));

    const { getByText } = render(<CheckoutScreen />);

    await waitFor(() => expect(getByText('Checkout').props.disabled).toBe(false));
    fireEvent.press(getByText('Checkout'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Payment failed', 'Something went wrong.');
    });
  });
});
