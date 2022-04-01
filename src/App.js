import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import './styles.css';
import { useGesture } from '@use-gesture/react';
import { forceSimulation } from 'd3-force';
import { rectCollide } from './rectCollideForce';
import { dampen } from './math';
import { data } from './data';

const CANVAS_SIZE = '200%';
const NODE_SAFE_AREA = 50;
const SPACING_TRIES = 500;

const OuterBounds = styled.section`
  overflow: hidden;
  height: 100vh;
  width: 100vw;
`;

const GridContainer = styled(motion.div)`
  touch-action: none;
  position: relative;
  height: ${CANVAS_SIZE};
  width: ${CANVAS_SIZE};

  border: thin solid black;
  display: grid;
  place-items: center;
`;

const Image = styled(motion.img)`
  user-select: none;
  position: absolute;
  outline: thin solid black;

  width: ${({ $width }) => $width && `${$width}px`};
  height: ${({ $height }) => $height && `${$height}px`};
`;

const nodeTransition = {
  ease: [0.87, 0, 0.13, 1],
  duration: 0.65,
};

/// todo: canvas as big as inner bounds
// todo start drag at center
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

  return (
    <OuterBounds ref={boundsRef}>
      <GridContainer {...bind()} ref={gridRef} style={{ x, y, cursor }}>
        {nodes?.map(({ x: pdsX, y: pdsY, url, width, height }, i) => {
          return (
            <Image
              key={`image-${i}`}
              alt={`image`}
              layoutId={`image-${i}`}
              src={url}
              draggable='false'
              animate={{ x: pdsX || 0, y: pdsY || 0 }}
              transition={nodeTransition}
              $width={width}
              $height={height}
            />
          );
        })}
      </GridContainer>
    </OuterBounds>
  );
}
