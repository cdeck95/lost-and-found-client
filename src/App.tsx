import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import EnterLostDisc from './components/EnterLostDisc';
import Inventory from './components/Inventory';
import './styles/App.css';
import { Button, ButtonGroup, Typography } from '@mui/material'; // Import Button and ButtonGroup from MUI


// Define a Disc interface
export interface Disc {
  id?: number;
  course: string;
  name: string;
  disc: string;
  phoneNumber: string;
  bin: string;
  dateFound: string;
  dateTexted?: string | null;
  dateClaimed?: string | null;
  status: string;
  comments?: string | null;
}

export const API_BASE_URL = 'http://localhost:3001'; // Update the port if needed
//export const API_BASE_URL = 'http://127.0.0.1:5000'; // Update the port if needed


function App() {
  const [activeTab, setActiveTab] = useState('enterLostDisc'); // Default active tab

  const switchTab = (tabName: string) => {
    setActiveTab(tabName);
  };

 
  return (
    <div className="App">
      <header className="App-header">
        <Typography sx={{ color: 'white', fontSize: "3.5rem"}}>Tranquility Trails Lost and Found</Typography>
        <nav>
          <ButtonGroup variant="contained" color="primary">
            <Button
              onClick={() => switchTab('enterLostDisc')}
              color={activeTab === 'enterLostDisc' ? "primary" : "inherit"}
              className={activeTab === 'enterLostDisc' ? 'active' : ''}
            >
              Enter Lost Disc
            </Button>
            <Button
              onClick={() => switchTab('inventory')}
              color={activeTab === 'inventory' ? "primary" : "inherit"}
              className={activeTab === 'inventory' ? 'active' : ''}
            >
              Inventory
            </Button>
          </ButtonGroup>
        </nav>
      </header>
      <main>
        {activeTab === 'enterLostDisc' && <EnterLostDisc />}
        {activeTab === 'inventory' && <Inventory />}
      </main>
    </div>
  );
}

export default App;
