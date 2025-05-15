import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import EditScreen from '../../src/components/EditScreen'; // Adjust this import as per your project structure
import { createMovie } from '../../src/utils/Api';
import { launchImageLibrary } from 'react-native-image-picker';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // Use native-stack
import { Alert } from 'react-native';

// Mock dependencies
jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
}));

jest.mock('../../src/utils/Api', () => ({
  createMovie: jest.fn(),
}));

// Mock Alert for testing alert behavior
jest.spyOn(Alert, 'alert');

// Navigation mock
const Stack = createNativeStackNavigator();

const renderWithNavigation = (component: React.ReactNode, routeParams = {}) => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
  };

  return render(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="EditScreen">
          {() => <EditScreen navigation={mockNavigation} route={{ params: routeParams }} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Rest of the test file remains the same
describe('EditScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the screen and all input fields correctly', () => {
    const { getByTestId, getByPlaceholderText } = renderWithNavigation(<EditScreen />);

    // Verify heading
    expect(getByTestId('edit-screen-heading')).toHaveTextContent('Edit Movie Details');

    // Verify all input fields
    expect(getByPlaceholderText('Title')).toBeTruthy();
    expect(getByPlaceholderText('Genre')).toBeTruthy();
    expect(getByPlaceholderText('Release Year')).toBeTruthy();
    expect(getByPlaceholderText('Director')).toBeTruthy();
    expect(getByPlaceholderText('Duration (e.g., 2h 15m)')).toBeTruthy();
    expect(getByPlaceholderText('Description')).toBeTruthy();
    expect(getByPlaceholderText('Main Lead Actor')).toBeTruthy();
    expect(getByPlaceholderText('Streaming Platform')).toBeTruthy();
    expect(getByPlaceholderText('Rating (e.g., 8.5)')).toBeTruthy();

    // Verify image picker button
    expect(getByTestId('image-picker-button')).toBeTruthy();

    // Verify add movie button
    expect(getByTestId('add-movie-button')).toBeTruthy();
  });

  it('handles user input for all text fields', () => {
    const { getByTestId } = renderWithNavigation(<EditScreen />);

    // Test input for each field
    const inputs = [
      { testId: 'input-title', value: 'The Dark Knight' },
      { testId: 'input-genre', value: 'Action' },
      { testId: 'input-release_year', value: '2008' },
      { testId: 'input-director', value: 'Christopher Nolan' },
      { testId: 'input-duration', value: '2h 32m' },
      { testId: 'input-description', value: 'A thrilling action movie.' },
      { testId: 'input-main_lead', value: 'Christian Bale' },
      { testId: 'input-streaming_platform', value: 'HBO Max' },
      { testId: 'input-rating', value: '9.0' },
    ];

    inputs.forEach(({ testId, value }) => {
      fireEvent.changeText(getByTestId(testId), value);
      expect(getByTestId(testId).props.value).toBe(value);
    });
  });

  it('picks an image when "Pick Poster Image" button is pressed', async () => {
    const mockImage = {
      assets: [
        {
          uri: 'mock-image-uri.jpg',
          fileName: 'image.jpg',
          type: 'image/jpeg',
        },
      ],
    };
    launchImageLibrary.mockImplementationOnce((options, callback) => {
      callback(mockImage);
    });

    const { getByTestId } = renderWithNavigation(<EditScreen />);

    fireEvent.press(getByTestId('image-picker-button'));

    await waitFor(() => {
      expect(getByTestId('poster-preview')).toBeTruthy();
      expect(getByTestId('poster-preview').props.source.uri).toBe('mock-image-uri.jpg');
    });
  });

  it('handles image picker cancellation', async () => {
    launchImageLibrary.mockImplementationOnce((options, callback) => {
      callback({ didCancel: true });
    });

    const { getByTestId, queryByTestId } = renderWithNavigation(<EditScreen />);

    fireEvent.press(getByTestId('image-picker-button'));

    await waitFor(() => {
      expect(queryByTestId('poster-preview')).toBeNull();
    });
  });

  it('handles image picker error', async () => {
    launchImageLibrary.mockImplementationOnce((options, callback) => {
      callback({ errorCode: 'E_PICKER_ERROR', errorMessage: 'Image picker failed' });
    });

    const { getByTestId, queryByTestId } = renderWithNavigation(<EditScreen />);

    fireEvent.press(getByTestId('image-picker-button'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error picking image');
      expect(queryByTestId('poster-preview')).toBeNull();
    });
  });

  it('submits the form successfully when all fields are filled', async () => {
    const mockMovieResponse = { id: 1 };
    createMovie.mockResolvedValueOnce(mockMovieResponse);

    const { getByTestId, queryByTestId } = renderWithNavigation(<EditScreen />);

    // Fill in the form
    fireEvent.changeText(getByTestId('input-title'), 'The Dark Knight');
    fireEvent.changeText(getByTestId('input-genre'), 'Action');
    fireEvent.changeText(getByTestId('input-release_year'), '2008');
    fireEvent.changeText(getByTestId('input-director'), 'Christopher Nolan');
    fireEvent.changeText(getByTestId('input-duration'), '2h 32m');
    fireEvent.changeText(getByTestId('input-description'), 'A thrilling action movie.');
    fireEvent.changeText(getByTestId('input-main_lead'), 'Christian Bale');
    fireEvent.changeText(getByTestId('input-streaming_platform'), 'HBO Max');
    fireEvent.changeText(getByTestId('input-rating'), '9.0');

    // Mock image
    const mockImage = {
      assets: [
        {
          uri: 'mock-image-uri.jpg',
          fileName: 'image.jpg',
          type: 'image/jpeg',
        },
      ],
    };
    launchImageLibrary.mockImplementationOnce((options, callback) => {
      callback(mockImage);
    });
    fireEvent.press(getByTestId('image-picker-button'));

    // Submit form
    fireEvent.press(getByTestId('add-movie-button'));

    await waitFor(() => {
      expect(createMovie).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'The Dark Knight',
          genre: 'Action',
          release_year: '2008',
          director: 'Christopher Nolan',
          duration: '2h 32m',
          description: 'A thrilling action movie.',
          main_lead: 'Christian Bale',
          streaming_platform: 'HBO Max',
          rating: '9.0',
          isPremium: false,
          poster: expect.any(Object),
          banner: null,
        })
      );
      expect(Alert.alert).toHaveBeenCalledWith('Movie added successfully!');

      // Verify form reset
      expect(getByTestId('input-title').props.value).toBe('');
      expect(getByTestId('input-genre').props.value).toBe('');
      expect(getByTestId('input-release_year').props.value).toBe('');
      expect(getByTestId('input-director').props.value).toBe('');
      expect(getByTestId('input-duration').props.value).toBe('');
      expect(getByTestId('input-description').props.value).toBe('');
      expect(getByTestId('input-main_lead').props.value).toBe('');
      expect(getByTestId('input-streaming_platform').props.value).toBe('');
      expect(getByTestId('input-rating').props.value).toBe('');
      expect(queryByTestId('poster-preview')).toBeNull();
    });
  });

  it('shows validation error when required fields are missing', async () => {
    const { getByTestId } = renderWithNavigation(<EditScreen />);

    // Submit form without filling any fields
    fireEvent.press(getByTestId('add-movie-button'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Validation Error', 'Please fill all required fields.');

      // Verify invalid input styling
      ['title', 'genre', 'release_year', 'director', 'duration', 'description', 'main_lead', 'streaming_platform', 'rating'].forEach((field) => {
        expect(getByTestId(`input-${field}`).props.style).toContainEqual(expect.objectContaining({ borderColor: 'red' }));
      });
    });
  });


  it('handles API failure gracefully', async () => {
    createMovie.mockRejectedValueOnce(new Error('Failed to add movie'));

    const { getByTestId } = renderWithNavigation(<EditScreen />);

    // Fill in the form
    fireEvent.changeText(getByTestId('input-title'), 'The Dark Knight');
    fireEvent.changeText(getByTestId('input-genre'), 'Action');
    fireEvent.changeText(getByTestId('input-release_year'), '2008');
    fireEvent.changeText(getByTestId('input-director'), 'Christopher Nolan');
    fireEvent.changeText(getByTestId('input-duration'), '2h 32m');
    fireEvent.changeText(getByTestId('input-description'), 'A thrilling action movie.');
    fireEvent.changeText(getByTestId('input-main_lead'), 'Christian Bale');
    fireEvent.changeText(getByTestId('input-streaming_platform'), 'HBO Max');
    fireEvent.changeText(getByTestId('input-rating'), '9.0');

    // Submit form
    fireEvent.press(getByTestId('add-movie-button'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Failed to add movie');
    });
  });

  it('handles route params correctly', () => {
    const routeParams = { id: 123 };
    const { getByTestId } = renderWithNavigation(<EditScreen />, routeParams);

    // Verify that the screen renders correctly with route params
    expect(getByTestId('edit-screen-heading')).toBeTruthy();
  });
});