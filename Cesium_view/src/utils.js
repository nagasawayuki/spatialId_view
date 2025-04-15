function computeAxisBounds(binaryStr, headerBitLengthStr) {
  const headerBitLength = parseInt(headerBitLengthStr, 2);
  const lower = binaryStr;
  const extractedVal = parseInt(binaryStr, 2);
  const upperVal = extractedVal + 1;
  const upper = upperVal.toString(2).padStart(headerBitLength, '0');

  return { lower, upper };
}
export { computeAxisBounds };

