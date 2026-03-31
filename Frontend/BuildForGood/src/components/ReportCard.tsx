import { useEffect, useState, useMemo } from 'react';

// Types
interface Decision {
  scenarioId: string;
  choiceLabel: string;
  deltas: { cash: number; impact: number; trust: number };
}

interface MVPFeature {
  id: string;
  name: string;
}

interface FundingOffer {
  investorName: string;
  amount: string;
  equity: string;
}

export interface ReportCardProps {
  resources: { cash: number; impact: number; trust: number };
  decisionLog: Decision[];
  mvpFeatures: MVPFeature[];
  fundingDetails: FundingOffer | null;
}

// Helpers
const clamp = (val: number, min = 0, max = 100) => Math.max(min, Math.min(max, val));

// SVG Circle Config
const SIZE = 140;
const STROKE = 8;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = RADIUS * 2 * Math.PI;

export default function ReportCard({ resources, decisionLog, mvpFeatures, fundingDetails }: ReportCardProps) {
  // Animation state to trigger dashed offset transitions on mount
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Ensure values are within 0-100
  const finalCash = clamp(resources.cash);
  const finalImpact = clamp(resources.impact);
  const finalTrust = clamp(resources.trust);

  // Verdict
  let verdictLabel = 'Venture Struggling';
  let verdictEmoji = '⚠️';
  if (finalCash > 0 && finalImpact > 20) {
    verdictLabel = 'Venture Survived!';
    verdictEmoji = '🏆';
  }
  if (finalCash <= 0 || finalTrust <= 10) {
    verdictLabel = 'Venture Failed';
    verdictEmoji = '💥';
  }

  // Archetype System
  const getArchetype = () => {
    if (finalCash > 70 && finalImpact > 70) return { title: 'Balanced Founder', icon: '⚖️', desc: 'Maintained both capital and social mission.' };
    if (finalCash > 70 && finalImpact < 50) return { title: 'Efficient Operator', icon: '⚙️', desc: 'Focused relentlessly on runway and margins.' };
    if (finalImpact > 70 && finalCash < 50) return { title: 'Mission Driver', icon: '🌱', desc: 'Maximized impact over absolute capital.' };
    if (finalTrust > 70) return { title: 'Strategic Builder', icon: '🏗️', desc: 'Prioritized community relationships.' };
    return { title: 'Emerging Leader', icon: '🚀', desc: 'Navigated the chaos of early startup life.' };
  };
  const archetype = getArchetype();

  // History calculation for Chart & Timeline
  const history = useMemo(() => {
    let currentCash = finalCash;
    let currentImpact = finalImpact;
    let currentTrust = finalTrust;

    // Go backwards to find starting values
    const logReversed = [...decisionLog].reverse();
    for (const d of logReversed) {
      currentCash -= d.deltas.cash;
      currentImpact -= d.deltas.impact;
      currentTrust -= d.deltas.trust;
    }

    // Now build forward array
    const points = [{ step: 0, cash: currentCash, impact: currentImpact, trust: currentTrust, label: 'Start' }];
    for (let i = 0; i < decisionLog.length; i++) {
      const d = decisionLog[i];
      currentCash = clamp(currentCash + d.deltas.cash);
      currentImpact = clamp(currentImpact + d.deltas.impact);
      currentTrust = clamp(currentTrust + d.deltas.trust);
      points.push({
        step: i + 1,
        cash: currentCash,
        impact: currentImpact,
        trust: currentTrust,
        label: d.choiceLabel || `Decision ${i + 1}`
      });
    }
    return points;
  }, [finalCash, finalImpact, finalTrust, decisionLog]);

  // Chart Configuration
  const CHART_WIDTH = 400;
  const CHART_HEIGHT = 200;
  const numPoints = history.length;
  const PADDING_Y = 20;
  
  const getX = (index: number) => (index / (numPoints - 1 || 1)) * CHART_WIDTH;
  const getY = (val: number) => CHART_HEIGHT - PADDING_Y - (val / 100) * (CHART_HEIGHT - PADDING_Y * 2);

  const cashPoints = history.map((p, i) => `${getX(i)},${getY(p.cash)}`).join(' ');
  const impactPoints = history.map((p, i) => `${getX(i)},${getY(p.impact)}`).join(' ');

  const cashPath = `M0,${CHART_HEIGHT} L${cashPoints} L${CHART_WIDTH},${CHART_HEIGHT} Z`;
  const impactPath = `M0,${CHART_HEIGHT} L${impactPoints} L${CHART_WIDTH},${CHART_HEIGHT} Z`;

  // MVP Emojis
  const getEmojiForFeature = (name: string) => {
    const l = name.toLowerCase();
    if (l.includes('auth') || l.includes('login') || l.includes('security')) return '🔐';
    if (l.includes('offline') || l.includes('sync')) return '📶';
    if (l.includes('ai') || l.includes('bot')) return '🤖';
    if (l.includes('payment') || l.includes('upi') || l.includes('loan')) return '💳';
    if (l.includes('community') || l.includes('forum')) return '👥';
    if (l.includes('map') || l.includes('geo') || l.includes('location')) return '📍';
    if (l.includes('reward') || l.includes('gamification')) return '🏆';
    if (l.includes('blockchain') || l.includes('ledger')) return '⛓';
    if (l.includes('dashboard') || l.includes('analytics')) return '📊';
    if (l.includes('sms') || l.includes('alert')) return '📱';
    if (l.includes('video') || l.includes('audio')) return '🎬';
    return '✦';
  };

  return (
    <div style={{
      maxWidth: 900,
      margin: '0 auto',
      padding: '2rem',
      background: 'var(--bg-base, #ffffff)',
      borderRadius: 'var(--radius-xl)',
      color: 'var(--text-primary)',
      fontFamily: 'inherit',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    }}>
      <style>{`
        @keyframes drawRing {
          from { stroke-dashoffset: ${CIRCUMFERENCE}; }
          to { stroke-dashoffset: var(--target-offset); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes drawLine {
          from { stroke-dasharray: 1000; stroke-dashoffset: 1000; }
          to { stroke-dasharray: 1000; stroke-dashoffset: 0; }
        }
        @keyframes drawDonut {
          from { stroke-dasharray: 0 100; }
          to { stroke-dasharray: var(--target-chart) 100; }
        }
        @keyframes pulseBorder {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .anim-ring {
          stroke-dasharray: ${CIRCUMFERENCE};
          transition: stroke-dashoffset 0.8s ease-out;
        }
        .stagger-item {
          opacity: 0;
          animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .tooltip-container { position: relative; }
        .tooltip-container:hover .tooltip { opacity: 1; visibility: visible; }
        .tooltip {
          position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%) translateY(-8px);
          background: var(--bg-surface); padding: 4px 8px; border-radius: 4px; font-size: 0.75rem;
          white-space: nowrap; opacity: 0; visibility: hidden; transition: 0.2s; pointer-events: none;
          border: 1px solid var(--border-light); z-index: 10;
        }
      `}</style>

      {/* Row 1: Hero Score Rings & Archetype */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '3rem', position: 'relative' }}>
        
        {/* Archetype Badge (Top Right) */}
        <div style={{
          position: 'absolute', top: 0, right: 0,
          background: 'var(--bg-surface)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.75rem',
          animation: 'pulseBorder 3s infinite'
        }}>
          <div style={{ fontSize: '1.5rem' }}>{archetype.icon}</div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.7, textTransform: 'uppercase' }}>Archetype</div>
            <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{archetype.title}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{archetype.desc}</div>
          </div>
        </div>

        {/* Concentric Rings */}
        <div style={{ position: 'relative', width: 220, height: 220, display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '2rem' }}>
          
          <svg width="220" height="220" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
            {/* Outer Ring: Cash */}
            <circle cx="110" cy="110" r="100" fill="none" stroke="var(--bg-surface)" strokeWidth="12" />
            <circle cx="110" cy="110" r="100" fill="none" stroke="var(--text-success, #10b981)" strokeWidth="12" strokeLinecap="round"
              className="anim-ring"
              style={{ '--target-offset': CIRCUMFERENCE - (finalCash / 100) * CIRCUMFERENCE } as any}
              strokeDashoffset={isMounted ? CIRCUMFERENCE - (finalCash / 100) * CIRCUMFERENCE : CIRCUMFERENCE} />
            
            {/* Middle Ring: Impact */}
            <circle cx="110" cy="110" r="80" fill="none" stroke="var(--bg-surface)" strokeWidth="12" />
            <circle cx="110" cy="110" r="80" fill="none" stroke="var(--text-info, #3b82f6)" strokeWidth="12" strokeLinecap="round"
              className="anim-ring"
              style={{ '--target-offset': (80 * 2 * Math.PI) - (finalImpact / 100) * (80 * 2 * Math.PI) } as any}
              strokeDasharray={80 * 2 * Math.PI}
              strokeDashoffset={isMounted ? (80 * 2 * Math.PI) - (finalImpact / 100) * (80 * 2 * Math.PI) : (80 * 2 * Math.PI)} />
              
            {/* Inner Ring: Trust */}
            <circle cx="110" cy="110" r="60" fill="none" stroke="var(--bg-surface)" strokeWidth="12" />
            <circle cx="110" cy="110" r="60" fill="none" stroke="var(--text-warning, #f59e0b)" strokeWidth="12" strokeLinecap="round"
              className="anim-ring"
              style={{ '--target-offset': (60 * 2 * Math.PI) - (finalTrust / 100) * (60 * 2 * Math.PI) } as any}
              strokeDasharray={60 * 2 * Math.PI}
              strokeDashoffset={isMounted ? (60 * 2 * Math.PI) - (finalTrust / 100) * (60 * 2 * Math.PI) : (60 * 2 * Math.PI)} />
          </svg>

          {/* Center Verdict */}
          <div style={{ textAlign: 'center', zIndex: 10 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.2rem' }}>{verdictEmoji}</div>
            <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em' }}>{verdictLabel}</div>
          </div>
        </div>

        {/* Ring Labels */}
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--text-success, #10b981)' }} />
            Cash {finalCash}%
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--text-info, #3b82f6)' }} />
            Impact {finalImpact}%
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--text-warning, #f59e0b)' }} />
            Trust {finalTrust}%
          </div>
        </div>
      </div>

      {/* Row 2: Timeline & Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        
        {/* Component 2: Timeline */}
        <div style={{ background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem' }}>Decision Journey</h3>
          
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingBottom: '2rem' }}>
            {/* Connecting line background */}
            <div style={{ position: 'absolute', top: 12, left: 15, right: 15, height: 3, background: 'var(--border-light)', zIndex: 1 }} />
            
            {decisionLog.map((d, i) => {
              const isPositiveCash = d.deltas.cash >= 0;
              const nodeColor = isPositiveCash ? 'var(--text-success, #10b981)' : d.deltas.cash === 0 ? 'var(--text-warning, #f59e0b)' : 'var(--text-danger, #ef4444)';
              
              return (
                <div key={i} className="stagger-item" style={{ 
                  animationDelay: `${i * 150}ms`, position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 
                }}>
                  <div style={{ 
                    width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-base)', border: `3px solid ${nodeColor}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800
                  }}>
                    {i+1}
                  </div>
                  <div style={{ 
                    position: 'absolute', top: 35, width: 80, textAlign: 'center' 
                  }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.4rem' }}>
                      {d.choiceLabel || `Option ${i+1}`}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem', borderRadius: 4, background: isPositiveCash ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: isPositiveCash ? 'var(--text-success)' : 'var(--text-danger)' }}>
                        {d.deltas.cash >= 0 ? '+' : ''}{d.deltas.cash} Cash
                      </span>
                      <span style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem', borderRadius: 4, background: 'rgba(59,130,246,0.1)', color: 'var(--text-info, #3b82f6)' }}>
                        {d.deltas.impact >= 0 ? '+' : ''}{d.deltas.impact} Impact
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Component 3: Area Chart */}
        <div style={{ background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem' }}>Growth Trajectory</h3>
          
          <div style={{ position: 'relative', width: '100%', height: CHART_HEIGHT }}>
            <svg width="100%" height="100%" viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="gradCash" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--text-success, #10b981)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--text-success, #10b981)" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="gradImpact" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--text-info, #3b82f6)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--text-info, #3b82f6)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 25, 50, 75, 100].map(vy => (
                <line key={vy} x1="0" y1={getY(vy)} x2={CHART_WIDTH} y2={getY(vy)} stroke="var(--border-light)" strokeWidth="1" strokeDasharray="4 4" />
              ))}

              {/* Areas */}
              {isMounted && (
                <>
                  <path d={cashPath} fill="url(#gradCash)" style={{ animation: 'fadeInUp 0.6s ease-out' }} />
                  <path d={impactPath} fill="url(#gradImpact)" style={{ animation: 'fadeInUp 0.6s ease-out 0.2s cubic-bezier(0.1,0.5,0.1,1)' }} />
                  
                  {/* Lines */}
                  <polyline points={cashPoints} fill="none" stroke="var(--text-success, #10b981)" strokeWidth="3" style={{ animation: 'drawLine 1s ease-out forwards' }} />
                  <polyline points={impactPoints} fill="none" stroke="var(--text-info, #3b82f6)" strokeWidth="3" style={{ animation: 'drawLine 1s ease-out forwards' }} />
                </>
              )}

              {/* Points & Tooltips */}
              {isMounted && history.map((p, i) => (
                <g key={'pts'+i} style={{ animation: `popIn 0.3s forwards ${i*100}ms`, opacity: 0 }}>
                  <circle cx={getX(i)} cy={getY(p.cash)} r="4" fill="var(--bg-base)" stroke="var(--text-success, #10b981)" strokeWidth="2" />
                  <circle cx={getX(i)} cy={getY(p.impact)} r="4" fill="var(--bg-base)" stroke="var(--text-info, #3b82f6)" strokeWidth="2" />
                </g>
              ))}
            </svg>
            
            {/* HTML Tooltips overlay */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              {isMounted && history.map((p, i) => (
                <div key={'tt'+i}>
                  <div className="tooltip-container" style={{ position:'absolute', left: `${(i / (numPoints-1))*100}%`, top: `${(getY(p.cash)/CHART_HEIGHT)*100}%`, width: 10, height: 10, transform:'translate(-50%,-50%)', pointerEvents:'auto' }}>
                    <div className="tooltip" style={{ color: 'var(--text-success)' }}>Cash: {p.cash}%</div>
                  </div>
                  <div className="tooltip-container" style={{ position:'absolute', left: `${(i / (numPoints-1))*100}%`, top: `${(getY(p.impact)/CHART_HEIGHT)*100}%`, width: 10, height: 10, transform:'translate(-50%,-50%)', pointerEvents:'auto' }}>
                    <div className="tooltip" style={{ color: 'var(--text-info)' }}>Impact: {p.impact}%</div>
                  </div>
                </div>
              ))}
            </div>

            {/* X Axis Labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              {history.map((_, i) => <span key={i} style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{i === 0 ? 'Start' : `D${i}`}</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: MVP Feature Pills */}
      {mvpFeatures.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', textAlign: 'center' }}>Features Shipped</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
            {mvpFeatures.map((f, idx) => (
              <div key={f.id} className="stagger-item" style={{ 
                animationDelay: `${idx * 80}ms`,
                background: 'var(--bg-surface)', border: '1px solid var(--border-light)', padding: '0.6rem 1rem', 
                borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600
              }}>
                <span>{getEmojiForFeature(f.name)}</span>
                {f.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Row 4: Investment Deal Donut + Details */}
      {fundingDetails && (
        <>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', textAlign: 'center' }}>Investment Secured</h3>
          <div className="stagger-item" style={{ 
            animationDelay: '0.5s',
            background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', 
            padding: '2rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '2rem'
          }}>
            
            {/* Amount */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-success, #10b981)', lineHeight: 1 }}>
                {fundingDetails.amount}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.5rem' }}>
                Secured Funding
              </div>
            </div>

            {/* Donut Chart */}
            <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0, alignSelf:'center' }}>
              <svg viewBox="0 0 36 36" width="120" height="120">
                {/* Founder Slice (100% background) */}
                <path
                  style={{ stroke: 'var(--text-success, #10b981)', strokeWidth: 4, fill: 'none' }}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  style={{ 
                    stroke: 'var(--text-info, #3b82f6)', strokeWidth: 4, fill: 'none',
                    animation: isMounted ? 'drawDonut 0.7s ease-out forwards' : 'none',
                    '--target-chart': parseInt(fundingDetails.equity || '0')
                  } as any}
                  strokeDasharray="0 100"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>{fundingDetails.equity}</span>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Equity</span>
              </div>
            </div>

            {/* Investor Details & Button */}
            <div style={{ flex: 1, minWidth: 200, textAlign: 'right' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>Lead by {fundingDetails.investorName || 'Private Investor'}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Seed Round Deal Term</div>
              <button disabled className="btn-solid" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', border: '1px solid var(--border-light)', cursor: 'default' }}>
                View Term Sheet
              </button>
            </div>

          </div>
        </>
      )}

    </div>
  );
}
