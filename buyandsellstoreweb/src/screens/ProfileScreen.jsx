import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../context/UserContext";
import omitDeep from "omit-deep-lodash";

// API base URL (change as needed or set via environment variables)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
const GRAPHQL_URL = `${API_BASE_URL}/graphql`;
const UPLOAD_URL = `${API_BASE_URL}/upload`;

const ProfileScreen = () => {
  const { user, login } = useUserContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    shippingAddresses: [],
    billingAddresses: [],
    phoneNumber: "",
    profilePictureUrl: "",
  });

  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // For editing addresses or phone
  const [editingShippingIndex, setEditingShippingIndex] = useState(null);
  const [editingBillingIndex, setEditingBillingIndex] = useState(null);
  const [editingPhone, setEditingPhone] = useState(false);
  // Add an errors state and a phone‐regex constant
  const PHONE_REGEX = /^\d{10}$/; // or whatever pattern you prefer
  const [errors, setErrors] = useState({ phoneNumber: "" });

  // Track which address is primary
  const [primaryShippingIndex, setPrimaryShippingIndex] = useState(null);
  const [primaryBillingIndex, setPrimaryBillingIndex] = useState(null);

  // Add State for Previous Order
  const [previousOrders, setPreviousOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // UI state for tab navigation
  const [activeTab, setActiveTab] = useState("profile");

  // Initialize form data when user is available
  useEffect(() => {
    if (user) {
      setFormData({
        shippingAddresses: user.shipping || [],
        billingAddresses: user.billing || [],
        phoneNumber: user.phone || "",
        profilePictureUrl: user.profilePictureUrl || "",
      });
      setPrimaryShippingIndex(
        typeof user.primaryShippingIndex === "number"
          ? user.primaryShippingIndex
          : user.shipping && user.shipping.length > 0
          ? 0
          : null
      );
      setPrimaryBillingIndex(
        typeof user.primaryBillingIndex === "number"
          ? user.primaryBillingIndex
          : user.billing && user.billing.length > 0
          ? 0
          : null
      );
      if (user.profilePictureUrl) {
        const fullUrl = `${API_BASE_URL}${user.profilePictureUrl}`;
        setProfilePicPreview(fullUrl);
      }
      // Fetch previous orders when the user is available
      fetchPreviousOrders(user.id);
    }
  }, [user]);

  // --- Handlers for phone number ---

  // Enhance handlePhoneChange to validate as you type 
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, phoneNumber: value }));
  
    // inline validation
    if (!value) {
      setErrors(prev => ({ ...prev, phoneNumber: "Phone number is required." }));
    } else if (!PHONE_REGEX.test(value)) {
      setErrors(prev => ({ ...prev, phoneNumber: "Please enter a 10-digit phone number." }));
    } else {
      setErrors(prev => ({ ...prev, phoneNumber: "" }));
    }
  };
  
  const updatePhoneNumber = async () => {
    // final check
    if (!formData.phoneNumber) {
      setErrors(prev => ({ ...prev, phoneNumber: "Phone number is required." }));
      return;
    }
    if (errors.phoneNumber) {
      return; // don't submit if invalid
    }
    setLoading(true);
    const mutation = `
      mutation {
        updateUser(
          id: "${user.id}",
          phone: "${formData.phoneNumber}"
        ) {
          id
          phone
        }
      }
    `;
    try {
      const response = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: mutation }),
      });
      const json = await response.json();
      if (json.data && json.data.updateUser) {
        showNotification("Phone number updated successfully");
        login({ ...user, phone: json.data.updateUser.phone });
        setEditingPhone(false);
      } else {
        showNotification("Failed to update phone number", "error");
      }
    } catch (error) {
      console.error("Error updating phone number:", error);
      showNotification("An error occurred while updating", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- Shipping Addresses ---
  
  const handleShippingFieldChange = (index, field, value) => {
    setFormData(prev => {
      const addrs = [...prev.shippingAddresses];
      addrs[index] = {
        ...addrs[index],
        [field]: field === "zip" ? value.replace(/\D/g, "") : value  // keep only digits
      };
      return { ...prev, shippingAddresses: addrs };
    });
  };
  
  const addShippingAddress = () => {
    setFormData(prev => ({
      ...prev,
      shippingAddresses: [
        ...prev.shippingAddresses,
        { type: "", street: "", city: "", state: "", zip: "", country: "" },
      ],
    }));
    setEditingShippingIndex(formData.shippingAddresses.length);
  };
  
  // Remove shipping address
  const removeShippingAddress = async (index) => {
    // compute new array
    const newList = formData.shippingAddresses.filter((_, i) => i !== index);

    // Persist that new array
    await updateShippingAddresses(newList);

    // Update local state & primary index
    setFormData(prev => ({ 
      ...prev, 
      shippingAddresses: newList 
    }));
    if (primaryShippingIndex === index) {
      setPrimaryShippingIndex(null);
    } else if (primaryShippingIndex > index) {
      setPrimaryShippingIndex(primaryShippingIndex - 1);
    }
  };
  
  const updateShippingAddresses = async (addressesParam) => {
    setLoading(true);
  
    const mutation = `
      mutation UpdateUserShipping(
        $id: ID!
        $shipping: [AddressInput!]!
        $primaryShippingIndex: Int!
      ) {
        updateUser(
          id: $id
          shipping: $shipping
          primaryShippingIndex: $primaryShippingIndex
        ) {
          id
          shipping { type street city state zip country }
          primaryShippingIndex
        }
      }
    `;
  
    // Pick either the passed‑in list or the latest state
    const addresses = addressesParam ?? formData.shippingAddresses;
    // Clean out __typename and coerce zip to an integer
    const shippingPayload = addresses.map(addr => {
      const cleanAddr = omitDeep(addr, "__typename");
      return {
        ...cleanAddr,
        zip: Number(cleanAddr.zip),
      };
    });
  
    const variables = {
      id: user.id,
      shipping: shippingPayload,
      primaryShippingIndex: primaryShippingIndex ?? 0,
    };

    try {
      const response = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: mutation, variables }),
      });
      const json = await response.json();
  
      if (json.data?.updateUser) {
        showNotification("Shipping addresses updated successfully");
        // Update your context via login()
        login({
          ...user,
          shipping: json.data.updateUser.shipping,
          primaryShippingIndex: json.data.updateUser.primaryShippingIndex,
        });
        setEditingShippingIndex(null);
      } else if (json.errors) {
        console.error("GraphQL errors:", json.errors);
        showNotification("Failed to update shipping addresses", "error");
      } else {
        showNotification("Failed to update shipping addresses", "error");
      }
    } catch (error) {
      console.error("Error updating shipping addresses:", error);
      showNotification("An error occurred while updating", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- Billing Addresses ---
  
  // Handle field edits (keep only digits in ZIP)
  const handleBillingFieldChange = (index, field, value) => {
    setFormData(prev => {
      const addrs = [...prev.billingAddresses];
      addrs[index] = {
        ...addrs[index],
        [field]: field === "zip" ? value.replace(/\D/g, "") : value
      };
      return { ...prev, billingAddresses: addrs };
    });
  };

  // Add a new blank billing address and enter edit mode
  const addBillingAddress = () => {
    setFormData(prev => ({
      ...prev,
      billingAddresses: [
        ...prev.billingAddresses,
        { type: "", street: "", city: "", state: "", zip: "", country: "" },
      ],
    }));
    setEditingBillingIndex(formData.billingAddresses.length);
  };

  // Remove + persist billing address
  const removeBillingAddress = async (index) => {
    const newList = formData.billingAddresses.filter((_, i) => i !== index);

    // Persist the change
    await updateBillingAddresses(newList);

    // Update local state & adjust primary index
    setFormData(prev => ({ ...prev, billingAddresses: newList }));
    if (primaryBillingIndex === index) {
      setPrimaryBillingIndex(null);
    } else if (primaryBillingIndex > index) {
      setPrimaryBillingIndex(primaryBillingIndex - 1);
    }
  };

  // Persist billing addresses to the server
  const updateBillingAddresses = async (addressesParam) => {
    setLoading(true);
    try {
      // Decide which list to send
      const addresses = addressesParam ?? formData.billingAddresses;

      // Clean out client‑only fields & coerce zip → Int
      const billingPayload = addresses.map(addr => {
        const clean = omitDeep(addr, "__typename", "id", "createdAt", "updatedAt");
        return { ...clean, zip: Number(clean.zip) };
      });

      // Ensure a non‑null primary index
      const primaryIndex =
        primaryBillingIndex != null
          ? primaryBillingIndex
          : addresses.length > 0
            ? 0
            : 0;

      // Build mutation + variables
      const mutation = `
        mutation UpdateUserBilling(
          $id: ID!,
          $billing: [AddressInput!]!,
          $primaryBillingIndex: Int!
        ) {
          updateUser(
            id: $id,
            billing: $billing,
            primaryBillingIndex: $primaryBillingIndex
          ) {
            id
            billing { type street city state zip country }
            primaryBillingIndex
          }
        }
      `;
      const variables = {
        id: user.id,
        billing: billingPayload,
        primaryBillingIndex: primaryIndex,
      };

      // Fire the request
      const response = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: mutation, variables }),
      });

      // Network‑error guard
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Network error ${response.status}: ${text}`);
      }

      // Parse & handle GraphQL errors
      const { data, errors } = await response.json();
      if (errors && errors.length) {
        throw new Error(errors.map(e => e.message).join("; "));
      }

      // On success, update context/UI
      login({
        ...user,
        billing: data.updateUser.billing,
        primaryBillingIndex: data.updateUser.primaryBillingIndex,
      });
      showNotification("Billing addresses updated successfully");
      setEditingBillingIndex(null);

    } catch (error) {
      console.error("Error updating billing addresses:", error);
      showNotification(`Failed to update billing addresses: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };
  
  // --- Profile Picture ---
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfilePicPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!selectedFile) return null;
    const data = new FormData();
    data.append("file", selectedFile);      // confirm your server expects "file"
    const res = await fetch(UPLOAD_URL, { method: "POST", body: data });
    const json = await res.json();           // parse JSON
    return json.url;                         // or json.path / json.filename
  };

  const updateProfilePicture = async () => {
    setLoading(true);
    try {
      const url = await uploadImage();
      if (!url) throw new Error("Image upload failed");
      const mutation = `
        mutation UpdateUserProfilePicture($id: ID!, $url: String!) {
          updateUser(id: $id, profilePictureUrl: $url) {
            id
            profilePictureUrl
          }
        }
      `;
      const variables = { id: user.id, url };
      const resp = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: mutation, variables }),
      });
      const { data, errors } = await resp.json();
      if (errors) throw new Error(errors[0].message);
      login({ ...user, profilePictureUrl: data.updateUser.profilePictureUrl });
      showNotification("Profile picture updated successfully");
    } catch (err) {
      console.error(err);
      showNotification(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Previous Orders Function
  const fetchPreviousOrders = async (userId) => {
    setLoading(true);
    const query = `
      query GetPreviousOrders($userId: ID!) {
        getOrdersByUserId(userId: $userId) {
          id
          totalPrice
          createdAt
          items {
            name
            quantity
            price
          }
        }
      }
    `;
    
    const variables = { userId };
    try {
      const response = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables }),
      });
      const json = await response.json();
      if (json.data && json.data.getOrdersByUserId) {
        setPreviousOrders(json.data.getOrdersByUserId);
      } else {
        showNotification("Failed to fetch previous orders", "error");
      }
    } catch (error) {
      console.error("Error fetching previous orders:", error);
      showNotification("An error occurred while fetching orders", "error");
    } finally {
      setLoading(false);
    }
  };

  // Toggle order expanded state
  const toggleOrderDetails = (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
    }
  };

  // Notification system
  const [notification, setNotification] = useState({ message: "", type: "", visible: false });
  
  const showNotification = (message, type = "success") => {
    setNotification({ message, type, visible: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 3000);
  };
  
  return (
    <div style={styles.container}>
      {/* Loading Overlay */}
      {loading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingSpinner}></div>
          <p>Processing...</p>
        </div>
      )}
      
      {/* Notification */}
      {notification.visible && (
        <div style={{
          ...styles.notification,
          backgroundColor: notification.type === "success" ? "#4caf50" : "#f44336"
        }}>
          {notification.message}
        </div>
      )}
      
      {/* Profile Header */}
      <div style={styles.profileHeader}>
        <div style={styles.profileImageContainer}>
          {profilePicPreview ? (
            <img
              src={profilePicPreview}
              alt="Profile"
              style={styles.headerProfileImage}
            />
          ) : (
            <div style={styles.defaultProfileImage}>
              {user && user.firstName ? user.firstName.charAt(0) : ""}
              {user && user.lastName ? user.lastName.charAt(0) : ""}
            </div>
          )}
        </div>
        <div style={styles.headerInfo}>
          <h1 style={styles.userName}>{user ? `${user.firstName} ${user.lastName}` : "User"}</h1>
          <p style={styles.userEmail}>{user ? user.email : ""}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={styles.tabContainer}>
        <button 
          style={{
            ...styles.tabButton,
            ...(activeTab === "profile" ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>
        <button 
          style={{
            ...styles.tabButton,
            ...(activeTab === "shipping" ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab("shipping")}
        >
          Shipping
        </button>
        <button 
          style={{
            ...styles.tabButton,
            ...(activeTab === "billing" ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab("billing")}
        >
          Billing
        </button>
        <button 
          style={{
            ...styles.tabButton,
            ...(activeTab === "orders" ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab("orders")}
        >
          Orders
        </button>
      </div>

      {/* Content Sections */}
      <div style={styles.contentContainer}>
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div style={styles.tabContent}>
            <h2 style={styles.sectionTitle}>Personal Information</h2>
            
            <div style={styles.card}>
              <div style={styles.cardRow}>
                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>First Name</label>
                  <div style={styles.fieldValue}>{user && user.firstName}</div>
                </div>
                
                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>Last Name</label>
                  <div style={styles.fieldValue}>{user && user.lastName}</div>
                </div>
              </div>
              
              <div style={styles.cardRow}>
                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>Username</label>
                  <div style={styles.fieldValue}>{user && user.username}</div>
                </div>
                
                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>Email</label>
                  <div style={styles.fieldValue}>{user && user.email}</div>
                </div>
              </div>
              
              <div style={styles.cardRow}>
                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>Phone Number</label>
                  {editingPhone ? (
                    <div style={styles.editField}>
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={handlePhoneChange}
                        style={styles.input}
                        placeholder="10-digit phone number"
                        disabled={loading}
                      />
                      {errors.phoneNumber && (
                        <div style={styles.errorText}>
                          {errors.phoneNumber}
                        </div>
                      )}
                      <div style={styles.buttonGroup}>
                        <button
                          onClick={updatePhoneNumber}
                          style={styles.saveButton}
                          disabled={loading || Boolean(errors.phoneNumber)}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingPhone(false)}
                          style={styles.cancelButton}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={styles.valueWithAction}>
                      <div style={styles.fieldValue}>
                        {formData.phoneNumber || "Not set"}
                      </div>
                      <button
                        onClick={() => setEditingPhone(true)}
                        style={styles.editButton}
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <h2 style={styles.sectionTitle}>Profile Picture</h2>
            <div style={styles.card}>
              <div style={styles.profilePictureContainer}>
                {profilePicPreview ? (
                  <img
                    src={profilePicPreview}
                    alt="Profile Preview"
                    style={styles.profilePicture}
                  />
                ) : (
                  <div style={styles.profilePlaceholder}>
                    {user && user.firstName ? user.firstName.charAt(0) : ""}
                    {user && user.lastName ? user.lastName.charAt(0) : ""}
                  </div>
                )}
                
                <div style={styles.uploadContainer}>
                  <label style={styles.uploadButton}>
                    Choose File
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      style={styles.fileInput} 
                    />
                  </label>
                  {selectedFile && (
                    <div style={styles.fileName}>{selectedFile.name}</div>
                  )}
                  <button 
                    onClick={updateProfilePicture} 
                    style={styles.updateButton}
                    disabled={!selectedFile || loading}
                  >
                    Update Profile Picture
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Shipping Tab */}
        {activeTab === "shipping" && (
          <div style={styles.tabContent}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Shipping Addresses</h2>
              <button 
                onClick={addShippingAddress} 
                style={styles.addButton}
              >
                Add New Address
              </button>
            </div>
            
            <div style={styles.addressesContainer}>
              {formData.shippingAddresses.length === 0 ? (
                <div style={styles.emptyState}>
                  <p>You haven't added any shipping addresses yet.</p>
                  <button 
                    onClick={addShippingAddress} 
                    style={styles.emptyStateButton}
                  >
                    Add Your First Address
                  </button>
                </div>
              ) : (
                formData.shippingAddresses.map((addr, idx) => (
                  <div key={idx} style={styles.addressCard}>
                    {editingShippingIndex === idx ? (
                      <div style={styles.addressForm}>
                        <h3 style={styles.addressFormTitle}>Edit Address</h3>
                        
                        <div style={styles.addressFormRow}>
                          <div style={styles.formFieldGroup}>
                            <label style={styles.formLabel}>Type</label>
                            <input
                              placeholder="Home, Work, etc."
                              value={addr.type}
                              onChange={(e) => handleShippingFieldChange(idx, "type", e.target.value)}
                              style={styles.formInput}
                            />
                          </div>
                        </div>
                        
                        <div style={styles.addressFormRow}>
                          <div style={styles.formFieldGroup}>
                            <label style={styles.formLabel}>Street</label>
                            <input
                              placeholder="Street Address"
                              value={addr.street}
                              onChange={(e) => handleShippingFieldChange(idx, "street", e.target.value)}
                              style={styles.formInput}
                            />
                          </div>
                        </div>
                        
                        <div style={styles.addressFormRow}>
                          <div style={styles.formFieldGroup}>
                            <label style={styles.formLabel}>City</label>
                            <input
                              placeholder="City"
                              value={addr.city}
                              onChange={(e) => handleShippingFieldChange(idx, "city", e.target.value)}
                              style={styles.formInput}
                            />
                          </div>
                        </div>
                        
                        <div style={styles.addressFormRow}>
                          <div style={styles.formFieldHalf}>
                            <label style={styles.formLabel}>State</label>
                            <input
                              placeholder="State"
                              value={addr.state}
                              onChange={(e) => handleShippingFieldChange(idx, "state", e.target.value)}
                              style={styles.formInput}
                            />
                          </div>
                          
                          <div style={styles.formFieldHalf}>
                            <label style={styles.formLabel}>ZIP</label>
                            <input
                              placeholder="ZIP"
                              value={addr.zip}
                              onChange={(e) => handleShippingFieldChange(idx, "zip", e.target.value)}
                              style={styles.formInput}
                            />
                          </div>
                        </div>
                        
                        <div style={styles.addressFormRow}>
                          <div style={styles.formFieldGroup}>
                            <label style={styles.formLabel}>Country</label>
                            <input
                              placeholder="Country"
                              value={addr.country}
                              onChange={(e) => handleShippingFieldChange(idx, "country", e.target.value)}
                              style={styles.formInput}
                            />
                          </div>
                        </div>
                        
                        <div style={styles.formActions}>
                          <button
                            onClick={() => {
                              setEditingShippingIndex(null);
                              updateShippingAddresses();
                            }}
                            style={styles.saveButton}
                          >
                            Save Address
                          </button>
                          <button
                            onClick={() => setEditingShippingIndex(null)}
                            style={styles.cancelButton}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={styles.addressCardHeader}>
                          <div style={styles.addressType}>
                            {addr.type || "Address"} 
                            {primaryShippingIndex === idx && <span style={styles.primaryBadge}>Primary</span>}
                          </div>
                          <div style={styles.addressActions}>
                            <button
                              onClick={() => setEditingShippingIndex(idx)}
                              style={styles.cardActionButton}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => removeShippingAddress(idx)}
                              style={{...styles.cardActionButton, ...styles.deleteAction}}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        
                        <div style={styles.addressDetails}>
                          <p style={styles.addressLine}>{addr.street}</p>
                          <p style={styles.addressLine}>{addr.city}, {addr.state} {addr.zip}</p>
                          <p style={styles.addressLine}>{addr.country}</p>
                        </div>
                        
                        <div style={styles.addressCardFooter}>
                          <label style={styles.setPrimaryLabel}>
                            <input
                              type="radio"
                              name="primaryShipping"
                              checked={primaryShippingIndex === idx}
                              onChange={() => setPrimaryShippingIndex(idx)}
                              style={styles.radioInput}
                            />
                            Set as primary address
                          </label>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        
        {/* Billing Tab */}
        {activeTab === "billing" && (
          <div style={styles.tabContent}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Billing Addresses</h2>
              <button 
                onClick={addBillingAddress} 
                style={styles.addButton}
              >
                Add New Address
              </button>
            </div>
            
            <div style={styles.addressesContainer}>
              {formData.billingAddresses.length === 0 ? (
                <div style={styles.emptyState}>
                  <p>You haven't added any billing addresses yet.</p>
                  <button 
                    onClick={addBillingAddress} 
                    style={styles.emptyStateButton}
                  >
                    Add Your First Address
                  </button>
                </div>
              ) : (
                formData.billingAddresses.map((addr, idx) => (
                  <div key={idx} style={styles.addressCard}>
                    {editingBillingIndex === idx ? (
                      <div style={styles.addressForm}>
                        <h3 style={styles.addressFormTitle}>Edit Address</h3>
                        
                        <div style={styles.addressFormRow}>
                          <div style={styles.formFieldGroup}>            
                            <label style={styles.formLabel}>Type</label>
                            <input
                              placeholder="Home, Work, etc."
                              value={addr.type}
                              onChange={(e) => handleBillingFieldChange(idx, "type", e.target.value)}
                              style={styles.formInput}
                            />
                          </div>
                        </div>
                        
                        <div style={styles.addressFormRow}>
                          <div style={styles.formFieldGroup}>
                            <label style={styles.formLabel}>Street</label>
                            <input
                              placeholder="Street Address"
                              value={addr.street}
                              onChange={(e) => handleBillingFieldChange(idx, "street", e.target.value)}
                              style={styles.formInput}
                            />
                          </div>
                        </div>
                        
                        <div style={styles.addressFormRow}>
                          <div style={styles.formFieldGroup}>
                            <label style={styles.formLabel}>City</label>
                            <input
                              placeholder="City"
                              value={addr.city}
                              onChange={(e) => handleBillingFieldChange(idx, "city", e.target.value)}
                              style={styles.formInput}
                            />
                          </div>
                        </div>
                        
                        <div style={styles.addressFormRow}>
                          <div style={styles.formFieldHalf}>
                            <label style={styles.formLabel}>State</label>
                            <input
                              placeholder="State"
                              value={addr.state}
                              onChange={(e) => handleBillingFieldChange(idx, "state", e.target.value)}
                              style={styles.formInput}
                            />
                          </div>
                          
                          <div style={styles.formFieldHalf}>
                            <label style={styles.formLabel}>ZIP</label>
                            <input
                              placeholder="ZIP"
                              value={addr.zip}
                              onChange={(e) => handleBillingFieldChange(idx, "zip", e.target.value)}
                              style={styles.formInput}
                            />
                          </div>
                        </div>
                        
                        <div style={styles.addressFormRow}>
                          <div style={styles.formFieldGroup}>
                            <label style={styles.formLabel}>Country</label>
                            <input
                              placeholder="Country"
                              value={addr.country}
                              onChange={(e) => handleBillingFieldChange(idx, "country", e.target.value)}
                              style={styles.formInput}
                            />
                          </div>
                        </div>
                        
                        <div style={styles.formActions}>
                          <button
                            onClick={() => {
                              setEditingBillingIndex(null);
                              updateBillingAddresses();
                            }}
                            style={styles.saveButton}
                          >
                            Save Address
                          </button>
                          <button
                            onClick={() => setEditingBillingIndex(null)}
                            style={styles.cancelButton}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={styles.addressCardHeader}>
                          <div style={styles.addressType}>
                            {addr.type || "Address"} 
                            {primaryBillingIndex === idx && <span style={styles.primaryBadge}>Primary</span>}
                          </div>
                          <div style={styles.addressActions}>
                            <button
                              onClick={() => setEditingBillingIndex(idx)}
                              style={styles.cardActionButton}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => removeBillingAddress(idx)}
                              style={{...styles.cardActionButton, ...styles.deleteAction}}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        
                        <div style={styles.addressDetails}>
                          <p style={styles.addressLine}>{addr.street}</p>
                          <p style={styles.addressLine}>{addr.city}, {addr.state} {addr.zip}</p>
                          <p style={styles.addressLine}>{addr.country}</p>
                        </div>
                        
                        <div style={styles.addressCardFooter}>
                          <label style={styles.setPrimaryLabel}>
                            <input
                              type="radio"
                              name="primaryBilling"
                              checked={primaryBillingIndex === idx}
                              onChange={() => setPrimaryBillingIndex(idx)}
                              style={styles.radioInput}
                            />
                            Set as primary address
                          </label>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        
        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div style={styles.tabContent}>
            <h2 style={styles.sectionTitle}>Order History</h2>
            
            <div style={styles.ordersContainer}>
              {loading ? (
                <div style={styles.loadingMessage}>Loading your orders...</div>
              ) : previousOrders.length > 0 ? (
                previousOrders.map((order) => (
                  <div key={order.id} style={styles.orderCard}>
                    <div style={styles.orderHeader}>
                      <div style={styles.orderInfo}>
                        <div style={styles.orderNumber}>Order #{order.id}</div>
                        <div style={styles.orderDate}>
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                      <div style={styles.orderAmount}>
                        ${order.totalPrice.toFixed(2)}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => toggleOrderDetails(order.id)}
                      style={styles.toggleDetailsButton}
                    >
                      {expandedOrderId === order.id ? "Hide Details" : "View Details"}
                    </button>
                    
                    {expandedOrderId === order.id && (
                      <div style={styles.orderDetails}>
                        <h4 style={styles.orderItemsHeading}>Items</h4>
                        <table style={styles.orderItemsTable}>
                          <thead>
                            <tr>
                              <th style={styles.tableHeader}>Product</th>
                              <th style={styles.tableHeader}>Quantity</th>
                              <th style={styles.tableHeader}>Price</th>
                              <th style={styles.tableHeader}>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items.map((item, idx) => (
                              <tr key={idx} style={styles.tableRow}>
                                <td style={styles.tableCell}>{item.name}</td>
                                <td style={styles.tableCell}>{item.quantity}</td>
                                <td style={styles.tableCell}>${item.price.toFixed(2)}</td>
                                <td style={styles.tableCell}>${(item.quantity * item.price).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colSpan="3" style={styles.tableTotalLabel}>Order Total:</td>
                              <td style={styles.tableTotalValue}>${order.totalPrice.toFixed(2)}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div style={styles.emptyState}>
                  <p>You haven't placed any orders yet.</p>
                  <button 
                    onClick={() => navigate("/products")}
                    style={styles.emptyStateButton}
                  >
                    Browse Products
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div style={styles.actionsContainer}>
        <button onClick={() => navigate("/home")} style={styles.backButton}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: { 
    padding: "20px",
    maxWidth: "1200px", 
    margin: "0 auto",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
    color: "#333",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
  },
  
  // Loading and notifications
  loadingOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingSpinner: {
    border: "4px solid rgba(0, 0, 0, 0.1)",
    borderRadius: "50%",
    borderTop: "4px solid #3498db",
    width: "40px",
    height: "40px",
    animation: "spin 1s linear infinite",
    marginBottom: "10px",
  },
  loadingMessage: {
    padding: "20px",
    textAlign: "center",
    color: "#666",
  },
  notification: {
    position: "fixed",
    top: "20px",
    right: "20px",
    padding: "12px 24px",
    borderRadius: "4px",
    color: "white",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
    zIndex: 1001,
    animation: "fadeIn 0.3s, fadeOut 0.3s 2.7s",
  },
  
  // Profile header
  profileHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: "24px",
    padding: "20px",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
  },
  profileImageContainer: {
    marginRight: "20px",
  },
  headerProfileImage: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #f0f0f0",
  },
  defaultProfileImage: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    backgroundColor: "#3498db",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "24px",
    fontWeight: "bold",
  },
  headerInfo: {
    flex: 1,
  },
  userName: {
    margin: "0 0 8px 0",
    fontSize: "24px",
    fontWeight: "500",
  },
  userEmail: {
    margin: 0,
    color: "#666",
    fontSize: "16px",
  },
  
  // Tab navigation
  tabContainer: {
    display: "flex",
    borderBottom: "1px solid #ddd",
    marginBottom: "24px",
    backgroundColor: "white",
    borderRadius: "8px 8px 0 0",
    overflow: "hidden",
  },
  tabButton: {
    padding: "16px 24px",
    fontSize: "16px",
    fontWeight: "500",
    background: "none",
    border: "none",
    borderBottom: "3px solid transparent",
    cursor: "pointer",
    flex: 1,
    textAlign: "center",
    transition: "all 0.2s ease",
  },
  activeTab: {
    borderBottom: "3px solid #3498db",
    color: "#3498db",
    backgroundColor: "#f0f7ff",
  },
  
  // Content container
  contentContainer: {
    backgroundColor: "white",
    borderRadius: "0 0 8px 8px",
    padding: "20px 24px",
    minHeight: "400px",
  },
  tabContent: {
    animation: "fadeIn 0.3s ease",
  },
  
  // Section styling
  sectionTitle: {
    fontSize: "20px",
    marginBottom: "16px",
    fontWeight: "500",
    color: "#444",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  
  // Cards and form elements
  card: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "24px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
    border: "1px solid #eee",
  },
  cardRow: {
    display: "flex",
    marginBottom: "16px",
    flexWrap: "wrap",
  },
  fieldGroup: {
    flex: "1 1 300px",
    marginBottom: "16px",
    marginRight: "16px",
  },
  fieldLabel: {
    display: "block",
    fontSize: "14px",
    color: "#666",
    marginBottom: "4px",
  },
  fieldValue: {
    fontSize: "16px",
    color: "#333",
  },
  editField: {
    marginTop: "8px",
  },
  valueWithAction: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonGroup: {
    display: "flex",
    gap: "8px",
    marginTop: "12px",
  },
  errorText: {
    color: "#e74c3c",
    fontSize: "14px",
    marginTop: "4px",
  },
  input: {
    padding: "10px",
    fontSize: "15px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    width: "100%",
    boxSizing: "border-box",
  },
  
  // Profile picture section
  profilePictureContainer: {
    display: "flex",
    alignItems: "flex-start",
    gap: "24px",
    flexWrap: "wrap",
  },
  profilePicture: {
    width: "150px",
    height: "150px",
    objectFit: "cover",
    borderRadius: "8px",
    border: "1px solid #eee",
  },
  profilePlaceholder: {
    width: "150px",
    height: "150px",
    borderRadius: "8px",
    backgroundColor: "#e0e0e0",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "36px",
    color: "#666",
    fontWeight: "bold",
  },
  uploadContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: "12px",
  },
  uploadButton: {
    display: "inline-block",
    padding: "10px 16px",
    backgroundColor: "#f0f0f0",
    color: "#444",
    borderRadius: "4px",
    cursor: "pointer",
    textAlign: "center",
    width: "fit-content",
    border: "1px solid #ddd",
  },
  fileInput: {
    display: "none",
  },
  fileName: {
    fontSize: "14px",
    color: "#666",
  },
  
  // Buttons
  addButton: {
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "4px",
    padding: "10px 16px",
    fontSize: "14px",
    cursor: "pointer",
    fontWeight: "500",
  },
  editButton: {
    backgroundColor: "transparent",
    color: "#3498db",
    border: "1px solid #3498db",
    borderRadius: "4px",
    padding: "6px 12px",
    fontSize: "14px",
    cursor: "pointer",
  },
  saveButton: {
    backgroundColor: "#2ecc71",
    color: "white",
    border: "none",
    borderRadius: "4px",
    padding: "8px 16px",
    fontSize: "14px",
    cursor: "pointer",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
    color: "#666",
    border: "1px solid #ddd",
    borderRadius: "4px",
    padding: "8px 16px",
    fontSize: "14px",
    cursor: "pointer",
  },
  updateButton: {
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "4px",
    padding: "10px 16px",
    fontSize: "14px",
    cursor: "pointer",
    width: "fit-content",
  },
  backButton: {
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "4px",
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: "500",
  },
  
  // Address cards
  addressesContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "20px",
    marginTop: "16px",
  },
  addressCard: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "16px",
    backgroundColor: "white",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
  },
  addressCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "12px",
    alignItems: "center",
  },
  addressType: {
    fontWeight: "500",
    fontSize: "16px",
    color: "#444",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  primaryBadge: {
    backgroundColor: "#e1f5fe",
    color: "#0288d1",
    padding: "2px 8px",
    borderRadius: "10px",
    fontSize: "12px",
    fontWeight: "500",
  },
  addressActions: {
    display: "flex",
    gap: "6px",
  },
  cardActionButton: {
    padding: "4px 8px",
    fontSize: "12px",
    backgroundColor: "transparent",
    border: "1px solid #ddd",
    borderRadius: "4px",
    cursor: "pointer",
    color: "#666",
  },
  deleteAction: {
    borderColor: "#ffcdd2",
    color: "#e53935",
  },
  addressDetails: {
    marginBottom: "12px",
  },
  addressLine: {
    margin: "4px 0",
    color: "#333",
  },
  addressCardFooter: {
    borderTop: "1px solid #eee",
    paddingTop: "12px",
    marginTop: "8px",
  },
  setPrimaryLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "#666",
    cursor: "pointer",
  },
  radioInput: {
    cursor: "pointer",
  },
  
  // Address forms
  addressForm: {
    padding: "8px 0",
  },
  addressFormTitle: {
    fontSize: "16px",
    marginBottom: "16px",
    color: "#444",
  },
  addressFormRow: {
    marginBottom: "12px",
  },
  formFieldGroup: {
    marginBottom: "12px",
  },
  formFieldHalf: {
    flex: "1 1 calc(50% - 8px)",
  },
  formLabel: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "4px",
    display: "block",
  },
  formInput: {
    width: "100%",
    padding: "10px",
    fontSize: "14px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    boxSizing: "border-box",
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-start",
    gap: "8px",
    marginTop: "16px",
  },
  
  // Orders styling
  ordersContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  orderCard: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "16px",
    backgroundColor: "white",
  },
  orderHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "12px",
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontWeight: "500",
    fontSize: "16px",
    marginBottom: "4px",
  },
  orderDate: {
    color: "#666",
    fontSize: "14px",
  },
  orderAmount: {
    fontSize: "18px",
    fontWeight: "500",
    color: "#3498db",
  },
  toggleDetailsButton: {
    backgroundColor: "transparent",
    color: "#3498db",
    border: "1px solid #3498db",
    borderRadius: "4px",
    padding: "6px 12px",
    fontSize: "14px",
    cursor: "pointer",
    marginBottom: "12px",
  },
  orderDetails: {
    backgroundColor: "#f9f9f9",
    padding: "16px",
    borderRadius: "4px",
    marginTop: "8px",
  },
  orderItemsHeading: {
    fontSize: "16px",
    marginBottom: "12px",
    color: "#444",
  },
  orderItemsTable: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    textAlign: "left",
    padding: "8px 12px",
    borderBottom: "1px solid #ddd",
    color: "#666",
    fontSize: "14px",
  },
  tableRow: {
    borderBottom: "1px solid #eee",
  },
  tableCell: {
    padding: "12px",
    fontSize: "14px",
  },
  tableTotalLabel: {
    textAlign: "right",
    padding: "12px",
    fontWeight: "500",
    fontSize: "14px",
  },
  tableTotalValue: {
    padding: "12px",
    fontWeight: "500",
    fontSize: "16px",
    color: "#3498db",
  },
  
  // Empty states
  emptyState: {
    textAlign: "center",
    padding: "32px 20px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    color: "#666",
  },
  emptyStateButton: {
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "4px",
    padding: "10px 20px",
    fontSize: "14px",
    cursor: "pointer",
    marginTop: "16px",
  },
  
  // Actions container
  actionsContainer: {
    marginTop: "24px",
    display: "flex",
    justifyContent: "flex-start",
  },
};

export default ProfileScreen;