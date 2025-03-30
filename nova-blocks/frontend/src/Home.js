import React, { useState, useEffect } from 'react';
import debounce from 'lodash.debounce'; // Import debounce function

const Home = () => {
    const [searchTerm, setSearchTerm] = useState(''); // State for search term
    const [searchResults, setSearchResults] = useState([]); // State for search results

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value); // Update search term
        debouncedFetchResults(event.target.value); // Fetch results with debounce
    };

    const fetchResults = async (term) => {
        if (term) {
            try {
                const response = await fetch(`/api/search?query=${term}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setSearchResults(data); // Update search results
            } catch (error) {
                console.error('Error fetching search results:', error);
            }
        } else {
            setSearchResults([]); // Clear results if search term is empty
        }
    };

    const debouncedFetchResults = debounce(fetchResults, 300); // Debounce the fetch function

    return (
        <div>
            <h1>Welcome to NOVA BLOCKS</h1>
            <a href="/hoverboard">Go to AI Hoverboard</a> {/* Link to navigate to the hoverboard feature */}
            <p>Explore and share videos with the community!</p>
            <a href="/ai-food-printing">Try the AI Food Printing Feature!</a> {/* Link to AI food printing feature */}
            <div>
                <input 
                    type="text" 
                    placeholder="Search videos or users..." 
                    value={searchTerm} 
                    onChange={handleSearchChange} 
                /> {/* Search bar */}
                <ul> {/* Display search results */}
                    {searchResults.map(result => (
                        <li key={result.id}>{result.title}</li> // Display search results
                    ))}
                </ul>
            </div> {/* Ensure this div is properly closed */}
        </div>
    );
};

export default Home;
