const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const PORT = process.env.PORT || 5000;
const pqCrypto = require('pqcrypto'); // Importing post-quantum cryptography library

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/novablocks', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware for logging requests
app.use(morgan('combined'));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Middleware for CORS support
app.use(cors());

// Middleware to parse JSON requests
app.use(express.json());

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.post('/api/arena/create', async (req, res) => {

    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Username and password are required.');
    }
    // Use post-quantum cryptography for password hashing
    const hashedPassword = await pqCrypto.hash(password);
    // Save user to the database (pseudo code)
    // await User.create({ username, password: hashedPassword });
    res.status(201).send('User registered successfully!');
});

app.get('/api/arena/:id', (req, res) => {

    // Placeholder for recommendations data
    const recommendations = [
        { id: 1, title: 'Video 1', url: 'path/to/video1.mp4' },
        { id: 2, title: 'Video 2', url: 'path/to/video2.mp4' },
        { id: 3, title: 'Video 3', url: 'path/to/video3.mp4' },
    ];
    res.json(recommendations); // Send recommendations as JSON
});

app.post('/api/arena/join', (req, res) => {

    const { description } = req.body;
    if (!description) {
        return res.status(400).send('Description is required.');
    }
    // Logic to save the roadblock report to the database (pseudo code)
    // await Roadblock.create({ description, status: 'Reported' });
    res.status(201).send('Roadblock reported successfully!');
});

app.get('/api/gaming/recommendations', (req, res) => {

    // Placeholder for fetching roadblocks from the database (pseudo code)
    const roadblocks = [
        { id: 1, description: 'Example roadblock', status: 'Reported' },
        { id: 2, description: 'Another roadblock', status: 'Resolved' },
    ];
    res.json(roadblocks); // Send roadblocks as JSON
});

app.post('/api/pc/create', async (req, res) => {

    const { solution } = req.body;
    if (!solution) {
        return res.status(400).send('Solution is required.');
    }
    // Logic to save the suggested solution to the database (pseudo code)
    // await Solution.create({ solution });
    res.status(201).send('Solution suggested successfully!');
});

app.get('/api/pc/:id', (req, res) => {

    const { ingredients } = req.body; // Get ingredients from the request body
    if (!ingredients || ingredients.trim() === '') {
        return res.status(400).send('No valid ingredients provided.');
    }

    // Logic to create the food paste from the ingredients
    const foodPaste = `Created food paste with: ${ingredients}`;
    // Here you can implement further processing or storage of foodPaste

    // Here you can implement the logic to process the ingredients and create the food paste.
    
    res.status(201).send('AI super food paste created successfully!');
});

app.use('/api', require('./payment')); // Integrating payment route

app.post('/api/pc/join', (req, res) => {
    res.send('Welcome to the NOVA BLOCKS backend!');
});

// AI Super Food Paste endpoint
app.post('/api/create-food-paste', async (req, res) => {
    try {
        const { ingredients } = req.body;
        
        // Input validation
        if (!ingredients || typeof ingredients !== 'string' || ingredients.trim() === '') {
            return res.status(400).json({ error: 'Valid ingredients string required' });
        }

        // Basic AI processing (will enhance with actual API calls)
        const ingredientList = ingredients.split(',').map(i => i.trim());
        const analysis = {
            ingredients: ingredientList,
            nutrition: {}, // Placeholder for API data
            suggestions: [] // Placeholder for AI suggestions
        };

        // TODO: Add actual nutrition API integration
        // Example: const nutritionData = await fetchNutritionData(ingredientList);
        
        res.json({
            success: true,
            message: `Created food paste with: ${ingredients}`,
            analysis
        });
    } catch (error) {
        console.error('Food paste creation error:', error);
        res.status(500).json({ 
            error: 'Failed to create food paste',
            details: error.message 
        });
    }
});

app.get('/api/arena/recommendations', (req, res) => {
    // Placeholder for arena recommendations
    const arenaRecommendations = [
        { id: 1, title: 'Arena Experience 1', description: 'Description for experience 1' },
        { id: 2, title: 'Arena Experience 2', description: 'Description for experience 2' },
    ];
    res.json(arenaRecommendations); // Send arena recommendations as JSON


}); // Closing the last route
app.post('/api/golds/enhance', (req, res) => {
    // Logic to enhance gold capabilities
    const { feature } = req.body;
    if (!feature) {
        return res.status(400).send('Feature is required.');
    }
    // Implement enhancement logic here
    res.status(201).send(`Gold capabilities enhanced with feature: ${feature}`);
});

app.get('/api/golds/recommendations', (req, res) => {
    // Logic to fetch recommendations related to gold capabilities
    const recommendations = [
        { id: 1, title: 'Gold Feature 1', description: 'Description for feature 1' },
        { id: 2, title: 'Gold Feature 2', description: 'Description for feature 2' },
    ];
    res.json(recommendations); // Send recommendations as JSON
});

app.listen(PORT, () => {

    console.log(`Server is running on http://localhost:${PORT}`);
});
