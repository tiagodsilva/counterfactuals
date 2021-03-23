import { getIndexes, filter, unique,
          sorted, map,
          parseNumbers, clone } from "./utils.js";
import * as d3 from "d3"; 
export function sortParallel(indexes, index, df, columns) {
  // console.log(indexes);
  if(indexes.length == 1 || index == columns.length) {
    // if(indexes.length != 1) {console.log(indexes)};
    return indexes;
  }

  let feat = columns[index];

  let xs = filter(df, indexes); // get the indexes

  let returnIndexes = [];
  for(let value of sorted(unique(xs, feat))) {
    // we need the indexes of `value` in xs
    var a = sortParallel(getIndexes(xs, feat, value), index + 1, df, columns);
    // console.log("a", a);
    returnIndexes = returnIndexes.concat(a);
    // console.log("b", returnIndexes);
  }

  return returnIndexes;

}


export function applyNoise(data, columns, ncol, origin, fdir) {
  let step = 1e-2;

  let aData = Object.assign({}, data);
  delete aData["columns"];
  let indexes = [];
  let originSteps = {};
  for(let j = 0; j < ncol; j++) {
    let feat = columns[j];
    let values = unique(aData, feat);
    let max = d3.max(values);
    let min = d3.min(values);

    let range = max == min ? 1 + max/15 : max - min;
    for(let value of values) {
      let iValues = getIndexes(aData, feat, value);
      if(j == 0) {
        indexes = sortParallel(iValues, j + 1, aData, columns);
        // sortp(iValues, j + 1, aData, columns);
      } else {
        indexes = sortParallel(iValues, j - 1, aData, columns);
        // sortp(iValues, j + 1, aData, columns);
      }

      let steps = [];
      for(let i = 0; i < indexes.length; i++) {
        steps[i] = step * range * i - step * range * indexes.length/2;
        aData[indexes[i]][feat] = +aData[indexes[i]][feat] + steps[i];
      }
      // console.log(feat, value, origin[feat]);
      if(value == origin[feat]) {
        originSteps[feat] = [-step * range * indexes.length/2,
                  step * range * indexes.length/2];
      }
    }
  }

  return {data: Object.values(aData),
            steps: originSteps};
}
