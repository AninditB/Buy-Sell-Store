import React from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  ApolloLink,
  HttpLink,
  from,
} from "@apollo/client";

import omitDeep from "omit-deep-lodash";
import { UserProvider, useUserContext } from "./context/UserContext";

import LoginScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";
import ForgotPassword from "./screens/ForgotPasswordScreen";
import ResetPassword from "./screens/ResetPasswordScreen";
import HomeScreen from "./screens/HomeScreen";
import HomeItemsScreen from "./screens/HomeItemsScreen";
import HomeItem from "./screens/HomeItem";
import Header from "./components/Header";
import CartScreen from "./screens/CartScreen";
import Books from "./screens/BooksScreen";
import Book from "./screens/BookDetailScreen";
import CheckoutScreen from "./screens/CheckoutScreen";
import WishlistScreen from "./screens/WishlistScreen";
import SellerDashboard from "./screens/SellerDashboard";
import SellerStats from "./screens/SellerStats";
import SellerHome from "./screens/SellerHome";
import UploadItems from "./screens/UploadItems";
import ProfileScreen from "./screens/ProfileScreen";
import ManageInventory from "./screens/ManageInventory";
import Inventory from "./screens/Inventory"; // or "./components/Inventory" if it's under components
import Revenue from "./screens/Revenue";

// Strip __typename before sending variables
const cleanTypenameLink = new ApolloLink((operation, forward) => {
  if (operation.variables) {
    operation.variables = omitDeep(operation.variables, "__typename");
  }
  return forward(operation);
});

const httpLink = new HttpLink({
  uri: "http://localhost:8080/graphql",
  credentials: "include",
});

const client = new ApolloClient({
  link: from([cleanTypenameLink, httpLink]),
  cache: new InMemoryCache(),
});

// Redirect to /login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { user } = useUserContext();
  return user ? children : <Navigate to="/login" replace />;
};

// Hide header on public pages
const Layout = ({ children }) => {
  const { user } = useUserContext();
  const location = useLocation();
  const hideHeaderRoutes = [
    "/login",
    "/signup",
    "/forgotpassword",
    "/reset-password",
  ];
  const shouldHideHeader = hideHeaderRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHideHeader && user && <Header />}
      {children}
    </>
  );
};

const AppRoutes = () => (
  <Layout>
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/signup" element={<SignUpScreen />} />
      <Route path="/forgotpassword" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Seller Public */}
      <Route path="/seller-dashboard" element={<SellerDashboard />} />
      <Route path="/manageinventory" element={<ManageInventory />} />
      <Route path="/uploadItems" element={<UploadItems />} />
      <Route path="/revenue" element={<Revenue />} />

      {/* Protected */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomeScreen />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sellerHome"
        element={
          <ProtectedRoute>
            <SellerHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/books"
        element={
          <ProtectedRoute>
            <Books />
          </ProtectedRoute>
        }
      />
      <Route
        path="/book/:id"
        element={
          <ProtectedRoute>
            <Book />
          </ProtectedRoute>
        }
      />
      <Route
        path="/homeitems"
        element={
          <ProtectedRoute>
            <HomeItemsScreen />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wishlist"
        element={
          <ProtectedRoute>
            <WishlistScreen />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <CartScreen />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkoutScreen"
        element={
          <ProtectedRoute>
            <CheckoutScreen />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfileScreen />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sellerstats"
        element={
          <ProtectedRoute>
            <SellerStats />
          </ProtectedRoute>
        }
      />


      <Route path="/home-item/:id" element={<HomeItem />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/home" replace />} />
      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <Inventory />
          </ProtectedRoute>
        }
      />
    </Routes>
  </Layout>
);

const App = () => (
  <ApolloProvider client={client}>
    <UserProvider>
      <Router>
        <AppRoutes />
      </Router>
    </UserProvider>
  </ApolloProvider>
);

export default App;
