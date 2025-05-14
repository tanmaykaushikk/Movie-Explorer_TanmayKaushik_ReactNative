jest.mock('react-native-reanimated-carousel', () => {
  const React = require('react');
  const { View } = require('react-native');
  return ({ data, renderItem }: any) => (
    <View>{data.map((item: any, index: number) => renderItem({ item, index }))}</View>
  );
});

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
jest.mock('react-native-gesture-handler', () => ({}));

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TrendingMoviesCarousel from "../../src/components/TrendingMovieCarousel";
import { itemProp } from "../../src/components/TrendingMovieCarousel";
import { NavigationContainer } from '@react-navigation/native';

const mockData: itemProp[] = [
  {
    id: 1,
    title: 'Test Movie',
    genre: 'Action',
    release_year: 2022,
    rating: 8.5,
    director: 'Test Director',
    duration: 120,
    description: 'Test Description',
    premium: true,
    main_lead: 'Test Lead',
    streaming_platform: 'Test Platform',
    poster_url: 'https://example.com/poster.jpg',
    banner_url: 'https://example.com/banner.jpg',
  },
];

const renderWithNavigation = (ui: React.ReactElement) => {
  return render(<NavigationContainer>{ui}</NavigationContainer>);
};

describe('TrendingMoviesCarousel Component', () => {
  it('renders "Trending" text', () => {
    const { getByText } = renderWithNavigation(
      <TrendingMoviesCarousel
        data={mockData}
        isAdmin={false}
        handleClick={jest.fn()}
      />
    );
    expect(getByText('Trending')).toBeTruthy();
  });

  it('renders poster image', () => {
    const { getByRole } = renderWithNavigation(
      <TrendingMoviesCarousel
        data={mockData}
        isAdmin={false}
        handleClick={jest.fn()}
      />
    );
    const image = getByRole('image');
    expect(image.props.source.uri).toBe(mockData[0].poster_url);
  });

  it('shows premium icon if movie is premium', () => {
    const { getByTestId } = renderWithNavigation(
      <TrendingMoviesCarousel
        data={mockData}
        isAdmin={false}
        handleClick={jest.fn()}
      />
    );
    expect(getByTestId('premium-icon')).toBeTruthy();
  });

  it('shows edit icon if user is admin', () => {
    const { getByTestId } = renderWithNavigation(
      <TrendingMoviesCarousel
        data={mockData}
        isAdmin={true}
        handleClick={jest.fn()}
      />
    );
    expect(getByTestId('edit-icon')).toBeTruthy();
  });

  it('calls handleClick when card is pressed', () => {
    const mockHandleClick = jest.fn();

    const { getByTestId } = renderWithNavigation(
      <TrendingMoviesCarousel
        data={mockData}
        isAdmin={false}
        handleClick={mockHandleClick}
      />
    );

    fireEvent.press(getByTestId(`card-${mockData[0].id}`));
    expect(mockHandleClick).toHaveBeenCalledWith(mockData[0]);
  });

  // ✅ EXTRA TEST CASES TO INCREASE COVERAGE

  it('does not show premium icon if movie is not premium', () => {
    const nonPremiumData = [{ ...mockData[0], premium: false }];
    const { queryByTestId } = renderWithNavigation(
      <TrendingMoviesCarousel
        data={nonPremiumData}
        isAdmin={false}
        handleClick={jest.fn()}
      />
    );
    expect(queryByTestId('premium-icon')).toBeNull();
  });

  it('does not show edit icon if user is not admin', () => {
    const { queryByTestId } = renderWithNavigation(
      <TrendingMoviesCarousel
        data={mockData}
        isAdmin={false}
        handleClick={jest.fn()}
      />
    );
    expect(queryByTestId('edit-icon')).toBeNull();
  });

  it('renders nothing if data is empty', () => {
    const { queryByRole } = renderWithNavigation(
      <TrendingMoviesCarousel
        data={[]}
        isAdmin={false}
        handleClick={jest.fn()}
      />
    );
    expect(queryByRole('image')).toBeNull();
  });
});
