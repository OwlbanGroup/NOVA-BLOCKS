import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Arena from './Arena'; // Importing the Arena component
import Payment from './Payment'; // Importing the Payment component

import ArenaDetails from './ArenaDetails'; // Importing the ArenaDetails component
import JoinArena from './JoinArena'; // Importing the JoinArena component
import Gaming from './Gaming'; // Importing the Gaming component
import GamingDetails from './GamingDetails'; // Importing the GamingDetails component
import JoinGaming from './JoinGaming'; // Importing the JoinGaming component
import PC from './PC'; // Importing the PC component
import PCDetails from './PCDetails'; // Importing the PCDetails component
import JoinPC from './JoinPC'; // Importing the JoinPC component

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
          <Route path="/arena" element={<Arena />} /> {/* New route for Arena */}
          <Route path="/payment" element={<Payment />} /> {/* New route for Payment */}

          <Route path="/arena/:id" element={<ArenaDetails />} /> {/* New route for Arena Details */}
          <Route path="/arena/join" element={<JoinArena />} /> {/* New route for joining Arena */}
          <Route path="/gaming" element={<Gaming />} /> {/* New route for Gaming */}
          <Route path="/gaming/:id" element={<GamingDetails />} /> {/* New route for Gaming Details */}
          <Route path="/gaming/join" element={<JoinGaming />} /> {/* New route for joining Gaming */}
          <Route path="/pc" element={<PC />} /> {/* New route for PC */}
          <Route path="/pc/:id" element={<PCDetails />} /> {/* New route for PC Details */}
          <Route path="/pc/join" element={<JoinPC />} /> {/* New route for joining PC */}


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
