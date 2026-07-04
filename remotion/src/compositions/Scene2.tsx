import { AbsoluteFill, Audio, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

function toBase64(str: string): string {
  if (typeof Buffer !== 'undefined') return Buffer.from(str).toString('base64');
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

type SceneProps = {
  svgData?: string;
  svgDataUri?: string;
  audioSrc?: string;
  script?: string;
  title?: string;
  description?: string;
  badges?: string[];
  failureScenario?: string;
  failureConsequence?: string;
  warningMessage?: string;
};

const DEFAULT_BADGES = [
  'Read/Write Contention',
  'Scalability Limits',
  'Complex Logic',
  'Poor Auditability',
];

const Scene2: React.FC<SceneProps> = ({
  svgData,
  svgDataUri: precomputedUri,
  audioSrc,
  title = 'The Monolithic Trap: Data Inconsistency & Bottlenecks',
  description = 'Witness the struggles of traditional architectures when faced with complex domain logic and high concurrency.',
  badges,
  failureScenario = 'A single, shared database struggles to handle simultaneous updates and diverse read requests from numerous services, leading to deadlocks, stale data, and slow response times.',
  failureConsequence = 'Users experience frustrating delays, unreliable data, and system crashes under peak load.',
  warningMessage = 'Beware: Tight Coupling Leads to Operational Chaos!',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 15], [0, 1]);
  const descOpacity = interpolate(frame, [10, 25], [0, 1]);
  const badgeOpacity = interpolate(frame, [20, 40], [0, 1]);
  const scenarioOpacity = interpolate(frame, [40, 55], [0, 1]);
  const warningOpacity = interpolate(frame, [100, 115], [0, 1]);
  const warningOut = interpolate(frame, [160, 175], [1, 0]);
  const flashOpacity = interpolate(frame, [130, 135, 140, 150], [0, 0.1, 0.1, 0]);

  const problemBadges = badges ?? DEFAULT_BADGES;

  const svgDataUri = precomputedUri
    || (svgData ? `data:image/svg+xml;base64,${toBase64(svgData)}` : null);

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0e27' }}>
      {svgDataUri && (
        <Img
          src={svgDataUri}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.12,
          }}
        />
      )}

      {audioSrc && <Audio src={audioSrc} />}

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
            color: '#e94560',
            textAlign: 'center',
            marginBottom: 20,
            opacity: titleOpacity,
          }}
        >
          {title}
        </h2>

        <p
          style={{
            fontSize: 24,
            color: '#667799',
            textAlign: 'center',
            maxWidth: 800,
            marginBottom: 20,
            opacity: descOpacity,
          }}
        >
          {description}
        </p>

        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            justifyContent: 'center',
            margin: '16px 0',
            opacity: badgeOpacity,
          }}
        >
          {problemBadges.map((label, i) => {
            const s = spring({
              frame: frame - 20 - i * 5,
              fps,
              config: { damping: 12 },
            });
            return (
              <span
                key={i}
                style={{
                  background: '#1a1f4e',
                  color: '#e94560',
                  padding: '8px 20px',
                  borderRadius: 20,
                  fontSize: 18,
                  border: '1px solid #e94560',
                  transform: `scale(${s})`,
                  opacity: s,
                }}
              >
                {label}
              </span>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 20,
            padding: 20,
            background: '#1a1f4e',
            borderRadius: 12,
            maxWidth: 600,
            width: '90%',
            border: '1px solid #e94560',
            opacity: scenarioOpacity,
          }}
        >
          <p style={{ color: '#ff6666', fontSize: 18, margin: 0, marginBottom: 8 }}>
            {failureScenario}
          </p>
          <p style={{ color: '#e94560', fontSize: 18, margin: 0 }}>
            {failureConsequence}
          </p>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(233,69,96,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: warningOpacity * (1 - warningOut) || 0,
        }}
      >
        <div
          style={{
            background: 'rgba(233,69,96,0.12)',
            border: '3px solid #e94560',
            borderRadius: 16,
            padding: '40px 60px',
            textAlign: 'center',
          }}
        >
          <h2 style={{ color: '#e94560', fontSize: 56, margin: 0, marginBottom: 12 }}>
            SYSTEM COMPROMISED
          </h2>
          <p style={{ color: '#ff6666', fontSize: 28, margin: 0 }}>
            {warningMessage}
          </p>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `rgba(233,69,96,${flashOpacity})`,
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};

export default Scene2;
