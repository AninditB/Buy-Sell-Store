  import React from "react";
  import styled from "styled-components";
  import { useNavigate } from "react-router-dom";

  const SellerHome = () => {
    const navigate = useNavigate();

    return (
      <Container>
        <Header>
          <h1>Seller Dashboard</h1>
          <p>Monitor your business performance and manage your inventory with ease.</p>
        </Header>

        <Grid>
          <Tile onClick={() => navigate("/sellerstats")}>
            <h3>📊 Sales Analytics</h3>
            <p>View charts and metrics of your sales performance.</p>
          </Tile>

          <Tile onClick={() => navigate("/manageinventory")}>
            <h3>📦 Manage Inventory</h3>
            <p>Track, update, and organize your product inventory.</p>
          </Tile>

          <Tile onClick={() => navigate("/revenue")}>
            <h3>💰 Revenue Overview</h3>
            <p>See how much you’ve earned this month and compare trends.</p>
          </Tile>

          <Tile onClick={() => navigate("/orders")}>
            <h3>🛍️ Orders</h3>
            <p>Manage and fulfill new and pending customer orders.</p>
          </Tile>
        </Grid>
      </Container>
    );
  };

  export default SellerHome;

  export const Container = styled.div`
    padding: 40px;
    background-color: ${({ theme }) => theme.background || "#f4f6f8"};
    min-height: 100vh;
    color: ${({ theme }) => theme.text || "#121212"};
  `;

  export const Header = styled.div`
    text-align: center;
    margin-bottom: 40px;

    h1 {
      font-size: 32px;
      margin-bottom: 10px;
    }

    p {
      font-size: 16px;
      color: ${({ theme }) => theme.subtleText || "#555"};
    }
  `;

  export const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 24px;
  `;

  export const Tile = styled.div`
    background-color: ${({ theme }) => theme.cardBg || "#ffffff"};
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    cursor: pointer;
    color: ${({ theme }) => theme.text || "#121212"};

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
    }

    h3 {
      font-size: 20px;
      margin-bottom: 12px;
    }

    p {
      font-size: 14px;
      color: ${({ theme }) => theme.subtleText || "#666"};
    }
  `;
