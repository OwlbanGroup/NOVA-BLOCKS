import React, { useEffect, useState } from 'react';
import LoadingIndicator from './LoadingIndicator'; // Import LoadingIndicator

const Recommendations = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true); // Add loading state


    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const response = await fetch('/api/recommendations');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setRecommendations(data);
            } catch (error) {
                console.error('Error fetching recommendations:', error);
            } finally {
                setLoading(false); // Set loading to false after fetching
            }
        };

        fetchRecommendations(); // Call the fetch function

    }, []);

    return (
        <div>
            <h2>Recommended Videos</h2>
            {loading ? ( // Show loading indicator while fetching
                <LoadingIndicator loading={loading} />
            ) : (
                <ul>

                {recommendations.map(video => (
                    <li key={video.id}>
                        <h3>{video.title}</h3>
                        <video width="200" controls src={video.url} />
                    </li>
                ))}
                </ul>
            )}

        </div>
    );
};

export default Recommendations;
