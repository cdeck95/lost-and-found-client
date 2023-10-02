import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Disc } from '../App';
import '../styles/Inventory.css'; // Import the CSS file
import { DateTime } from 'luxon';

function Inventory() {
    const [inventory, setInventory] = useState<Disc[]>([]); // Provide the type 'Disc[]'
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredInventory, setFilteredInventory] = useState([]);

  // Assuming your API server is running on localhost:3000
  const API_BASE_URL = 'http://localhost:3001'; // Update the port if needed

  const convertToEST = (utcTimestamp: string) => {
    const dateUTC = DateTime.fromISO(utcTimestamp, { zone: 'utc' });
    const dateEST = dateUTC.setZone('America/New_York');
    return dateEST.toLocaleString(DateTime.DATETIME_SHORT);
  };

 useEffect(() => {
  axios.get(`${API_BASE_URL}/api/inventory`)
    .then((response) => {
      // Convert UTC timestamps to EST
      const convertedInventory = response.data.map((disc: Disc) => ({
        ...disc,
        dateFound: convertToEST(disc.dateFound),
        dateTexted: disc.dateTexted ? convertToEST(disc.dateTexted) : null,
        dateClaimed: disc.dateClaimed ? convertToEST(disc.dateClaimed) : null,
      }));
      
      setInventory(convertedInventory);

      // Filter the inventory based on the search query
      const filtered = convertedInventory.filter((disc: Disc) =>
        disc.phoneNumber.includes(searchQuery) ||
        disc.disc.includes(searchQuery) ||
        disc.name.includes(searchQuery)
      );

      setFilteredInventory(filtered);
    })
    .catch((error) => {
      console.error('Error fetching inventory:', error);
    });
}, [searchQuery]); // Trigger the effect when the searchQuery changes

  const markAsClaimed = (discId: string) => {
    axios.put(`${API_BASE_URL}/api/mark-claimed/${discId}`) // Mark a disc as claimed using the API
      .then((response) => {
        console.log('Disc marked as claimed:', response.data);
        // You can update the local state or perform other actions here
      })
      .catch((error) => {
        console.error('Error marking disc as claimed:', error);
      });
  };

  return (
    <div className="page-container"> 
      <h1>Inventory</h1>
      <div className="search-bar">
      <input
        type="text"
        placeholder="Search by phone number, disc, or name"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
      <table className="inventory-table"> {/* Apply className */}
        <thead>
          <tr>
            <th className="table-header">Course</th> {/* Apply className */}
            <th className="table-header">Name</th> {/* Apply className */}
            <th className="table-header">Disc</th> {/* Apply className */}
            <th className="table-header">Phone Number</th> {/* Apply className */}
            <th className="table-header">Bin</th> {/* Apply className */}
            <th className="table-header">Date Found</th> {/* Apply className */}
            <th className="table-header">Action</th> {/* Apply className */}
          </tr>
        </thead>
        <tbody>
            {filteredInventory.map((disc: Disc) => (
            <tr key={disc.disc}>
              <td className="table-cell">{disc.course}</td> {/* Apply className */}
              <td className="table-cell">{disc.name}</td> {/* Apply className */}
              <td className="table-cell">{disc.disc}</td> {/* Apply className */}
              <td className="table-cell">{disc.phoneNumber}</td> {/* Apply className */}
              <td className="table-cell">{disc.bin}</td> {/* Apply className */}
              <td className="table-cell">{disc.dateFound}</td> {/* Apply className */}
              <td className="table-cell">
                <button onClick={() => markAsClaimed(disc.disc)}>Mark as Claimed</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Inventory;
