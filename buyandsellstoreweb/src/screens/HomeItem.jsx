// Update the HomeItem.jsx component to include review functionality

import React, { useState, useEffect } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useParams } from "react-router-dom";
import { useUserContext } from "../context/UserContext";

const GET_HOME_ITEM_DETAILS = gql`
  query GetHomeItem($id: ID!) {
    homeItem(id: $id) {
      id
      title
      type
      description
      price
      imageUrl
      manufacturer
      ratings
      reviews {
        reviewer
        comment
        rating
      }
      totalQuantity
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

const ADD_WISHLIST_ITEM = gql`
  mutation AddWishlistItem($input: WishlistItemInput!) {
    addWishlistItem(input: $input) {
      id
      userId
      itemId
      type
      name
      imageUrl
    }
  }
`;

const GET_WISHLIST_ITEMS = gql`
  query wishlistItems($userId: ID!) {
    wishlistItems(userId: $userId) {
      id
      userId
      itemId
      type
      name
      imageUrl
    }
  }
`;

// Updated mutation names for HomeItem reviews
const ADD_REVIEW = gql`
  mutation AddHomeItemReview($homeItemId: ID!, $review: ReviewInput!) {
    addHomeItemReview(homeItemId: $homeItemId, review: $review) {
      id
      reviews {
        reviewer
        comment
        rating
      }
    }
  }
`;

const UPDATE_REVIEW = gql`
  mutation UpdateHomeItemReview($homeItemId: ID!, $reviewer: String!, $updatedReview: ReviewInput!) {
    updateHomeItemReview(homeItemId: $homeItemId, reviewer: $reviewer, updatedReview: $updatedReview) {
      id
      reviews {
        reviewer
        comment
        rating
      }
    }
  }
`;

const DELETE_REVIEW = gql`
  mutation DeleteHomeItemReview($homeItemId: ID!, $reviewer: String!) {
    deleteHomeItemReview(homeItemId: $homeItemId, reviewer: $reviewer) {
      id
      reviews {
        reviewer
        comment
        rating
      }
    }
  }
