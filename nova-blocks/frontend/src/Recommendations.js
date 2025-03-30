import React, { useEffect, useState } from 'react';

const Recommendations = () => {
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        // Fetch recommendations from the backend (placeholder URL)
        fetch('/api/recommendations')
            .then(response => response.json())
            .then(data => setRecommendations(data))
            .catch(error => console.error('Error fetching recommendations:', error));
    }, []);

    return (
        <div>
            <h2>Recommended Videos</h2>
            <ul>
                {recommendations.map(video => (
                    <li key={video.id}>
                        <h3>{video.title}</h3>
                        <video width="200" controls src={video.url} />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Recommendations;
