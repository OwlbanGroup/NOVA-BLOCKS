import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar'; // Importing the Navbar component
import AiSuperFoodPaste from './AiSuperFoodPaste'; // Importing the AiSuperFoodPaste component

import Recommendations from './Recommendations'; // Importing the Recommendations component
import SuperFoodPasteScience from './SuperFoodPasteScience'; // Importing the SuperFoodPasteScience component

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
<Route path="/ai-food-printing" element={<AiFoodPrinting />} /> {/* New route for AI food printing */}

<Route path="/profile" element={<Profile />} />
<Route path="/ai-super-food-paste" element={<AiSuperFoodPaste />} /> {/* New route for AI super food paste */}

<Route path="/healthy-super-elements" element={<HealthySuperElements />} /> {/* Adding route for HealthySuperElements */}
<Route path="/super-food-paste-science" element={<SuperFoodPasteScience />} /> {/* New route for Super Food Paste Science */}

          <Route path="/hoverboard" element={<Hoverboard />} /> {/* Adding route for Hoverboard */}

          <Route path="/lion-of-judah-jewelry" element={<LionOfJudahJewelry />} /> {/* Adding route for LionOfJudahJewelry */}
        </Routes>


      </div>
    </Router>
  );
}



export default App;
