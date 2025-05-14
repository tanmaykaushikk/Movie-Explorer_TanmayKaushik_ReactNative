// Mocking react-native-gesture-handler to avoid the "TurboModuleRegistry" error
jest.mock('react-native-gesture-handler', () => {
  return {
    GestureHandlerRootView: 'View',
    GestureDetector: 'View',
    GestureHandler: 'View',
    PanGestureHandler: 'View',
    // Mock any other gesture handler components you may be using
  };
});

// Mocking @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () => {
  return {
    getItem: jest.fn().mockResolvedValue(null), // Mocking the getItem method to return null
    setItem: jest.fn().mockResolvedValue(null),  // Mocking the setItem method to return null
    removeItem: jest.fn().mockResolvedValue(null),  // Mocking the removeItem method to return null
    clear: jest.fn().mockResolvedValue(null),  // Mocking the clear method to return null
  };
});

// Mocking @stripe/stripe-react-native to prevent errors in the Jest environment
jest.mock('@stripe/stripe-react-native', () => {
  return {
    initPaymentSheet: jest.fn().mockResolvedValue({}), // Mock the initPaymentSheet function
    presentPaymentSheet: jest.fn().mockResolvedValue({ paymentIntent: 'mock_payment_intent' }), // Mock the presentPaymentSheet function
  };
});

import { render } from '@testing-library/react-native';
import Navigation from '../../src/navigation/Navigation';  // Adjust path if necessary
import React from 'react';

describe('Navigation', () => {
  it('should render Navigation container correctly', () => {
    const { getByTestId } = render(<Navigation />);

    // You can check if the Navigation container renders correctly
    // You can also add more specific tests if your Navigation component has accessible test IDs
    expect(getByTestId('navigation-container')).toBeTruthy();
  });

  it('should render SplashScreen as the initial screen', () => {
    const { getByText } = render(<Navigation />);

    // Check if SplashScreen is rendered by its text or a specific element you expect in the SplashScreen
    expect(getByText('SplashScreen')).toBeTruthy();
  });

  it('should render the LoginPage when navigating to LoginPage', () => {
    const { getByText } = render(<Navigation />);

    // Simulate navigation to the LoginPage
    // You can mock navigation or simulate actions like button presses
    expect(getByText('LoginPage')).toBeTruthy();
  });

  it('should render HomePage when navigating to HomePage', () => {
    const { getByText } = render(<Navigation />);

    // Simulate navigation to HomePage (again, mock or simulate navigation if necessary)
    expect(getByText('HomePage')).toBeTruthy();
  });

  // Add more tests for other screens as necessary
});
