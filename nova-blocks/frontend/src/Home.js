import React, { useState } from 'react';

const Home = () => {
    const [searchTerm, setSearchTerm] = useState(''); // State for search term

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value); // Update search term
    };

    return (
        <div>
            <h1>Welcome to NOVA BLOCKS</h1>
            <a href="/hoverboard">Go to AI Hoverboard</a> {/* Link to navigate to the hoverboard feature */}

<p>Explore and share videos with the community!</p>
<a href="/ai-food-printing">Try the AI Food Printing Feature!</a> {/* Link to AI food printing feature */}

            <input 
                type="text" 
                placeholder="Search videos or users..." 
                value={searchTerm} 
                onChange={handleSearchChange} 
            /> {/* Search bar */}
        </div>
    );
};

export default Home;
