import express from 'express';
import { mongoStorage } from '../db/mongo-storage';

const router = express.Router();

// Get all doctors
router.get('/', async (req, res) => {
  try {
    console.log('Fetching doctors from MongoDB...');
    const doctors = await mongoStorage.getAllDoctors();
    console.log('Fetched doctors:', doctors);
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// Get doctors by specialty
router.get('/specialty/:specialty', async (req, res) => {
  try {
    const { specialty } = req.params;
    const doctors = await mongoStorage.getDoctorsBySpecialty(specialty);
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors by specialty:', error);
    res.status(500).json({ error: 'Failed to fetch doctors by specialty' });
  }
});

// Get doctors by location
router.get('/location/:location', async (req, res) => {
  try {
    const { location } = req.params;
    const doctors = await mongoStorage.getDoctorsByLocation(location);
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors by location:', error);
    res.status(500).json({ error: 'Failed to fetch doctors by location' });
  }
});

export default router; 