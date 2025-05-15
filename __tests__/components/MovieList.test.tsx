import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import MovieList from '../../src/components/MovieList';
import { NavigationContainer } from '@react-navigation/native';
import { Alert } from 'react-native';
import { deleteMovie, getMoviesById } from '../../src/utils/Api';

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

// Mock API calls
jest.mock('../../src/utils/Api', () => ({
  deleteMovie: jest.fn(),
  getMoviesById: jest.fn(),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

const mockMovies = [
  {
    id: 1,
    title: 'Test Movie',
    genre: 'Drama',
    release_year: 2023,
    rating: 4.5,
    director: 'Jane Doe',
    duration: 120,
    description: 'Test description',
    premium: true,
    main_lead: 'Actor A',
    streaming_platform: 'Netflix',
    poster_url: 'https://via.placeholder.com/120x170',
    banner_url: '',
  },
  {
    id: 2,
    title: 'Test Movie 2',
    genre: 'Comedy',
    release_year: 2022,
    rating: 4.0,
    director: 'John Doe',
    duration: 100,
    description: 'Another test description',
    premium: false,
    main_lead: 'Actor B',
    streaming_platform: 'Hulu',
    poster_url: 'https://via.placeholder.com/120x170',
    banner_url: '',
  },
];

describe('MovieList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (deleteMovie as jest.Mock).mockResolvedValue(true);
    (getMoviesById as jest.Mock).mockResolvedValue(mockMovies[0]);
  });

  it('renders title, see all button, and movie posters', () => {
    const { getByText, getAllByTestId } = render(
      <NavigationContainer>
        <MovieList
          title="Trending"
          data={mockMovies}
          handleClick={jest.fn()}
          isAdmin={false}
          isPremiumSubscribed={false}
        />
      </NavigationContainer>
    );

    expect(getByText('Trending')).toBeTruthy();
    expect(getByText('See All')).toBeTruthy();
    expect(getAllByTestId('image')).toHaveLength(2);
  });

  it('navigates to SeeAll screen when See All is pressed', () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({
      navigate: mockNavigate,
    });

    const { getByText } = render(
      <NavigationContainer>
        <MovieList
          title="Trending"
          data={mockMovies}
          handleClick={jest.fn()}
          isAdmin={false}
          isPremiumSubscribed={false}
        />
      </NavigationContainer>
    );

    fireEvent.press(getByText('See All'));
    expect(mockNavigate).toHaveBeenCalledWith('SeeAll', { title: 'Trending', movies: mockMovies });
  });

  it('shows edit icon and navigates to Update screen when admin', () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({
      navigate: mockNavigate,
    });

    const { getByTestId } = render(
      <NavigationContainer>
        <MovieList
          title="Admin Picks"
          data={mockMovies}
          handleClick={jest.fn()}
          isAdmin={true}
          isPremiumSubscribed={false}
        />
      </NavigationContainer>
    );

    expect(getByTestId('edit-icon-1')).toBeTruthy();
    expect(getByTestId('edit-icon-2')).toBeTruthy();

    fireEvent.press(getByTestId('edit-icon-1'));
    expect(mockNavigate).toHaveBeenCalledWith('Update', { movie: mockMovies[0] });
  });

  it('calls handleClick with updated movie data on press', async () => {
    const handleClick = jest.fn();
    const { getByTestId } = render(
      <NavigationContainer>
        <MovieList
          title="My List"
          data={mockMovies}
          handleClick={handleClick}
          isAdmin={false}
          isPremiumSubscribed={true}
        />
      </NavigationContainer>
    );

    fireEvent.press(getByTestId('movie-touchable-1'));
    await waitFor(() => {
      expect(getMoviesById).toHaveBeenCalledWith(1);
      expect(handleClick).toHaveBeenCalledWith(mockMovies[0]);
    });
  });

  it('shows error alert when getMoviesById fails', async () => {
    (getMoviesById as jest.Mock).mockRejectedValueOnce(new Error('Fetch error'));
    const handleClick = jest.fn();
    const { getByTestId } = render(
      <NavigationContainer>
        <MovieList
          title="My List"
          data={mockMovies}
          handleClick={handleClick}
          isAdmin={false}
          isPremiumSubscribed={true}
        />
      </NavigationContainer>
    );

    fireEvent.press(getByTestId('movie-touchable-1'));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error. Something went wrong fetching movie');
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  it('shows error alert when getMoviesById returns null', async () => {
    (getMoviesById as jest.Mock).mockResolvedValueOnce(null);
    const handleClick = jest.fn();
    const { getByTestId } = render(
      <NavigationContainer>
        <MovieList
          title="My List"
          data={mockMovies}
          handleClick={handleClick}
          isAdmin={false}
          isPremiumSubscribed={true}
        />
      </NavigationContainer>
    );

    fireEvent.press(getByTestId('movie-touchable-1'));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error. Could not fetch the movie');
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  it('handles movie deletion on long press when admin', async () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <MovieList
          title="Admin Picks"
          data={mockMovies}
          handleClick={jest.fn()}
          isAdmin={true}
          isPremiumSubscribed={false}
        />
      </NavigationContainer>
    );

    fireEvent(getByTestId('movie-touchable-1'), 'onLongPress');
    expect(Alert.alert).toHaveBeenCalledWith(
      'Confirm Deletion',
      'Are you sure you want to delete this movie?',
      expect.any(Array),
      { cancelable: true }
    );

    // Simulate pressing "Delete"
    const [, { onPress }] = (Alert.alert as jest.Mock).mock.calls[0][2];
    await onPress();

    expect(deleteMovie).toHaveBeenCalledWith(1);
    expect(Alert.alert).toHaveBeenCalledWith('Movie Deleted Successfully');
  });

  it('handles deletion failure', async () => {
    (deleteMovie as jest.Mock).mockResolvedValueOnce(false);
    const { getByTestId } = render(
      <NavigationContainer>
        <MovieList
          title="Admin Picks"
          data={mockMovies}
          handleClick={jest.fn()}
          isAdmin={true}
          isPremiumSubscribed={false}
        />
      </NavigationContainer>
    );

    fireEvent(getByTestId('movie-touchable-1'), 'onLongPress');
    const [, { onPress }] = (Alert.alert as jest.Mock).mock.calls[0][2];
    await onPress();

    expect(deleteMovie).toHaveBeenCalledWith(1);
    expect(Alert.alert).toHaveBeenCalledWith('Failed to delete movie');
  });

  it('handles deletion error', async () => {
    (deleteMovie as jest.Mock).mockRejectedValueOnce(new Error('Delete error'));
    const { getByTestId } = render(
      <NavigationContainer>
        <MovieList
          title="Admin Picks"
          data={mockMovies}
          handleClick={jest.fn()}
          isAdmin={true}
          isPremiumSubscribed={false}
        />
      </NavigationContainer>
    );

    fireEvent(getByTestId('movie-touchable-1'), 'onLongPress');
    const [, { onPress }] = (Alert.alert as jest.Mock).mock.calls[0][2];
    await onPress();

    expect(deleteMovie).toHaveBeenCalledWith(1);
    expect(Alert.alert).toHaveBeenCalledWith('An error occurred while deleting the movie.');
  });

  it('does not trigger deletion on long press when not admin', () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <MovieList
          title="Trending"
          data={mockMovies}
          handleClick={jest.fn()}
          isAdmin={false}
          isPremiumSubscribed={false}
        />
      </NavigationContainer>
    );

    fireEvent(getByTestId('movie-touchable-1'), 'onLongPress');
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('renders correctly with empty data', () => {
    const { getByText, queryAllByTestId } = render(
      <NavigationContainer>
        <MovieList
          title="Empty List"
          data={[]}
          handleClick={jest.fn()}
          isAdmin={false}
          isPremiumSubscribed={false}
        />
      </NavigationContainer>
    );

    expect(getByText('Empty List')).toBeTruthy();
    expect(queryAllByTestId('image')).toHaveLength(0);
  });

  it('updates movie list when data prop changes', () => {
    const { rerender, getAllByTestId } = render(
      <NavigationContainer>
        <MovieList
          title="Trending"
          data={[mockMovies[0]]}
          handleClick={jest.fn()}
          isAdmin={false}
          isPremiumSubscribed={false}
        />
      </NavigationContainer>
    );

    expect(getAllByTestId('image')).toHaveLength(1);

    rerender(
      <NavigationContainer>
        <MovieList
          title="Trending"
          data={mockMovies}
          handleClick={jest.fn()}
          isAdmin={false}
          isPremiumSubscribed={false}
        />
      </NavigationContainer>
    );

    expect(getAllByTestId('image')).toHaveLength(2);
  });

});