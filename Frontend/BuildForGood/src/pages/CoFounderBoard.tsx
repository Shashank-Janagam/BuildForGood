import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { CheckCircle2, Lock, Zap, Trophy, Target, Clock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// ─── Static domain-based quiz questions ───────────────────────────────────────
const DOMAINS = ['Climate & Environment', 'Health & Wellness', 'Education', 'Fintech & Inclusion', 'Agriculture', 'Social Impact'];

const QUIZ_BANK: Record<string, { q: string; options: string[]; correct: number }[]> = {
  'Climate & Environment': [
    { q: 'What does ESG stand for?', options: ['Environmental Social Governance', 'Energy Systems Growth', 'Economic Stability Goals', 'Ecological Services Group'], correct: 0 },
    { q: 'Which Indian government scheme funds renewable energy projects?', options: ['PM-KUSUM', 'Jan Dhan Yojana', 'MUDRA', 'PMAY'], correct: 0 },
    { q: 'What is a carbon credit?', options: ['A permit to emit one tonne of CO₂', 'A tax on diesel vehicles', 'A green loan scheme', 'A UN climate fund'], correct: 0 },
    { q: 'Which sector contributes most to India\'s greenhouse gas emissions?', options: ['Energy', 'Agriculture', 'Industry', 'Transport'], correct: 0 },
    { q: 'What is the goal of India\'s National Solar Mission?', options: ['100 GW solar by 2022', '500 GW renewables by 2030', 'Zero coal by 2040', 'Carbon neutral by 2047'], correct: 1 },
    { q: 'A social enterprise has ₹2L budget for a waste project. Each tonne of waste processed costs ₹1,200. How many tonnes can be processed?', options: ['100', '150', '166', '200'], correct: 2 },
    { q: 'What is "circular economy"?', options: ['Closed-loop resource use reducing waste', 'Round-the-clock manufacturing', 'Global trade cycle', 'Continuous GDP growth'], correct: 0 },
  ],
  'Health & Wellness': [
    { q: 'What is the Ayushman Bharat scheme?', options: ['Health insurance for poor families', 'Free medicine distribution', 'Rural hospital construction fund', 'Doctor training program'], correct: 0 },
    { q: 'India\'s infant mortality rate (per 1000 live births) is closest to:', options: ['12', '28', '50', '65'], correct: 1 },
    { q: 'What does "last-mile healthcare" mean?', options: ['Reaching the most underserved communities', 'Hospital ambulance service', 'City-level primary care', 'Last appointment of the day'], correct: 0 },
    { q: 'A clinic serves 80 patients/day at ₹50 revenue each. Monthly revenue is:', options: ['₹1,20,000', '₹40,000', '₹80,000', '₹1,60,000'], correct: 0 },
    { q: 'Which disease is India closest to eradicating?', options: ['Polio', 'Tuberculosis', 'Malaria', 'Dengue'], correct: 0 },
    { q: 'What is telemedicine?', options: ['Remote healthcare via technology', 'TV health commercials', 'Medicine delivery by telephone', 'Robotic surgery'], correct: 0 },
    { q: 'ASHA workers primarily serve which population?', options: ['Rural communities', 'Urban slums', 'Corporate employees', 'Students'], correct: 0 },
  ],
  'Education': [
    { q: 'The Right to Education Act (RTE) ensures free education up to which grade?', options: ['Grade 8', 'Grade 10', 'Grade 5', 'Grade 12'], correct: 0 },
    { q: 'India\'s adult literacy rate is approximately:', options: ['77%', '60%', '90%', '45%'], correct: 0 },
    { q: 'What is the PM e-VIDYA program?', options: ['Digital education initiative', 'Scholarship for engineers', 'Free textbook scheme', 'Teacher training fund'], correct: 0 },
    { q: 'A school earns ₹5000/student/year and has 200 students. If it targets 20% more students, what would its new annual revenue be?', options: ['₹12,00,000', '₹10,00,000', '₹8,00,000', '₹15,00,000'], correct: 0 },
    { q: 'Which pedagogy focuses on student-led discovery rather than lecture?', options: ['Constructivism', 'Behaviourism', 'Direct Instruction', 'Rote Learning'], correct: 0 },
    { q: 'What is the primary barrier to girls\' education in rural India?', options: ['Early marriage & safety concerns', 'Lack of textbooks', 'No schools nearby', 'Language barriers'], correct: 0 },
    { q: 'EdTech stands for:', options: ['Educational Technology', 'Engineering Technology', 'Ethical Technology', 'Enterprise Technology'], correct: 0 },
  ],
  'Fintech & Inclusion': [
    { q: 'What is financial inclusion?', options: ['Access to affordable financial services for all', 'Free bank accounts', 'Zero-interest loans', 'Digital payments only'], correct: 0 },
    { q: 'UPI in India stands for:', options: ['Unified Payments Interface', 'Universal Payment Index', 'United People\'s Initiative', 'Unique Payment ID'], correct: 0 },
    { q: 'Jan Dhan Yojana primarily targets:', options: ['Unbanked population', 'Small businesses', 'Farmers only', 'Students'], correct: 0 },
    { q: 'A microfinance borrower takes ₹25,000 at 18% annual interest. Interest owed after 6 months is:', options: ['₹2,250', '₹4,500', '₹1,800', '₹3,600'], correct: 0 },
    { q: 'What is a Self-Help Group (SHG)?', options: ['Community savings & lending group', 'Govt business grant', 'Stock market club', 'NGO volunteer unit'], correct: 0 },
    { q: 'MUDRA scheme provides loans to:', options: ['Micro and small businesses', 'Large corporations', 'Government departments', 'Foreign investors'], correct: 0 },
    { q: 'What is "credit score" used for?', options: ['Assessing loan repayment ability', 'Measuring savings', 'Insurance premium calculation', 'Tax filing'], correct: 0 },
  ],
  'Agriculture': [
    { q: 'PM-KISAN provides farmers with how much annually?', options: ['₹6,000', '₹12,000', '₹3,000', '₹10,000'], correct: 0 },
    { q: 'What is drip irrigation?', options: ['Water delivery directly to roots', 'Overhead sprinkler system', 'Flood irrigation', 'Rain-fed farming'], correct: 0 },
    { q: 'India is the world\'s largest producer of which crop?', options: ['Milk', 'Rice', 'Wheat', 'Cotton'], correct: 0 },
    { q: 'If a farmer earns ₹80/kg for tomatoes and produces 500 kg, gross revenue is:', options: ['₹40,000', '₹35,000', '₹50,000', '₹20,000'], correct: 0 },
    { q: 'e-NAM is:', options: ['National Agriculture Market online platform', 'Electronic Nitrogen & Mineral scheme', 'Agri-bank mobile app', 'Rural credit card'], correct: 0 },
    { q: 'What does FPO stand for in agriculture?', options: ['Farmer Producer Organisation', 'Farming Policy Office', 'Fertiliser Procurement Order', 'Food Production Outlet'], correct: 0 },
    { q: 'Soil health card helps farmers with:', options: ['Knowing nutrient deficiencies in soil', 'Crop price tracking', 'Weather forecasting', 'Government subsidy claims'], correct: 0 },
  ],
  'Social Impact': [
    { q: 'What is a B-Corporation?', options: ['Business certified for social & environmental performance', 'Banking corporation', 'Borrowing corporation', 'Business startup certificate'], correct: 0 },
    { q: 'CSR in India mandates companies spending ₹__ on social activities:', options: ['2% of net profit', '5% of revenue', '1% of turnover', '10% of tax'], correct: 0 },
    { q: 'The SDG framework has how many goals?', options: ['17', '12', '8', '20'], correct: 0 },
    { q: 'An NGO has 3 programs each costing ₹50,000/month. Annual budget needed is:', options: ['₹18,00,000', '₹12,00,000', '₹6,00,000', '₹24,00,000'], correct: 0 },
    { q: 'Theory of Change in social enterprise means:', options: ['A clear plan of how activities lead to long-term impacts', 'Financial projections', 'Staff rotation policy', 'Market entry strategy'], correct: 0 },
    { q: 'SROI stands for:', options: ['Social Return on Investment', 'Sustainability Reporting for Organisations India', 'State Revenue of India', 'Social Risk Oversight Index'], correct: 0 },
    { q: 'Which Indian law governs NGO foreign funding?', options: ['FCRA', 'FEMA', 'IPC', 'Companies Act'], correct: 0 },
  ],
};

interface QuizQuestion { q: string; options: string[]; correct: number; }
interface CoFounderProfile {
  _id: string; name: string; domain: string; tier: 'Newbie' | 'Amateur' | 'Professional';
  score: number; specialty: string; bio: string; price: number; rating: number;
  isRecruited: boolean;
}

// ─── QUIZ phase ────────────────────────────────────────────────────────────────
function QuizView({ domain, onComplete }: { domain: string; onComplete: (score: number, specialty: string) => void }) {
  const questions: QuizQuestion[] = QUIZ_BANK[domain] || QUIZ_BANK['Social Impact'];
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers]   = useState<boolean[]>([]);
  const [revealed, setRevealed] = useState(false);

  const q = questions[current];
  const progress = ((current) / questions.length) * 100;

  const handleSelect = (idx: number) => {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
    const correct = idx === q.correct;
    const newAnswers = [...answers, correct];

    setTimeout(() => {
      if (current + 1 >= questions.length) {
        const score = newAnswers.filter(Boolean).length;
        onComplete(score, domain);
      } else {
        setAnswers(newAnswers);
        setCurrent(c => c + 1);
        setSelected(null);
        setRevealed(false);
      }
    }, 1000);
  };

  const optColor = (idx: number) => {
    if (!revealed) return 'var(--bg-base)';
    if (idx === q.correct) return 'rgba(16,185,129,0.12)';
    if (idx === selected && idx !== q.correct) return 'rgba(239,68,68,0.1)';
    return 'var(--bg-base)';
  };
  const optBorder = (idx: number) => {
    if (!revealed) return selected === idx ? 'var(--accent-primary)' : 'var(--border-light)';
    if (idx === q.correct) return '#10b981';
    if (idx === selected && idx !== q.correct) return '#ef4444';
    return 'var(--border-light)';
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', width: '100%', animation: 'fadeIn 0.3s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div className="eyebrow-tag">Question {current + 1} of {questions.length}</div>
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          {questions.map((_, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i < current ? '#10b981' : i === current ? 'var(--accent-primary)' : 'var(--border-light)', transition: 'background 0.3s' }} />
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: 'var(--bg-surface-hover)', borderRadius: 2, overflow: 'hidden', marginBottom: '2rem' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent-primary)', transition: 'width 0.4s ease-out' }} />
      </div>

      {/* Question */}
      <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-md)', marginBottom: '1.5rem' }}>
        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '1.75rem' }}>{q.q}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {q.options.map((opt, idx) => (
            <button key={idx} onClick={() => handleSelect(idx)}
              style={{
                textAlign: 'left', padding: '0.9rem 1.1rem', borderRadius: 'var(--radius-md)',
                border: `1.5px solid ${optBorder(idx)}`, background: optColor(idx),
                cursor: revealed ? 'default' : 'pointer', fontFamily: 'inherit',
                color: 'var(--text-primary)', fontSize: '0.95rem', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: '0.75rem'
              }}>
              <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                {String.fromCharCode(65 + idx)}
              </span>
              {opt}
              {revealed && idx === q.correct && <CheckCircle2 size={16} style={{ color: '#10b981', marginLeft: 'auto' }} />}
            </button>
          ))}
        </div>
      </div>

      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        Domain: <strong style={{ color: 'var(--text-secondary)' }}>{domain}</strong>
      </div>
    </div>
  );
}

