import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LeadToSilverTransmutation from '../LeadToSilverTransmutation';

describe('LeadToSilverTransmutation Component', () => {
  test('renders component with initial state', () => {
    render(<LeadToSilverTransmutation />);
    expect(screen.getByText(/Lead to Pure Silver Transmutation/i)).toBeInTheDocument();
    expect(screen.getByText(/Click the button below to transmute lead into pure silver./i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Transmute Lead/i })).toBeEnabled();
  });

  test('button click changes state and shows result', () => {
    render(<LeadToSilverTransmutation />);
    const button = screen.getByRole('button', { name: /Transmute Lead/i });
    fireEvent.click(button);
    expect(button).toBeDisabled();
    // Use a function matcher to handle text broken up by multiple elements
    expect(screen.getByText((content, element) => {
      return content.includes('Lead has been successfully turned into') &&
             element.tagName.toLowerCase() === 'p';
    })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Transmuted!/i })).toBeDisabled();
    expect(screen.getByText(/✨/i)).toBeInTheDocument();
  });

  test('button is disabled after transmutation', () => {
    render(<LeadToSilverTransmutation />);
    const button = screen.getByRole('button', { name: /Transmute Lead/i });
    fireEvent.click(button);
    expect(button).toBeDisabled();
  });
});
