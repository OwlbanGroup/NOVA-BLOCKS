import React, { useState } from 'react'; // Import useState

const Hoverboard = () => {
    const [message, setMessage] = useState('This is the AI hoverboard feature!'); // Add state for message

    const handleClick = () => {
        setMessage('You clicked the hoverboard!'); // Update message on click
    };

    return (
        <div>
            <h1>AI Hoverboard</h1>
            <p>{message}</p> {/* Display the message */}
            <button onClick={handleClick}>Click Me!</button> {/* Button to trigger state change */}

        </div>
    );
};

export default Hoverboard;
