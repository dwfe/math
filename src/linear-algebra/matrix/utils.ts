// region Regexp
function getCSSMatrixRegexp(is3D?: boolean) {
  let res = new Array(is3D ? 16 : 6).fill('(' + regexpNumberTemplate + ')').join(regexpSepTemplate);
  return new RegExp(`^\\s*matrix\\(${res}\\)\\s*$`);
}

const regexpNumberTemplate = '.*';
const regexpSepTemplate = ',\\s*';
export const regexpCSSMatrix2D = getCSSMatrixRegexp();
// endregion Regexp
