import * as d3 from 'd3';

const random = (min, max) => d3.randomInt(min, max)();

export const data = [...new Array(30).fill({})].map(() => {
  const width = random(200, 300);
  const height = random(200, 300);
  const id = random(0, 100);
  const url = `https://picsum.photos/id/${id}/${width}/${height}`;

  return {
    width,
    height,
    url,
  };
});
