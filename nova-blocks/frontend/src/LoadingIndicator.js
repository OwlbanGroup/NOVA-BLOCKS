import React from 'react';

const LoadingIndicator = ({ loading, message = 'Loading...' }) => { // Add message prop with default value
    return loading ? <p>{message}</p> : null; // Display loading message if loading is true
};

export default LoadingIndicator;
