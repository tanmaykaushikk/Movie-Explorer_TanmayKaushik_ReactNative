import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MovieList from "../../src/components/MovieList"; 
import { NavigationContainer } from '@react-navigation/native';

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

// Mock deleteMovie
jest.mock("../../src/utils/api.ts", () => ({
  deleteMovie: jest.fn().mockResolvedValue(true),
}));

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
];

describe('MovieList Component', () => {
  it('renders title and movie poster', () => {
    const { getByText, getByRole,getByTestId } = render(
      <NavigationContainer>
        <MovieList title="Trending" data={mockMovies} handleClick={jest.fn()} isAdmin={false} />
      </NavigationContainer>
    );

    expect(getByText('Trending')).toBeTruthy();
    expect(getByTestId('image')).toBeTruthy();
  });

  it('shows edit icon if isAdmin is true', () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <MovieList
          title="Admin Picks"
          data={mockMovies}
          handleClick={jest.fn()}
          isAdmin={true}
        />
      </NavigationContainer>
    );

    expect(getByTestId('edit-icon-1')).toBeTruthy();
  });

  it('calls handleClick on press', () => {
    const handleClick = jest.fn();
    const { getByTestId } = render(
      <NavigationContainer>
        <MovieList title="My List" data={mockMovies} handleClick={handleClick} isAdmin={false} />
      </NavigationContainer>
    );

    fireEvent.press(getByTestId('movie-touchable-1'));
    expect(handleClick).toHaveBeenCalledWith(mockMovies[0]);
  });
});
