import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SplashScreen from '../../src/screens/SplashScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

// Mock AsyncStorage and navigation
jest.mock('@react-native-async-storage/async-storage', () => ({
  removeItem: jest.fn(),
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

describe('SplashScreen', () => {
  const navigate = jest.fn();

  beforeEach(() => {
    // Reset the mocks before each test
    useNavigation.mockReturnValue({ navigate });
    jest.clearAllMocks();
  });

  it('should display the "WELCOME" text correctly', () => {
    const { getByText } = render(<SplashScreen navigation={{ navigate }} />);
    // Check if "WELCOME" text is rendered
    expect(getByText('WELCOME')).toBeTruthy();
  });

  it('should display the "Are you ready to explore?" text correctly', () => {
    const { getByText } = render(<SplashScreen navigation={{ navigate }} />);
    // Check if "Are you ready to explore?" text is rendered
    expect(getByText('Are you ready to explore?')).toBeTruthy();
  });

  it('should display the button text correctly', () => {
    const { getByText } = render(<SplashScreen navigation={{ navigate }} />);
    // Check if the button text is "Let's Start"
    expect(getByText("Let's Start")).toBeTruthy();
  });

  it('should trigger handleStart when button is pressed', async () => {
    const { getByText } = render(<SplashScreen navigation={{ navigate }} />);

    // Simulate button press
    fireEvent.press(getByText("Let's Start"));

    // Check if AsyncStorage removeItem was called for "user" and "token"
    await waitFor(() => {
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('token');
      expect(navigate).toHaveBeenCalledWith('HomePage');
    });
  });
});
