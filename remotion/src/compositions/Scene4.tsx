import { AbsoluteFill, Audio, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

type Metric = {
  label: string;
  unit: string;
  target: number;
  icon: string;
};

type SceneProps = {
  svgData?: string;
  audioSrc?: string;
  script?: string;
  title?: string;
  metrics?: Metric[];
  modelName?: string;
};

const DEFAULT_METRICS: Metric[] = [
  { label: 'Read Throughput Increase', unit: '%', target: 250, icon: '\u26A1' },
  { label: 'Data Consistency & Reliability', unit: '%', target: 100, icon: '\u{1F6E1}\uFE0F' },
  { label: 'System Auditability', unit: '%', target: 100, icon: '\u{1F4C8}' },
];

const Scene4: React.FC<SceneProps> = ({
  svgData,
  audioSrc,
  title = 'The Results: Unleashing Architectural Power',
  metrics,
  modelName = 'GPT-4o & Remotion',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 15], [0, 1]);

  const displayMetrics = metrics ?? DEFAULT_METRICS;

  const svgDataUri = svgData
    ? `data:image/svg+xml;base64,${Buffer.from(svgData).toString('base64')}`
    : null;

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
            color: '#e8c766',
            textAlign: 'center',
            marginBottom: 40,
            opacity: titleOpacity,
          }}
        >
          {title}
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 24,
            maxWidth: 900,
            width: '90%',
          }}
        >
          {displayMetrics.map((metric, i) => {
            const s = spring({
              frame: frame - 20 - i * 8,
              fps,
              config: { damping: 10, mass: 0.8 },
            });

            const animatedValue = Math.round(
              interpolate(
                Math.max(0, Math.min((frame - 30 - i * 8) / 60, 1)),
                [0, 1],
                [0, metric.target]
              )
            );

            return (
              <div
                key={i}
                style={{
                  background: '#1a1f4e',
                  borderRadius: 16,
                  padding: 24,
                  textAlign: 'center',
                  opacity: s,
                  transform: `scale(${s})`,
                }}
              >
                <div
                  style={{
                    fontSize: 72,
                    fontWeight: 'bold',
                    color: '#00d4aa',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {animatedValue}{metric.unit}
                </div>
                <div
                  style={{
                    fontSize: 20,
                    color: '#667799',
                    marginTop: 8,
                  }}
                >
                  {metric.icon} {metric.label}
                </div>
              </div>
            );
          })}
        </div>

        <p
          style={{
            marginTop: 40,
            color: '#667799',
            fontSize: 20,
          }}
        >
          Built with {modelName}
        </p>
      </div>
    </AbsoluteFill>
  );
};

export default Scene4;
