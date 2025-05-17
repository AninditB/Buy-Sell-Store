import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Book, { GET_BOOK_DETAILS, ADD_REVIEW } from "./BookDetailScreen";

// Mock the user context hook
jest.mock("../context/UserContext", () => ({
  useUserContext: () => ({
    user: { id: "user123", username: "testuser" },
  }),
}));

const mockBookId = "book123";

const mockBook = {
  id: mockBookId,
  title: "Test Book",
  author: "Test Author",
  price: 19.99,
  imageUrl: "http://example.com/image.jpg",
  ratings: 4.5,
  reviews: [
    { reviewer: "john", comment: "Great!", rating: 4.5 }
  ]
};

const mocks = [
  {
    request: {
      query: GET_BOOK_DETAILS,
      variables: { id: mockBookId }
    },
    result: {
      data: {
        book: mockBook
      }
    }
  },
  {
    request: {
      query: ADD_REVIEW,
      variables: {
        bookId: mockBookId,
        review: {
          reviewer: "testuser",
          comment: "Awesome book!",
          rating: 5,
          userId: "user123"
        }
      }
    },
    result: {
      data: {
        addReview: {
          id: mockBookId,
          reviews: [
            {
              reviewer: "testuser",
              comment: "Awesome book!",
              rating: 5,
              userId: "user123"
            }
          ]
        }
      }
    }
  }
];

const renderComponent = () => {
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter initialEntries={[`/books/${mockBookId}`]}>
        <Routes>
          <Route path="/books/:id" element={<Book />} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>
  );
};

describe("BookDetailScreen", () => {
  test("renders loading state initially", () => {
    renderComponent();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("renders book details after loading", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("Test Book")).toBeInTheDocument();
      expect(screen.getByText("Test Author")).toBeInTheDocument();
      expect(screen.getByText(/Ratings:/)).toBeInTheDocument();
    });
  });

  test("submits a new review", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Test Book")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("Write a review"), {
      target: { value: "Awesome book!" }
    });

    fireEvent.change(screen.getByPlaceholderText("Rating (0-5)"), {
      target: { value: "5" }
    });

    fireEvent.click(screen.getByText("Add Review"));

    await waitFor(() => {
      expect(screen.getByText("Review added successfully!")).toBeInTheDocument();
    });
  });
});
