import React from 'react';
import ChatComponent from './ChatComponent'; // Importing the new ChatComponent
import AlchemicalTransmutation from './AlchemicalTransmutation'; // Importing the new AlchemicalTransmutation component

import LionOfJudahJewelry from './LionOfJudahJewelry';
import QuantumHealthyElementJewelry from './QuantumHealthyElementJewelry';


const App = () => {
    return (
        <div>
        <LionOfJudahJewelry />
        <ChatComponent />  // Adding the ChatComponent to the main application
        <AlchemicalTransmutation /> // Adding the AlchemicalTransmutation component to the main application


            <QuantumHealthyElementJewelry />
        </div>
    );
};

export default App;
