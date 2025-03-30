import React from 'react';
import { render, screen } from '@testing-library/react';
import Recommendations from '../Recommendations';

test('renders Recommendations component', () => {
    render(<Recommendations />);
    const heading = screen.getByText(/Recommended Videos/i);
    expect(heading).toBeInTheDocument();
});
