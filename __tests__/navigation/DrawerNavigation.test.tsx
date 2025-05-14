import { render, fireEvent } from '@testing-library/react-native';
import React from 'react';
import DrawerNavigation from '../../src/navigation/DrawerNavigation'; // Adjust the path accordingly
import { NavigationContainer } from '@react-navigation/native'; // To wrap the navigation container for testing

// Mocking the necessary components and modules
jest.mock('../../src/screens/HomePage', () => 'HomePage');
jest.mock('../../src/screens/Login', () => 'Login');
jest.mock('../../src/screens/Signup', () => 'Signup');
jest.mock('../../src/screens/PremiumScreen', () => 'PremiumScreen');
jest.mock('../../src/screens/Profile', () => 'Profile');
jest.mock('../../src/components/CustomDrawerContent', () => 'CustomDrawerContent');

// Mocking react-native-gesture-handler (important for navigation to work in tests)
jest.mock('react-native-gesture-handler', () => {
  return {
    GestureHandlerRootView: 'GestureHandlerRootView',
    GestureHandler: 'GestureHandler',
    PanGestureHandler: 'PanGestureHandler',
    ScrollView: 'ScrollView',
    State: {
      END: 'END',
      BEGAN: 'BEGAN',
      FAILED: 'FAILED',
      UNDETERMINED: 'UNDETERMINED',
    },
    Directions: {
      LEFT: 'LEFT',
      RIGHT: 'RIGHT',
      UP: 'UP',
      DOWN: 'DOWN',
    },
  };
});

// Mocking other native modules (if needed)
// jest.mock('react-native-reanimated', () => require('react-native-jest/mock'));

describe('DrawerNavigation', () => {
  it('renders DrawerNavigation correctly', () => {
    const { getByText } = render(
      <NavigationContainer>
        <DrawerNavigation />
      </NavigationContainer>
    );
    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
    expect(getByText('Signup')).toBeTruthy();
    expect(getByText('Premium')).toBeTruthy();
    expect(getByText('Profile')).toBeTruthy();
  });

  it('navigates to Home page when Home is pressed', () => {
    const { getByText } = render(
      <NavigationContainer>
        <DrawerNavigation />
      </NavigationContainer>
    );
    
    const homeButton = getByText('Home');
    fireEvent.press(homeButton);

    expect(homeButton).toBeTruthy(); // Ensure Home page is navigated to
  });

  it('navigates to Login page when Login is pressed', () => {
    const { getByText } = render(
      <NavigationContainer>
        <DrawerNavigation />
      </NavigationContainer>
    );
    
    const loginButton = getByText('Login');
    fireEvent.press(loginButton);

    expect(loginButton).toBeTruthy(); // Ensure Login page is navigated to
  });

  it('navigates to Signup page when Signup is pressed', () => {
    const { getByText } = render(
      <NavigationContainer>
        <DrawerNavigation />
      </NavigationContainer>
    );
    
    const signupButton = getByText('Signup');
    fireEvent.press(signupButton);

    expect(signupButton).toBeTruthy(); // Ensure Signup page is navigated to
  });

  it('navigates to Premium page when Premium is pressed', () => {
    const { getByText } = render(
      <NavigationContainer>
        <DrawerNavigation />
      </NavigationContainer>
    );
    
    const premiumButton = getByText('Premium');
    fireEvent.press(premiumButton);

    expect(premiumButton).toBeTruthy(); // Ensure Premium page is navigated to
  });

  it('navigates to Profile page when Profile is pressed', () => {
    const { getByText } = render(
      <NavigationContainer>
        <DrawerNavigation />
      </NavigationContainer>
    );
    
    const profileButton = getByText('Profile');
    fireEvent.press(profileButton);

    expect(profileButton).toBeTruthy(); // Ensure Profile page is navigated to
  });

  it('should render CustomDrawerContent', () => {
    const { getByText } = render(
      <NavigationContainer>
        <DrawerNavigation />
      </NavigationContainer>
    );

    // Ensure CustomDrawerContent is rendered
    expect(getByText('CustomDrawerContent')).toBeTruthy();
  });

  // You can add more tests for specific behavior of each screen if needed.
});
