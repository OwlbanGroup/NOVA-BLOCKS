import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Importing axios for API calls

const AlchemicalTransmutation = () => {
    const [colors, setColors] = useState([]);

    useEffect(() => {
        const fetchColors = async () => {
            try {
                const response = await axios.get('/api/golds/colors'); // Assuming an endpoint for colors
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
            <ul>
                {colors.map(color => (
                    <li key={color}>{color}</li>
                ))}
            </ul>
            <p>Experience the beauty and versatility of gold in all its colors!</p>
        </div>
    );
};

export default AlchemicalTransmutation;
