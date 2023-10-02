import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import EnterLostDisc from './components/EnterLostDisc';
import Inventory from './components/Inventory';

// Define a Disc interface
export interface Disc {
  course: string;
  name: string;
  disc: string;
  phoneNumber: string;
  bin: string;
  dateFound: string;
  dateTexted?: string | null;
  dateClaimed?: string | null;
  status: string;
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/enter-lost-disc" Component={EnterLostDisc} />
          <Route path="/inventory" Component={Inventory} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
