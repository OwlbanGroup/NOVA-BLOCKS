import React, { useState } from 'react';
import { Canvas } from 'react-three-fiber'; // Import for 3D model rendering

const Upload = () => {
    const [modelFile, setModelFile] = useState(null); // State for model file
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false); // State for success message
    const [loading, setLoading] = useState(false); // State for loading indicator
    const [previewUrl, setPreviewUrl] = useState('');

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && (file.type === 'model/stl' || file.type === 'model/obj')) { // Check for 3D model types
            setModelFile(file);
            setError('');
            setPreviewUrl(URL.createObjectURL(file)); // Create a preview URL
        } else {
            setError('Please select a valid 3D model file.'); // Update error message
            setModelFile(null);
            setPreviewUrl('');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!modelFile) {
            setError('Please select a 3D model file to upload.'); // Update error message
            return;
        }
        setLoading(true); // Start loading
        setError(''); // Clear previous errors
        console.log('Uploading:', modelFile); // Log the model file

        // Simulate upload process
        setTimeout(() => {
            setLoading(false); // Stop loading
            setSuccess(true); // Set success message
        }, 2000); // Simulate a 2-second upload time
    };

    return (
        <div>
            <h1>Upload 3D Model</h1> {/* Update heading */}
            <form onSubmit={handleSubmit}>
                <input type="file" accept=".stl,.obj" onChange={handleFileChange} /> {/* Change accepted file types */}

                {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}
                {previewUrl && <Canvas>
                    {/* Render the 3D model preview here using a library like three.js */}
                </Canvas>} {/* 3D model preview */}

                <button type="submit" disabled={!modelFile}>Upload</button> {/* Disable button if no file is selected */}
                {success && <p style={{ color: 'green' }}>3D model uploaded successfully!</p>} {/* Display success message */}
                {loading && <p>Uploading...</p>} {/* Display loading indicator */}
            </form>
        </div>
    );
};

export default Upload;
