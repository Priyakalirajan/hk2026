const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// API Root
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to OBL SwiftOnboard API' });
});

// Mock KYC Endpoint - PAN
app.post('/api/kyc/pan', (req, res) => {
  const { panNumber } = req.body;
  if (!panNumber) return res.status(400).json({ success: false, error: 'PAN is required' });
  
  // Simulate API response
  res.json({
    success: true,
    data: {
      panNumber,
      legalName: 'TEST ENTERPRISES',
      entityType: 'Company',
      status: 'Active'
    }
  });
});

// Start a local server if not running on Vercel
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running locally on port ${PORT}`);
  });
}

// Export the app for Vercel
module.exports = app;
