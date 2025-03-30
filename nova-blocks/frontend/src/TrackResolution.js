import React, { useState, useEffect } from 'react';
import LoadingIndicator from './LoadingIndicator'; // Import LoadingIndicator

const TrackResolution = () => {
    const [roadblocks, setRoadblocks] = useState([]);
    const [loading, setLoading] = useState(true); // Add loading state

    useEffect(() => {
        // Logic to fetch roadblock statuses from the backend
        const fetchRoadblocks = async () => {
            try {
                const response = await fetch('/api/roadblocks');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setRoadblocks(data);
            } catch (error) {
                console.error('Error fetching roadblocks:', error);
                setResult('An error occurred while fetching roadblocks. Please try again.'); // Set user-friendly error message

                setResult('An error occurred while fetching roadblocks. Please try again.'); // Set user-friendly error message

            } finally {
                setLoading(false); // Set loading to false after fetching
            }
        };

        fetchRoadblocks(); // Call the fetch function
    }, []); // Ensure the useEffect hook is properly closed

    return (
        <div>
            <h2>Track Roadblock Resolutions</h2>
            {loading ? ( // Show loading indicator while fetching
                <LoadingIndicator loading={loading} />
            ) : (
                <ul>
                    {roadblocks.map(roadblock => (
                        <li key={roadblock.id}>
                            <h3>{roadblock.description}</h3>
                            <p>Status: {roadblock.status}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default TrackResolution;
