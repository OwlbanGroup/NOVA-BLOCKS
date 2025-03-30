import React, { useState } from 'react';

const ReportRoadblock = () => {
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!description) {
            setError('Description is required.');
            return;
        }
        // Logic to send the roadblock report to the backend
        console.log('Reporting roadblock:', description);
        setSuccess(true);
        setDescription('');
    };

    return (
        <div>
            <h2>Report a Roadblock</h2>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the roadblock..."
                />
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>Roadblock reported successfully!</p>}
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default ReportRoadblock;
