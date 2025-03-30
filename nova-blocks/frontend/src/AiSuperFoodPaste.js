import React, { useState } from 'react';

const AiSuperFoodPaste = () => {
    const [ingredients, setIngredients] = useState('');
    const [result, setResult] = useState('');

    const handleInputChange = (event) => {
        setIngredients(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        // Logic to process the ingredients and create the food paste
        // This could involve sending a request to the backend
        const response = await fetch('/api/create-food-paste', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ingredients }),
        });

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
                <button type="submit">Create Food Paste</button>
            </form>
            {result && <p>{result}</p>}
        </div>
    );
};

export default AiSuperFoodPaste;
