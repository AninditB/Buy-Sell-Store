import React, { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";

const SIGNUP_MUTATION = gql`
  mutation Signup(
    $username: String!
    $email: String!
    $password: String!
    $firstName: String!
    $lastName: String!
    $phone: String!
    $isSeller: Boolean!
    $billing: [Address]
    $shipping: [Address]
  ) {
    signup(
      username: $username
      email: $email
      password: $password
      firstName: $firstName
      lastName: $lastName
      phone: $phone
      isSeller: $isSeller
      billing: $billing
      shipping: $shipping
    ) {
      success
      message
      user {
        id
        username
        email
        firstName
        lastName
        isSeller
        phone
        billing {
          street
          city
          state
          zip
          country
        }
        shipping {
          street
          city
          state
          zip
          country
        }
      }
    }
  }
`;

const SignUpScreen = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    verifyPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    isSeller: false,
  });

  const [errors, setErrors] = useState({
    email: "",
    phone: "",
    password: "",
    verifyPassword: "",
    form: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);

  const [signup] = useMutation(SIGNUP_MUTATION);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setErrors((prev) => ({
        ...prev,
        email: value && !emailRegex.test(value) ? "Invalid email format." : "",
      }));
    }

    if (name === "phone") {
      if (!/^\d{0,10}$/.test(value)) return;
      setErrors((prev) => ({
        ...prev,
        phone: value.length > 0 && value.length < 10 ? "Phone number must be 10 digits." : "",
      }));
    }

    if (name === "password") {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      setErrors((prev) => ({
        ...prev,
        password: value && !passwordRegex.test(value)
          ? "Password must be at least 8 characters long, include an uppercase, lowercase, number, and special character."
          : "",
        verifyPassword: formData.verifyPassword && value !== formData.verifyPassword
          ? "Passwords do not match."
          : "",
      }));
    }

    if (name === "verifyPassword") {
      setErrors((prev) => ({
        ...prev,
        verifyPassword: value !== formData.password ? "Passwords do not match." : "",
      }));
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (errors.email || errors.phone || errors.password || errors.verifyPassword) {
      return;
    }

    try {
      const response = await signup({ variables: { ...formData } });
      if (response.data.signup.success) {
        navigate("/login");
      } else {
        setErrors((prev) => ({ ...prev, form: response.data.signup.message }));
      }
    } catch (error) {
      setErrors((prev) => ({ ...prev, form: "An error occurred during sign-up." }));
    }
  };

  return (
    <div
      style={{
        backgroundColor: formData.isSeller ? "#000" : "#fff",
        color: formData.isSeller ? "#fff" : "#000",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={styles.innerContainer}>
        <h1 style={{ marginBottom: "20px" }}>Sign Up</h1>
        <form onSubmit={handleSignup} style={styles.form}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            style={styles.input}
          />
          {errors.email && <p style={styles.error}>{errors.email}</p>}

          <div style={styles.passwordContainer}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              style={styles.input}
            />
            <span
              style={styles.eyeIcon}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "👁️" : "🔒"}
            </span>
          </div>
          {errors.password && <p style={styles.error}>{errors.password}</p>}

          <div style={styles.passwordContainer}>
            <input
              type={showVerifyPassword ? "text" : "password"}
              name="verifyPassword"
              placeholder="Verify Password"
              value={formData.verifyPassword}
              onChange={handleChange}
              required
              style={styles.input}
            />
            <span
              style={styles.eyeIcon}
              onClick={() => setShowVerifyPassword(!showVerifyPassword)}
            >
              {showVerifyPassword ? "👁️" : "🔒"}
            </span>
          </div>
          {errors.verifyPassword && <p style={styles.error}>{errors.verifyPassword}</p>}

          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
            style={styles.input}
          />
          {errors.phone && <p style={styles.error}>{errors.phone}</p>}

          {/* Wrap checkbox + button together for perfect alignment */}
          <div style={{ width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={!formData.isSeller}
                  onChange={() => setFormData((prev) => ({ ...prev, isSeller: false }))}
                  style={{ marginRight: "6px" }}
                />
                Sign up as User
              </label>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.isSeller}
                  onChange={() => setFormData((prev) => ({ ...prev, isSeller: true }))}
                  style={{ marginRight: "6px" }}
                />
                Sign up as Seller
              </label>
            </div>

            <button
              type="submit"
              style={styles.button}
              disabled={errors.email || errors.phone || errors.password || errors.verifyPassword}
            >
              Sign Up
            </button>
          </div>

          {errors.form && <p style={styles.error}>{errors.form}</p>}
        </form>
      </div>
    </div>
  );
};

const styles = {
  innerContainer: {
    maxWidth: "400px",
    width: "90%",
    padding: "30px",
    borderRadius: "8px",
    textAlign: "center",
  },
  form: { display: "flex", flexDirection: "column", gap: "10px", width: "100%" },
  input: { padding: "10px", fontSize: "16px", width: "100%" },
  passwordContainer: { position: "relative", width: "100%" },
  eyeIcon: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
  },
  button: {
    padding: "10px",
    background: "#28A745",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    width: "106%",
    marginTop: "5px",
  },
  checkboxLabel: {
    fontSize: "14px",
    margin: "10px 0",
    textAlign: "left",
  },
  error: {
    color: "red",
    marginTop: "5px",
    fontSize: "14px",
  },
};

export default SignUpScreen;
