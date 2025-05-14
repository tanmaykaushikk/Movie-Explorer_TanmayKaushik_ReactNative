// CustomDrawerContent.test.tsx

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  return {
    GestureHandlerRootView: jest.fn(),
    GestureHandlerButton: jest.fn(),
    // You can also mock other parts of this module as needed
  };
});

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CustomDrawerContent from '../../src/components/CustomDrawerContent';

describe('CustomDrawerContent', () => {
  it('renders correctly', () => {
    const mockNavigation = { navigate: jest.fn() };
    const { getByText } = render(<CustomDrawerContent navigation={mockNavigation} />);

    // Check if the menu items are rendered
    expect(getByText('Login')).toBeTruthy();
    expect(getByText('Sign Up')).toBeTruthy();
    expect(getByText('Premium')).toBeTruthy();
    expect(getByText('Profile')).toBeTruthy();
  });

  it('navigates to the correct route on menu item press', () => {
    const mockNavigation = { navigate: jest.fn() };
    const { getByText } = render(<CustomDrawerContent navigation={mockNavigation} />);

    fireEvent.press(getByText('Login'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('LoginPage');
  });
});
