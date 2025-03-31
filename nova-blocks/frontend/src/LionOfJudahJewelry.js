import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Importing axios for API calls

import React, { useEffect } from 'react';
import { Canvas } from 'react-three-fiber'; // Importing 3D rendering library

const LionOfJudahJewelry = () => {
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const response = await axios.get('/api/golds/recommendations');
                setRecommendations(response.data);
            } catch (error) {
                console.error('Error fetching recommendations:', error);
            }
        };

        fetchRecommendations();
    }, []);

    return (
        <div>
            <h1>Lion of Judah Alchemical Jewelry</h1>
            <p>Explore our unique designs that blend tradition with modern AI technology.</p>
            <Canvas>
                {/* Render 3D models and designs here */}
            </Canvas>
        </div>
    );
};


export default LionOfJudahJewelry;
