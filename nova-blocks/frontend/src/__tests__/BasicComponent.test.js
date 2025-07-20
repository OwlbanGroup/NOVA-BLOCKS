import React from 'react';
import { render, screen } from '@testing-library/react';
import LionOfJudahJewelry from '../LionOfJudahJewelry';

test('renders LionOfJudahJewelry component', () => {
  render(<LionOfJudahJewelry />);
  const element = screen.getByText(/Lion of Judah/i);
  expect(element).toBeInTheDocument();
});
