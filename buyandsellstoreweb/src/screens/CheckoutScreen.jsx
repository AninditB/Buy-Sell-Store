import React, { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { useUserContext } from "../context/UserContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Truck, CreditCard as CCIcon, CheckCircle } from "lucide-react";

const CREATE_ORDER = gql`
  mutation CreateOrder(
    $userId: ID!
    $items: [CartItemInput!]!
    $totalPrice: Float!
    $billing: Address
    $shipping: Address
    $payment: PaymentInput!
  ) {
    createOrder(
      userId: $userId
      items: $items
      totalPrice: $totalPrice
      billing: $billing
      shipping: $shipping
      payment: $payment
    ) {
      success
      message
      order {
        id
        totalPrice
        createdAt
        items {
          itemId
          name
          type
          quantity
          price
          imageUrl
        }
      }
    }
  }
`;

const steps = [
  { label: "Shipping", icon: <Truck size={20} /> },
  { label: "Payment", icon: <CCIcon size={20} /> },
  { label: "Confirmation", icon: <CheckCircle size={20} /> }
];

const CheckoutScreen = () => {
  const { user } = useUserContext();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { cartItems = [], totalPrice = 0 } = state || {};

  const [step, setStep] = useState(0);
  const [billingAddress] = useState(user.billing?.[0] || {});
  const [shippingAddress, setShippingAddress] = useState(user.shipping?.[0] || {});
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [creditCard, setCreditCard] = useState({ cardNumber: "", expiry: "", cvv: "" });
  const [errors, setErrors] = useState({ cardNumber: "", expiry: "", cvv: "" });
  const [isPlacing, setIsPlacing] = useState(false);
  const [order, setOrder] = useState(null);

  const [createOrder] = useMutation(CREATE_ORDER);

  const handleCardNumberChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = digits.replace(/(.{4})/g, "$1 ").trim();
    setCreditCard(prev => ({ ...prev, cardNumber: formatted }));
    setErrors(prev => ({ ...prev, cardNumber: digits.length === 16 ? "" : "Card number must be 16 digits" }));
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (val.length > 2) val = `${val.slice(0,2)}/${val.slice(2)}`;
    setCreditCard(prev => ({ ...prev, expiry: val }));
    const [m, y] = val.split("/");
    const now = new Date();
    const year = now.getFullYear() % 100;
    const month = now.getMonth() + 1;
    let msg = "";
    if (!m || !y || +m < 1 || +m > 12) msg = "Invalid expiry format (MM/YY)";
    else if (+y < year || (+y === year && +m < month)) msg = "Card has expired";
    setErrors(prev => ({ ...prev, expiry: msg }));
  };

  const handleCVVChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCreditCard(prev => ({ ...prev, cvv: val }));
    setErrors(prev => ({ ...prev, cvv: (val.length === 3 || val.length === 4) ? "" : "CVV must be 3 or 4 digits" }));
  };

  const isShippingValid = () => {
    const addr = useSameAddress ? billingAddress : shippingAddress;
    return ["street","city","state","zip","country"].every(k => !!addr[k]);
  };

  const isPaymentValid = () => {
    return creditCard.cardNumber && creditCard.expiry && creditCard.cvv && !errors.cardNumber && !errors.expiry && !errors.cvv;
  };

  const nextStep = async () => {
    if (step === 0 && !isShippingValid()) return;
    if (step === 1) await placeOrder(); else setStep(s => s + 1);
  };

  const placeOrder = async () => {
    setIsPlacing(true);
    try {
      const billing = { ...billingAddress }; delete billing.__typename;
      const shipping = useSameAddress ? billing : (() => { const s = { ...shippingAddress }; delete s.__typename; return s; })();
      const resp = await createOrder({
        variables: {
          userId: user.id,
          items: cartItems.map(i => ({ itemId: i.itemId, name: i.name, type: i.type, quantity: i.quantity, price: i.price, imageUrl: i.imageUrl })),
          totalPrice,
          billing,
          shipping,
          payment: { cardNumber: creditCard.cardNumber.replace(/\s/g, ""), expiry: creditCard.expiry, cvv: creditCard.cvv }
        }
      });
      if (resp.data.createOrder.success) {
        setOrder(resp.data.createOrder.order);
        setStep(2);
      } else alert(resp.data.createOrder.message);
    } catch (e) {
      console.error(e);
      alert("Error placing order");
    }
    setIsPlacing(false);
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.container}>
        <h1 style={styles.pageTitle}>Checkout</h1>
        <div style={styles.cartContainer}>
          <div style={styles.cartItems}>
            <div style={styles.stepper}>
              {steps.map((s, i) => (
                <div key={i} style={{ ...styles.step, ...(i === step ? styles.activeStep : {}) }}>
                  <div style={styles.stepIcon}>{s.icon}</div>
                  <div style={styles.stepLabel}>{s.label}</div>
                </div>
              ))}
            </div>
            {step === 0 && (
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>Shipping Address</h2>
                <label style={styles.label}>Choose Address</label>
                <select
                  style={styles.select}
                  value={JSON.stringify(shippingAddress)}
                  onChange={e => { setShippingAddress(JSON.parse(e.target.value)); setUseSameAddress(false); }}
                >
                  {user.shipping.map((a, idx) => (
                    <option key={idx} value={JSON.stringify(a)}>
                      {`${a.type}: ${a.street}, ${a.city}, ${a.state}, ${a.zip}`}
                    </option>
                  ))}
                </select>
                <label style={styles.label}>
                  <input type="checkbox" checked={useSameAddress} onChange={e => setUseSameAddress(e.target.checked)} /> Use billing address
                </label>
                {!useSameAddress && ["street","city","state","zip","country"].map(f => (
                  <div key={f}>
                    <label style={styles.label}>{f.charAt(0).toUpperCase() + f.slice(1)}</label>
                    <input
                      type="text"
                      value={shippingAddress[f] || ""}
                      onChange={e => setShippingAddress(prev => ({ ...prev, [f]: e.target.value }))}
                      style={styles.input}
                    />
                  </div>
                ))}
              </div>
            )}
            {step === 1 && (
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>Payment Details</h2>
                <label style={styles.label}>Card Number</label>
                <input
                  type="text"
                  value={creditCard.cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  style={styles.input}
                />
                {errors.cardNumber && <p style={styles.error}>{errors.cardNumber}</p>}
                <label style={styles.label}>Expiry (MM/YY)</label>
                <input
                  type="text"
                  value={creditCard.expiry}
                  onChange={handleExpiryChange}
                  placeholder="MM/YY"
                  style={styles.input}
                />
                {errors.expiry && <p style={styles.error}>{errors.expiry}</p>}
                <label style={styles.label}>CVV</label>
                <input
                  type="password"
                  value={creditCard.cvv}
                  onChange={handleCVVChange}
                  placeholder="123"
                  style={styles.input}
                />
                {errors.cvv && <p style={styles.error}>{errors.cvv}</p>}
              </div>
            )}
            {step === 2 && order && (
              <div style={styles.card}>
                <CheckCircle size={48} color="#28a745" />
                <h2 style={styles.cardTitle}>Thank You!</h2>
                <p>Your order <strong>#{order.id}</strong> has been placed.</p>
                <p>Placed on: {new Date(order.createdAt).toLocaleString()}</p>
                <button onClick={() => navigate('/order',{state:{order}})} style={styles.checkoutButton}>View Order</button>
              </div>
            )}
            {step < 2 && (
              <div style={styles.navButtons}>
                {step > 0 && <button onClick={() => setStep(s => s - 1)} style={styles.continueShoppingButton}>Back</button>}
                <button
                  onClick={nextStep}
                  disabled={isPlacing || (step === 0 ? !isShippingValid() : !isPaymentValid())}
                  style={styles.checkoutButton}
                >
                  {isPlacing ? 'Processing…' : step === 1 ? 'Place Order' : 'Next'}
                </button>
              </div>
            )}
          </div>
          <div style={styles.cartSummary}>
            <h3 style={styles.summaryTitle}>Order Summary</h3>
            {cartItems.map(i => (
              <div key={i.itemId} style={styles.cartItem}>
                <div style={styles.productInfo}>
                  <div style={styles.productImage}>
                    <img src={i.imageUrl} alt={i.name} style={styles.itemImage} />
                  </div>
                  <div style={styles.productDetails}>
                    <p style={styles.itemName}>{i.name}</p>
                    <p style={styles.itemType}>{i.type}</p>
                  </div>
                </div>
                <p style={styles.subtotalInfo}>${(i.price * i.quantity).toFixed(2)}</p>
              </div>
            ))}
            <div style={styles.summaryDivider} />
            <div style={styles.summaryTotal}>
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
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
    padding: "20px",
  },
  cartSummary: {
    flex: "1 1 300px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    padding: "20px",
    position: "sticky",
    top: "20px",
    height: "fit-content",
  },
  stepper: { display: "flex", marginBottom: "24px", gap: "16px" },
  step: { display: "flex", alignItems: "center", gap: "8px", opacity: 0.5 },
  activeStep: { opacity: 1, fontWeight: "bold" },
  stepIcon: { display: "flex" },
  stepLabel: { fontSize: "14px" },
  card: {
    background: "#fff",
    borderRadius: "8px",
    padding: "24px",
    marginBottom: "24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)"
  },
  cardTitle: { marginBottom: "16px", fontSize: "18px", color: "#333" },
  label: { display: "block", marginBottom: "6px", fontWeight: 500 },
  input: {
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    marginBottom: "12px",
    boxSizing: "border-box"
  },
  select: {
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    marginBottom: "12px",
    boxSizing: "border-box"
  },
  error: { color: "red", fontSize: "14px", marginTop: "-8px", marginBottom: "12px" },
  navButtons: { display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "16px" },
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
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
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
  cartItem: {
    display: "grid",
    gridTemplateColumns: "3fr 1fr 1fr 1fr",
    padding: "20px",
    borderBottom: "1px solid #eaeaea",
    alignItems: "center"
  },
  productInfo: {
    display: "flex",
    alignItems: "center",
    gap: "15px"
  },
  productImage: {
    width: "80px",
    height: "80px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  itemImage: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
    borderRadius: "4px"
  },
  productDetails: {
    flex: "1"
  },
  itemName: {
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "5px",
    color: "#333"
  },
  itemType: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "5px"
  },
  priceInfo: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#333",
    textAlign: "center"
  },
  quantityControls: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px"
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
    outline: "none"
  },
  quantityDisplay: {
    fontWeight: "500",
    fontSize: "16px",
    minWidth: "30px",
    textAlign: "center"
  },
  subtotalInfo: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#333",
    textAlign: "right"
  },
  summaryTitle: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "20px",
    paddingBottom: "15px",
    borderBottom: "1px solid #eaeaea",
    color: "#333"
  },
  summaryDivider: {
    height: "1px",
    backgroundColor: "#eaeaea",
    margin: "10px 0"
  },
  summaryTotal: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "18px",
    fontWeight: "600",
    color: "#333",
    margin: "10px 0"
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "15px",
    color: "#666"
  }
};

export default CheckoutScreen;
