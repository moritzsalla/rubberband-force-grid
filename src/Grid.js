import { useGesture } from '@use-gesture/react';
import { forceSimulation } from 'd3-force';
import {
  motion,
  MotionConfig,
  useMotionValue,
  useSpring,
  useTransform,
  useViewportScroll,
} from 'framer-motion';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import { SPRING_TRANSITION, TRANSITION } from './utils/animationConfig';
import { data } from './data/data';
import { debounce } from './utils/debounce';
import GridTile from './GridTile';
import { dampen } from './utils/math';
import { rectCollide } from './utils/rectCollideForce';
import GridLoadingOverlay from './GridLoadingOverlay';

const CANVAS_SIZE = '200%';
const NODE_SAFE_AREA = 50;
const SPACING_TRIES = 500;

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
  const [inViewNodes, setInViewNodes] = useState([]);

  const programRef = useRef(null);
  const boundsRef = useRef(null);
  const gridRef = useRef(null);

  // world space translation

  const cursor = useMotionValue('grab');
  const x = useSpring(0, SPRING_TRANSITION);
  const y = useSpring(0, SPRING_TRANSITION);
  const scale = useSpring(1, SPRING_TRANSITION);

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
    const handleCalculationEnd = () => {
      setNodes(data);
    };

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
      .on('end', handleCalculationEnd);
  }, []);

  useEffect(() => {
    if (gridRef.current && !nodes) computeLayout();
    return () => programRef.current.stop();
  }, [nodes, computeLayout]);

  // set origin to center of bounds

  useLayoutEffect(() => {
    const setWorldOrigin = debounce(({ width, height }) => {
      x.set(-width / 2);
      y.set(-height / 2);
    });

    const ro = new ResizeObserver((entries) => {
      const worldSpaceRect = entries[0]?.contentRect;
      setWorldOrigin(worldSpaceRect);
    });
    ro.observe(boundsRef.current);

    return () => ro.disconnect();
  }, [x, y]);

  // parallax: zoom out on wheel

  const { scrollY } = useViewportScroll();
  const zoomOutOnScroll = useTransform(
    scrollY,
    [0, window.innerHeight],
    [1, 0.6]
  );

  useEffect(() => {
    const visibleImages = nodes?.filter((node) => {
      const { x, y, width, height } = node || {};
      const { left, top, right, bottom } =
        boundsRef.current?.getBoundingClientRect() || {};

      const isVisible =
        x + width > left && x < right && y + height > top && y < bottom;

      return isVisible;
    });

    setInViewNodes(visibleImages);
  }, [nodes]);

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
                  url={url}
                  size={[width, height]}
                  nodeCoords={[pdsX, pdsY]}
                  worldCoords={[x, y]}
                  canvasBounds={boundsRef.current?.getBoundingClientRect()}
                  className='grid-tile'
                />
              );
            })}

            <motion.div
              style={{
                x: 0,
                y: 0,
                height: 10,
                width: 10,
                position: 'relative',
                zIndex: 100,
                background: 'blue',
              }}
            />
          </GridContainer>
        </ScaleContainer>
      </OuterBounds>

      <GridLoadingOverlay targetNodes={inViewNodes} unmountDeps={[nodes]} />
    </MotionConfig>
  );
}
