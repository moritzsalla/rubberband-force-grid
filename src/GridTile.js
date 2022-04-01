import { motion, useTransform, useViewportScroll } from 'framer-motion';
import styled from 'styled-components';
import { randomUniform } from 'd3-random';
import { useEffect } from 'react';

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

const verticalDisplacement = -500;
const getParallaxOffset = randomUniform(-100, 100);
const scaleOffset = randomUniform(0.8, 1)();

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
    [0, verticalDisplacement + getParallaxOffset()]
  );
  const scale = useTransform(
    scrollY,
    [0, window.innerHeight],
    [1, scaleOffset]
  );

  // drag parallax

  const dragOffset = randomUniform(-50, 50)();
  const dragBounds = [-dragOffset, dragOffset];
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

  return (
    <ImageWrapper
      animate={{ x: nodeX, y: nodeY }}
      $width={width}
      $height={height}
    >
      <DragParallax style={{ x: dragX, y: dragY }}>
        <ScrollParallax style={{ y: parallax, scale }}>
          <img alt={`image`} loading='lazy' src={url} draggable='false' />
        </ScrollParallax>
      </DragParallax>
    </ImageWrapper>
  );
};

export default GridTile;
