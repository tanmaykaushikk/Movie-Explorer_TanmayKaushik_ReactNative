import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PremiumScreen from '../../src/screens/PremiumScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Api from '../../src/utils/Api';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

jest.mock('../../src/utils/Api', () => ({
  createSubscription: jest.fn(() =>
    Promise.resolve({
      url: 'https://fake-url.com',
      session_id: 'test-session-id',
    })
  ),
}));

describe('PremiumScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the main header content', () => {
    const { getByTestId } = render(<PremiumScreen />);

    expect(getByTestId('headerContainer')).toBeTruthy();
    expect(getByTestId('premiumBadge').props.children).toBe('PREMIUM');
    expect(getByTestId('headerText').props.children).toBe('Upgrade Your Experience');
    expect(getByTestId('subHeaderText').props.children).toBe('No commitment. Cancel anytime.');
  });

  it('renders both plan options with titles', () => {
    const { getByTestId } = render(<PremiumScreen />);
    expect(getByTestId('plan-1_day')).toBeTruthy();
    expect(getByTestId('plan-7-days Subscription')).toBeTruthy();
  });

  it('renders the MOST POPULAR badge for the premium plan', () => {
    const { getByTestId } = render(<PremiumScreen />);
    expect(getByTestId('popularBadge')).toBeTruthy();
    expect(getByTestId('popularBadge').props.children.props.children).toBe('MOST POPULAR');
  });

  it('renders the money-back guarantee text', () => {
    const { getByTestId } = render(<PremiumScreen />);
    expect(getByTestId('moneyBackGuarantee').props.children).toContain('30-day money back guarantee');
  });


  it('handles AsyncStorage token and passes it to API', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('dummy-token');

    const { getByTestId } = render(<PremiumScreen />);
    const button = getByTestId('subscribe-7-days Subscription');
    fireEvent.press(button);

    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('token');
      expect(Api.createSubscription).toHaveBeenCalledWith('7-days Subscription', 'dummy-token');
    });
  });
});
