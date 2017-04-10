/**
 * scatter elements in array among n consumers
 */
const scatter = (array, n, interleave=false) => {
  let i;
  let a, b=0;
  let m = array.length;
  let mModN = m%n;
  let mDivN = Math.floor(m/n);
  let mDivNPlus1 = mDivN + 1;
  let result = new Array(n);

  if (interleave) {
    for (i=0; i<n; ++i) {
      result[i] = new Array(i < mModN ? mDivNPlus1 : mDivN);
    }

    for (i=0; i<m; ++i) {
      result[i % n][Math.floor(i/n)] = array[i];
    }
  } else {
    for (i=0; i<mModN; ++i) {
      a = b;
      b += mDivNPlus1;
      result[i] = array.slice(a, b);
    }

    for (i=mModN; i<n; ++i) {
      a = b;
      b += mDivN;
      result[i] = array.slice(a, b);
    }
  }

  return result;
};

export default scatter;
