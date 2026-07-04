import { AbsoluteFill, Sequence } from 'remotion';
import Scene1 from './Scene1';
import Scene2 from './Scene2';
import Scene3 from './Scene3';
import Scene4 from './Scene4';

const FPS = 30;

const FullVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0e27' }}>
      <Sequence from={0} durationInFrames={4 * FPS}>
        <Scene1 />
      </Sequence>
      <Sequence from={4 * FPS} durationInFrames={8 * FPS}>
        <Scene2 />
      </Sequence>
      <Sequence from={12 * FPS} durationInFrames={10 * FPS}>
        <Scene3 />
      </Sequence>
      <Sequence from={22 * FPS} durationInFrames={6 * FPS}>
        <Scene4 />
      </Sequence>
    </AbsoluteFill>
  );
};

export default FullVideo;
