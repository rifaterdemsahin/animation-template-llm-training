import { Composition } from 'remotion';
import Scene1 from './compositions/Scene1';
import Scene2 from './compositions/Scene2';
import Scene3 from './compositions/Scene3';
import Scene4 from './compositions/Scene4';
import FullVideo from './compositions/FullVideo';

const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Scene1"
        component={Scene1}
        durationInFrames={4 * FPS}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="Scene2"
        component={Scene2}
        durationInFrames={8 * FPS}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="Scene3"
        component={Scene3}
        durationInFrames={10 * FPS}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="Scene4"
        component={Scene4}
        durationInFrames={6 * FPS}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="FullVideo"
        component={FullVideo}
        durationInFrames={28 * FPS}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
