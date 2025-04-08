import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatComponent from './ChatComponent';
import AlchemicalTransmutation from './AlchemicalTransmutation';
import ArmourOfGod from './ArmourOfGod';
import FaithWalkers from './FaithWalkers';
import LionOfJudahJewelry from './LionOfJudahJewelry';
import QuantumHealthyElementJewelry from './QuantumHealthyElementJewelry';
import Gaming from './Gaming';
import Arena from './Arena';
import GamingDetails from './GamingDetails';
import JoinGaming from './JoinGaming';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={
                    <div>
                        <LionOfJudahJewelry />
                        <ChatComponent />
                        <AlchemicalTransmutation />
                        <ArmourOfGod />
                        <FaithWalkers />
                        <QuantumHealthyElementJewelry />
                    </div>
                }/>
                <Route path="/gaming" element={<Gaming />} />
                <Route path="/arena" element={<Arena />} />
                <Route path="/gaming-details" element={<GamingDetails />} />
                <Route path="/join-gaming" element={<JoinGaming />} />
            </Routes>
        </Router>
    );
};

export default App;
