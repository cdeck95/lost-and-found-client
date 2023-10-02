import React, { useState } from 'react';
import axios from 'axios';

function EnterLostDisc() {
  const [discData, setDiscData] = useState({
    course: 'Tranquility Trails',
    name: '',
    disc: '',
    phoneNumber: '',
    bin: '',
    dateFound: new Date().toISOString().split('T')[0],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDiscData({ ...discData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    axios.post('/api/found-discs', discData)
      .then((response) => {
        console.log('Disc added:', response.data);
        // You can perform additional actions here, such as clearing the form
      })
      .catch((error) => {
        console.error('Error adding disc:', error);
      });
  };

  return (
    <div>
      <h1>Enter Lost Disc</h1>
      <form onSubmit={handleSubmit}>
        {/* Render form fields here */}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default EnterLostDisc;
