import React, { useState, useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import { Link } from "react-router-dom";
import "../styles/HomeItems.css";

const GET_HOME_ITEMS = gql`
  query GetHomeItems {
    homeItems {
      id
      title
      price
      imageUrl
      manufacturer
      ratings
    }
  }
`;

const HomeItemsScreen = () => {
  const { loading, error, data, refetch, networkStatus } = useQuery(GET_HOME_ITEMS, {
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    refetch();
  }, [refetch]);

  const [homeItems, setHomeItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSort, setSelectedSort] = useState("default");

  useEffect(() => {
    if (data && data.homeItems) {
      setHomeItems(data.homeItems);
    }
  }, [data]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e) => {
    setSelectedSort(e.target.value);
  };

  const filteredItems = homeItems.filter((item) => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch(selectedSort) {
      case "title-asc":
        return a.title.localeCompare(b.title);
      case "title-desc":
        return b.title.localeCompare(a.title);
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "rating-desc":
        return b.ratings - a.ratings;
      default:
        return 0;
    }
  });

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="star-filled">★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="star-half">★</span>);
      } else {
        stars.push(<span key={i} className="star-empty">☆</span>);
      }
    }
    
    return stars;
  };

 if (loading || networkStatus === 4)
  return <div className="loading-container">Loading home items...</div>;

  if (error) return <div className="error-container">Error loading items: {error.message}</div>;

  return (
    <div className="home-items-container">
      <h2>🏠 Home Items</h2>
      
      <div className="controls-container">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by title or manufacturer..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        
        <div className="sort-container">
          <select 
            value={selectedSort} 
            onChange={handleSortChange}
            className="sort-select"
          >
            <option value="default">Sort by</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
            <option value="rating-desc">Top Rated</option>
          </select>
        </div>
      </div>
      
      {sortedItems.length === 0 ? (
        <div className="no-results">
          <p>No home items found matching "{searchTerm}"</p>
        </div>
      ) : (
        <div className="home-items-grid">
          {sortedItems.map((item) => (
            <Link
              to={`/home-item/${item.id}`}
              key={item.id}
              className="home-item-link"
            >
              <div className="home-item-card">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="home-item-image"
                />
                <h3 className="home-item-title">{item.title}</h3>
                <p className="home-item-price">${item.price.toFixed(2)}</p>
                <p className="home-item-manufacturer">By {item.manufacturer}</p>
                <div className="home-item-rating">
                  {renderStars(item.ratings)}
                  <span className="rating-number">{item.ratings.toFixed(1)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomeItemsScreen;