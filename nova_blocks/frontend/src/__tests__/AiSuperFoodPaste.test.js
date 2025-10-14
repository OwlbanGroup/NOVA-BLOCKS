import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AiSuperFoodPaste from '../AiSuperFoodPaste';

test('renders AiSuperFoodPaste component', () => {
    render(<AiSuperFoodPaste />);
    const heading = screen.getByText(/Create AI Super Food Paste/i);
    expect(heading).toBeInTheDocument();
});

test('allows users to input ingredients', () => {
    render(<AiSuperFoodPaste />);
    const input = screen.getByLabelText(/Ingredients input/i);
    fireEvent.change(input, { target: { value: 'Tomatoes' } });
    expect(input.value).toBe('Tomatoes');
});
