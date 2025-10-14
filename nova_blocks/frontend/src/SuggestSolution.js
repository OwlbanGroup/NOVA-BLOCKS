import React, { useState } from 'react';

const SuggestSolution = () => {
    const [solution, setSolution] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!solution) {
            setError('Solution is required.');
            return;
        }
        // Logic to send the suggested solution to the backend
        console.log('Suggesting solution:', solution);
        setSuccess(true);
        setSolution('');
    };

    return (
        <div>
            <h2>Suggest a Solution</h2>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                    placeholder="Suggest a solution for a roadblock..."
                />
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>Solution suggested successfully!</p>}
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default SuggestSolution;
