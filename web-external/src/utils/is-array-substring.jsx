let { min } = Math;

const isArraySubstring = (a, b) => {
  let result = true;
  let n = min(a.length, b.length);
  let i;

  for (i = 0; i < n; ++i) {
    result = (a[i] === b[i]);
    if (!result) { break; }
  }

  return result;
};

export default isArraySubstring;
