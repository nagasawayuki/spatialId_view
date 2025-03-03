function computeAxisBounds(binaryStr, headerBitLength) {
    const lower = binaryStr;
    const upperVal = parseInt(binaryStr, 2) + 1;
    const upper = upperVal.toString(2).padStart(20, "0");
    return { lower, upper };
  }
  export { computeAxisBounds };
  
  