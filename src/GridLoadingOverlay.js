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
  height: 100%;
  width: 100%;
  color: white;
`;

const Inner = styled(motion.div)``;

const overlayVariants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

/**
 * Self containing intro animation. Unmounts when animation is complete.
 * Pass in dependencies to postpone unmounting.
 * @param {Array<Boolean>} unmountDeps - dependencies to wait for before unmounting
 */
const GridLoadingOverlay = ({ unmountDeps = [] }) => {
  const [mounted, setMounted] = useState(true);

  const handleFinish = () => {
    setMounted(false);
  };

  return (
    <AnimatePresence>
      {(mounted || !unmountDeps.every(Boolean)) && (
        <Container
          variants={overlayVariants}
          initial='visible'
          animate='visible'
          exit='hidden'
        >
          <Inner
            animate={{ rotate: 360 }}
            transition={{ duration: 2 }}
            onAnimationComplete={handleFinish}
          >
            Loading ...
          </Inner>
        </Container>
      )}
    </AnimatePresence>
  );
};

export default GridLoadingOverlay;
