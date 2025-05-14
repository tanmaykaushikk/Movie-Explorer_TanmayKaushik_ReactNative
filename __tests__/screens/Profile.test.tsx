import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Profile from '../../src/screens/Profile'; // Adjust the path as per your project structure

// Mocking AsyncStorage to avoid issues during testing
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('Profile Screen', () => {
  beforeEach(() => {
    // Mock the return values for AsyncStorage
    require('@react-native-async-storage/async-storage').getItem.mockResolvedValue(
      JSON.stringify({
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1 234 567 8900',
        role: 'user',
        subscriptionStatus: 'Free',
      })
    );
    require('@react-native-async-storage/async-storage').setItem.mockResolvedValue({});
    require('@react-native-async-storage/async-storage').removeItem.mockResolvedValue({});
  });

  it('renders the profile screen and loads user data', async () => {
    const { getByText } = render(<Profile />);

    // Ensure that the loading message is shown
    expect(getByText('Loading profile...')).toBeTruthy();

    // Wait for the profile data to be loaded
    await waitFor(() => {
      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('john.doe@example.com')).toBeTruthy();
      expect(getByText('+1 234 567 8900')).toBeTruthy();
      expect(getByText('Free')).toBeTruthy();
    });
  });

  it('allows editing and saving profile data', async () => {
    const { getByText, getByPlaceholderText } = render(<Profile />);

    // Wait for the profile data to be loaded
    await waitFor(() => {
      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('john.doe@example.com')).toBeTruthy();
      expect(getByText('+1 234 567 8900')).toBeTruthy();
    });

    // Press the edit button
    fireEvent.press(getByText('Edit Profile'));

    // Edit the name field
    const nameInput = getByPlaceholderText('Name');
    fireEvent.changeText(nameInput, 'Jane Doe');

    // Save changes
    fireEvent.press(getByText('Save Changes'));

    // Check if the save function was called
    await waitFor(() => {
      expect(require('@react-native-async-storage/async-storage').setItem).toHaveBeenCalled();
    });

    // Ensure that the new name appears on the screen
    expect(getByText('Jane Doe')).toBeTruthy();
  });

  it('handles logout', async () => {
    const { getByText } = render(<Profile />);

    // Press the logout button
    fireEvent.press(getByText('Logout'));

    // Ensure that AsyncStorage removeItem is called for 'user' and 'token'
    await waitFor(() => {
      expect(require('@react-native-async-storage/async-storage').removeItem).toHaveBeenCalledWith('user');
      expect(require('@react-native-async-storage/async-storage').removeItem).toHaveBeenCalledWith('token');
    });
  });

  it('shows an error message if AsyncStorage fails to load data', async () => {
    // Mock AsyncStorage to return an error
    require('@react-native-async-storage/async-storage').getItem.mockRejectedValueOnce(new Error('Failed to load user data'));

    const { getByText } = render(<Profile />);

    // Wait for the error alert to appear
    await waitFor(() => {
      expect(getByText('Unable to load user profile')).toBeTruthy();
    });
  });

  it('allows upgrading to premium', async () => {
    const { getByText } = render(<Profile />);

    // Check if the "Upgrade to Premium" button is visible for free users
    expect(getByText('Upgrade to Premium')).toBeTruthy();

    // Press the "Upgrade to Premium" button
    fireEvent.press(getByText('Upgrade to Premium'));

    // Ensure that the navigation to the "Premium" screen happens (this assumes that you have a navigation mock set up)
    await waitFor(() => {
      expect(require('@react-navigation/native').useNavigation().navigate).toHaveBeenCalledWith('Premium');
    });
  });

  it('does not show the upgrade button for premium users', async () => {
    // Mock AsyncStorage to return premium status
    require('@react-native-async-storage/async-storage').getItem.mockResolvedValueOnce(
      JSON.stringify({
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1 234 567 8900',
        role: 'user',
        subscriptionStatus: 'Premium',
      })
    );

    const { queryByText } = render(<Profile />);

    // Wait for the profile data to be loaded
    await waitFor(() => {
      expect(queryByText('Upgrade to Premium')).toBeNull(); // Button should not appear
    });
  });

  it('handles profile edit cancelation', async () => {
    const { getByText, getByPlaceholderText } = render(<Profile />);

    // Wait for the profile data to be loaded
    await waitFor(() => {
      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('john.doe@example.com')).toBeTruthy();
      expect(getByText('+1 234 567 8900')).toBeTruthy();
    });

    // Press the edit button
    fireEvent.press(getByText('Edit Profile'));

    // Edit the name field
    const nameInput = getByPlaceholderText('Name');
    fireEvent.changeText(nameInput, 'Jane Doe');

    // Press the cancel button
    fireEvent.press(getByText('Cancel'));

    // Ensure the name is reverted back to original
    expect(getByText('John Doe')).toBeTruthy();
  });

  it('does not allow saving an empty name', async () => {
    const { getByText, getByPlaceholderText } = render(<Profile />);

    // Wait for the profile data to be loaded
    await waitFor(() => {
      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('john.doe@example.com')).toBeTruthy();
      expect(getByText('+1 234 567 8900')).toBeTruthy();
    });

    // Press the edit button
    fireEvent.press(getByText('Edit Profile'));

    // Clear the name field
    const nameInput = getByPlaceholderText('Name');
    fireEvent.changeText(nameInput, '');

    // Try to save changes
    fireEvent.press(getByText('Save Changes'));

    // Ensure the save function was not called
    await waitFor(() => {
      expect(require('@react-native-async-storage/async-storage').setItem).not.toHaveBeenCalled();
    });

    // Ensure the name field is still showing the old value
    expect(getByText('John Doe')).toBeTruthy();
  });
});
