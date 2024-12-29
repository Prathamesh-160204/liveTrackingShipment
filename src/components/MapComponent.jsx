import { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Custom shipment icon
const shipmentIcon = new L.Icon({
  iconUrl: require("./download.png"), // Replace with the correct path
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Default custom icon (if needed, you can replace it with your own icon)
const customIcon = new L.Icon({
  iconUrl: require("leaflet/dist/images/marker-icon.png"), // Default Leaflet marker icon
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function App() {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [GPSLatitude, setGPSLatitude] = useState(null);
  const [GPSLongitude, setGPSLongitude] = useState(null);
  const [destinationLatitude, setDestinationLatitude] = useState("");
  const [destinationLongitude, setDestinationLongitude] = useState("");
  const [shipmentPosition, setShipmentPosition] = useState(null);
  const [userAddress, setUserAddress] = useState("");

  const geo = navigator.geolocation;

  useEffect(() => {
    geo.getCurrentPosition(userCoords);
    geo.watchPosition(userGPSCoords);
  }, []);
  useEffect(() => {
    if (latitude && longitude && destinationLatitude && destinationLongitude) {
      setShipmentPosition([latitude, longitude]); // Initialize shipment position
      moveShipment(); // Start moving the shipment
    }
  }, [latitude, longitude, destinationLatitude, destinationLongitude]); // Dependencies

  // Function to move shipment towards destination
  const moveShipment = useCallback(() => {
    if (!shipmentPosition || !destinationLatitude || !destinationLongitude) return;
  
    const interval = setInterval(() => {
      setShipmentPosition((prevPosition) => {
        const [prevLat, prevLng] = prevPosition;
        const latDiff = destinationLatitude - prevLat;
        const lngDiff = destinationLongitude - prevLng;
  
        // Calculate the new position by moving a small step
        const stepSize = 0.001; // You can adjust this value to change speed
        const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
  
        if (distance < stepSize) {
          clearInterval(interval); // Stop the interval when the destination is reached
          return [destinationLatitude, destinationLongitude];
        }
  
        const newLat = prevLat + (latDiff / distance) * stepSize;
        const newLng = prevLng + (lngDiff / distance) * stepSize;
  
        return [newLat, newLng];
      });
    }, 100); // Update position every 100ms for smoother movement
  
    return () => clearInterval(interval); // Cleanup on component unmount or dependency change
  }, [shipmentPosition, destinationLatitude, destinationLongitude]);

 

  function userCoords(position) {
    const userLatitude = position.coords.latitude;
    const userLongitude = position.coords.longitude;
    setGPSLatitude(userLatitude);
    setGPSLongitude(userLongitude);
    setShipmentPosition([userLatitude, userLongitude]); // Start shipment at GPS location
  }

  const getUserAddress = async () => {
    let url = `https://api.opencagedata.com/geocode/v1/json?key=YOUR_API_KEY&q=${latitude},${longitude}&pretty=1&no_annotations=1`;
    const loc = await fetch(url);
    const data = await loc.json();
    console.log("User Address: ", data);
    setUserAddress(data.results[0].formatted);
  };

  const handleUserAddress = () => {
    getUserAddress();
  };

  function userGPSCoords(position) {
    const userGPSLatitude = position.coords.latitude;
    const userGPSLongitude = position.coords.longitude;
    setLatitude(userGPSLatitude);
    setLongitude(userGPSLongitude);
  }

  return (
    <>
      <h1>
        Current Location
        <button onClick={handleUserAddress}>Get User Address</button>
      </h1>
      <h2>User Address: {userAddress}</h2>

      <h1>GPS Tracking</h1>
      <h2>GPS Latitude: {GPSLatitude}</h2>
      <h2>GPS Longitude: {GPSLongitude}</h2>

      <div>
        <h2>Enter Destination Coordinates</h2>
        <label>
          Latitude:
          <input
            type="number"
            value={destinationLatitude}
            onChange={(e) => setDestinationLatitude(parseFloat(e.target.value))}
          />
        </label>
        <br />
        <label>
          Longitude:
          <input
            type="number"
            value={destinationLongitude}
            onChange={(e) => setDestinationLongitude(parseFloat(e.target.value))}
          />
        </label>
      </div>

      {latitude && longitude && (
        <MapContainer center={[latitude, longitude]} zoom={13} style={{ height: "400px", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={[latitude, longitude]} icon={customIcon}>
            <Popup>Your location</Popup>
          </Marker>
          {destinationLatitude && destinationLongitude && (
            <>
              <Marker position={[destinationLatitude, destinationLongitude]} icon={customIcon}>
                <Popup>Destination</Popup>
              </Marker>
              <Polyline
                positions={[
                  [latitude, longitude],
                  [destinationLatitude, destinationLongitude],
                ]}
                color="blue"
              />
              {shipmentPosition && (
                <Marker position={shipmentPosition} icon={shipmentIcon}>
                  <Popup>Shipment</Popup>
                </Marker>
              )}
            </>
          )}
        </MapContainer>
      )}
    </>
  );
}

export default App;
