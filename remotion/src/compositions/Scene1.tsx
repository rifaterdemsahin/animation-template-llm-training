import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';

const BADGES = [
  { label: 'Built with GPT-4o', color: '#00d4aa' },
  { label: 'GSAP Animation', color: '#00d4aa' },
];

const BADGE_CHAIN = [
  { label: 'Monolithic CRUD', color: '#e94560', type: 'bad' },
  { label: '→', color: '#e8c766', type: 'arrow' },
  { label: 'CQRS & Event Sourcing', color: '#00d4aa', type: 'good' },
];

const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 12, mass: 0.5 } });
  const subtitleSpring = spring({ frame: frame - 10, fps, config: { damping: 12, mass: 0.5 } });
  const descSpring = spring({ frame: frame - 20, fps, config: { damping: 12, mass: 0.5 } });
  const badgeSpring = spring({ frame: frame - 30, fps, config: { damping: 12, mass: 0.5 } });

  const titleOpacity = Math.min(frame / 15, 1);
  const subtitleOpacity = Math.max(0, Math.min((frame - 10) / 15, 1));
  const descOpacity = Math.max(0, Math.min((frame - 20) / 15, 1));
  const badgeOpacity = Math.max(0, Math.min((frame - 30) / 15, 1));

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0e27' }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
          fontFamily: 'Segoe UI, system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginBottom: 24,
            opacity: badgeOpacity,
            transform: `translateY(${(1 - badgeSpring) * 30}px)`,
          }}
        >
          {BADGES.map((badge, i) => (
            <span
              key={i}
              style={{
                background: '#1a1f4e',
                color: badge.color,
                padding: '8px 20px',
                borderRadius: 20,
                fontSize: 18,
                border: `1px solid ${badge.color}`,
              }}
            >
              {badge.label}
            </span>
          ))}
        </div>

        <h1
          style={{
            fontSize: 72,
            color: '#00d4aa',
            textAlign: 'center',
            marginBottom: 16,
            opacity: titleOpacity,
            transform: `translateY(${(1 - titleSpring) * 40}px)`,
          }}
        >
          CQRS & Event Sourcing
        </h1>

        <h2
          style={{
            fontSize: 48,
            color: '#e8c766',
            textAlign: 'center',
            marginBottom: 12,
            opacity: subtitleOpacity,
            transform: `translateY(${(1 - subtitleSpring) * 30}px)`,
          }}
        >
          Mastering Data Flow, Empowering Applications
        </h2>

        <p
          style={{
            fontSize: 28,
            color: '#667799',
            textAlign: 'center',
            maxWidth: 800,
            margin: '8px auto',
            opacity: descOpacity,
            transform: `translateY(${(1 - descSpring) * 20}px)`,
          }}
        >
          Discover how Command Query Responsibility Segregation and Event Sourcing
          revolutionize modern software architecture.
        </p>

        <div
          style={{
            display: 'flex',
            gap: 12,
            marginTop: 24,
            opacity: badgeOpacity,
          }}
        >
          {BADGE_CHAIN.map((badge, i) => (
            <span
              key={i}
              style={{
                background: badge.type === 'arrow' ? 'transparent' : '#1a1f4e',
                color: badge.color,
                padding: badge.type === 'arrow' ? '8px 4px' : '8px 20px',
                borderRadius: 20,
                fontSize: 18,
                border: badge.type === 'arrow' ? 'none' : `1px solid ${badge.color}`,
                fontWeight: badge.type === 'arrow' ? 'bold' : 'normal',
              }}
            >
              {badge.label}
            </span>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default Scene1;
