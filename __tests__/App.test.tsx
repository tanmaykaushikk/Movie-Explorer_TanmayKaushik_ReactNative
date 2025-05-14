import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

const App = () => <Text>Welcome to Explorer Movie</Text>;

describe('App', () => {
  it('renders the welcome text', () => {
    const { getByText } = render(<App />);
    expect(getByText('Welcome to Explorer Movie')).toBeTruthy();
  });
});
