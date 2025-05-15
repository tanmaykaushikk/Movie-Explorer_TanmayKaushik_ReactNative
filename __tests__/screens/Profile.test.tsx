import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Profile from '../../src/screens/Profile';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockReset = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
    addListener: jest.fn(() => () => {}),
    reset: mockReset,
  }),
}));

describe('Profile Screen', () => {
  const userMock = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    role: 'supervisor',
    premiumSubscribed: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loader while fetching data', async () => {
    (AsyncStorage.getItem as jest.Mock).mockReturnValueOnce(null);
    const { getByText } = render(<Profile />);
    expect(getByText('Loading profile...')).toBeTruthy();
  });




  it('navigates to Premium screen on upgrade button press', async () => {
    const freeUser = { ...userMock, premiumSubscribed: false };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(freeUser));

    const { getByText } = render(<Profile />);
    const upgradeButton = await waitFor(() => getByText('Upgrade to Premium'));
    fireEvent.press(upgradeButton);
    expect(mockNavigate).toHaveBeenCalledWith('Premium');
  });

  it('handles logout correctly and resets navigation', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(userMock));

    const { getByText } = render(<Profile />);
    const logoutButton = await waitFor(() => getByText('Logout'));
    fireEvent.press(logoutButton);

    await waitFor(() => {
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('token');
      expect(mockReset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    });
  });

  

  it('handles malformed AsyncStorage user data gracefully', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('invalid json');

    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { getByText } = render(<Profile />);
    await waitFor(() => {
      expect(getByText('Loading profile...')).toBeTruthy();
    });

    consoleError.mockRestore();
  });
});
