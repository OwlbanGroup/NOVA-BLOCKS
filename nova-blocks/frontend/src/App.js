import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar'; // Importing the Navbar component
import Recommendations from './Recommendations'; // Importing the Recommendations component
import Hoverboard from './Hoverboard'; // Importing the Hoverboard component

import LionOfJudahJewelry from './LionOfJudahJewelry'; // Importing the LionOfJudahJewelry component

import HealthySuperElements from './HealthySuperElements'; // Importing the HealthySuperElements component




function App() {
  return (
    <Router>
      <div className="App">
        <Navbar /> {/* Adding the Navbar component */}
        <h1>NOVA BLOCKS</h1>
        <Recommendations /> {/* Adding the Recommendations component */}
        <Routes>

          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/healthy-super-elements" element={<HealthySuperElements />} /> {/* Adding route for HealthySuperElements */}
          <Route path="/hoverboard" element={<Hoverboard />} /> {/* Adding route for Hoverboard */}

          <Route path="/lion-of-judah-jewelry" element={<LionOfJudahJewelry />} /> {/* Adding route for LionOfJudahJewelry */}
        </Routes>


      </div>
    </Router>
  );
}



export default App;
