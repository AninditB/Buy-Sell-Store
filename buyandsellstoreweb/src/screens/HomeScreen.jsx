import React from "react";
import { useNavigate } from "react-router-dom";
import "./css_files/HomeScreen.css";

const categories = [
  { name: "Books", path: "/books" },
  { name: "Home Items", path: "/homeitems" }
];

const HomeScreen = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (path) => {
    navigate(path);
  };

  return (
    <div className="container">
      <h2 className="heading">Explore Categories</h2>
      <div className="grid">
        {categories.map((category) => (
          <div
            key={category.name}
            className="card"
            onClick={() => handleCategoryClick(category.path)}
            role="button"
            tabIndex={0}
            aria-label={`Go to ${category.name}`}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCategoryClick(category.path);
            }}
          >
            <h3>{category.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeScreen;
