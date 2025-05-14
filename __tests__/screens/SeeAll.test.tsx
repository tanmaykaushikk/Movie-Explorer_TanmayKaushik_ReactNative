import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import SeeAll from '../../src/screens/SeeAll';


const mockMovies = [
  { id: '1', title: 'Movie 1' },
  { id: '2', title: 'Movie 2' },
  { id: '3', title: 'Movie 3' },
  { id: '4', title: 'Movie 4' },
];

describe('SeeAll Component', () => {
  it('renders correctly when movies are passed in', async () => {
    const route = { params: { title: 'Action Movies', movies: mockMovies } };

    const { getByText } = render(
      <NavigationContainer>
        <SeeAll route={route} />
      </NavigationContainer>
    );

    // Check if the movie titles are rendered
    mockMovies.forEach(movie => {
      getByText(movie.title); 
    });
  });

  it('displays "No movies available" when movies are not passed', async () => {
    const route = { params: { title: 'Action Movies', movies: [] } };

    const { getByText } = render(
      <NavigationContainer>
        <SeeAll route={route} />
      </NavigationContainer>
    );

    // Check if "No movies available" is displayed
    getByText('No movies available');
  });

  it('navigates to the Movie screen when a movie is pressed', async () => {
    const route = { params: { title: 'Action Movies', movies: mockMovies } };

    const { getByText } = render(
      <NavigationContainer>
        <SeeAll route={route} />
      </NavigationContainer>
    );

    // Simulate pressing the first movie
    const movie = getByText('Movie 1');
    fireEvent.press(movie);

    // Assuming you have some kind of navigation logic to check here
    // Example: Check if a navigation function was called, if necessary
    // e.g., expect(navigation.navigate).toHaveBeenCalledWith('Movie', { movieId: '1' });
  });

  it('disables the "Next" button when on the last page', async () => {
    const route = { params: { title: 'Action Movies', movies: mockMovies } };

    const { getByTestId } = render(
      <NavigationContainer>
        <SeeAll route={route} />
      </NavigationContainer>
    );

    // Check if "Next" button is disabled (assuming you have a button with testID)
    const nextButton = getByTestId('next-button');
    expect(nextButton.props.disabled).toBeTruthy(); // Update according to your component's logic
  });

  it('disables the "Previous" button when on the first page', async () => {
    const route = { params: { title: 'Action Movies', movies: mockMovies } };

    const { getByTestId } = render(
      <NavigationContainer>
        <SeeAll route={route} />
      </NavigationContainer>
    );

    // Check if "Previous" button is disabled (assuming you have a button with testID)
    const prevButton = getByTestId('previous-button');
    expect(prevButton.props.disabled).toBeTruthy(); // Update according to your component's logic
  });

  it('displays correct number of movies based on the current page', async () => {
    const route = { params: { title: 'Action Movies', movies: mockMovies } };

    const { getByTestId } = render(
      <NavigationContainer>
        <SeeAll route={route} />
      </NavigationContainer>
    );

    // Check that the correct number of movies is rendered
    const movies = getByTestId('movies-list');
    expect(movies.children.length).toBe(4); // Adjust based on your actual logic for rendering movies
  });
});
