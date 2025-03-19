import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>NOVA BLOCKS</h1>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  );
}


export default App;
