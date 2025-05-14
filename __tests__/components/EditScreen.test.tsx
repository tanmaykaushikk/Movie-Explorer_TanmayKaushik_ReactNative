import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import  EditScreen  from '../../src/components/EditScreen';  // Adjust this import as per your project structure
import { createMovie } from '../../src/utils/Api';
import { launchImageLibrary } from 'react-native-image-picker';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Mock dependencies
jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
}));

jest.mock('../../src/utils/Api', () => ({
  createMovie: jest.fn(),
}));

// Navigation mock
const Stack = createStackNavigator();

const renderWithNavigation = (component: React.ReactNode) => {
  return render(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="EditScreen" component={() => component} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

describe('EditScreen', () => {
  beforeEach(() => {
    createMovie.mockReset();
    launchImageLibrary.mockReset();
  });

  it('renders the screen and input fields', () => {
    const { getByTestId, getByPlaceholderText } = renderWithNavigation(<EditScreen />);

    // Check if all input fields are rendered
    expect(getByTestId('edit-screen-heading')).toBeTruthy();
    expect(getByPlaceholderText('Title')).toBeTruthy();
    expect(getByPlaceholderText('Genre')).toBeTruthy();
    expect(getByPlaceholderText('Release Year')).toBeTruthy();
    expect(getByPlaceholderText('Director')).toBeTruthy();
    expect(getByPlaceholderText('Duration (e.g., 2h 15m)')).toBeTruthy();
    expect(getByPlaceholderText('Description')).toBeTruthy();
    expect(getByPlaceholderText('Main Lead Actor')).toBeTruthy();
    expect(getByPlaceholderText('Streaming Platform')).toBeTruthy();
    expect(getByPlaceholderText('Rating (e.g., 8.5)')).toBeTruthy();
  });

  it('should handle user input for the title field', () => {
    const { getByTestId } = renderWithNavigation(<EditScreen />);

    // Simulate user typing in the title input
    fireEvent.changeText(getByTestId('input-title'), 'The Dark Knight');

    // Check if the state has been updated
    expect(getByTestId('input-title').props.value).toBe('The Dark Knight');
  });

  it('should pick an image when "Pick Poster Image" button is pressed', async () => {
    const mockImage = {
      assets: [
        {
          uri: 'mock-image-uri.jpg',
        },
      ],
    };
    launchImageLibrary.mockImplementationOnce((options, callback) => {
      callback(mockImage);
    });

    const { getByTestId } = renderWithNavigation(<EditScreen />);

    // Simulate pressing the image picker button
    fireEvent.press(getByTestId('image-picker-button'));

    // Wait for the image preview to appear
    await waitFor(() => expect(getByTestId('poster-preview')).toBeTruthy());
  });

  it('should submit the form when the "Add Movie" button is pressed', async () => {
    const mockMovieResponse = { id: 1 };
    createMovie.mockResolvedValueOnce(mockMovieResponse);

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

    // Simulate pressing the "Add Movie" button
    fireEvent.press(getByTestId('add-movie-button'));

    // Check if the API function has been called with the correct data
    await waitFor(() => {
      expect(createMovie).toHaveBeenCalledWith({
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
        poster: expect.any(Object), // Expecting a file object (mocked image)
        banner: null,
      });
    });
  });

  it('should handle error when createMovie fails', async () => {
    createMovie.mockRejectedValueOnce(new Error('Failed to add movie'));

    const { getByTestId } = renderWithNavigation(<EditScreen />);

    // Simulate pressing the "Add Movie" button
    fireEvent.press(getByTestId('add-movie-button'));

    // Check for error alert
    await waitFor(() => expect(getByTestId('alert')).toBeTruthy());
  });

  it('should handle empty form submission gracefully', async () => {
    createMovie.mockResolvedValueOnce({ id: 1 });

    const { getByTestId } = renderWithNavigation(<EditScreen />);

    // Submit the form with empty fields
    fireEvent.press(getByTestId('add-movie-button'));

    // Check if the validation or error alert is triggered
    await waitFor(() => expect(getByTestId('alert')).toBeTruthy());
  });

  it('should show validation error for invalid input (e.g., invalid year)', async () => {
    createMovie.mockResolvedValueOnce({ id: 1 });

    const { getByTestId } = renderWithNavigation(<EditScreen />);

    // Fill in an invalid year
    fireEvent.changeText(getByTestId('input-release_year'), 'Invalid Year');
    fireEvent.press(getByTestId('add-movie-button'));

    // Expect an error or validation message
    await waitFor(() => expect(getByTestId('alert')).toBeTruthy());
  });
});
