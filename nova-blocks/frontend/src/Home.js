import React from 'react';

const Home = () => {
    return (
        <div>
            <h1>Welcome to NOVA BLOCKS</h1>
            <p>Explore and share videos with the community!</p>
            <img src="path/to/your/image.jpg" alt="NOVA BLOCKS" /> {/* Adding a visual element */}
            <button onClick={() => window.location.href='/upload'}>Upload Video</button> {/* Call to action */}
            <h2>User Testimonials</h2>
            <p>"NOVA BLOCKS has changed the way I share my creativity!" - User A</p> {/* Adding a testimonial */}
            <p>"I love the community and the content!" - User B</p> {/* Adding a testimonial */}
        </div>
    );
};

export default Home;
