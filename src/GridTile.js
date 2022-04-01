import { motion, useTransform, useViewportScroll } from 'framer-motion';
import styled from 'styled-components';
import { randomUniform } from 'd3-random';

const ImageWrapper = styled(motion.div)`
  position: absolute;
  width: ${({ $width }) => $width && `${$width}px`};
  height: ${({ $height }) => $height && `${$height}px`};
  outline: thin solid black;
  background: white;
`;

const Image = styled(motion.img)`
  user-select: none;
`;

const nodeTransition = {
  ease: [0.87, 0, 0.13, 1],
  duration: 0.65,
};

const random = randomUniform(0, 100);

const GridTile = ({ url, width, height, x, y }) => {
  const { scrollY } = useViewportScroll();
  const parallax = useTransform(
    scrollY,
    [0, window.innerHeight],
    [0, -1000 - y * 0.5 + random()]
  );

  return (
    <ImageWrapper
      animate={{
        x: x || 0,
        y: y || 0,
      }}
      transition={nodeTransition}
      $width={width}
      $height={height}
    >
      <Image
        alt={`image`}
        loading='lazy'
        src={url}
        draggable='false'
        style={{ y: parallax }}
      />
    </ImageWrapper>
  );
};

export default GridTile;
