import express from 'express';
import CoFounder from '../models/CoFounder.js';
import Simulation from '../models/Simulation.js';
import auth from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Tier price ranges (mid-point used for assignment)
const TIER_PRICES = {
  Newbie:       { min: 5000,  max: 15000,  mid: 10000  },
  Amateur:      { min: 20000, max: 50000,  mid: 35000  },
  Professional: { min: 60000, max: 150000, mid: 95000  },
};

// Score → Tier mapping (quiz is 7 questions, each worth 1 point)
function scoreTier(score) {
  if (score >= 6) return 'Professional';
  if (score >= 4) return 'Amateur';
  return 'Newbie';
}

// Price within tier: varies by exact score
function tierPrice(tier, score) {
  const { min, max } = TIER_PRICES[tier];
  const range = max - min;
  // Map score 0-7 to relative position inside the tier band
  const scoreMap = { Professional: [6,7], Amateur: [4,5], Newbie: [0,1,2,3] };
  const tierScores = scoreMap[tier];
  const pos = (tierScores.indexOf(score) + 1) / (tierScores.length + 1);
  return Math.round(min + range * pos);
}

// ── POST /api/cofounder/submit — Submit quiz result and register as co-founder
router.post('/submit', auth, async (req, res) => {
  try {
    const { name, domain, score, specialty } = req.body;

    // If user already has a PENDING (not recruited) profile, update it
    const existing = await CoFounder.findOne({ userId: req.user.userId, isRecruited: false });
    if (existing) {
      await CoFounder.deleteOne({ _id: existing._id });
    }

    const tier   = scoreTier(score);
    const price  = tierPrice(tier, score);
    const rating = tier === 'Professional' ? (4.3 + Math.random() * 0.6).toFixed(1)
                 : tier === 'Amateur'      ? (3.5 + Math.random() * 0.8).toFixed(1)
                 :                           (2.5 + Math.random() * 1.0).toFixed(1);

    // Fetch user name to fill profile name
    const user = await User.findById(req.user.userId);

    const profile = new CoFounder({
      userId:    req.user.userId,
      name:      name || user?.name || 'Applicant',
      domain,
      tier,
      score,
      specialty,
      bio:       `${tier}-level co-founder specialising in ${specialty} within ${domain}.`,
      price,
      rating:    parseFloat(rating),
      isRecruited: false,
    });
    await profile.save();

    res.status(201).json({ tier, price, rating, profile });
  } catch (err) {
    console.error('CoFounder submit error:', err);
    res.status(500).json({ message: 'Failed to register co-founder' });
  }
});

// ── GET /api/cofounder/pool — Return unrecruited co-founders, filtered by domain and/or tier
router.get('/pool', auth, async (req, res) => {
  try {
    const { domain, tier } = req.query;
    const filter = { isRecruited: false, userId: { $ne: req.user.userId } };
    if (domain && domain !== 'All') filter.domain = domain;
    if (tier   && tier   !== 'All') filter.tier   = tier;
    const pool = await CoFounder.find(filter).sort({ score: -1, createdAt: -1 });
    res.json(pool);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch pool' });
  }
});

// ── GET /api/cofounder/my — Return current user's co-founder profile (if any)
router.get('/my', auth, async (req, res) => {
  try {
    const profile = await CoFounder.findOne({ userId: req.user.userId });
    res.json(profile || null);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// ── POST /api/cofounder/recruit — Founder recruits a co-founder into their simulation
router.post('/recruit', auth, async (req, res) => {
  try {
    const { coFounderId, simulationId } = req.body;

    const cf = await CoFounder.findById(coFounderId);
    if (!cf) return res.status(404).json({ message: 'Co-founder not found' });
    if (cf.isRecruited) return res.status(400).json({ message: 'Already recruited' });

    cf.isRecruited = true;
    cf.recruitedTo = simulationId;
    await cf.save();

    // Mark simulation as having a co-founder
    if (simulationId) {
      await Simulation.findByIdAndUpdate(simulationId, {
        coFounderId:   cf._id,
        coFounderName: cf.name,
        coFounderTier: cf.tier,
        coFounderPrice: cf.price,
      });
    }

    res.json({ ok: true, tier: cf.tier, name: cf.name });
  } catch (err) {
    console.error('Recruit error:', err);
    res.status(500).json({ message: 'Failed to recruit co-founder' });
  }
});

export default router;
