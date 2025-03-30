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

app.post('/register', async (req, res) => {
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


app.get('/api/recommendations', (req, res) => {
    // Placeholder for recommendations data
    const recommendations = [
        { id: 1, title: 'Video 1', url: 'path/to/video1.mp4' },
        { id: 2, title: 'Video 2', url: 'path/to/video2.mp4' },
        { id: 3, title: 'Video 3', url: 'path/to/video3.mp4' },
    ];
    res.json(recommendations); // Send recommendations as JSON
});

app.post('/api/roadblocks', (req, res) => {
    const { description } = req.body;
    if (!description) {
        return res.status(400).send('Description is required.');
    }
    // Logic to save the roadblock report to the database (pseudo code)
    // await Roadblock.create({ description, status: 'Reported' });
    res.status(201).send('Roadblock reported successfully!');
});

app.get('/api/roadblocks', (req, res) => {
    // Placeholder for fetching roadblocks from the database (pseudo code)
    const roadblocks = [
        { id: 1, description: 'Example roadblock', status: 'Reported' },
        { id: 2, description: 'Another roadblock', status: 'Resolved' },
    ];
    res.json(roadblocks); // Send roadblocks as JSON
});

app.post('/api/solutions', (req, res) => {
    const { solution } = req.body;
    if (!solution) {
        return res.status(400).send('Solution is required.');
    }
    // Logic to save the suggested solution to the database (pseudo code)
    // await Solution.create({ solution });
    res.status(201).send('Solution suggested successfully!');
});

// Basic route
app.get('/', (req, res) => {
    res.send('Welcome to the NOVA BLOCKS backend!');
});



// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
