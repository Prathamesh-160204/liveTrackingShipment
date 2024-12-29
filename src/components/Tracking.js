import React, { useState, useEffect } from 'react';
import MapComponent from './MapComponent';

function Tracking() {
  const [position, setPosition] = useState([51.505, -0.09]); // Default position (London)
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  
  useEffect(() => {
    // Function to handle the success of fetching the position
    const handlePositionSuccess = (position) => {
      const { latitude, longitude } = position.coords;
      setPosition([latitude, longitude]);
    };

    // Function to handle errors
    const handlePositionError = (error) => {
      console.error('Error getting location:', error);
    };

    // Check if geolocation is supported and then get the current position
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(handlePositionSuccess, handlePositionError);
    } else {
      console.error('Geolocation is not supported by this browser.');
    }

    // Optional: Update position periodically or if necessary
    const interval = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(handlePositionSuccess, handlePositionError);
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval); // Clear the interval on component unmount
  }, []);

  const handleSourceChange = (e) => setSource(e.target.value);
  const handleDestinationChange = (e) => setDestination(e.target.value);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Source:', source);
    console.log('Destination:', destination);
  };

  return (
    <div>
      <h2>Live Tracking</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Source:
          <input type="text" value={source} onChange={handleSourceChange} />
        </label>
        <br />
        <label>
          Destination:
          <input type="text" value={destination} onChange={handleDestinationChange} />
        </label>
        <br />
        <button type="submit">Start Tracking</button>
      </form>

      <MapComponent position={position} />
    </div>
  );
}

export default Tracking;
