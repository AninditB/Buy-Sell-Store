import React, { useEffect, useState } from "react";
import { useUserContext } from "../context/UserContext";
import { useQuery, useMutation, gql } from "@apollo/client";
import "./css_files/WishlistScreen.css";

const API_BASE_URL = "http://localhost:8080";

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

const REMOVE_WISHLIST_ITEM = gql`
  mutation removeWishlistItem($id: ID!) {
    removeWishlistItem(id: $id) {
      success
      message
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

const WishlistScreen = () => {
  const { user } = useUserContext();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [cartMessage, setCartMessage] = useState("");
  const [removeMessage, setRemoveMessage] = useState("");

  const { data, loading, error, refetch } = useQuery(GET_WISHLIST_ITEMS, {
    variables: { userId: user?.id },
    skip: !user,
  });

  const [removeWishlistItem] = useMutation(REMOVE_WISHLIST_ITEM, {
    onCompleted: ({ removeWishlistItem }) => {
      setRemoveMessage(removeWishlistItem.message);
      refetch();
    },
    onError: () => setRemoveMessage("Failed to remove item from wishlist."),
  });

  const [addToCart, { loading: cartLoading }] = useMutation(ADD_TO_CART, {
    onCompleted: ({ addToCart }) => setCartMessage(addToCart.message),
    onError: () => setCartMessage("Failed to add item to cart."),
  });

  useEffect(() => {
    if (data?.wishlistItems) setWishlistItems(data.wishlistItems);
  }, [data]);

  const handleRemove = (id) => removeWishlistItem({ variables: { id } });
  const handleAddToCart = (item) => {
    if (!user?.id) {
      return setCartMessage("Please log in to add items to the cart.");
    }
    addToCart({ variables: { userId: user.id, itemId: item.itemId, type: item.type } });
  };

  // Helper to ensure correct image URL
  const getImageSrc = (url) =>
    url.startsWith("http")
      ? url
      : `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;

  if (loading) return <p className="loading">Loading wishlist...</p>;
  if (error) return <p className="error">Error loading wishlist items</p>;

  return (
    <div className="wishlist-screen">
      <h1 className="wishlist-title">Your Wishlist</h1>

      {removeMessage && <p className="message error">{removeMessage}</p>}
      {cartMessage && <p className="message success">{cartMessage}</p>}

      {wishlistItems.length === 0 ? (
        <p className="empty">No items in your wishlist.</p>
      ) : (
        <ul className="wishlist-list">
          {wishlistItems.map((item) => (
            <li className="wishlist-item" key={item.id}>
              <img
                src={getImageSrc(item.imageUrl)}
                alt={item.name}
                className="item-image"
              />
              <div className="item-details">
                <p className="item-name">{item.name}</p>
                <button
                  className="btn btn-add"
                  onClick={() => handleAddToCart(item)}
                  disabled={cartLoading}
                >
                  {cartLoading ? "Adding..." : "Add to Cart"}
                </button>
                <button
                  className="btn btn-remove"
                  onClick={() => handleRemove(item.id)}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default WishlistScreen;