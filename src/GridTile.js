import { motion } from 'framer-motion';
import styled from 'styled-components';

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

const GridTile = ({ url, width, height, x, y }) => {
  return (
    <Image
      alt={`image`}
      src={url}
      draggable='false'
      animate={{
        x: x || 0,
        y: y || 0,
      }}
      transition={nodeTransition}
      $width={width}
      $height={height}
    />
  );
};

export default GridTile;
