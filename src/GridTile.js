import {
  motion,
  useSpring,
  useTransform,
  useViewportScroll,
} from 'framer-motion';
import styled from 'styled-components';
import { randomUniform } from 'd3-random';
import { SPRING_TRANSITION } from './utils/animationConfig';

const ImageWrapper = styled(motion.div)`
  position: absolute;
  width: ${({ $width }) => $width && `${$width}px`};
  height: ${({ $height }) => $height && `${$height}px`};
`;

const ScrollParallax = styled(motion.div)`
  background: white;
  outline: thin solid black;
  height: 100%;
  width: 100%;
`;

const DragParallax = styled(motion.div)`
  height: 100%;
  width: 100%;
`;

const randomScroll = randomUniform(-100, 100);
const randomScale = randomUniform(0.8, 1);
const randomDrag = randomUniform(-75, 75);

const GridTile = ({
  url,
  size: [width, height],
  nodeCoords: [nodeX, nodeY],
  worldCoords: [worldX, worldY],
  canvasBounds,
}) => {
  const { scrollY } = useViewportScroll();

  // scroll parallax

  const parallax = useTransform(
    scrollY,
    [0, window.innerHeight],
    [0, -500 + randomScroll()]
  );
  const scale = useTransform(
    scrollY,
    [0, window.innerHeight],
    [1, randomScale()]
  );

  // drag parallax

  const dragBounds = [-randomDrag(), randomDrag()];
  const dragX = useTransform(
    worldX,
    [-canvasBounds.width, canvasBounds.width],
    dragBounds
  );
  const dragY = useTransform(
    worldY,
    [-canvasBounds.height, canvasBounds.height],
    dragBounds
  );
  const easedX = useSpring(dragX, SPRING_TRANSITION);
  const easedY = useSpring(dragY, SPRING_TRANSITION);

  return (
    <ImageWrapper
      initial={{ x: nodeX, y: nodeY }}
      animate={{ x: nodeX, y: nodeY }}
      $width={width}
      $height={height}
    >
      <DragParallax style={{ x: easedX, y: easedY }}>
        <ScrollParallax style={{ y: parallax, scale }}>
          <img alt={`image`} loading='lazy' src={url} draggable='false' />
        </ScrollParallax>
      </DragParallax>
    </ImageWrapper>
  );
};

export default GridTile;
