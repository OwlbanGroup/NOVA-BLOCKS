import React, { useState } from 'react';
import FileInput from './FileInput'; // New component for file input
import LoadingIndicator from './LoadingIndicator'; // New component for loading indicator

import { Canvas } from 'react-three-fiber'; // Import for 3D model rendering

const Upload = () => {
const [modelFile, setModelFile] = useState(null);
const [imageFile, setImageFile] = useState(null); // State for image file

    const [fileInputError, setFileInputError] = useState(''); // State for file input error

    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false); // State for success message
    const [loading, setLoading] = useState(false); // State for loading indicator
    const [previewUrl, setPreviewUrl] = useState('');

    const handleFileChange = (file) => {
if (file && (file.type === 'model/stl' || file.type === 'model/obj' || file.type.startsWith('image/'))) {
    if (file.type.startsWith('image/')) {
        setImageFile(file); // Set image file
        setModelFile(null); // Clear model file
    } else {
        setModelFile(file);
        setImageFile(null); // Clear image file
    }

            setModelFile(file);
            setFileInputError('');
setPreviewUrl(URL.createObjectURL(file)); // Set preview URL for both model and image

        } else {
            setFileInputError('Please select a valid 3D model file.');
            setModelFile(null);
            setPreviewUrl('');
        }
    };



    const handleSubmit = async (event) => {
        event.preventDefault();
if (!modelFile && !imageFile) { // Check for both model and image files

            setError('Please select a 3D model file to upload.'); // Update error message
            return;
        }
        setLoading(true); // Start loading
        setError(''); // Clear previous errors
console.log('Uploading:', modelFile || imageFile); // Log the model or image file


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
                <FileInput accept=".stl,.obj" onFileChange={handleFileChange} /> {/* Use new FileInput component */}


                {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}
                {previewUrl && <Canvas>
                    {/* Render the 3D model preview here using a library like three.js */}
                </Canvas>} {/* 3D model preview */}

                <button type="submit" disabled={!modelFile}>Upload</button> {/* Disable button if no file is selected */}
                {success && <p style={{ color: 'green' }}>3D model uploaded successfully!</p>} {/* Display success message */}
                <LoadingIndicator loading={loading} /> {/* Use new LoadingIndicator component */}

            </form>
        </div>
    );
};

export default Upload;
