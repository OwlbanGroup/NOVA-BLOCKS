import React, { useState } from 'react';
import LoadingIndicator from './LoadingIndicator'; // Import LoadingIndicator

const AiSuperFoodPaste = () => {
    const [ingredients, setIngredients] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false); // Add loading state


    const handleInputChange = (event) => {
        setIngredients(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true); // Set loading to true when submitting
        try {
            const response = await fetch('/api/create-food-paste', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ingredients }),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setResult(data.message); // Assuming the backend returns a message
        } catch (error) {
            console.error('Error creating food paste:', error);
            setResult('Failed to create food paste. Please try again.'); // Set error message
        } finally {
            setLoading(false); // Set loading to false after submission
        }


        const data = await response.json();
        setResult(data.message); // Assuming the backend returns a message
    };

    return (
        <div>
            <h1>Create AI Super Food Paste</h1>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={ingredients}
                    onChange={handleInputChange}
                    placeholder="Enter ingredients here..."
                />
            <button type="submit" disabled={loading}>Create Food Paste</button> {/* Disable button while loading */}

            </form>
            {loading && <LoadingIndicator loading={loading} />} {/* Show loading indicator */}
            {result && <p>{result}</p>} 

        </div>
    );
};

export default AiSuperFoodPaste;
