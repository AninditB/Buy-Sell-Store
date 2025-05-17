import React, { useEffect } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale);

export const GET_SELLER_STATS = gql`
  query getSellerStatistics($sellerId: ID!) {
    getSellerStatistics(sellerId: $sellerId) {
      totalBuyers
      totalPurchases
      totalRevenue
      purchasedBooks {
        id
        title
        author
        price
        description
        imageUrl
      }
    }
  }
`;

const SellerDashboard = () => {
  const sellerId = localStorage.getItem('sellerId');

  const { loading, error, data, refetch } = useQuery(GET_SELLER_STATS, {
    variables: { sellerId },
    skip: !sellerId,
  });

  useEffect(() => {
    if (sellerId) {
      refetch();
    }
  }, [sellerId, refetch]);

  if (!sellerId) return <div>Please log in as a seller to view the dashboard.</div>;
  if (loading) return <p>Loading stats...</p>;
  if (error) return <p>Error fetching stats: {error.message}</p>;

  const stats = data?.getSellerStatistics;

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', padding: '2rem', minHeight: '100vh' }}>
      <h1>Welcome Seller, Testing!</h1>
      <h2>🛒 Total Users Bought Your Products: {stats?.totalBuyers}</h2>
      <h2>📦 Total Purchases: {stats?.totalPurchases ?? 0}</h2>
      <h2>💰 Total Revenue: ${stats?.totalRevenue?.toFixed(2) ?? '0.00'}</h2>

      {/* 📘 Purchased Book Cards */}
      <div style={{ marginTop: '2rem' }}>
        <h3>📘 Purchased Books:</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {stats?.purchasedBooks?.map((book, idx) => (
            <div
              key={idx}
              style={{
                border: '1px solid #444',
                backgroundColor: '#111',
                padding: '1rem',
                borderRadius: '10px',
                width: '200px'
              }}
            >
              <img
                src={`http://localhost:8080${book.imageUrl}`}
                alt={book.title}
                style={{ width: '100%', height: 'auto', borderRadius: '5px' }}
              />
              <h4 style={{ marginTop: '0.5rem' }}>{book.title}</h4>
              <p style={{ fontSize: '0.9rem', margin: 0 }}>👤 {book.author}</p>
              <p style={{ fontSize: '0.9rem', margin: 0 }}>💵 ${book.price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 📊 Bar Chart */}
      <div style={{ marginTop: '3rem' }}>
        <h3>📊 Purchases Overview</h3>
        <Bar
          data={{
            labels: ['Buyers', 'Purchases', 'Revenue'],
            datasets: [{
              label: 'Stats',
              data: [stats.totalBuyers, stats.totalPurchases, stats.totalRevenue],
              backgroundColor: ['#f39c12', '#3498db', '#2ecc71'],
            }]
          }}
          options={{
            responsive: true,
            scales: {
              y: { beginAtZero: true }
            }
          }}
        />
      </div>
    </div>
  );
};

export default SellerDashboard;
