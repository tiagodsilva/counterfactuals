import * as d3 from "d3";
export function getIndexes(list, feat, v) {
  let indexes = [];
  let index = 0;

  for(let key of Object.keys(list)) {
    if(list[key][feat] == v) {
      indexes.push(key);
    }
  }

  return indexes;
}

export function filter(list, indexes) {
  let obj = {};
  for(let key of Object.keys(list)) {
    if(indexes.includes(key)) {
      obj[key] = list[key];
    }
  }
  return obj;
}

export function unique(list, feat) {
  let arr = Object.values(list);
  arr = d3.map(arr, d => d[feat]);
  return arr.filter((v, i, s) => s.indexOf(v) == i);
}

export function sorted(list, dir) {
  let direction = dir || 1
  return list.slice().sort((a, b) => direction * (a - b));
}

export function map(list, field) {
  let df = d3.map(list, d => d[field]);
  return df.slice(0, df.length - 1);
} 

export function clone(data, columns) {
  let dummy = [];
  for(let i = 0; i < data.length; i++) {
    dummy[i] = {};
    dummy[i][""] = data[i][""];
    for(let field of columns) {
      // console.log(data[i], data[i][field], field);
      let v = data[i][field];
      // v = data[i][field];
      dummy[i][field] = v;
    }
  }
  return dummy;
}

export function parseNumbers(arr) {
  for(let i = 0; i < arr.length; i++) arr[i] = eval(arr[i]);
  return arr;
}

