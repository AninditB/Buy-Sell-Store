import React, { useState } from "react";
import { useMutation, gql } from "@apollo/client";

const FORGOT_PASSWORD_MUTATION = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email)
  }
`;

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [forgotPassword, { loading }] = useMutation(FORGOT_PASSWORD_MUTATION, {
    onCompleted: (data) => {
      if (data.forgotPassword) {
        setSubmitted(true);
      } else {
        // Update error message if the email is not available.
        setErrorMessage("No account associated with that email address.");
      }
    },
    onError: (error) => {
      console.error(error);
      setErrorMessage("An unexpected error occurred.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    forgotPassword({ variables: { email } });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Forgot Password</h2>
      {submitted ? (
        <p style={styles.successMessage}>
          An email has been sent to your email address with instructions to reset your password.
        </p>
      ) : (
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </label>
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Sending..." : "Reset Password"}
          </button>
        </form>
      )}
      {errorMessage && <p style={styles.error}>{errorMessage}</p>}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "400px",
    margin: "50px auto",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    textAlign: "center",
    backgroundColor: "#fff",
  },
  title: {
    marginBottom: "20px",
    color: "#333",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    fontSize: "16px",
    color: "#555",
    textAlign: "left",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    marginTop: "5px",
  },
  button: {
    padding: "10px",
    fontSize: "16px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  error: {
    marginTop: "15px",
    color: "red",
    fontWeight: "bold",
  },
  successMessage: {
    color: "#28a745",
    fontSize: "16px",
  },
};

export default ForgotPassword;
