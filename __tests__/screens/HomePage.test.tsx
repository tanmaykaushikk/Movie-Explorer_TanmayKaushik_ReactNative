import { render, fireEvent, waitFor } from '@testing-library/react-native';
import React from 'react';
import HomePage from '../../src/screens/HomePage';  // Assuming HomePage is in the same folder
import * as Api from '../../src/utils/Api';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock the necessary modules to avoid errors related to `react-native-gesture-handler` and `react-native-reanimated-carousel`
jest.mock('react-native-gesture-handler', () => {
  return {
    GestureHandlerRootView: jest.fn().mockImplementation(({ children }) => children),
    PanGestureHandler: jest.fn().mockImplementation(({ children }) => children),
    GestureDetector: jest.fn().mockImplementation(({ children }) => children),
    // Mock other gesture handlers if you use them
  };
});

jest.mock('react-native-reanimated-carousel', () => ({
  __esModule: true,
  default: jest.fn(() => null), // Mocking carousel as a no-op for tests
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  DrawerActions: {
    toggleDrawer: jest.fn(),
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('../../src/utils/Api', () => ({
  getAllMovies: jest.fn(),
  getMoviesByGenre: jest.fn(),
  searchMovies: jest.fn(),
}));

// Mocks for Movies and Data
const mockMovies = [
  {
    id: 1,
    title: 'Avengers: Endgame',
    genre: 'Action',
    release_year: 2019,
    rating: 8.4,
    director: 'Anthony Russo, Joe Russo',
    duration: 181,
    description: 'Superheroes team up...',
    premium: false,
    main_lead: 'Robert Downey Jr.',
    streaming_platform: 'Disney+',
    poster_url: 'some-url',
    banner_url: 'some-banner-url',
  },
  {
    id: 2,
    title: 'Inception',
    genre: 'Sci-Fi',
    release_year: 2010,
    rating: 8.8,
    director: 'Christopher Nolan',
    duration: 148,
    description: 'A mind-bending thriller...',
    premium: true,
    main_lead: 'Leonardo DiCaprio',
    streaming_platform: 'Netflix',
    poster_url: 'another-url',
    banner_url: 'another-banner-url',
  },
];

// Tests

describe('HomePage Component', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display loading indicator initially', () => {
    const { getByText, getByTestId } = render(<HomePage />);
    expect(getByTestId('test')).toBeTruthy();
    expect(getByText('Loading movies...')).toBeTruthy();
  });

  it('should fetch and display movies after loading', async () => {
    Api.getAllMovies.mockResolvedValue({ movies: mockMovies });

    const { getByText, findByText } = render(<HomePage />);
    await waitFor(() => findByText('Upcoming Movies'));

    expect(getByText('Upcoming Movies')).toBeTruthy();
  });

  it('should display search results on typing', async () => {
    Api.searchMovies.mockResolvedValue(mockMovies);
    
    const { getByPlaceholderText, findByText } = render(<HomePage />);
    const searchInput = getByPlaceholderText('Ready for a movie adventure?');
    
    fireEvent.changeText(searchInput, 'Avengers');
    
    await waitFor(() => findByText(/Search Results for "Avengers"/));

    expect(findByText(/Search Results for "Avengers"/)).toBeTruthy();
  });

  it('should show edit icon if user is admin', async () => {
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify({ role: 'supervisor' }));
    
    const { getByTestId } = render(<HomePage />);
    
    await waitFor(() => getByTestId('edit-icon'));
    
    expect(getByTestId('edit-icon')).toBeTruthy();
  });

  it('should show subscription icon if user is not admin', async () => {
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify({ role: 'user' }));
    
    const { getByTestId } = render(<HomePage />);
    
    await waitFor(() => getByTestId('menu-image'));
    
    expect(getByTestId('menu-image')).toBeTruthy();
  });

  it('should dispatch drawer action when profile image is clicked', () => {
    const mockDispatch = jest.fn();
    jest.spyOn(useNavigation(), 'dispatch').mockImplementation(mockDispatch);

    const { getByRole } = render(<HomePage />);
    const image = getByRole('button'); // Assuming it's the first TouchableOpacity

    fireEvent.press(image);
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('should navigate to Movie screen when a movie is clicked', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(useNavigation(), 'navigate').mockImplementation(mockNavigate);

    const { getByText } = render(<HomePage />);
    fireEvent.press(getByText('Avengers: Endgame'));

    expect(mockNavigate).toHaveBeenCalledWith('Movie', { movie: mockMovies[0] });
  });

  it('should reset menuVisible on screen focus', () => {
    const { result } = renderHook(() => HomePage());
    
    act(() => {
      result.current.navigation.emit({ type: 'focus' });
    });

    expect(result.current.menuVisible).toBe(false);
  });

  it('should display movies by genre', async () => {
    Api.getMoviesByGenre.mockResolvedValue(mockMovies);
    const { findByText } = render(<HomePage />);

    await waitFor(() => findByText('Action Movies'));

    expect(findByText('Action Movies')).toBeTruthy();
  });

  it('should display correct search results for "Avengers"', async () => {
    Api.searchMovies.mockResolvedValue([
      {
        id: 3,
        title: 'Avengers: Infinity War',
        genre: 'Action',
        release_year: 2018,
        rating: 8.5,
        director: 'Anthony Russo, Joe Russo',
        duration: 149,
        description: 'Superheroes face their biggest challenge...',
        premium: true,
        main_lead: 'Chris Hemsworth',
        streaming_platform: 'Disney+',
        poster_url: 'some-url',
        banner_url: 'some-banner-url',
      }
    ]);

    const { getByPlaceholderText, findByText } = render(<HomePage />);
    const searchInput = getByPlaceholderText('Ready for a movie adventure?');
    
    fireEvent.changeText(searchInput, 'Avengers');
    
    await waitFor(() => findByText('Avengers: Infinity War'));

    expect(findByText('Avengers: Infinity War')).toBeTruthy();
  });

});
