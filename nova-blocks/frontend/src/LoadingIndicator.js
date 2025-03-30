import React from 'react';

const LoadingIndicator = ({ loading }) => {
    return loading ? <p>Uploading...</p> : null; // Display loading message if loading is true
};

export default LoadingIndicator;
