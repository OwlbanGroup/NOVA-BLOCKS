import React, { useState, useEffect } from 'react';

const TrackResolution = () => {
    const [roadblocks, setRoadblocks] = useState([]);

    useEffect(() => {
        // Logic to fetch roadblock statuses from the backend
        fetch('/api/roadblocks')
            .then(response => response.json())
            .then(data => setRoadblocks(data))
            .catch(error => console.error('Error fetching roadblocks:', error));
    }, []);

    return (
        <div>
            <h2>Track Roadblock Resolutions</h2>
            <ul>
                {roadblocks.map(roadblock => (
                    <li key={roadblock.id}>
                        <h3>{roadblock.description}</h3>
                        <p>Status: {roadblock.status}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TrackResolution;
