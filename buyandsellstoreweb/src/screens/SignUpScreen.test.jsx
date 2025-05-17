import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';
import SignUpScreen from './SignUpScreen';

describe('SignUpScreen', () => {
  const renderComponent = () =>
    render(
      <MemoryRouter>
        <MockedProvider>
          <SignUpScreen />
        </MockedProvider>
      </MemoryRouter>
    );

  it('renders the Sign Up form with all fields', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: /Sign Up/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();

    // Get password and verify password fields separately
    const passwordFields = screen.getAllByPlaceholderText(/Password/i);
    expect(passwordFields[0]).toBeInTheDocument(); // Password
    expect(passwordFields[1]).toBeInTheDocument(); // Verify Password

    expect(screen.getByPlaceholderText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Phone Number/i)).toBeInTheDocument();
  });

  it('shows error for invalid email format', () => {
    renderComponent();

    const emailInput = screen.getByPlaceholderText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    expect(screen.getByText(/Invalid email format/i)).toBeInTheDocument();
  });

  it('disables submit when validation errors exist', () => {
    renderComponent();

    const emailInput = screen.getByPlaceholderText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    const submitButton = screen.getByRole('button', { name: /Sign Up/i });
    expect(submitButton).toBeDisabled();
  });
});
