import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserContext } from "../context/UserContext";
import "./css_files/Header.css";

const Header = () => {
  const { user, logout } = useUserContext();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleHomeClick = () => {
    navigate(user?.isSeller ? "/sellerHome" : "/home");
  };

  return (
    <header className="header">
      <h2
        className={`title ${isHovered ? "title-hover" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleHomeClick}
      >
        Buy&Sell Store
      </h2>
      <div className="nav">
        {user && (
          <>
            <span className="welcome">Welcome, {user.firstName}</span>
            <Link to="/profile" className="icon" title="Profile">
              {user.profilePictureUrl ? (
                <img
                  src={user.profilePictureUrl}
                  alt="Profile"
                  className="profile-image"
                />
              ) : (
                "👤"
              )}
            </Link>
            <Link to="/cart" className="icon" title="Cart">🛒</Link>
            <Link to="/wishlist" className="icon" title="Wishlist">❤️</Link>
            <button
              onClick={handleLogout}
              className="logout-btn"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;