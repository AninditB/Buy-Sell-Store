import React from 'react';
import {
  render,
  screen,
  waitForElementToBeRemoved,
  waitFor,
} from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import SellerDashboard, { GET_SELLER_STATS } from './SellerDashboard';

// Mock <Bar /> chart to avoid Canvas error in JSDOM
jest.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="mock-bar-chart" />,
}));

// Suppress React act() warning in console
const originalConsoleError = console.error;
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((...args) => {
    if (
      args[0].includes('not wrapped in act') ||
      args[0].includes('act(...)')
    ) {
      return;
    }
    originalConsoleError(...args);
  });
});

afterAll(() => {
  console.error.mockRestore();
});

// Mock localStorage
beforeEach(() => {
  localStorage.setItem('sellerId', '123');
});

afterEach(() => {
  localStorage.clear();
});

const mockStats = {
  totalBuyers: 10,
  totalPurchases: 25,
  totalRevenue: 1234.56,
  purchasedBooks: [
    {
      id: 'b1',
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      price: 10.99,
      description: 'A classic novel',
      imageUrl: '/images/gatsby.png',
    },
  ],
};

const mocks = [
  {
    request: {
      query: GET_SELLER_STATS,
      variables: { sellerId: '123' },
    },
    result: {
      data: {
        getSellerStatistics: mockStats,
      },
    },
  },
];

describe('SellerDashboard', () => {
  it('renders loading state initially', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <SellerDashboard />
      </MockedProvider>
    );

    expect(screen.getByText(/loading stats/i)).toBeInTheDocument();
  });

  it('renders seller stats after successful fetch', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <SellerDashboard />
      </MockedProvider>
    );

    await waitForElementToBeRemoved(() =>
      screen.getByText(/loading stats/i)
    );

    expect(
      screen.getByText(/Welcome Seller, Testing!/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Total Users Bought Your Products: 10/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Total Purchases: 25/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Total Revenue: \$1234.56/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/The Great Gatsby/i)).toBeInTheDocument();
    expect(screen.getByTestId('mock-bar-chart')).toBeInTheDocument();
  });

  it('renders error state', async () => {
    const errorMock = [
      {
        request: {
          query: GET_SELLER_STATS,
          variables: { sellerId: '123' },
        },
        error: new Error('Something went wrong'),
      },
    ];

    render(
      <MockedProvider mocks={errorMock} addTypename={false}>
        <SellerDashboard />
      </MockedProvider>
    );

    await waitFor(() =>
      expect(
        screen.getByText(/Error fetching stats/i)
      ).toBeInTheDocument()
    );
  });

  it('renders fallback when no sellerId is present', async () => {
    localStorage.removeItem('sellerId');

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <SellerDashboard />
      </MockedProvider>
    );

    await waitFor(() =>
      expect(
        screen.getByText(/Please log in as a seller/i)
      ).toBeInTheDocument()
    );
  });
});
