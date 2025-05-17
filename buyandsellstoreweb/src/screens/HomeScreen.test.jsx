// HomeScreen.test.js
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HomeScreen from "../screens/HomeScreen"; // Update path as per your folder structure

// Mock useNavigate from react-router-dom
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("HomeScreen Component", () => {
  beforeEach(() => {
    mockNavigate.mockClear(); // Clear navigation mock calls before each test
  });

  test("renders Explore Categories title", () => {
    render(
      <MemoryRouter>
        <HomeScreen />
      </MemoryRouter>
    );

    expect(screen.getByText("Explore Categories")).toBeInTheDocument();
  });

  test("renders both category cards", () => {
    render(
      <MemoryRouter>
        <HomeScreen />
      </MemoryRouter>
    );

    expect(screen.getByText("Books")).toBeInTheDocument();
    expect(screen.getByText("Home Items")).toBeInTheDocument();
  });

  test("clicking on Books category navigates to /books", () => {
    render(
      <MemoryRouter>
        <HomeScreen />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Books"));
    expect(mockNavigate).toHaveBeenCalledWith("/books");
  });

  test("clicking on Home Items category navigates to /homeitems", () => {
    render(
      <MemoryRouter>
        <HomeScreen />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Home Items"));
    expect(mockNavigate).toHaveBeenCalledWith("/homeitems");
  });
});
