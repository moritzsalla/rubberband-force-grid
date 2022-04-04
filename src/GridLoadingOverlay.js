import { AnimatePresence, motion, useMotionValue } from 'framer-motion';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

const Container = styled(motion.div)`
  display: grid;
  place-items: center;
  position: absolute;
  background: black;
  top: 0;
  left: 0;
  z-index: 100;
  height: 100%;
  width: 100%;
  color: white;
  pointer-events: none;
`;

const overlayVariants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

/**
 * Self containing intro animation. Unmounts when animation is complete.
 * Pass in dependencies to postpone unmounting.
 * @param {Array<Object>} targetNodes - Array of dom image elements to animate to their final positions
 * @param {Array<Boolean>} unmountDeps - dependencies to wait for before unmounting
 */
const GridLoadingOverlay = ({ targetNodes, unmountDeps = [] }) => {
  const [mounted, setMounted] = useState(true);

  const handleFinish = () => {
    setMounted(false);
  };

  return (
    <>
      <AnimatePresence>
        {(mounted || !unmountDeps.every(Boolean)) && (
          <Container
            variants={overlayVariants}
            initial='visible'
            animate='visible'
            exit='hidden'
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2 }}
              onAnimationComplete={handleFinish}
            >
              Loading ...
            </motion.div>
          </Container>
        )}
      </AnimatePresence>

      {targetNodes?.map(({ url, x, y, width, height }, i) => (
        <motion.div
          key={`${x}-${y}-${i}`}
          style={{
            position: 'fixed',
            left: x,
            top: y,
            width,
            height,
            outline: '5px solid red',
          }}
        />
      ))}
    </>
  );
};

export default GridLoadingOverlay;
