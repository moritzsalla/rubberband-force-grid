import { motion, useTransform, useViewportScroll } from 'framer-motion';
import styled from 'styled-components';
import * as d3 from 'd3';

const ImageWrapper = styled(motion.div)`
  height: 100%;
  width: 100%;
  position: absolute;
  width: ${({ $width }) => $width && `${$width}px`};
  height: ${({ $height }) => $height && `${$height}px`};
`;

const Image = styled(motion.img)`
  user-select: none;
  outline: thin solid black;
`;

const nodeTransition = {
  ease: [0.87, 0, 0.13, 1],
  duration: 0.65,
};

const random = d3.randomUniform(0, 100);

const GridTile = ({ url, width, height, x, y }) => {
  const { scrollY } = useViewportScroll();
  const parallax = useTransform(
    scrollY,
    [0, window.innerHeight],
    [0, -1000 - y * 0.5 + random()]
  );

  console.log(x);

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
        src={url}
        draggable='false'
        style={{ y: parallax }}
      />
    </ImageWrapper>
  );
};

export default GridTile;
