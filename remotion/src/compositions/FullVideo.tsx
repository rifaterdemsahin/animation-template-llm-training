import { AbsoluteFill, Sequence } from 'remotion';
import Scene1 from './Scene1';
import Scene2 from './Scene2';
import Scene3 from './Scene3';
import Scene4 from './Scene4';

const FPS = 30;

type FullVideoProps = {
  svgData?: string;
  audioSrc?: string;
  script?: string;
};

const FullVideo: React.FC<FullVideoProps> = (props) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0e27' }}>
      <Sequence from={0} durationInFrames={4 * FPS}>
        <Scene1 {...props} />
      </Sequence>
      <Sequence from={4 * FPS} durationInFrames={8 * FPS}>
        <Scene2 {...props} />
      </Sequence>
      <Sequence from={12 * FPS} durationInFrames={10 * FPS}>
        <Scene3 {...props} />
      </Sequence>
      <Sequence from={22 * FPS} durationInFrames={6 * FPS}>
        <Scene4 {...props} />
      </Sequence>
    </AbsoluteFill>
  );
};

export default FullVideo;
