export const dampen = (val, [min, max], factor = 3) => {
  if (val > max) {
    let extra = val - max;
    let dampenedExtra = extra > 0 ? Math.sqrt(extra) : -Math.sqrt(-extra);
    return max + dampenedExtra * factor;
  } else if (val < min) {
    let extra = val - min;
    let dampenedExtra = extra > 0 ? Math.sqrt(extra) : -Math.sqrt(-extra);
    return min + dampenedExtra * factor;
  } else {
    return val;
  }
};
