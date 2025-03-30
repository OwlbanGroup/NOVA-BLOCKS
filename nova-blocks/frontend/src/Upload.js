import React, { useState } from 'react';

const Upload = () => {
    const [videoFile, setVideoFile] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false); // State for success message
    const [loading, setLoading] = useState(false); // State for loading indicator
    const [previewUrl, setPreviewUrl] = useState('');

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('video/')) {
            setVideoFile(file);
            setError('');
            setPreviewUrl(URL.createObjectURL(file)); // Create a preview URL
        } else {
            setError('Please select a valid video file.');
            setVideoFile(null);
            setPreviewUrl('');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!videoFile) {
            setError('Please select a video file to upload.');
            return;
        }
        setLoading(true); // Start loading
        setError(''); // Clear previous errors
        // Handle the upload logic here
        console.log('Uploading:', videoFile);
        // Simulate upload process
        setTimeout(() => {
            setLoading(false); // Stop loading
            setSuccess(true); // Set success message
        }, 2000); // Simulate a 2-second upload time
    };

    return (
        <div>
            <h1>Upload Video</h1>
            <form onSubmit={handleSubmit}>
                <input type="file" accept="video/*" onChange={handleFileChange} />
                {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}
                {previewUrl && <video width="400" controls src={previewUrl} />} {/* Video preview */}
                <button type="submit" disabled={!videoFile}>Upload</button> {/* Disable button if no file is selected */}
                {success && <p style={{ color: 'green' }}>Video uploaded successfully!</p>} {/* Display success message */}
                {loading && <p>Uploading...</p>} {/* Display loading indicator */}
            </form>
        </div>
    );
};

export default Upload;
