// pages/api/validate.js
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { zone, password } = req.body;
  if (!zone || !password) {
    return res.status(400).json({ error: 'Zone and password required' });
  }

  try {
    const client = await clientPromise;
    const db = client.db("event-pass-db");
    const collection = db.collection('doctorsDetails');

    // Try to find a zone-specific password
    let record = await collection.findOne({ password, zone });

    // If not found, try to find a universal password (universal: true)
    if (!record) {
      record = await collection.findOne({ password, universal: true });
    }

    if (!record) {
      // Use a more general error message now that 'used' is irrelevant
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Password is valid, no need to mark as used anymore

    // Define zone-specific redirect URLs
    const zoneRedirects = {
      food: 'https://designblast.org',
      conference: 'https://symbolandemoji.com',
      chill: 'https://www.youtube.com/'
    };

    const redirectUrl = zoneRedirects[zone];
    if (!redirectUrl) {
      return res.status(500).json({ error: 'Zone URL not configured' });
    }

    return res.status(200).json({ url: redirectUrl });
  } catch (error) {
    console.error("Error in API:", error);
    return res.status(500).json({ error: 'Server error' });
  }
}
