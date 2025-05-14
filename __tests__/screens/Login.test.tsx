import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Login from '../../src/screens/Login';
import { loginAPI } from '../../src/utils/Api'; // Mock the loginAPI function
import { useNavigation } from '@react-navigation/native';
import { Alert, View } from 'react-native';

// Mock the loginAPI and navigation
jest.mock('../../src/utils/Api', () => ({
  loginAPI: jest.fn(),
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

// Mock react-native components that are used in your component
jest.mock('react-native', () => {
  const actualReactNative = jest.requireActual('react-native');
  return {
    ...actualReactNative,
    Alert: {
      alert: jest.fn(),
    },
    View: actualReactNative.View, // Use actual View here
  };
});

// Mock react-native-linear-gradient to return a simple View wrapper
jest.mock('react-native-linear-gradient', () => {
  return ({ children })=> <View>{children}</View>; // Simple wrapper for LinearGradient
});

describe('Login Screen', () => {
  const navigate = jest.fn();

  beforeEach(() => {
    // Reset the mocks before each test
    useNavigation.mockReturnValue({ navigate });
    jest.clearAllMocks();
  });

  it('should render login inputs and button', () => {
    const { getByPlaceholderText, getByText } = render(<Login />);
    
    // Check if the email input, password input, and login button are rendered
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
  });

  it('should show alert if fields are empty', () => {
    const { getByText } = render(<Login />);
    
    // Simulate pressing the login button without filling in fields
    fireEvent.press(getByText('Login'));

    // Check if the alert is triggered for empty fields
    expect(Alert.alert).toHaveBeenCalledWith('Please fill all fields');
  });

  it('should call loginAPI with the correct credentials', async () => {
    const { getByPlaceholderText, getByText } = render(<Login />);

    // Fill in the email and password inputs
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');

    // Mock the loginAPI response
    loginAPI.mockResolvedValueOnce({ role: 'user' });

    // Simulate login button press
    fireEvent.press(getByText('Login'));

    // Wait for the API call to finish
    await waitFor(() => expect(loginAPI).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    }));
  });

  it('should show alert on invalid login credentials', async () => {
    const { getByPlaceholderText, getByText } = render(<Login />);

    // Fill in the email and password inputs
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'wrongpassword');

    // Mock the loginAPI to simulate an error
    loginAPI.mockRejectedValueOnce(new Error('Invalid credentials'));

    // Simulate login button press
    fireEvent.press(getByText('Login'));

    // Check if alert is triggered for invalid login
    await waitFor(() => expect(Alert.alert).toHaveBeenCalledWith('Invalid email or password'));
  });

  it('should navigate to HomePage after successful login for regular user', async () => {
    const { getByPlaceholderText, getByText } = render(<Login />);

    // Fill in the email and password inputs
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');

    // Mock a successful loginAPI response for regular user
    loginAPI.mockResolvedValueOnce({ role: 'user' });

    // Simulate login button press
    fireEvent.press(getByText('Login'));

    // Check if navigation to HomePage happens
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('HomePage'));
  });

  it('should navigate to HomePage after successful admin login', async () => {
    const { getByPlaceholderText, getByText } = render(<Login />);

    // Fill in the email and password inputs
    fireEvent.changeText(getByPlaceholderText('Email'), 'admin@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'adminpassword');

    // Mock a successful loginAPI response for supervisor (admin)
    loginAPI.mockResolvedValueOnce({ role: 'supervisor' });

    // Simulate login button press
    fireEvent.press(getByText('Login'));

    // Check if navigation to HomePage happens
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('HomePage'));
  });

  it('should toggle the password visibility when clicking show/hide button', () => {
    const { getByText, getByPlaceholderText } = render(<Login />);

    // Initial state should have password hidden
    const passwordInput = getByPlaceholderText('Password');
    expect(passwordInput.props.secureTextEntry).toBe(true);

    // Press the show/hide button to toggle password visibility
    fireEvent.press(getByText('Show'));

    // After clicking, password input should be visible
    expect(passwordInput.props.secureTextEntry).toBe(false);
    
    // Press the show/hide button again to hide the password
    fireEvent.press(getByText('Hide'));
    expect(passwordInput.props.secureTextEntry).toBe(true);
  });

  it('should navigate to SignupPage when "Create Account" is pressed', () => {
    const { getByText } = render(<Login />);

    // Simulate pressing the "Create Account" link
    fireEvent.press(getByText('Create Account'));

    // Check if navigation to SignupPage occurs
    expect(navigate).toHaveBeenCalledWith('SignupPage');
  });
});