// ─── RESULT display after quiz ─────────────────────────────────────────────────
function ResultView({ score, total, tier, price, domain, onRegister, isRegistering }: {
  score: number; total: number; tier: string; price: number; domain: string;
  onRegister: () => void; isRegistering: boolean;
}) {
  const tierMeta: Record<string, { color: string; icon: string; desc: string }> = {
    Newbie:       { color: '#10b981', icon: '🌱', desc: 'Entry-level profile. Great for support roles and growing ventures.' },
    Amateur:      { color: '#f59e0b', icon: '⚡', desc: 'Solid practitioner with domain experience. In demand.' },
    Professional: { color: '#8b5cf6', icon: '👑', desc: 'Elite profile. Strategic leader with deep expertise.' },
  };
  const meta = tierMeta[tier] || tierMeta['Newbie'];

  return (
    <div style={{ maxWidth: 540, margin: '0 auto', width: '100%', animation: 'slideUp 0.4s ease-out', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: '0.75rem' }}>{meta.icon}</div>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
        You're a <span style={{ color: meta.color }}>{tier}</span>!
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>{meta.desc}</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Score', value: `${score}/${total}` },
          { label: 'Tier', value: tier },
          { label: 'Monthly Rate', value: `₹${price.toLocaleString('en-IN')}` },
        ].map(m => (
          <div key={m.label} style={{ background: 'var(--bg-base)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>{m.label}</div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: meta.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: `${meta.color}10`, border: `1px solid ${meta.color}30`, borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'left' }}>
        <strong style={{ color: 'var(--text-primary)' }}>What happens next?</strong> Your profile will be added to the {domain} co-founder pool. Founders who completed their Operational Phase can browse and recruit you. Once recruited, you'll collaborate on their venture!
      </div>

      <button onClick={onRegister} disabled={isRegistering} className="btn-solid btn-lg"
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        {isRegistering ? <div className="loader-white" /> : <><Zap size={16} /> Add Me to the Co-Founder Pool!</>}
      </button>
    </div>
  );
}

// ─── REGISTERED confirmation ───────────────────────────────────────────────────
function RegisteredView({ tier, domain }: { tier: string; domain: string }) {
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', width: '100%', textAlign: 'center', animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>✅</div>
      <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>You're in the pool!</h2>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        Your <strong>{tier}</strong> profile has been added to the <strong>{domain}</strong> co-founder pool.
        Founders who complete their Operational Phase can now discover and recruit you!
      </p>
    </div>
  );
}

// ─── BOARD: pool view for browsing/filtering ──────────────────────────────────
function PoolBoardView({ onApply }: { onApply: () => void }) {
  const [pool, setPool]             = useState<CoFounderProfile[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [domainFilter, setDomainFilter] = useState('All');
  // Dynamic domains derived from the loaded pool (custom domains included)
  const [availableDomains, setAvailableDomains] = useState<string[]>(['All']);

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'ngrok-skip-browser-warning': 'true',
  });

  useEffect(() => {
    loadPool();
  }, [domainFilter]);

  const loadPool = async () => {
    setIsLoading(true);
    try {
      const url = domainFilter === 'All'
        ? `${API_URL}/api/cofounder/pool`
        : `${API_URL}/api/cofounder/pool?domain=${encodeURIComponent(domainFilter)}`;
      const res = await fetch(url, { headers: getHeaders() });
      if (res.ok) {
        const data: CoFounderProfile[] = await res.json();
        setPool(data);
        // Build dynamic domain list from all profiles (always fetch all to get domain list)
        if (domainFilter === 'All' && data.length > 0) {
          const uniqueDomains = Array.from(new Set(data.map(cf => cf.domain)));
          setAvailableDomains(['All', ...uniqueDomains]);
        }
      }
    } catch { setPool([]); }
    finally { setIsLoading(false); }
  };

  const tierColor = (t: string) => t === 'Professional' ? '#8b5cf6' : t === 'Amateur' ? '#f59e0b' : '#10b981';

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="eyebrow-tag" style={{ marginBottom: '0.6rem' }}>CO-FOUNDER POOL</div>
          <h1 className="hero-title" style={{ fontSize: 'clamp(1.6rem,3.5vw,2.2rem)', marginBottom: '0.35rem' }}>Quiz-Verified Co-Founders</h1>
          <p className="hero-subtitle" style={{ margin: 0, fontSize: '0.95rem' }}>
            Every profile here has passed a domain quiz. Founders recruit these real applicants.
          </p>
        </div>
        <button onClick={onApply} className="btn-solid" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Target size={16} /> Apply as Co-Founder
        </button>
      </div>

      {/* Domain filter - dynamic chips from pool data */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
        {availableDomains.map(d => (
          <button key={d} onClick={() => setDomainFilter(d)}
            style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius-pill)', border: '1.5px solid var(--border-light)', background: domainFilter === d ? 'var(--text-primary)' : 'var(--bg-base)', color: domainFilter === d ? 'var(--bg-base)' : 'var(--text-primary)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
            {d}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <div className="loader-white" style={{ margin: '0 auto 1rem', borderColor: 'var(--border-light)', borderLeftColor: 'var(--accent-primary)', width: 32, height: 32 }} />
          Loading co-founder pool...
        </div>
      ) : pool.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-base)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
          <Lock size={40} style={{ opacity: 0.25, marginBottom: '1rem' }} />
          <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No co-founders available yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.93rem', marginBottom: '1.5rem' }}>
            Be the first to take the quiz and join the pool!
          </p>
          <button onClick={onApply} className="btn-solid" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={15} /> Take the Quiz Now
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {pool.map(cf => {
            const tc = tierColor(cf.tier);
            return (
              <div key={cf._id} className="feature-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${tc}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tc, fontWeight: 800, fontSize: '1.2rem' }}>
                    {cf.name.charAt(0)}
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-pill)', background: `${tc}15`, color: tc, textTransform: 'uppercase' }}>
                    {cf.tier}
                  </span>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '0.2rem' }}>{cf.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '0.3rem' }}>{cf.specialty}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{cf.domain}</div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1, marginBottom: '1rem' }}>{cf.bio}</p>

                {/* Stars */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.75rem' }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <span key={s} style={{ color: s <= Math.round(cf.rating) ? '#f59e0b' : 'var(--border-light)', fontSize: '0.85rem' }}>★</span>
                  ))}
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.35rem' }}>{cf.rating.toFixed(1)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
                  <div>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: tc }}>₹{cf.price.toLocaleString('en-IN')}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>/mo</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <Trophy size={13} style={{ color: tc }} /> Score: {cf.score}/7
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── DOMAIN SELECTION before quiz ─────────────────────────────────────────────
function DomainSelect({ onSelect }: { onSelect: (d: string) => void }) {
  const [customDomain, setCustomDomain] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const icons: Record<string, string> = {
    'Climate & Environment': '🌿', 'Health & Wellness': '❤️', 'Education': '📚',
    'Fintech & Inclusion': '💳', 'Agriculture': '🌾', 'Social Impact': '🤝'
  };

  const handleCustomSubmit = () => {
    const trimmed = customDomain.trim();
    if (trimmed.length >= 2) onSelect(trimmed);
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', width: '100%', animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎯</div>
        <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Choose Your Domain</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>
          Select a domain or enter your own. You'll answer 7 questions to earn your co-founder tier.
        </p>
      </div>

      {/* Preset domain grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {DOMAINS.map(d => (
          <button key={d} onClick={() => onSelect(d)}
            style={{
              background: 'var(--bg-base)', border: '1.5px solid var(--border-light)', borderRadius: 'var(--radius-lg)',
              padding: '1.5rem 1rem', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center',
              transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-primary)'; (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-light)'; (e.currentTarget as HTMLElement).style.background = 'var(--bg-base)'; }}
          >
            <div style={{ fontSize: '2rem' }}>{icons[d] || '🌟'}</div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{d}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <Clock size={12} /> 7 questions
            </div>
          </button>
        ))}
      </div>

      {/* Custom domain toggle */}
      <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
        {!showCustom ? (
          <button onClick={() => setShowCustom(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: '1.5px dashed var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1.25rem', cursor: 'pointer', fontFamily: 'inherit', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem', width: '100%', justifyContent: 'center', transition: 'all 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-primary)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent-primary)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-light)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}>
            + Add a Custom Domain (e.g. Waste Management, Water, Logistics...)
          </button>
        ) : (
          <div style={{ background: 'var(--bg-base)', border: '1.5px solid var(--accent-primary)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.6rem', fontSize: '0.9rem' }}>✏️ Enter your domain name</div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                value={customDomain}
                onChange={e => setCustomDomain(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCustomSubmit()}
                placeholder="e.g. Waste Management, Water Access, Rural Logistics..."
                style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', background: 'var(--bg-surface)', fontFamily: 'inherit', fontSize: '0.93rem', color: 'var(--text-primary)', outline: 'none' }}
                autoFocus
              />
              <button onClick={handleCustomSubmit} disabled={customDomain.trim().length < 2}
                className="btn-solid"
                style={{ padding: '0.75rem 1.25rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                Start Quiz →
              </button>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Custom domains use general social enterprise questions.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// ─── MAIN EXPORT ───────────────────────────────────────────────────────────────
type View = 'board' | 'domain_select' | 'quiz' | 'result' | 'registered';

export function CoFounderBoardContent() {
  const [view, setView]               = useState<View>('board');
  const [selectedDomain, setDomain]   = useState('');
  const [quizScore, setQuizScore]     = useState(0);
  const [quizSpecialty, setSpecialty] = useState('');
  const [resultTier, setResultTier]   = useState('');
  const [resultPrice, setResultPrice] = useState(0);
  const [isRegistering, setIsReg]     = useState(false);

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'ngrok-skip-browser-warning': 'true',
  });

  const handleDomainSelect = (d: string) => { setDomain(d); setView('quiz'); };

  const handleQuizComplete = (score: number, specialty: string) => {
    setQuizScore(score);
    setSpecialty(specialty);
    // Determine tier client-side for immediate display
    const tier = score >= 6 ? 'Professional' : score >= 4 ? 'Amateur' : 'Newbie';
    const prices: Record<string, number> = { Newbie: 10000, Amateur: 35000, Professional: 95000 };
    setResultTier(tier);
    setResultPrice(prices[tier]);
    setView('result');
  };

  const handleRegister = async () => {
    setIsReg(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    try {
      const res = await fetch(`${API_URL}/api/cofounder/submit`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          name: user.name || 'Applicant',
          domain: selectedDomain,
          score: quizScore,
          specialty: quizSpecialty || selectedDomain,
        }),
      });
      if (res.ok) setView('registered');
    } catch { /* optimistic */ setView('registered'); }
    finally { setIsReg(false); }
  };

  return (
    <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Back nav (not on board) */}
      {view !== 'board' && view !== 'registered' && (
        <button onClick={() => setView(view === 'quiz' ? 'domain_select' : 'board')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.92rem', fontFamily: 'inherit' }}>
          ← Back
        </button>
      )}

      {view === 'board'         && <PoolBoardView onApply={() => setView('domain_select')} />}
      {view === 'domain_select' && <DomainSelect onSelect={handleDomainSelect} />}
      {view === 'quiz'          && <QuizView domain={selectedDomain} onComplete={handleQuizComplete} />}
      {view === 'result'        && (
        <ResultView
          score={quizScore} total={7} tier={resultTier} price={resultPrice}
          domain={selectedDomain} onRegister={handleRegister} isRegistering={isRegistering}
        />
      )}
      {view === 'registered'    && <RegisteredView tier={resultTier} domain={selectedDomain} />}
    </div>
  );
}

export default function CoFounderBoard() {
  return (
    <div className="landing-layout">
      <Navbar />
      <main className="landing-main" style={{ padding: '2rem 2.5rem', display: 'flex', flex: 1 }}>
        <CoFounderBoardContent />
      </main>
    </div>
  );
}
