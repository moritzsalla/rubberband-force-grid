import { motion, useMotionValue, useSpring } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import "./styles.css";
import { useGesture } from "@use-gesture/react";
import { forceSimulation } from "d3-force";
import { rectCollide } from "./rectCollideForce";
import * as d3 from "d3";
import { dampen } from "./math";

const randImageDimension = d3.randomUniform(100, 200);

const radii = [
  ...new Array(30).fill({
    r: 80
  })
].map((r) => ({
  ...r,
  width: randImageDimension(),
  height: randImageDimension()
}));

const data = radii.map((r) => ({ r }));

const OuterBounds = styled.section`
  overflow: hidden;
  height: 100vh;
  width: 100vw;
`;

const GridContainer = styled(motion.div)`
  touch-action: none;
  height: 200%;
  width: 200%;
  border: thin solid black;
  display: grid;
  place-items: center;
`;

const Image = styled(motion.img)`
  user-select: none;
  position: absolute;
  outline: thin black solid;
  width: ${({ $width }) => $width && `${$width}px`};
  height: ${({ $height }) => $height && `${$height}px`};
  object-fit: contain;
`;

const safeArea = 50;
const nodeTransition = {
  ease: [0.87, 0, 0.13, 1],
  duration: 0.65
};

export default function App() {
  const [nodes, setNodes] = useState(null);

  const programRef = useRef(null);
  const boundsRef = useRef(null);
  const gridRef = useRef(null);

  // world space translation

  const springConfig = { damping: 50, stiffness: 50, mass: 4 };
  const cursor = useMotionValue("grab");
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);
  const scale = useSpring(1, springConfig);

  const handleDrag = ({ offset: [ox, oy], down }) => {
    scale.set(down ? 0.9 : 1);
    cursor.set(down ? "grabbing" : "grab");

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
      onDragEnd: constrictToBoundingBox
    },
    {
      drag: { from: () => [x.get(), y.get()] },
      eventOptions: "passive"
    }
  );

  // --- poisson disk sampling ---

  const computeLayout = useCallback(() => {
    if (!gridRef.current) return;

    programRef.current = forceSimulation(data)
      .alphaDecay(0.1)
      // .force(
      //   "collision",
      //   forceCollide()
      //     .radius(({ r }) => {
      //       return r.r;
      //     })
      //     .iterations(1)
      // )
      .force(
        "collide",
        rectCollide()
          .iterations(100)
          .size(function ({ r: { width, height } }) {
            return [width + safeArea, height + safeArea];
          })
      )
      .on("end", () => setNodes(data));
  }, []);

  useEffect(() => {
    computeLayout();
    return () => programRef.current.stop();
  }, [computeLayout]);

  return (
    <OuterBounds ref={boundsRef}>
      <GridContainer {...bind()} ref={gridRef} style={{ x, y, cursor }}>
        {nodes?.map(
          ({ x: pdsX, y: pdsY, r: { r, width = 0, height = 0 } }, i) => {
            const randNumber = Math.floor(Math.random() * 100);
            const url = `https://source.unsplash.com/random?sig={${randNumber}}`;

            return (
              <Image
                key={`image-${i}`}
                alt={`image`}
                layoutId={`image-${i}`}
                src={url}
                draggable="false"
                animate={{ x: pdsX || 0, y: pdsY || 0 }}
                transition={nodeTransition}
                $width={width}
                $height={height}
              />
            );
          }
        )}
      </GridContainer>
    </OuterBounds>
  );
}
