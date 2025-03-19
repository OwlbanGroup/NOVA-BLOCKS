import React from 'react';

const Upload = () => {
    return (
        <div>
            <h1>Upload Video</h1>
            <form>
                <input type="file" accept="video/*" />
                <button type="submit">Upload</button>
            </form>
        </div>
    );
};

export default Upload;
