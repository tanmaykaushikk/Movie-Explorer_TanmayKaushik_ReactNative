import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SeeAll from '../../src/screens/SeeAll';
import { NavigationContainer } from '@react-navigation/native';

const movies = [
  { title: 'Movie 1', poster_url: 'https://via.placeholder.com/150' },
  { title: 'Movie 2', poster_url: 'https://via.placeholder.com/150' },
  { title: 'Movie 3', poster_url: 'https://via.placeholder.com/150' },
  { title: 'Movie 4', poster_url: 'https://via.placeholder.com/150' },
];

const mockNavigation = jest.fn();

const renderWithNavigation = (component: React.ReactNode) => {
  return render(
    <NavigationContainer>
      {component}
    </NavigationContainer>
  );
};

describe('SeeAll Component', () => {
  it('should render the title', () => {
    const { getByText } = renderWithNavigation(
      <SeeAll route={{ params: { title: 'Action Movies', movies } }} />
    );
    expect(getByText('Action Movies')).toBeTruthy();
  });



  it('should disable the "Previous" button on the first page', () => {
    const { getByTestId } = renderWithNavigation(
      <SeeAll route={{ params: { title: 'Action Movies', movies } }} />
    );
    const prevButton = getByTestId('previous-button');
    expect(prevButton).toBeDisabled();
  });


});
