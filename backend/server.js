const express = require('express');
// const { Pool } = require('pg');
const http = require('http');
const WebSocket = require('ws');

const app = express();
// const pool = new Pool();  // Configure your PostgreSQL connection

// WebSocket setup for real-time updates
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Supplier's and Warehouse Operator's locations
const supplierLocation = { latitude: 40.7128, longitude: -74.0060 };  // New York
const warehouseLocation = { latitude: 34.0522, longitude: -118.2437 };  // Los Angeles

wss.on('connection', (ws, req) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log(`Received: ${message}`);
    });

    ws.on('close', () => console.log('Client disconnected'));
});

// Function to simulate package movement
function simulatePackageMovement(shipmentId) {
    const totalSteps = 20;
    let currentStep = 0;

    const movePackage = () => {
        if (currentStep <= totalSteps) {
            const latitude = supplierLocation.latitude + (warehouseLocation.latitude - supplierLocation.latitude) * (currentStep / totalSteps);
            const longitude = supplierLocation.longitude + (warehouseLocation.longitude - supplierLocation.longitude) * (currentStep / totalSteps);

            const update = {
                shipmentId,
                latitude,
                longitude,
                timestamp: new Date(),
                source: supplierLocation,
                destination: warehouseLocation
            };

            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(update));
                }
            });

            currentStep += 1;
        } else {
            clearInterval(interval);
        }
    };

    const interval = setInterval(movePackage, 5000);  // Update every 5 seconds
}

simulatePackageMovement(1);

server.listen(3000, () => console.log('Server running on port 3000'));
