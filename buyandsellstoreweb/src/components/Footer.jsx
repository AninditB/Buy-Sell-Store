import React from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../context/UserContext";

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useUserContext(); // Access user and logout from UserContext

  const handleLogout = () => {
    logout(); // Clear user context
    navigate("/login"); // Redirect to login
  };

  return (
    <div style={styles.navBar}>
      <h1 style={styles.title} onClick={() => navigate("/home")}>
        Buy and Sell
      </h1>
      <div style={styles.navIcons}>
        {user ? (
          <>
            <span style={styles.welcomeText}>Welcome, {user.username}</span>
            <button
              onClick={() => navigate("/profile")}
              style={styles.iconButton}
              title="Profile Settings"
            >
              <i className="fas fa-user" style={styles.icon}></i>
            </button>
            <button
              onClick={
                () => navigate("/cart", { state: { userId: user.userId } }) // Pass userId via state
              }
              style={styles.iconButton}
              title="View Cart"
            >
              <i className="fas fa-shopping-cart" style={styles.icon}></i>
            </button>
            <button
              onClick={() => navigate("/order")}
              style={styles.iconButton}
              title="View Past Orders"
            >
              <i className="fas fa-box" style={styles.icon}></i>
            </button>

            <button onClick={handleLogout} style={styles.logoutButton}>
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate("/login")}
            style={styles.loginButton}
            title="Login"
          >
            Login
          </button>
        )}
      </div>
    </div>
  );
};

const styles = {
  navBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #ccc",
    padding: "10px 20px",
    backgroundColor: "#f8f9fa",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
  },
  title: {
    margin: 0,
    fontSize: "24px",
    color: "#333",
    cursor: "pointer",
    fontWeight: "bold",
  },
  navIcons: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  iconButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "20px",
    color: "#007BFF",
  },
  icon: { fontSize: "24px" },
  welcomeText: {
    fontSize: "16px",
    marginRight: "10px",
    color: "#555",
  },
  logoutButton: {
    padding: "5px 10px",
    background: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "background 0.3s",
  },
  loginButton: {
    padding: "5px 10px",
    background: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "background 0.3s",
  },
};

export default Header;
