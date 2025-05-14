import React from 'react';
import { render } from '@testing-library/react-native';
import { MovieScreen } from '../../src/screens/MovieScreen';  // Update path accordingly
import { useRoute } from '@react-navigation/native';
import { StatusBar } from 'react-native';

// Mocking useRoute to provide movie data
jest.mock('@react-navigation/native', () => ({
  useRoute: jest.fn(),
}));

describe('MovieScreen', () => {
  const mockMovie = {
    poster_url: 'https://someurl.com/poster.jpg',
    title: 'Movie Title',
    release_year: 2021,
    duration: 120,
    genre: 'Action',
    director: 'John Doe',
    rating: 8.5,
    description: 'A thrilling action-packed adventure movie.',
  };

  beforeEach(() => {
    useRoute.mockReturnValue({
      params: {
        movie: mockMovie,
      },
    });
  });

  it('should render the movie details correctly', () => {
    const { getByText, getByTestId } = render(<MovieScreen />);

    // Check if the movie title is rendered correctly
    getByText(mockMovie.title);

    // Check if the release year, duration, genre, director are rendered
    getByText(`Released - ${mockMovie.release_year} - ${mockMovie.duration} m`);
    getByText(`${mockMovie.genre} - Directed by ${mockMovie.director}`);

    // Check if the rating is rendered correctly
    getByText(`⭐ ${mockMovie.rating} / 10`);

    // Check if the description is rendered
    getByText(mockMovie.description);
  });

  it('should display the movie poster image', () => {
    const { getByTestId } = render(<MovieScreen />);
    
    // Check if the background image is rendered with correct URL
    const image = getByTestId('movie-poster-image');
    expect(image.props.source.uri).toBe(mockMovie.poster_url);
  });

  it('should render the LinearGradient over the background image', () => {
    const { getByTestId } = render(<MovieScreen />);
    
    // Check if the LinearGradient is rendered
    const gradient = getByTestId('gradient-overlay');
    expect(gradient).toBeTruthy();
  });

  it('should render the StatusBar', () => {
    const { getByTestId } = render(<MovieScreen />);
    
    // Check if StatusBar is rendered
    const statusBar = getByTestId('status-bar');
    expect(statusBar).toBeTruthy();
  });
});
