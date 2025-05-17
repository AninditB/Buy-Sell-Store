import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const ManageInventory = () => {
  const navigate = useNavigate();

  const tiles = [
    {
      icon: "📤",
      title: "Upload Item",
      description: "Upload a new book or home item to your inventory.",
      onClick: () => navigate("/uploadItems"),
    },
    {
      icon: "📦",
      title: "View Inventory",
      description: "Track, update, and organize your product inventory.",
      onClick: () => navigate("/inventory"), // Adjust route if needed
    },
  ];
  

  return (
    <Wrapper>
      <h2 style={{ textAlign: "center", marginBottom: "24px" }}>📋 Manage Inventory</h2>
      <TileGrid>
        {tiles.map((tile, idx) => (
          <Tile key={idx} onClick={tile.onClick}>
            <Icon>{tile.icon}</Icon>
            <Title>{tile.title}</Title>
            <Description>{tile.description}</Description>
          </Tile>
        ))}
      </TileGrid>
    </Wrapper>
  );
};

export default ManageInventory;

const Wrapper = styled.div`
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  width: 100%;
  max-width: 800px;
`;

const Tile = styled.div`
  background: #fff;
  border: 1px solid #eee;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.03);
  cursor: pointer;
  transition: 0.3s ease;
  text-align: left;

  &:hover {
    background: #f5f8ff;
  }
`;

const Icon = styled.div`
  font-size: 32px;
`;

const Title = styled.h3`
  margin: 12px 0 8px;
  font-size: 20px;
`;

const Description = styled.p`
  color: #555;
  font-size: 14px;
`;