`;

// Rest of the file remains unchanged


const HomeItem = () => {
  const { id } = useParams();
  const { user } = useUserContext();

  const { loading, error, data, refetch } = useQuery(GET_HOME_ITEM_DETAILS, {
    variables: { id },
  });

  const { data: cartData, refetch: refetchCart } = useQuery(VIEW_CART, {
    variables: { userId: user?.id || "placeholder-id" },
  });

  // Mutations
  const [addToCart, { loading: addLoading }] = useMutation(ADD_TO_CART);
  const [removeFromCart, { loading: removeLoading }] = useMutation(REMOVE_FROM_CART);
  const [addWishlistItem, { loading: wishlistLoading }] = useMutation(
    ADD_WISHLIST_ITEM,
    {
      update(cache, { data: { addWishlistItem } }) {
        try {
          const existing = cache.readQuery({
            query: GET_WISHLIST_ITEMS,
            variables: { userId: user.id },
          });
          if (existing && existing.wishlistItems) {
            cache.writeQuery({
              query: GET_WISHLIST_ITEMS,
              variables: { userId: user.id },
              data: {
                wishlistItems: [...existing.wishlistItems, addWishlistItem],
              },
            });
          }
        } catch (e) {
          console.warn("Cache update skipped:", e);
        }
      },
      onCompleted() {
        setWishlistMessage("Item added to wishlist!");
        setTimeout(() => setWishlistMessage(""), 3000);
      },
      onError(err) {
        console.error("Wishlist error:", err);
        setWishlistMessage("Failed to add item to wishlist.");
        setTimeout(() => setWishlistMessage(""), 3000);
      },
    }
  );
  
  // Review mutations
  const [addReview] = useMutation(ADD_REVIEW);
  const [updateReview] = useMutation(UPDATE_REVIEW);
  const [deleteReview] = useMutation(DELETE_REVIEW);

  // State hooks
  const [cartMessage, setCartMessage] = useState("");
  const [wishlistMessage, setWishlistMessage] = useState("");
  const [cartQuantity, setCartQuantity] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");

  useEffect(() => {
    if (cartData) {
      const itemInCart = cartData.cartItems.find((item) => item.itemId === id);
      setCartQuantity(itemInCart ? itemInCart.quantity : 0);
    }
  }, [cartData, id]);

  // Check if user has already reviewed this item
  const existingReview = data?.homeItem?.reviews?.find((r) => r.reviewer === user?.username);
  
  useEffect(() => {
    if (existingReview) {
      setComment(existingReview.comment);
      setRating(existingReview.rating.toString());
    }
  }, [existingReview]);

  const handleAddToCart = async () => {
    if (!user || !user.id) {
      setCartMessage("Please log in to add items to the cart.");
      return;
    }
    try {
      const response = await addToCart({
        variables: { userId: user.id, itemId: id, type: "home" },
      });
      setCartMessage(response.data.addToCart.message || "Item added to cart!");
      refetchCart();
    } catch (err) {
      console.error(err);
      setCartMessage("Failed to add to cart.");
    }
  };

  const handleRemoveFromCart = async () => {
    if (!user || !user.id) {
      setCartMessage("Please log in to manage your cart.");
      return;
    }
    try {
      const response = await removeFromCart({
        variables: { userId: user.id, itemId: id, type: "home" },
      });
      setCartMessage(response.data.removeFromCart.message || "Item removed from cart.");
      refetchCart();
    } catch (err) {
      console.error(err);
      setCartMessage("Failed to remove from cart.");
    }
  };

  const handleAddToWishlist = async () => {
    if (!user || !user.id) {
      setWishlistMessage("Please log in to add items to the wishlist.");
      return;
    }
    try {
      await addWishlistItem({
        variables: {
          input: {
            userId: user.id,
            itemId: id,
            type: "home",
            name: data.homeItem.title,
            imageUrl: data.homeItem.imageUrl,
          },
        },
      });
    } catch (err) {
      console.error("Wishlist error:", err);
    }
  };
  
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user?.username) {
      setReviewMessage("Please log in to leave a review.");
      return;
    }
    
    if (!rating || rating === "" || parseFloat(rating) < 0 || parseFloat(rating) > 5) {
      setReviewMessage("Please provide a valid rating between 0 and 5.");
      return;
    }
    
    if (!comment || comment.trim() === "") {
      setReviewMessage("Please provide a review comment.");
      return;
    }
    
    const review = { 
      reviewer: user.username, 
      comment, 
      rating: parseFloat(rating) 
    };
    
    try {
      if (existingReview) {
        await updateReview({ 
          variables: { 
            homeItemId: id,  // Pass homeItemId as bookId
            reviewer: user.username, 
            updatedReview: review 
          } 
        });
        setReviewMessage("Review updated successfully!");
      } else {
        await addReview({ 
          variables: { 
            homeItemId: id,  // Pass homeItemId as bookId
            review 
          } 
        });
        setReviewMessage("Review added successfully!");
      }
      refetch();
      
      // Clear form after successful submission if it's a new review
      if (!existingReview) {
        setComment("");
        setRating("");
      }
      
      setTimeout(() => setReviewMessage(""), 3000);
    } catch (err) {
      console.error("Review error:", err);
      setReviewMessage("Error saving review. Please try again.");
      setTimeout(() => setReviewMessage(""), 3000);
    }
  };
  
  const handleDeleteReview = async () => {
    if (!user?.username) return;
    
    try {
      await deleteReview({ 
        variables: { 
          homeItemId: id,  // Pass homeItemId as bookId
          reviewer: user.username 
        } 
      });
      setReviewMessage("Review deleted successfully!");
      setComment("");
      setRating("");
      refetch();
      setTimeout(() => setReviewMessage(""), 3000);
    } catch (err) {
      console.error("Delete review error:", err);
      setReviewMessage("Error deleting review. Please try again.");
      setTimeout(() => setReviewMessage(""), 3000);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} style={styles.starFilled}>★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} style={styles.starHalf}>★</span>);
      } else {
        stars.push(<span key={i} style={styles.starEmpty}>☆</span>);
      }
    }
    
    return stars;
  };

  if (loading) return (
    <div style={styles.loadingContainer}>
      <div style={styles.loadingSpinner}></div>
      <p>Loading item details...</p>
    </div>
  );
  
  if (error) return (
    <div style={styles.errorContainer}>
      <h2>Error</h2>
      <p>{error.message}</p>
    </div>
  );
  
  if (!data || !data.homeItem) return (
    <div style={styles.errorContainer}>
      <h2>Not Found</h2>
      <p>Home item not found.</p>
    </div>
  );

  const item = data.homeItem;

  return (
    <div style={styles.container}>
      <div style={styles.itemDetails}>
        <div style={styles.imageContainer}>
          <img
            src={item.imageUrl}
            alt={item.title}
            style={styles.itemImage}
          />
        </div>
        <div style={styles.itemInfo}>
          <h1 style={styles.itemTitle}>{item.title}</h1>
          <p style={styles.manufacturerName}>By {item.manufacturer}</p>
          
          <div style={styles.ratingContainer}>
            <div style={styles.stars}>
              {renderStars(item.ratings)}
            </div>
            <span style={styles.ratingText}>
              {item.ratings.toFixed(1)} ({item.reviews ? item.reviews.length : 0} {item.reviews && item.reviews.length === 1 ? 'review' : 'reviews'})
            </span>
          </div>
          
          <div style={styles.priceSection}>
            <span style={styles.price}>${item.price.toFixed(2)}</span>
          </div>
          
          <div style={styles.actionButtons}>
            <div style={styles.cartActions}>
              <div style={styles.cartQuantityControl}>
                <button
                  onClick={handleRemoveFromCart}
                  style={cartQuantity > 0 ? styles.quantityButton : styles.quantityButtonDisabled}
                  disabled={removeLoading || cartQuantity === 0}
                >
                  {removeLoading ? "..." : "-"}
                </button>
                <span style={styles.cartQuantity}>{cartQuantity}</span>
                <button
                  onClick={handleAddToCart}
                  style={styles.quantityButton}
                  disabled={addLoading}
                >
                  {addLoading ? "..." : "+"}
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                style={styles.addToCartButton}
                disabled={addLoading}
              >
                {addLoading ? "Adding..." : cartQuantity > 0 ? "Add More to Cart" : "Add to Cart"}
              </button>
            </div>
            
            <button
              onClick={handleAddToWishlist}
              style={styles.wishlistButton}
              disabled={wishlistLoading}
            >
              {wishlistLoading ? "Adding..." : "♡ Wishlist"}
            </button>
          </div>
          
          {cartMessage && <div style={styles.messageBox}>{cartMessage}</div>}
          {wishlistMessage && <div style={styles.messageBox}>{wishlistMessage}</div>}
        </div>
      </div>
      
      <div style={styles.tabsContainer}>
        <div style={styles.tabs}>
          <button 
            style={{
              ...styles.tabButton,
              ...(activeTab === "description" ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab("description")}
          >
            Description
          </button>
          <button 
            style={{
              ...styles.tabButton,
              ...(activeTab === "reviews" ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews ({item.reviews ? item.reviews.length : 0})
          </button>
        </div>
        
        <div style={styles.tabContent}>
          {activeTab === "description" && (
            <div style={styles.description}>
              <p>{item.description || "No description available for this item."}</p>
            </div>
          )}
          
          {activeTab === "reviews" && (
            <div style={styles.reviewsContainer}>
              {item.reviews && item.reviews.length > 0 ? (
                item.reviews.map((review, i) => (
                  <div key={i} style={styles.reviewCard}>
                    <div style={styles.reviewHeader}>
                      <span style={styles.reviewerName}>{review.reviewer}</span>
                      <div style={styles.reviewStars}>
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <p style={styles.reviewComment}>{review.comment}</p>
                  </div>
                ))
              ) : (
                <p style={styles.noReviews}>No reviews yet. Be the first to review this item!</p>
              )}
              
              {/* Review Form Section */}
              <div style={styles.reviewFormContainer}>
                <h2 style={styles.reviewFormTitle}>Write a Review</h2>
                
                <form onSubmit={handleSubmitReview} style={styles.reviewForm}>
                  <div style={styles.formField}>
                    <label style={styles.formLabel}>Your Rating:</label>
                    <div style={styles.ratingInputContainer}>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        placeholder="0.0 - 5.0"
                        style={styles.ratingInput}
                      />
                      <span style={styles.ratingScale}>/ 5</span>
                    </div>
                  </div>
                  
                  <div style={styles.formField}>
                    <label style={styles.formLabel}>Your Review:</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your thoughts about this item..."
                      style={styles.reviewTextarea}
                      rows={6}
                    />
                  </div>
                  
                  <div style={styles.buttonContainer}>
                    <button 
                      type="submit" 
                      style={styles.submitButton}
                    >
                      {existingReview ? "Update Review" : "Submit Review"}
                    </button>
                    
                    {existingReview && (
                      <button
                        type="button"
                        onClick={handleDeleteReview}
                        style={styles.deleteButton}
                      >
                        Delete Review
                      </button>
                    )}
                  </div>
                </form>
                
                {reviewMessage && (
                  <div style={styles.reviewMessage}>{reviewMessage}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "30px 20px",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
    color: "#333",
    backgroundColor: "#f9f9f9",
  },
  
  // Loading and error states
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
    border: "4px solid rgba(0, 0, 0, 0.1)",
    borderRadius: "50%",
    borderTopColor: "#007BFF",
    animation: "spin 1s ease-in-out infinite",
    marginBottom: "15px",
  },
  errorContainer: {
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  
  // Item details section
  itemDetails: {
    display: "flex",
    gap: "40px",
    flexWrap: "wrap",
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    padding: "30px",
    marginBottom: "30px",
  },
  imageContainer: {
    flex: "0 0 280px",
    display: "flex",
    justifyContent: "center",
  },
  itemImage: {
    width: "100%",
    maxWidth: "280px",
    height: "auto",
    objectFit: "contain",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
  },
  itemInfo: {
    flex: "1 1 400px",
    display: "flex",
    flexDirection: "column",
  },
  itemTitle: {
    fontSize: "28px",
    fontWeight: "700",
    marginTop: "0",
    marginBottom: "8px",
    color: "#1a1a1a",
  },
  manufacturerName: {
    fontSize: "18px",
    color: "#555",
    marginTop: "0",
    marginBottom: "20px",
  },
  
  // Rating section
  ratingContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: "20px",
  },
  stars: {
    display: "flex",
    marginRight: "10px",
    fontSize: "20px",
  },
  starFilled: {
    color: "#ffc107",
  },
  starHalf: {
    color: "#ffc107",
    position: "relative",
  },
  starEmpty: {
    color: "#e4e5e9",
  },
  ratingText: {
    fontSize: "16px",
    color: "#666",
  },
  
  // Price section
  priceSection: {
    marginBottom: "25px",
  },
  price: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#038552",
  },
  
  // Action buttons
  actionButtons: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    marginBottom: "20px",
  },
  cartActions: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  },
  cartQuantityControl: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #ddd",
    borderRadius: "6px",
    overflow: "hidden",
  },
  quantityButton: {
    width: "40px",
    height: "40px",
    border: "none",
    background: "#f0f0f0",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonDisabled: {
    width: "40px",
    height: "40px",
    border: "none",
    background: "#f0f0f0",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "not-allowed",
    color: "#aaa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cartQuantity: {
    width: "50px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "bold",
    borderLeft: "1px solid #ddd",
    borderRight: "1px solid #ddd",
  },
  addToCartButton: {
    flex: "1",
    padding: "0 30px",
    height: "45px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  wishlistButton: {
    height: "45px",
    backgroundColor: "#fff",
    color: "#333",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  messageBox: {
    padding: "10px 15px",
    backgroundColor: "#d4edda",
    color: "#155724",
    borderRadius: "6px",
    fontSize: "14px",
    marginTop: "15px",
    animation: "fadeIn 0.3s ease-in-out",
  },
  
  // Tabs section
  tabsContainer: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    overflow: "hidden",
  },
  tabs: {
    display: "flex",
    borderBottom: "1px solid #e0e0e0",
  },
  tabButton: {
    padding: "15px 25px",
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "3px solid transparent",
    fontSize: "16px",
    fontWeight: "600",
    color: "#666",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  activeTab: {
    padding: "15px 25px",
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "3px solid #007BFF",
    fontSize: "16px",
    fontWeight: "600",
    color: "#007BFF",
    cursor: "pointer",
  },
  tabContent: {
    padding: "30px",
  },
  
  // Description tab
  description: {
    fontSize: "16px",
    lineHeight: "1.6",
    color: "#333",
  },
  
  // Reviews tab
  reviewsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "25px",
  },
  noReviews: {
    fontSize: "16px",
    color: "#666",
    fontStyle: "italic",
  },
  reviewCard: {
    padding: "20px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  reviewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  reviewerName: {
    fontWeight: "600",
    fontSize: "16px",
    color: "#444",
  },
  reviewStars: {
    display: "flex",
    fontSize: "16px",
  },
  reviewComment: {
    margin: "0",
    fontSize: "15px",
    lineHeight: "1.5",
  },
  
  // Review form
  reviewFormContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: "12px",
    padding: "25px",
    marginTop: "30px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
  },
  reviewFormTitle: {
    fontSize: "22px",
    fontWeight: "600",
    margin: "0 0 20px 0",
    color: "#333",
  },
  reviewForm: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formField: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  formLabel: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#444",
  },
  ratingInputContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  ratingInput: {
    width: "120px",
    padding: "12px 15px",
    fontSize: "16px",
    border: "1px solid #ddd",
    borderRadius: "6px",
  },
  ratingScale: {
    fontSize: "16px",
    color: "#666",
  },
  reviewTextarea: {
    width: "100%",
    padding: "15px",
    fontSize: "16px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    resize: "vertical",
    minHeight: "120px",
    fontFamily: "inherit",
  },
  buttonContainer: {
    display: "flex",
    gap: "15px",
    marginTop: "10px",
  },
  submitButton: {
    padding: "12px 25px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  deleteButton: {
    padding: "12px 25px",
    backgroundColor: "transparent",
    color: "#dc3545",
    border: "1px solid #dc3545",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  reviewMessage: {
    marginTop: "15px",
    padding: "12px 15px",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "#d4edda",
    color: "#155724",
  },
  
};

export default HomeItem;