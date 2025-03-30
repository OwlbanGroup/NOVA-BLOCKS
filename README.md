# NOVA BLOCKS

NOVA BLOCKS is a web application similar to TikTok, allowing users to upload and view videos.

## Project Structure

- **frontend/**: Contains the React frontend application.
  - **src/**: Source files for the React application.
    - **App.js**: Main application component.
    - **Home.js**: Home page component.
    - **Upload.js**: Component for uploading videos.
    - **Profile.js**: User profile component.
  - **public/**: Static files like images and HTML.
  
- **backend/**: Contains the Node.js and Express backend server.
  - **index.js**: Main server file that sets up the Express application and routes.
  - **models/**: Database models (e.g., User model).
  - **routes/**: API routes for handling requests.



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

- **AI Recommendations**: The application provides personalized video recommendations based on user behavior.
- **Search Functionality**: Users can search for videos and users using the search bar on the home page.
- **Roadblock Reporting**: Users can report roadblocks they encounter while using the application.
- **Track Roadblock Resolutions**: Users can track the status of reported roadblocks.
- **Suggest Solutions**: Users can suggest solutions for common roadblocks.
- **Minecraft Integration**: Features for sharing Minecraft-related content and community engagement.


- **AI Recommendations**: The application provides personalized video recommendations based on user behavior.
- **Search Functionality**: Users can search for videos and users using the search bar on the home page.


- **User Authentication**: Users can register and log in to their accounts.
- **Video Uploading**: Users can upload videos to share with the community.
- **Video Feed Display**: Users can view a feed of videos uploaded by others.
- **User Profiles**: Each user has a profile page displaying their uploaded videos and information.



- User authentication
- Video uploading
- Video feed display
- User profiles

## Future Improvements

- Implement user authentication with JWT for secure sessions.
- Add video upload functionality with progress indicators.
- Create a video feed that displays trending and recent videos.
- Implement user profiles with customizable settings.
- Enhance AI recommendations with machine learning algorithms for better personalization.
- Expand Minecraft features to include event tracking and community forums.


- Implement user authentication with JWT for secure sessions.
- Add video upload functionality with progress indicators.
- Create a video feed that displays trending and recent videos.
- Implement user profiles with customizable settings.
- Enhance AI recommendations with machine learning algorithms for better personalization.


- Implement user authentication with JWT for secure sessions.
- Add video upload functionality with progress indicators.
- Create a video feed that displays trending and recent videos.
- Implement user profiles with customizable settings.



- Implement user authentication
- Add video upload functionality
- Create a video feed
- Implement user profiles
