import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Importing axios for API calls
import { Canvas } from 'react-three-fiber'; // Importing 3D rendering library
import { useFrame } from 'react-three-fiber';
import { useRef } from 'react';

const LionOfJudahJewelry = () => {
    const [recommendations, setRecommendations] = useState([]);
    const meshRef = useRef();

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

    // Animation for the 3D model
    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.01; // Rotate the model
        }
    });

    return (
        <div>
            <h1>Lion of Judah Alchemical Jewelry</h1>
            <p>Explore our unique designs that blend tradition with modern AI technology.</p>
            <Canvas>
                {/* Render 3D models based on recommendations */}
                {recommendations.map((item, index) => (
                    <mesh key={index} ref={meshRef}>
                        <boxGeometry args={[1, 1, 1]} />
                        <meshStandardMaterial color={'#ffcc00'} />
                    </mesh>
                ))}
            </Canvas>
        </div>
    );
};

export default LionOfJudahJewelry;
