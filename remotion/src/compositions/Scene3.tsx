import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

const PILLARS = [
  {
    icon: '\u{1F6E1}\uFE0F',
    title: 'CQRS',
    description: 'Separating read (queries) and write (commands) operations, allowing independent optimization and scaling for each.',
  },
  {
    icon: '\u26A1',
    title: 'Event Sourcing',
    description: 'Storing all changes to application state as a sequence of immutable events, creating a perfect audit trail.',
  },
  {
    icon: '\u{1F4CA}',
    title: 'Optimized Read Models',
    description: 'Projecting events into denormalized, purpose-built data stores tailored for specific query needs.',
  },
];

const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 15], [0, 1]);
  const descOpacity = interpolate(frame, [10, 25], [0, 1]);
  const successOpacity = interpolate(frame, [180, 200], [0, 1]);

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
        <h2
          style={{
            fontSize: 56,
            color: '#e8c766',
            textAlign: 'center',
            marginBottom: 20,
            opacity: titleOpacity,
          }}
        >
          CQRS & Event Sourcing: A Resilient Paradigm
        </h2>

        <p
          style={{
            fontSize: 24,
            color: '#667799',
            textAlign: 'center',
            maxWidth: 800,
            marginBottom: 30,
            opacity: descOpacity,
          }}
        >
          Embrace a decoupled, event-driven architecture that champions performance,
          consistency, and a complete historical record.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 24,
            maxWidth: 1000,
            width: '90%',
          }}
        >
          {PILLARS.map((pillar, i) => {
            const s = spring({
              frame: frame - 30 - i * 10,
              fps,
              config: { damping: 14, mass: 0.6 },
            });
            return (
              <div
                key={i}
                style={{
                  background: '#1a1f4e',
                  borderRadius: 16,
                  padding: 24,
                  textAlign: 'center',
                  border: '2px solid #667799',
                  opacity: s,
                  transform: `translateY(${(1 - s) * 40}px)`,
                }}
              >
                <div style={{ fontSize: 56, marginBottom: 12 }}>{pillar.icon}</div>
                <h3
                  style={{
                    fontSize: 28,
                    color: '#00d4aa',
                    margin: '0 0 8px 0',
                  }}
                >
                  {pillar.title}
                </h3>
                <p style={{ fontSize: 16, color: '#667799', margin: 0 }}>
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 24,
            padding: '16px 24px',
            background: 'rgba(0,212,170,0.1)',
            borderRadius: 10,
            border: '1px solid #00d4aa',
            opacity: successOpacity,
          }}
        >
          <p style={{ color: '#00d4aa', fontSize: 20, margin: 0 }}>
            Achieve ultimate data consistency, high throughput, robust audit trails,
            and effortless horizontal scaling.
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default Scene3;
