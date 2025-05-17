import React, { useEffect, useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useUserContext } from '../context/UserContext';
import '../styles/Inventory.css';

// Queries
const GET_BOOKS_BY_SELLER = gql`
  query GetBooksBySellerId($sellerId: String!) {
    getBooksBySellerId(sellerId: $sellerId) {
      id
      title
      type
      author
      price
      imageUrl
      description
      ratings
      sellerId
      totalQuantity
      reviews {
        reviewer
        comment
        rating
      }
    }
  }
`;

const GET_HOME_ITEMS_BY_SELLER = gql`
  query GetHomeItemsBySellerId($sellerId: String!) {
    getHomeItemsBySellerId(sellerId: $sellerId) {
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
      sellerId
      totalQuantity
    }
  }
`;

const UPDATE_BOOK = gql`
  mutation UpdateBook(
    $id: ID!
    $title: String!
    $author: String!
    $totalQuantity: Int!
    $price: Float!
    $imageUrl: String!
    $description: String!
    $sellerId: String!
  ) {
    updateBook(
      id: $id
      title: $title
      author: $author
      totalQuantity: $totalQuantity
      price: $price
      imageUrl: $imageUrl
      description: $description
      sellerId: $sellerId
    ) {
      success
      message
      book { id title totalQuantity }
    }
  }
`;


const UPDATE_HOME_ITEM = gql`
  mutation UpdateHomeItem(
    $id: ID!
    $title: String!
    $description: String!
    $totalQuantity: Int!
    $price: Float!
    $imageUrl: String!
    $manufacturer: String!
    $sellerId: String!
    $type: String!
  ) {
    updateHomeItem(
      id: $id
      title: $title
      description: $description
      totalQuantity: $totalQuantity
      price: $price
      imageUrl: $imageUrl
      manufacturer: $manufacturer
      sellerId: $sellerId
      type: $type
    ) {
      success
      message
      homeItem { id title totalQuantity }
    }
  }
`;

const Inventory = () => {
  const { user } = useUserContext();
  const sellerId = user?.id;

  const { loading: loadingBooks, error: errorBooks, data: dataBooks, refetch: refetchBooks } = useQuery(GET_BOOKS_BY_SELLER, {
    variables: { sellerId }, skip: !sellerId, fetchPolicy: "network-only",
  });

  const { loading: loadingHomeItems, error: errorHomeItems, data: dataHomeItems, refetch: refetchHomeItems } = useQuery(GET_HOME_ITEMS_BY_SELLER, {
    variables: { sellerId }, skip: !sellerId, fetchPolicy: "network-only",
  });

  const [updateBook] = useMutation(UPDATE_BOOK, {
    onCompleted: (data) => console.log("Book updated:", data),
    onError: (error) => console.error("Book update error:", error.message)
  });

  const [updateHomeItem] = useMutation(UPDATE_HOME_ITEM, {
    onCompleted: (data) => console.log("Home item updated:", data),
    onError: (error) => console.error("Home item update error:", error.message)
  });

  const [editItem, setEditItem] = useState(null);
  const [isBook, setIsBook] = useState(false);
  const [formValues, setFormValues] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const variables = {
        id: editItem.id,
        sellerId,
        title: formValues.title,
        description: formValues.description,
        imageUrl: formValues.imageUrl,
        totalQuantity: parseInt(formValues.totalQuantity),
        price: parseFloat(formValues.price),
        ...(isBook
          ? { author: formValues.author }
          : { manufacturer: formValues.manufacturer, type: formValues.type })
      };

      if (isBook) {
        const result = await updateBook({ variables });
        if (result.data?.updateBook?.success) {
          console.log("Book saved successfully");
        }
        refetchBooks();
      } else {
        const result = await updateHomeItem({ variables });
        if (result.data?.updateHomeItem?.success) {
          console.log("Home item saved successfully");
        }
        refetchHomeItems();
      }

      setEditItem(null);
      setFormValues({});
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  useEffect(() => {
    if (sellerId) {
      refetchBooks();
      refetchHomeItems();
    }
  }, [sellerId, refetchBooks, refetchHomeItems]);

  useEffect(() => {
    if (editItem) {
      setFormValues(editItem);
    }
  }, [editItem]);

  return (
    <div className="inventory-container">
      <h1 className="inventory-title">Inventory</h1>

      {editItem && (
        <form onSubmit={handleUpdate} className="popup-form">
          <h2>Edit {isBook ? "Book" : "Home Item"}</h2>
          <div className="form-grid">
            <input name="title" value={formValues.title || ''} onChange={handleChange} placeholder="Title" required />
            {!isBook && <input name="type" value={formValues.type || ''} onChange={handleChange} placeholder="Type" required />}
            {!isBook && <input name="manufacturer" value={formValues.manufacturer || ''} onChange={handleChange} placeholder="Manufacturer" required />}
            {isBook && <input name="author" value={formValues.author || ''} onChange={handleChange} placeholder="Author" required />}
            <textarea name="description" value={formValues.description || ''} onChange={handleChange} placeholder="Description" required />
            <input name="price" type="number" value={formValues.price || ''} onChange={handleChange} placeholder="Price" required />
            <input name="totalQuantity" type="number" value={formValues.totalQuantity || ''} onChange={handleChange} placeholder="Quantity" required />
            <input name="imageUrl" value={formValues.imageUrl || ''} onChange={handleChange} placeholder="Image URL" required />
          </div>
          <div className="form-actions">
            <button type="submit">Save</button>
            <button type="button" onClick={() => setEditItem(null)}>Cancel</button>
          </div>
        </form>
      )}

      <h2 className="inventory-subtitle">Books</h2>
      <div className="inventory-grid">
        {dataBooks?.getBooksBySellerId.map((book) => (
          <div className="inventory-card" key={book.id} onClick={() => { setEditItem(book); setIsBook(true); }}>
            {book.totalQuantity < 20 && <div className="low-stock-badge">Low Stock</div>}
            <img src={book.imageUrl} alt={book.title} className="inventory-image" />
            <h3 className="inventory-card-title">{book.title}</h3>
            <p className="inventory-card-subtitle">Author: {book.author}</p>
            <p>Price: ${book.price.toFixed(2)}</p>
            <p className={book.totalQuantity < 20 ? 'low-stock-text' : ''}>Quantity: {book.totalQuantity}</p>
          </div>
        ))}
      </div>

      <h2 className="inventory-subtitle">Home Items</h2>
      <div className="inventory-grid">
        {dataHomeItems?.getHomeItemsBySellerId.map((item) => (
          <div className="inventory-card" key={item.id} onClick={() => { setEditItem(item); setIsBook(false); }}>
            {item.totalQuantity < 20 && <div className="low-stock-badge">Low Stock</div>}
            <img src={item.imageUrl} alt={item.title} className="inventory-image" />
            <h3 className="inventory-card-title">{item.title}</h3>
            <p className="inventory-card-subtitle">Manufacturer: {item.manufacturer}</p>
            <p>Price: ${item.price.toFixed(2)}</p>
            <p className={item.totalQuantity < 20 ? 'low-stock-text' : ''}>Quantity: {item.totalQuantity}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inventory;