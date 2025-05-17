import React, { useEffect, useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
import styled, { keyframes } from 'styled-components';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

export const GET_SELLER_STATS = gql`
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

const SellerStats = () => {
  const sellerId = localStorage.getItem('sellerId');
  const { loading, error, data, refetch } = useQuery(GET_SELLER_STATS, {
    variables: { sellerId },
    skip: !sellerId,
  });
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (sellerId) refetch();
  }, [sellerId, refetch]);

  if (!sellerId) return <p>Please log in as a seller to view this page.</p>;
  if (loading) return <p>Loading stats...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data || !data.getSellerStatistics) return <p>No statistics available.</p>;

  const stats = data.getSellerStatistics;
  const avgTop3 = (stats.averageRatings || []).slice().sort((a, b) => b.averageRating - a.averageRating).slice(0, 3);

  const showBookDetails = (bookId) => {
    const book = stats.purchasedBooks.find(b => b.id === bookId);
    const wishlist = stats.wishlistFrequency.find(w => w.bookId === bookId)?.count || 0;
    const soldUnits = stats.topSellingBooks.concat(stats.leastSellingBooks).find(b => b.id === bookId)?.sold || 'N/A';
    if (book) setDetails({
      Type: 'Book',
      ID: book.id,
      Title: book.title,
      Author: book.author,
      Price: `$${book.price}`,
      Ratings: book.ratings,
      'Wishlisted Count': wishlist
    });
  };

  const showUserDetails = (userId, label) => {
    const frequency = stats.userPurchaseFrequency.find(f => f.userId === userId)?.frequency || 'N/A';
    const wishlistCount = stats.wishlistFrequency.filter(w => w.bookId === userId).length;
    setDetails({
      Type: 'Buyer',
      ID: userId,
      Name: `User ${label}`,
      'Purchase Frequency': frequency,
      'Wishlisted Count': wishlistCount
    });
  };

  const showFrequencyDetails = (entry) => {
    setDetails({
      Type: 'Purchase Frequency',
      'User ID': entry.userId,
      Frequency: entry.frequency
    });
  };

  const showOrderDelay = (entry) => {
    setDetails({
      Type: 'Fulfillment Delay',
      'Order ID': entry.orderId,
      'Delay in Hours': entry.delayInHours
    });
  };

  const showWishlist = (entry) => {
    const book = stats.purchasedBooks.find(b => b.id === entry.bookId);
    setDetails({
      Type: 'WishlistEntry',
      'Book Title': book?.title || 'Unknown',
      'Total Wishlists': entry.count
    });
  };

  return (
    <Wrapper>
      <Header>
        <h1>📈 Seller Analytics</h1>
        <p>Track performance, understand customer behavior, and optimize strategy.</p>
      </Header>

      <ScrollRow>
        <FullCard>
          <h2>💹 Revenue Trends</h2>
          <Line
            data={{
              labels: (stats.revenueByDate || []).map((d) => d.date),
              datasets: [{
                label: 'Revenue',
                data: (stats.revenueByDate || []).map((d) => d.revenue),
                borderColor: '#66fcf1',
                backgroundColor: 'rgba(102, 252, 241, 0.1)',
                fill: true
              }]
            }}
          />
        </FullCard>

        <FullCard>
          <h2>📚 Book Performance</h2>
          <h4>🔥 Top-Selling</h4>
          <FlexList>{(stats.topSellingBooks || []).map(b => (
            <button key={b.id} onClick={() => showBookDetails(b.id)}>{b.title} ({b.ratings?.toFixed(1)}⭐)</button>
          ))}</FlexList>

          <h4>🧊 Least-Selling</h4>
          <FlexList>{(stats.leastSellingBooks || []).map(b => (
            <button key={b.id} onClick={() => showBookDetails(b.id)}>{b.title} ({b.ratings?.toFixed(1)}⭐)</button>
          ))}</FlexList>

          <h4>🌟 Top Rated</h4>
          <FlexList>{avgTop3.map(r => {
            const book = stats.purchasedBooks.find(b => b.id === r.bookId);
            return book ? <button key={r.bookId} onClick={() => showBookDetails(r.bookId)}>{book.title}: {r.averageRating.toFixed(1)}⭐</button> : null;
          })}</FlexList>
        </FullCard>

        <FullCard>
          <h2>🧍 Customer Behavior</h2>
          <h4>Most Active Buyers</h4>
          <FlexList>{(stats.mostActiveBuyers || []).map((u, idx) => (
            <button key={idx} onClick={() => showUserDetails(u, idx + 1)}>User {idx + 1}</button>
          ))}</FlexList>

          <h4>📊 Purchase Frequency</h4>
          <FlexList>{(stats.userPurchaseFrequency || []).slice(0, 3).map(f => (
            <button key={f.userId} onClick={() => showFrequencyDetails(f)}>User: {f.frequency}</button>
          ))}</FlexList>
        </FullCard>

        <FullCard>
          <h2>📦 Order Insights</h2>
          <p>Total Orders: <strong>{stats.totalOrders}</strong></p>

          <h4>Fulfillment Delays</h4>
          <FlexList>{(stats.orderFulfillmentDelay || []).slice(0, 3).map((d, idx) => (
            <button key={idx} onClick={() => showOrderDelay(d)}>Order {idx + 1}: {d.delayInHours} hrs</button>
          ))}</FlexList>

          <h4>💖 Most Wishlisted</h4>
          <FlexList>{(stats.wishlistFrequency || []).slice(0, 3).map(w => (
            <button key={w.bookId} onClick={() => showWishlist(w)}>Book {w.bookId}: {w.count}</button>
          ))}</FlexList>
        </FullCard>
      </ScrollRow>

      {details && (
        <DetailsCard>
          <h3>📌 Details</h3>
          <DetailGrid>
            {Object.entries(details).map(([key, value]) => (
              <div key={key}><strong>{key}:</strong> {value}</div>
            ))}
          </DetailGrid>
        </DetailsCard>
      )}
    </Wrapper>
  );
};

export default SellerStats;

const Wrapper = styled.div`
  background: #0b0c10;
  color: #fff;
  padding: 2rem;
  min-height: 100vh;
  font-family: 'Segoe UI', sans-serif;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  h1 { font-size: 2.5rem; }
  p { color: #c5c6c7; }
`;

const ScrollRow = styled.div`
  display: flex;
  gap: 2rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding-bottom: 1rem;
  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: #45a29e;
    border-radius: 4px;
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const FullCard = styled.div`
  background: #1f2833;
  border-radius: 16px;
  padding: 2.5rem;
  min-width: 70vw;
  scroll-snap-align: start;
  box-shadow: 0 0 20px rgba(102, 252, 241, 0.2);
  animation: ${fadeIn} 0.6s ease-in-out;
  transition: transform 0.3s ease;
  &:hover {
    transform: translateY(-5px);
  }
`;

const FlexList = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin: 1rem 0;
  button {
    background: #0b0c10;
    padding: 0.5rem 1rem;
    border: 1px solid #45a29e;
    border-radius: 10px;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
    &:hover {
      background: #45a29e;
      color: #0b0c10;
    }
  }
`;

const DetailsCard = styled.div`
  margin-top: 2rem;
  padding: 2rem;
  background: #1f2833;
  border-radius: 12px;
  border: 1px solid #45a29e;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  font-size: 1.3rem;
`;
