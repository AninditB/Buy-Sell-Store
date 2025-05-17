import React, { useEffect, useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../context/UserContext";

const VIEW_CART = gql`
  query GetCartItems($userId: ID!) {
    cartItems(id: $userId) {
      itemId
      type
      name
      quantity
      price
      imageUrl
    }
  }
`;

const ADD_TO_CART = gql`
  mutation AddToCart($userId: ID!, $itemId: ID!, $type: String!) {
    addToCart(userId: $userId, itemId: $itemId, type: $type) {
      success
      message
    }
  }
`;

const REMOVE_FROM_CART = gql`
  mutation RemoveFromCart($userId: ID!, $itemId: ID!, $type: String!) {
    removeFromCart(userId: $userId, itemId: $itemId, type: $type) {
      success
      message
    }
  }
`;

const CartScreen = () => {
  const { user } = useUserContext();
  const userId = user?.id;
  const navigate = useNavigate();

  const { loading, error, data, refetch, networkStatus } = useQuery(VIEW_CART, {
    variables: { userId },
    skip: !userId,
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  });

  const [addToCart] = useMutation(ADD_TO_CART);
  const [removeFromCart] = useMutation(REMOVE_FROM_CART);
  const [cartMessages, setCartMessages] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (userId) {
      refetch();
    }
  }, [userId, refetch]);

  if (!userId) {
    return (
      <div style={styles.emptyStateContainer}>
        <div style={styles.emptyState}>
          <i className="fas fa-user-slash" style={styles.emptyStateIcon}></i>
          <h2>Please log in to view your cart</h2>
          <button 
            style={styles.actionButton} 
            onClick={() => navigate("/login")}
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  // if (loading) return <p>Loading your cart...</p>;
  if (loading || networkStatus === 4) return <p>Loading your cart...</p>;

  if (error) return <p>Error loading cart: {error.message}</p>;

  const cartItems = data?.cartItems || [];

  const handleAddToCart = async (itemId, type) => {
    setIsProcessing(true);
    try {
      const response = await addToCart({
        variables: { userId, itemId, type },
      });
      const message = response.data.addToCart.message || "Item added to cart!";
      setCartMessages((prev) => ({ ...prev, [itemId]: message }));
      
      // Auto-clear the message after 3 seconds
      setTimeout(() => {
        setCartMessages((prev) => {
          const newMessages = { ...prev };
          delete newMessages[itemId];
          return newMessages;
        });
      }, 3000);
      
      refetch();
    } catch (err) {
      console.error("Error adding item to cart:", err.message);
      setCartMessages((prev) => ({ ...prev, [itemId]: "Failed to add item." }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFromCart = async (itemId, type) => {
    setIsProcessing(true);
    try {
      const response = await removeFromCart({
        variables: { userId, itemId, type },
      });
      const message = response.data.removeFromCart.message || "Item removed from cart!";
      setCartMessages((prev) => ({ ...prev, [itemId]: message }));
      
      // Auto-clear the message after 3 seconds
      setTimeout(() => {
        setCartMessages((prev) => {
          const newMessages = { ...prev };
          delete newMessages[itemId];
          return newMessages;
        });
      }, 3000);
      
      refetch();
    } catch (err) {
      console.error("Error removing item from cart:", err.message);
      setCartMessages((prev) => ({
        ...prev,
        [itemId]: "Failed to remove item.",
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div style={styles.pageContainer}>
      <div style={styles.container}>
        <h1 style={styles.pageTitle}>Your Shopping Cart</h1>
        
        {cartItems.length === 0 ? (
          <div style={styles.emptyStateContainer}>
            <div style={styles.emptyState}>
              <i className="fas fa-shopping-cart" style={styles.emptyStateIcon}></i>
              <h2>Your cart is empty</h2>
              <p>Looks like you haven't added anything to your cart yet.</p>
              <button 
                style={styles.actionButton}
                onClick={() => navigate("/")}
              >
                Start Shopping
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.cartContainer}>
            <div style={styles.cartItems}>
              <div style={styles.cartHeader}>
                <span style={styles.productColumn}>Product</span>
                <span style={styles.priceColumn}>Price</span>
                <span style={styles.quantityColumn}>Quantity</span>
                <span style={styles.subtotalColumn}>Subtotal</span>
              </div>
              
              {cartItems.map((item, index) => (
                <div key={index} style={styles.cartItem}>
                  <div style={styles.productInfo}>
                    <div style={styles.productImage}>
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        style={styles.itemImage}
                      />
                    </div>
                    <div style={styles.productDetails}>
                      <h3 style={styles.itemName}>{item.name}</h3>
                      <p style={styles.itemType}>Type: {item.type}</p>
                      {cartMessages[item.itemId] && (
                        <div 
                          style={styles.messageBox}
                          className={cartMessages[item.itemId].includes("Failed") ? "error" : "success"}
                        >
                          {cartMessages[item.itemId]}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div style={styles.priceInfo}>
                    ${item.price.toFixed(2)}
                  </div>
                  
                  <div style={styles.quantityControls}>
                    <button
                      disabled={isProcessing}
                      onClick={() => handleRemoveFromCart(item.itemId, item.type)}
                      style={{
                        ...styles.quantityButton,
                        ...(isProcessing ? styles.buttonDisabled : {}),
                      }}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span style={styles.quantityDisplay}>{item.quantity}</span>
                    <button
                      disabled={isProcessing}
                      onClick={() => handleAddToCart(item.itemId, item.type)}
                      style={{
                        ...styles.quantityButton,
                        ...(isProcessing ? styles.buttonDisabled : {}),
                      }}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  
                  <div style={styles.subtotalInfo}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            
            <div style={styles.cartSummary}>
              <h2 style={styles.summaryTitle}>Order Summary</h2>
              
              <div style={styles.summaryDetails}>
                <div style={styles.summaryRow}>
                  <span>Items ({cartItems.length}):</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                
                <div style={styles.summaryRow}>
                  <span>Shipping:</span>
                  <span>Calculated at checkout</span>
                </div>
                
                <div style={styles.summaryDivider}></div>
                
                <div style={styles.summaryTotal}>
                  <span>Estimated Total:</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                
                <button
                  style={styles.checkoutButton}
                  onClick={() =>
                    navigate("/CheckoutScreen", {
                      state: { cartItems, totalPrice },
                    })
                  }
                  disabled={isProcessing}
                >
                  Proceed to Checkout
                </button>
                
                <button
                  style={styles.continueShoppingButton}
                  onClick={() => navigate("/")}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
    paddingTop: "30px",
    paddingBottom: "50px",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px",
    fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
  },
  pageTitle: {
    fontSize: "32px",
    fontWeight: "700",
    marginBottom: "30px",
    color: "#333",
    textAlign: "left",
  },
  cartContainer: {
    display: "flex",
    flexDirection: "row",
    gap: "30px",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  cartItems: {
    flex: "1 1 650px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
  },
  cartHeader: {
    display: "grid",
    gridTemplateColumns: "3fr 1fr 1fr 1fr",
    padding: "15px 20px",
    backgroundColor: "#f8f9fa",
    borderBottom: "1px solid #eaeaea",
    fontWeight: "600",
    color: "#666",
  },
  productColumn: {
    textAlign: "left",
  },
  priceColumn: {
    textAlign: "center",
  },
  quantityColumn: {
    textAlign: "center",
  },
  subtotalColumn: {
    textAlign: "right",
  },
  cartItem: {
    display: "grid",
    gridTemplateColumns: "3fr 1fr 1fr 1fr",
    padding: "20px",
    borderBottom: "1px solid #eaeaea",
    alignItems: "center",
  },
  productInfo: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  productImage: {
    width: "80px",
    height: "80px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  itemImage: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
    borderRadius: "4px",
  },
  productDetails: {
    flex: "1",
  },
  itemName: {
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "5px",
    color: "#333",
  },
  itemType: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "5px",
  },
  priceInfo: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },
  quantityControls: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  quantityButton: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.2s ease",
    padding: "0",
    color: "#333",
    outline: "none",
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  quantityDisplay: {
    fontWeight: "500",
    fontSize: "16px",
    minWidth: "30px",
    textAlign: "center",
  },
  subtotalInfo: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#333",
    textAlign: "right",
  },
  cartSummary: {
    flex: "1 1 300px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    padding: "20px",
    position: "sticky",
    top: "20px",
  },
  summaryTitle: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "20px",
    paddingBottom: "15px",
    borderBottom: "1px solid #eaeaea",
    color: "#333",
  },
  summaryDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "15px",
    color: "#666",
  },
  summaryDivider: {
    height: "1px",
    backgroundColor: "#eaeaea",
    margin: "10px 0",
  },
  summaryTotal: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "18px",
    fontWeight: "600",
    color: "#333",
    margin: "10px 0",
  },
  checkoutButton: {
    backgroundColor: "#4a7bff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "12px 0",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
    marginTop: "15px",
    transition: "background-color 0.2s ease",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  continueShoppingButton: {
    backgroundColor: "transparent",
    color: "#4a7bff",
    border: "1px solid #4a7bff",
    borderRadius: "6px",
    padding: "10px 0",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    width: "100%",
    marginTop: "10px",
    transition: "all 0.2s ease",
  },
  messageBox: {
    padding: "6px 10px",
    borderRadius: "4px",
    fontSize: "14px",
    marginTop: "5px",
    backgroundColor: "#e8f5e9",
    color: "#388e3c",
    animation: "fadeOut 3s forwards",
    animationDelay: "2s",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "300px",
  },
  loadingSpinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #4a7bff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "20px",
  },
  errorContainer: {
    textAlign: "center",
    padding: "40px 20px",
    maxWidth: "500px",
    margin: "0 auto",
  },
  errorIcon: {
    fontSize: "50px",
    color: "#f44336",
    marginBottom: "20px",
  },
  emptyStateContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
  },
  emptyState: {
    textAlign: "center",
    maxWidth: "500px",
  },
  emptyStateIcon: {
    fontSize: "60px",
    color: "#9e9e9e",
    marginBottom: "20px",
  },
  actionButton: {
    backgroundColor: "#4a7bff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "10px 20px",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    marginTop: "20px",
    transition: "background-color 0.2s ease",
  },
  // Add keyframe animations
  "@keyframes spin": {
    "0%": { transform: "rotate(0deg)" },
    "100%": { transform: "rotate(360deg)" },
  },
  "@keyframes fadeOut": {
    "0%": { opacity: 1 },
    "100%": { opacity: 0 },
  },
};

export default CartScreen;