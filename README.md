# NOVA BLOCKS

NOVA BLOCKS is a web application similar to TikTok, allowing users to upload and view videos.

## Project Structure

## Deployment Instructions

To deploy the NOVA BLOCKS application to the MOOLA CLOUD, follow these steps:

1. **Set Up Environment Variables**:
   - Create a `.env` file in the backend directory.
   - Add the following line to specify the MongoDB connection string:
     ```
     MONGODB_URI=your_mongodb_connection_string
     ```

2. **Build the Frontend**:
   - Navigate to the frontend directory:
     ```bash
     cd nova-blocks/frontend
     ```
   - Build the React application:
     ```bash
     npm run build
     ```

3. **Deploy the Backend**:
   - Navigate to the backend directory:
     ```bash
     cd ../backend
     ```
   - Start the server:
     ```bash
     node index.js
     ```

4. **Access the Application**:
   - Once deployed, you can access the NOVA BLOCKS application at the specified URL.

- **frontend/**: Contains the React frontend application.
- **backend/**: Contains the Node.js and Express backend server.

## Setup Instructions

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd nova-blocks/frontend
   ```

2. Start the development server:
   ```bash
   npm start
   ```

### Backend

1. Navigate to the backend directory:
   ```bash
   cd nova-blocks/backend
   ```

2. Start the backend server:
   ```bash
   node index.js
   ```

## Features

- User authentication
- Video uploading
- Video feed display
- User profiles

## Future Improvements

- Implement user authentication
- Add video upload functionality
- Create a video feed
- Implement user profiles
