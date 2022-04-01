import { motion, useTransform, useViewportScroll } from 'framer-motion';
import styled from 'styled-components';
import { randomUniform } from 'd3-random';

const ImageWrapper = styled(motion.div)`
  position: absolute;
  width: ${({ $width }) => $width && `${$width}px`};
  height: ${({ $height }) => $height && `${$height}px`};
`;

const Outline = styled(motion.div)`
  background: white;
  outline: thin solid black;
  height: 100%;
  width: 100%;
`;

const GridTile = ({ url, x, y, width, height }) => {
  const { scrollY } = useViewportScroll();
  const parallax = useTransform(
    scrollY,
    [0, window.innerHeight],
    [0, -500 + randomUniform(-200, 200)()]
  );

  return (
    <ImageWrapper animate={{ x, y }} $width={width} $height={height}>
      <Outline style={{ y: parallax }}>
        <img alt={`image`} loading='lazy' src={url} draggable='false' />
      </Outline>
    </ImageWrapper>
  );
};

export default GridTile;
