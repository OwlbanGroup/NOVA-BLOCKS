import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar'; // Importing the Navbar component


function App() {
  return (
    <Router>
      <div className="App">
        <Navbar /> {/* Adding the Navbar component */}
        <h1>NOVA BLOCKS</h1>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
}



export default App;
