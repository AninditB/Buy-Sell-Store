import React, { useState } from "react";
import styled from "styled-components";
import { gql, useMutation } from "@apollo/client";
import { useUserContext } from "../context/UserContext";

// 📚 Book Upload Mutation
const UPLOAD_BOOK = gql`
  mutation UploadBook(
    $title: String!
    $author: String!
    $totalQuantity: Int!
    $price: Float!
    $imageUrl: String!
    $description: String!
    $sellerId: String!
  ) {
    uploadBook(
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
      book {
        id
        title
      }
    }
  }
`;

// 🏠 Home Item Upload Mutation
const UPLOAD_HOME_ITEM = gql`
  mutation UploadHomeItem(
    $title: String!
    $description: String!
    $price: Float!
    $totalQuantity: Int!
    $imageUrl: String!
    $manufacturer: String!
    $sellerId: String!
    $type: String!
  ) {
    uploadHomeItem(
      title: $title
      description: $description
      price: $price
      totalQuantity: $totalQuantity
      imageUrl: $imageUrl
      manufacturer: $manufacturer
      sellerId: $sellerId
      type: $type
    ) {
      success
      message
      homeItem {
        id
        title
      }
    }
  }
`;

const ManageInventory = () => {
  const { user } = useUserContext();
  const [uploadBook] = useMutation(UPLOAD_BOOK);
  const [uploadHomeItem] = useMutation(UPLOAD_HOME_ITEM);

  const [form, setForm] = useState({
    title: "",
    author: "",
    price: "",
    totalQuantity: "",
    imageUrl: "",
    description: "",
    type: "books", 
    subcategory: "",
    manufacturer: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updatedForm = { ...prev, [name]: value };
      // Conditionally update other fields based on the 'type' dropdown
      if (name === "type") {
        if (value === "books") {
          updatedForm.manufacturer = "";
        } else if (value === "home") {
          updatedForm.author = "";
        }
        updatedForm.subcategory = ""; // Reset subcategory when type changes
      }
      return updatedForm;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return alert("Seller ID missing. Please log in again.");
  
    try {
      const baseVars = {
        title: form.title,
        price: parseFloat(form.price),
        totalQuantity: parseInt(form.totalQuantity),
        imageUrl: form.imageUrl,
        description: form.description,
        sellerId: user.id,
      };
  
      let response;
      if (form.type === "books") {
        response = await uploadBook({
          variables: {
            ...baseVars,
            author: form.author,
          },
        });
  
        const res = response.data.uploadBook;
        alert(res.message);
        if (!res.success) return;
  
      } else {
        response = await uploadHomeItem({
          variables: {
            ...baseVars,
            manufacturer: form.manufacturer,
            type: form.type,
          },
        });
  
        const res = response.data.uploadHomeItem;
        alert(res.message);
        if (!res.success) return;
      }
  
      // Clear form only if successful
      setForm({
        title: "",
        author: "",
        price: "",
        totalQuantity: "",
        imageUrl: "",
        description: "",
        type: "books",
        subcategory: "",
        manufacturer: "",
      });
      
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
    }
  };
  

  return (
    <Wrapper>
      <Card>
        <Title>📤 Upload Books or Home Items</Title>
        <Form onSubmit={handleSubmit}>
          <Select name="type" value={form.type} onChange={handleChange}>
            <option value="books">Books</option>
            <option value="home">Home Item</option>
          </Select>

          <Input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />

          {form.type === "books" && (
            <Input name="author" placeholder="Author" value={form.author} onChange={handleChange} required />
          )}

          <Textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required />

          <Input
            name="price"
            type="number"
            step="0.01"
            placeholder="Price per Item"
            value={form.price}
            onChange={handleChange}
            required
          />

          <Input
            name="totalQuantity"
            type="number"
            placeholder="Total Quantity"
            value={form.totalQuantity}
            onChange={handleChange}
            required
          />

          {form.type === "home" && (
            <>
              <Input
                name="manufacturer"
                placeholder="Manufacturer"
                value={form.manufacturer}
                onChange={handleChange}
                required
              />
              <Select name="subcategory" value={form.subcategory} onChange={handleChange}>
                <option value="">-- Select Subcategory --</option>
                <option value="kitchen">Kitchen</option>
                <option value="livingroom">Living Room</option>
              </Select>
            </>
          )}

          <Input
            name="imageUrl"
            placeholder="Image URL"
            value={form.imageUrl}
            onChange={handleChange}
            required
          />

          {form.imageUrl && (
            <ImagePreview>
              <img src={form.imageUrl} alt="Preview" />
            </ImagePreview>
          )}

          <SubmitButton type="submit">Upload</SubmitButton>
        </Form>
      </Card>
    </Wrapper>
  );
};

export default ManageInventory;

// 💅 Styled Components
export const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 50px 20px;
  background-color: ${({ theme }) => theme.background || "#f0f2f5"};
  min-height: 100vh;
`;

export const Card = styled.div`
  background: ${({ theme }) => theme.cardBg || "#ffffff"};
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 600px;
`;

export const Title = styled.h2`
  text-align: center;
  margin-bottom: 24px;
  font-size: 28px;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const Input = styled.input`
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 16px;
`;

export const Textarea = styled.textarea`
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 16px;
  min-height: 80px;
`;

export const Select = styled.select`
  padding: 12px;
  border-radius: 8px;
  font-size: 16px;
  border: 1px solid #ccc;
`;

export const SubmitButton = styled.button`
  padding: 14px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
  transition: 0.3s ease;

  &:hover {
    opacity: 0.9;
  }
`;

export const ImagePreview = styled.div`
  text-align: center;
  img {
    max-width: 100%;
    height: 180px;
    object-fit: cover;
    border-radius: 8px;
    margin-top: 10px;
  }
`;
