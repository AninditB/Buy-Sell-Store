import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import SellerStats from './SellerStats';
import { MockedProvider } from '@apollo/client/testing';
import { gql } from '@apollo/client';

// 🧪 Dummy query matching your actual component's GET_SELLER_STATS
const SELLER_STATS_QUERY = gql`
  query getSellerStatistics($sellerId: ID!) {
    getSellerStatistics(sellerId: $sellerId) {
      totalBuyers
      totalPurchases
      totalRevenue
      purchasedBooks { id title author price imageUrl ratings }
      revenueByDate { date revenue }
      topSellingBooks { id title ratings }
      leastSellingBooks { id title ratings }
      averageRatings { bookId averageRating }
      mostActiveBuyers
      userPurchaseFrequency { userId frequency }
      cartAbandonmentRate
      totalOrders
      orderFulfillmentDelay { orderId delayInHours }
      wishlistFrequency { bookId count }
      trendingRecommendations { id title author imageUrl ratings }
    }
  }
`;

jest.mock('react-chartjs-2', () => ({
  Line: (props) => <div data-testid="mock-line-chart" {...props} />,
}));

describe('SellerStats Component', () => {
  const mockData = {
    getSellerStatistics: {
      totalOrders: 6,
      purchasedBooks: [
        { id: 'book1', title: 'Book One', author: 'Author A', price: 12.99, imageUrl: '', ratings: 4.2 },
        { id: 'book2', title: 'Book Two', author: 'Author B', price: 9.99, imageUrl: '', ratings: 3.5 }
      ],
      revenueByDate: [
        { date: '2024-04-01', revenue: 100 },
        { date: '2024-04-02', revenue: 200 }
      ],
      topSellingBooks: [ { id: 'book1', title: 'Book One', ratings: 4.2 } ],
      leastSellingBooks: [ { id: 'book2', title: 'Book Two', ratings: 3.5 } ],
      averageRatings: [
        { bookId: 'book1', averageRating: 4.2 },
        { bookId: 'book2', averageRating: 3.5 }
      ],
      mostActiveBuyers: ['user1'],
      userPurchaseFrequency: [ { userId: 'user1', frequency: 3 } ],
      orderFulfillmentDelay: [ { orderId: 'order1', delayInHours: 5 } ],
      wishlistFrequency: [ { bookId: 'book1', count: 7 } ],
      trendingRecommendations: [],
    }
  };

  const mocks = [
    {
      request: {
        query: SELLER_STATS_QUERY,
        variables: { sellerId: 'seller1' },
      },
      result: { data: mockData },
    },
  ];

  it('renders loading and then analytics heading', async () => {
    localStorage.setItem('sellerId', 'seller1');

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <SellerStats />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('📈 Seller Analytics')).toBeInTheDocument();
    });
  });
});
