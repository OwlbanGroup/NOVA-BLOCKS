import React from 'react';

const FileInput = ({ accept, onFileChange, error }) => {
    const handleChange = (event) => {
        const file = event.target.files[0];
        onFileChange(file);
    };

    return (
        <div>
            <input type="file" accept={accept} onChange={handleChange} />
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default FileInput;
