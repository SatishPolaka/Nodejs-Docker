const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Set up EJS for templating
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse JSON bodies
app.use(express.json());
// Serve static files (like style.css)
app.use(express.static(path.join(__dirname, 'public')));

// --- MOCK DATA ---
const flights = [
  { id: 'FL001', airline: 'SkyHigh', from: 'JFK', to: 'LHR', price: 450, time: '08:00 AM' },
  { id: 'FL002', airline: 'Oceanic', from: 'LAX', to: 'CDG', price: 620, time: '11:30 AM' },
  { id: 'FL003', airline: 'AeroJet', from: 'ORD', to: 'NRT', price: 890, time: '02:15 PM' }
];

// Pre-defined occupied seats (1A, 1B, 2C, 3D are taken)
const occupiedSeats = new Set(['1A', '1B', '2C', '3D']);

// --- ROUTES ---

// Home page
app.get('/', (req, res) => {
  res.render('index', { flights: flights, occupiedSeats: Array.from(occupiedSeats) });
});

// API endpoint to book a flight
app.post('/api/book', (req, res) => {
  const { flightId, seats } = req.body;

  if (!flightId || !seats || seats.length === 0) {
    return res.status(400).json({ success: false, message: 'Missing flight or seats.' });
  }

  const flight = flights.find(f => f.id === flightId);
  if (!flight) {
    return res.status(404).json({ success: false, message: 'Flight not found.' });
  }

  // Check if any seat is already taken
  for (let seat of seats) {
    if (occupiedSeats.has(seat)) {
      return res.status(409).json({ success: false, message: `Seat ${seat} is already taken.` });
    }
  }

  // Mark seats as occupied
  seats.forEach(seat => occupiedSeats.add(seat));

  // Calculate total
  const total = seats.length * flight.price;
  const bookingRef = `FL-${Math.floor(10000 + Math.random() * 90000)}`;

  res.json({
    success: true,
    message: `Successfully booked ${seats.length} seat(s) on ${flight.airline} flight ${flight.id}.`,
    bookingRef: bookingRef,
    total: total.toFixed(2),
    seats: seats
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✈️ Flight booking server running at http://localhost:${PORT}`);
});
