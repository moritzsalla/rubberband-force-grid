import { randomInt } from 'd3-random';

const random = (min, max) => randomInt(min, max)();

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
