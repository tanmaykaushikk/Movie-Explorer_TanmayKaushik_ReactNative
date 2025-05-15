// Mock dependencies
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: 'View',
  GestureDetector: 'View',
  GestureHandler: 'View',
  PanGestureHandler: 'View',
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(null),
  clear: jest.fn().mockResolvedValue(null),
}));

jest.mock('@stripe/stripe-react-native', () => ({
  initPaymentSheet: jest.fn().mockResolvedValue({}),
  presentPaymentSheet: jest.fn().mockResolvedValue({ paymentIntent: 'mock_payment_intent' }),
}));

// Mock navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
    }),
  };
});

// Mock drawer navigation
jest.mock('@react-navigation/drawer', () => {
  const actualDrawer = jest.requireActual('@react-navigation/drawer');
  return {
    ...actualDrawer,
    createDrawerNavigator: () => ({
      Navigator: ({ children, drawerContent }) => {
        const mockProps = { navigation: { navigate: jest.fn() } };
        return (
          <>
            {children}
            {drawerContent && drawerContent(mockProps)}
          </>
        );
      },
      Screen: ({ component }) => component({}),
    }),
  };
});

// Mock screen components
jest.mock('../../src/screens/HomePage', () => {
  const MockHomePage = () => <Text testID="home-screen">HomePage</Text>;
  MockHomePage.displayName = 'HomePage';
  return MockHomePage;
});

jest.mock('../../src/screens/Login', () => {
  const MockLogin = () => <Text testID="login-screen">Login</Text>;
  MockLogin.displayName = 'Login';
  return MockLogin;
});

jest.mock('../../src/screens/Signup', () => {
  const MockSignup = () => <Text testID="signup-screen">Signup</Text>;
  MockSignup.displayName = 'Signup';
  return MockSignup;
});

jest.mock('../../src/screens/PremiumScreen', () => {
  const MockPremiumScreen = () => <Text testID="premium-screen">PremiumScreen</Text>;
  MockPremiumScreen.displayName = 'PremiumScreen';
  return MockPremiumScreen;
});

jest.mock('../../src/screens/Profile', () => {
  const MockProfile = () => <Text testID="profile-screen">Profile</Text>;
  MockProfile.displayName = 'Profile';
  return MockProfile;
});

// Mock CustomDrawerContent
jest.mock('../../src/navigation/CustomDrawerContent', () => {
  const MockCustomDrawerContent = ({ navigation }) => (
    <View>
      <Text testID="drawer-content">Custom Drawer</Text>
      <TouchableOpacity
        testID="home-drawer-item"
        onPress={() => navigation.navigate('Home')}
      >
        <Text>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="login-drawer-item"
        onPress={() => navigation.navigate('Login')}
      >
        <Text>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="signup-drawer-item"
        onPress={() => navigation.navigate('Signup')}
      >
        <Text>Signup</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="premium-drawer-item"
        onPress={() => navigation.navigate('Premium')}
      >
        <Text>Premium</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="profile-drawer-item"
        onPress={() => navigation.navigate('Profile')}
      >
        <Text>Profile</Text>
      </TouchableOpacity>
    </View>
  );
  MockCustomDrawerContent.displayName = 'CustomDrawerContent';
  return MockCustomDrawerContent;
});

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import DrawerNavigation from '../../src/navigation/DrawerNavigation';
import { Text, TouchableOpacity, View } from 'react-native';

describe('DrawerNavigation', () => {
  it('renders DrawerNavigation with initial Home screen', () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <DrawerNavigation />
      </NavigationContainer>
    );
    expect(getByTestId('home-screen')).toBeTruthy();
  });

  it('renders CustomDrawerContent', () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <DrawerNavigation />
      </NavigationContainer>
    );
    expect(getByTestId('drawer-content')).toBeTruthy();
  });

  it('navigates to Home page when Home drawer item is pressed', () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({
      navigate: mockNavigate,
    });

    const { getByTestId } = render(
      <NavigationContainer>
        <DrawerNavigation />
      </NavigationContainer>
    );

    fireEvent.press(getByTestId('home-drawer-item'));
    expect(mockNavigate).toHaveBeenCalledWith('Home');
  });

  it('navigates to Login page when Login drawer item is pressed', () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({
      navigate: mockNavigate,
    });

    const { getByTestId } = render(
      <NavigationContainer>
        <DrawerNavigation />
      </NavigationContainer>
    );

    fireEvent.press(getByTestId('login-drawer-item'));
    expect(mockNavigate).toHaveBeenCalledWith('Login');
  });

  it('navigates to Signup page when Signup drawer item is pressed', () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({
      navigate: mockNavigate,
    });

    const { getByTestId } = render(
      <NavigationContainer>
        <DrawerNavigation />
      </NavigationContainer>
    );

    fireEvent.press(getByTestId('signup-drawer-item'));
    expect(mockNavigate).toHaveBeenCalledWith('Signup');
  });

  it('navigates to Premium page when Premium drawer item is pressed', () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({
      navigate: mockNavigate,
    });

    const { getByTestId } = render(
      <NavigationContainer>
        <DrawerNavigation />
      </NavigationContainer>
    );

    fireEvent.press(getByTestId('premium-drawer-item'));
    expect(mockNavigate).toHaveBeenCalledWith('Premium');
  });

  it('navigates to Profile page when Profile drawer item is pressed', () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({
      navigate: mockNavigate,
    });

    const { getByTestId } = render(
      <NavigationContainer>
        <DrawerNavigation />
      </NavigationContainer>
    );

    fireEvent.press(getByTestId('profile-drawer-item'));
    expect(mockNavigate).toHaveBeenCalledWith('Profile');
  });

  it('renders Login screen when navigated to', () => {
    const { getByTestId, rerender } = render(
      <NavigationContainer>
        <DrawerNavigation />
      </NavigationContainer>
    );
    rerender(
      <NavigationContainer initialState={{ routes: [{ name: 'Login' }] }}>
        <DrawerNavigation />
      </NavigationContainer>
    );
    expect(getByTestId('login-screen')).toBeTruthy();
  });

  it('renders Signup screen when navigated to', () => {
    const { getByTestId, rerender } = render(
      <NavigationContainer>
        <DrawerNavigation />
      </NavigationContainer>
    );
    rerender(
      <NavigationContainer initialState={{ routes: [{ name: 'Signup' }] }}>
        <DrawerNavigation />
      </NavigationContainer>
    );
    expect(getByTestId('signup-screen')).toBeTruthy();
  });

  it('renders Premium screen when navigated to', () => {
    const { getByTestId, rerender } = render(
      <NavigationContainer>
        <DrawerNavigation />
      </NavigationContainer>
    );
    rerender(
      <NavigationContainer initialState={{ routes: [{ name: 'Premium' }] }}>
        <DrawerNavigation />
      </NavigationContainer>
    );
    expect(getByTestId('premium-screen')).toBeTruthy();
  });

  it('renders Profile screen when navigated to', () => {
    const { getByTestId, rerender } = render(
      <NavigationContainer>
        <DrawerNavigation />
      </NavigationContainer>
    );
    rerender(
      <NavigationContainer initialState={{ routes: [{ name: 'Profile' }] }}>
        <DrawerNavigation />
      </NavigationContainer>
    );
    expect(getByTestId('profile-screen')).toBeTruthy();
  });
});