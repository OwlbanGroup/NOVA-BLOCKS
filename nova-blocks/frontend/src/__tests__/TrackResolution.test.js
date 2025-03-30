import React from 'react';
import { render, screen } from '@testing-library/react';
import TrackResolution from '../TrackResolution';

test('renders TrackResolution component', () => {
    render(<TrackResolution />);
    const heading = screen.getByText(/Track Roadblock Resolutions/i);
    expect(heading).toBeInTheDocument();
});
