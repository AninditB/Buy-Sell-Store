import { render, screen } from "@testing-library/react";
import App from "./App";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import { UserProvider } from "./context/UserContext";

const client = new ApolloClient({
  uri: "http://localhost:8080/graphql",
  cache: new InMemoryCache(),
});

test("renders login screen title", () => {
  render(
    <ApolloProvider client={client}>
      <UserProvider>
        <App />
      </UserProvider>
    </ApolloProvider>
  );

  expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();
});
