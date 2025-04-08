import React, { useState } from 'react';
import LoadingIndicator from './LoadingIndicator'; // Import LoadingIndicator

const AiSuperFoodPaste = () => {
    const [ingredients, setIngredients] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false); // Add loading state


    const handleInputChange = (event) => {
        setIngredients(event.target.value); // Update ingredients input

    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setResult('');
        try {
            const response = await fetch('/api/create-food-paste', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ingredients }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to create food paste');
            }

            // Display success message and analysis
            setResult(
                <div className="result-container">
                    <h3>Food Paste Created!</h3>
                    <p>{data.message}</p>
                    <div className="analysis-section">
                        <h4>Nutritional Analysis:</h4>
                        <pre>{JSON.stringify(data.analysis, null, 2)}</pre>
                    </div>
                </div>
            );
        } catch (error) {
            console.error('Error creating food paste:', error);
            setResult(
                <div className="error-message">
                    <h3>Error</h3>
                    <p>{error.message}</p>
                    <p>Please check your ingredients and try again.</p>
                </div>
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Create AI Super Food Paste</h1>
            <form onSubmit={handleSubmit}>
            <textarea
                aria-label="Ingredients input" // Add ARIA label for accessibility

                    value={ingredients}
                    onChange={handleInputChange}
                    placeholder="Enter ingredients here..."
                />
            <button type="submit" disabled={loading}>Create Food Paste</button> {/* Disable button while loading */}

            </form>
            {loading && <LoadingIndicator loading={loading} />}
            {result}


        </div>
    );
};

export default AiSuperFoodPaste;
