import React, { useState } from 'react';

const Upload = () => {
    const [videoFile, setVideoFile] = useState(null);
    const [error, setError] = useState('');
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

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!videoFile) {
            setError('Please select a video file to upload.');
            return;
        }
        // Handle the upload logic here
        console.log('Uploading:', videoFile);
    };

    return (
        <div>
            <h1>Upload Video</h1>
            <form onSubmit={handleSubmit}>
                <input type="file" accept="video/*" onChange={handleFileChange} />
                {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}
                {previewUrl && <video width="400" controls src={previewUrl} />} {/* Video preview */}
                <button type="submit">Upload</button>
            </form>
        </div>
    );
};

export default Upload;
