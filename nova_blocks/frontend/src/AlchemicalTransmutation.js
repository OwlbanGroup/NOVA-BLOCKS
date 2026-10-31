import React, { useEffect, useState } from 'react';
import axiosInstance from './axiosInstance'; // Import configured axios instance
import './AlchemicalTransmutation.css'; // Importing CSS for styling

const AlchemicalTransmutation = () => {
    const [colors, setColors] = useState([]);

    useEffect(() => {
        const fetchColors = async () => {
            try {
                const response = await axiosInstance.get('/golds/colors'); // Using axiosInstance with baseURL /api
                setColors(response.data);
            } catch (error) {
                console.error('Error fetching colors:', error);
            }
        };

        fetchColors();
    }, []);

    return (
        <div>
            <h1>NOVA BLOCKS ALCHEMICAL TRANSMUTATION GOLD METHOD</h1>
            <p>Discover the purest gold created through our unique alchemical transmutation process.</p>
            <h2>Available Colors:</h2>
            <ul className="color-list">
                {colors.map(color => (
                    <li key={color} className="color-swatch" style={{ backgroundColor: color }}>
                        {color}
                    </li>
                ))}
            </ul>
            <p>Experience the beauty and versatility of gold in all its colors!</p>
        </div>
    );
};

export default AlchemicalTransmutation;
