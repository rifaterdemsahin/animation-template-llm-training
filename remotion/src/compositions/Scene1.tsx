import { AbsoluteFill, Audio, Img, spring, useCurrentFrame, useVideoConfig } from 'remotion';

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
  subtitle?: string;
  description?: string;
  badges?: string[];
  antiPattern?: string;
  solutionName?: string;
};

const Scene1: React.FC<SceneProps> = ({
  svgData,
  svgDataUri: precomputedUri,
  audioSrc,
  title = 'CQRS & Event Sourcing',
  subtitle = 'Mastering Data Flow, Empowering Applications',
  description = 'Discover how Command Query Responsibility Segregation and Event Sourcing revolutionize modern software architecture.',
  badges,
  antiPattern = 'Monolithic CRUD',
  solutionName = 'CQRS & Event Sourcing',
}) => {
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

  const displayBadges = badges ?? ['Built with GPT-4o', 'Remotion Video'];

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
            opacity: 0.15,
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
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginBottom: 24,
            opacity: badgeOpacity,
            transform: `translateY(${(1 - badgeSpring) * 30}px)`,
          }}
        >
          {displayBadges.map((badge, i) => (
            <span
              key={i}
              style={{
                background: '#1a1f4e',
                color: '#00d4aa',
                padding: '8px 20px',
                borderRadius: 20,
                fontSize: 18,
                border: '1px solid #00d4aa',
              }}
            >
              {badge}
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
          {title}
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
          {subtitle}
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
          {description}
        </p>

        <div
          style={{
            display: 'flex',
            gap: 12,
            marginTop: 24,
            opacity: badgeOpacity,
          }}
        >
          <span
            style={{
              background: '#1a1f4e',
              color: '#e94560',
              padding: '8px 20px',
              borderRadius: 20,
              fontSize: 18,
              border: '1px solid #e94560',
            }}
          >
            {antiPattern}
          </span>
          <span
            style={{
              background: 'transparent',
              color: '#e8c766',
              padding: '8px 4px',
              fontSize: 18,
              fontWeight: 'bold',
            }}
          >
            →
          </span>
          <span
            style={{
              background: '#1a1f4e',
              color: '#00d4aa',
              padding: '8px 20px',
              borderRadius: 20,
              fontSize: 18,
              border: '1px solid #00d4aa',
            }}
          >
            {solutionName}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default Scene1;
