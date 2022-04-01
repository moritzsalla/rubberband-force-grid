import {
  motion,
  MotionConfig,
  useMotionValue,
  useSpring,
  useTransform,
  useViewportScroll,
} from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useGesture } from '@use-gesture/react';
import { forceSimulation } from 'd3-force';
import { rectCollide } from './rectCollideForce';
import { dampen } from './math';
import { data } from './data';
import GridTile from './GridTile';

const CANVAS_SIZE = '200%';
const NODE_SAFE_AREA = 50;
const SPACING_TRIES = 500;

const TRANSITION = {
  ease: [0.87, 0, 0.13, 1],
  duration: 0.65,
};

const OuterBounds = styled.section`
  overflow: hidden;
  height: 100vh;
  width: 100%;
  background: white;
  user-select: none;
`;

const ScaleContainer = styled(motion.div)`
  height: 100%;
  width: 100%;
`;

const LoadingOverlay = styled.div`
  display: grid;
  place-items: center;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
`;

const GridContainer = styled(motion.div)`
  height: ${CANVAS_SIZE};
  width: ${CANVAS_SIZE};

  touch-action: none;
  position: relative;
  display: grid;
  place-items: center;
`;

export default function App() {
  const [nodes, setNodes] = useState(null);

  const programRef = useRef(null);
  const boundsRef = useRef(null);
  const gridRef = useRef(null);

  // world space translation

  const springConfig = { damping: 80, stiffness: 300 };
  const cursor = useMotionValue('grab');
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);
  const scale = useSpring(1, springConfig);

  // set origin to center of bounds

  useEffect(() => {
    const { width, height } = boundsRef.current?.getBoundingClientRect();
    x.set(-width / 2);
    y.set(-height / 2);
  }, []);

  const handleDrag = ({ offset: [ox, oy], down }) => {
    scale.set(down ? 0.9 : 1);
    cursor.set(down ? 'grabbing' : 'grab');

    // --- rubber band ---

    x.stop();
    y.stop();

    const gridRect = gridRef.current?.getBoundingClientRect();
    const boundsRect = boundsRef.current?.getBoundingClientRect();

    let originalWidth = gridRef.current.clientWidth;
    let widthOverhang = (gridRect.width - originalWidth) / 2;
    let originalHeight = gridRef.current.clientHeight;
    let heightOverhang = (gridRect.height - originalHeight) / 2;
    let maxX = widthOverhang;
    let minX = -(gridRect.width - boundsRect.width) + widthOverhang;
    let maxY = heightOverhang;
    let minY = -(gridRect.height - boundsRect.height) + heightOverhang;

    x.set(dampen(ox, [minX, maxX]));
    y.set(dampen(oy, [minY, maxY]));
  };

  const constrictToBoundingBox = () => {
    const gridRect = gridRef.current?.getBoundingClientRect();
    const containerRect = boundsRef.current?.getBoundingClientRect();

    if (gridRect.left > containerRect.left) {
      x.set(0);
    } else if (gridRect.right < containerRect.right) {
      x.set(-(gridRect.width - containerRect.width));
    }

    if (gridRect.top > containerRect.top) {
      y.set(0);
    } else if (gridRect.bottom < containerRect.bottom) {
      y.set(-(gridRect.height - containerRect.height));
    }
  };

  const bind = useGesture(
    {
      onDrag: handleDrag,
      onDragEnd: constrictToBoundingBox,
    },
    {
      drag: { from: () => [x.get(), y.get()] },
      eventOptions: 'passive',
    }
  );

  // --- generative grid ---

  const computeLayout = useCallback(() => {
    if (!gridRef.current) return;

    programRef.current = forceSimulation(data)
      .alphaDecay(0.1)
      .force(
        'collide',
        rectCollide()
          .iterations(SPACING_TRIES)
          .strength(1)
          .size(({ width, height }) => [
            width + NODE_SAFE_AREA,
            height + NODE_SAFE_AREA,
          ])
      )
      .on('end', () => setNodes(data));
  }, []);

  useEffect(() => {
    computeLayout();
    return () => programRef.current.stop();
  }, [computeLayout]);

  // --- parallax: zoom out on wheel ---

  const { scrollY } = useViewportScroll();
  const zoomOutOnScroll = useTransform(
    scrollY,
    [0, window.innerHeight],
    [1, 0.6]
  );

  return (
    <MotionConfig transition={TRANSITION}>
      <OuterBounds ref={boundsRef}>
        <ScaleContainer style={{ scale: zoomOutOnScroll }}>
          <GridContainer {...bind()} ref={gridRef} style={{ x, y, cursor }}>
            {nodes?.map(({ x: pdsX, y: pdsY, url, width, height }, i) => {
              const id = `image-${i}`;
              return (
                <GridTile
                  key={id}
                  layoutId={id}
                  style={{ x: pdsX, y: pdsY }}
                  url={url}
                  size={[width, height]}
                  nodeCoords={[pdsX, pdsY]}
                  worldCoords={[x, y]}
                  canvasBounds={boundsRef.current?.getBoundingClientRect()}
                />
              );
            })}
          </GridContainer>
        </ScaleContainer>

        {!nodes && <LoadingOverlay>loading...</LoadingOverlay>}
      </OuterBounds>
    </MotionConfig>
  );
}
