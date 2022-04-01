import { motion, useTransform, useViewportScroll } from 'framer-motion';
import styled from 'styled-components';
import { randomUniform } from 'd3-random';

const ImageWrapper = styled(motion.div)`
  position: absolute;
  width: ${({ $width }) => $width && `${$width}px`};
  height: ${({ $height }) => $height && `${$height}px`};
`;

const Parallax = styled(motion.div)`
  background: white;
  outline: thin solid black;
  height: 100%;
  width: 100%;
`;

const verticalDisplacement = -500;
const parallaxOffset = randomUniform(-100, 100);
const scaleOffset = randomUniform(0.8, 1)();

const GridTile = ({ url, x, y, width, height }) => {
  const { scrollY } = useViewportScroll();

  const parallax = useTransform(
    scrollY,
    [0, window.innerHeight],
    [0, verticalDisplacement + parallaxOffset()]
  );
  const scale = useTransform(
    scrollY,
    [0, window.innerHeight],
    [1, scaleOffset]
  );

  return (
    <ImageWrapper animate={{ x, y }} $width={width} $height={height}>
      <Parallax style={{ y: parallax, scale }}>
        <img alt={`image`} loading='lazy' src={url} draggable='false' />
      </Parallax>
    </ImageWrapper>
  );
};

export default GridTile;
