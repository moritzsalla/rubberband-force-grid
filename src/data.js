import * as d3 from 'd3';

const random = (min, max) => d3.randomInt(min, max)();

export const data = [...new Array(30).fill({})].map(() => {
  const width = random(100, 200);
  const height = random(100, 200);
  const id = random(0, 100);
  const url = `https://picsum.photos/id/${id}/${width}/${height}`;

  return {
    width,
    height,
    url,
  };
});

export const safeArea = 20;
