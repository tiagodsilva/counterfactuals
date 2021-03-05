function filterCluster(data, cluster) {
  return d3.filter(data, d => d.Clusters == cluster);
}

function parseNumbers(arr) {
  for(let i = 0; i < arr.length; i++) arr[i] = eval(arr[i]);
  return arr;
}

function setGroups(divID, df) {

  let div = d3.select(divID);

  let clusters = parseNumbers(d3.map(df, d => d.Clusters));
  clusters = clusters.filter((v, i, s) => s.indexOf(v) == i && v != -1);
  let lenClusters = clusters.length;
  // console.log(clusters);

  let svg = div.append("svg")
        .attr("height", height)
        .attr("width", width + 3.9)
        .attr("id", "cluster0");

  let yAxisGroup = svg.append("g")
          .attr("id", "yAxis")
          .attr("transform", "translate(" + margin.left + ", 0)");

  return svg;
}

function randomNoise(l, r) {
  let xl = l || -2
  var xr = r || 2
  return Math.random() * (xr - xl) + xl
}

function getClusterData(data, columns, cluster, yScale) {
  let fields = {}
  let df = filterCluster(data, cluster);
  let ncol = columns.length - 1;
  let axisGroup = d3.select("#cluster" + cluster + "Axis");
  for(let i = 1; i < columns.length - 1; i++) {
    let field = columns[i];
    dfField = parseNumbers(d3.map(df, d => d[field]));
    fields[field] = {}
    // the df.length'th row is the feature direction
    fields[field]["df"] = dfField;
    var fdir = d3.map(data, d => d[field]);
    fdir = fdir[fdir.length - 1];
    // draw the horizontal axis correspondent to
    // this field
    var vShift = margin.top + yScale(field) - yScale.bandwidth()/2;
    var hShift = 5
    fields[field]["group"] = axisGroup.append("g")
            .attr("id", "axis" + field)
            .attr("transform",
                "translate(" + hShift + "," + vShift + ")");

    // add the axis
    let min = fdir == 1 ? d3.min(dfField) : d3.max(dfField);
    let max = fdir == 1 ? d3.max(dfField) : d3.min(dfField);

    // I am using a random nosie; however,
    // the visual was a kinda of strange

    if(min == max) {
      fields[field]["scale"] = d3.scaleLinear()
              .domain([min, max + 1e-3])
              .range([margin.left, width - margin.right]);

      fields[field]["axis"] = d3.axisBottom()
              .scale(fields[field]["scale"])
              .ticks(2)
              .tickSizeOuter(0)
              .tickFormat(x => Math.floor(x * 1000)/1000)
              .tickValues([max]);
    } else {
      fields[field]["scale"] = d3.scaleLinear()
              .domain([min, max])
              .range([margin.left, width - margin.right]);

      fields[field]["axis"] = d3.axisBottom()
              .scale(fields[field]["scale"])
              .ticks(2)
              .tickSizeOuter(0)
          }

    fields[field]["group"].call(fields[field]["axis"])
        .call(g => g.select(".domain"))
        .call(g => g.attr("font-size", 8));
  }

  return fields;
}

function getNoise(lines, x, self, range) {
  // we will get the near lines
  let toArray = d => Array.prototype.slice.call(d);
  let arrayOfLines = toArray(lines.getElementsByTagName("line"));
  let nearLines = [];
  let index = 0;
  for(let i = 0; i < arrayOfLines.length; i++) {
    let l = arrayOfLines[i];
    let lx = d3.select(l).attr("x2");

    if(Math.abs(lx - x) < 2 * range) {
      nearLines.push(l);
    }
  }

  nearLines.sort(function(a, b) {
    return d3.select(a).attr("x2") - d3.select(b).attr("x2")
  });

  for(let w = 0; w < nearLines.length; w++) {
    if(d3.select(nearLines[w]).attr("x2") == x) {
      index = w;
    }
  }

  // console.log(index);
  let xs = d3.map(nearLines, d => d3.select(d).attr("x2"));

  let noiseRange = nearLines.length > 2 ? 2 : 1;
  let noise = 0;

  let noiseScale = d3.scaleLinear()
          .domain([0, nearLines.length])
          .range([-range, range]);

  return {noiseScale, index};
}

function getPreviousX(fieldA, fieldB, cluster, d) {
  let thisCluster = document.getElementById("cluster" + cluster + "Lines");
  let lines = thisCluster.getElementsByClassName(fieldA +
            fieldB + "Lines")[0];
  let previousLine = lines.getElementsByClassName("cluster" + cluster + d)[0];
  let previousX = d3.select(previousLine).attr("x2");
  return previousX;
}

function drawCluster(svg, cluster, data, columns, yScale) {
  svg.append("g")
    .attr("class", "clusterName")
    .append("text")
    .attr("x", (margin.left + width - margin.right)/2)
    .attr("y", margin.top)
    .attr("text-anchor", "middle")
    .attr("font-size", 10.5)
    .text("Cluster " + cluster);

  let axisGroup = svg.append("g")
          .attr("id", "cluster" + cluster + "Axis");

  let fields = getClusterData(data, columns, cluster, yScale);
  var hShift = 5;

  let df = filterCluster(data, cluster);
  let ncol = columns.length - 1;
  let counterfactuals = d3.map(df, d => d[""]);

  // we draw the lines
  let svgLines = svg.append("g")
          .attr("id", "cluster" + cluster + "Lines")
          .attr("transform", "translate(" + hShift + "," + margin.top + ")");

  let svgMouseOver = svg.append("g")
          .attr("id", "mouseOverArea")
          .attr("transform", "translate(" + hShift + "," + margin.top + ")");

  for(let i = 1; i < ncol - 1; i ++) {
    // we will draw the lines here
    var previousField = columns[i];
    var nextField = columns[i + 1];

    var lineGroup = svgLines.append("g")
        .attr("class", previousField + nextField + "Lines");

    lineGroup.selectAll("line")
      .data(counterfactuals)
        .join("line")
        .attr("class", d => "cluster" + cluster + d)
        .attr("cluster", cluster)
        .attr("debug", (d, j) => {

          let previousScale = fields[previousField]["scale"];
          let previousSelf = fields[previousField]["df"][j];

          let nextScale = fields[nextField]["scale"];
          let nextSelf = fields[nextField]["df"][j];

          return "[" + previousSelf + "," +  nextSelf + "]";
        })
        .attr("x1", (d, j) => {
          if(i == 1) {
            // for the initial field
            let scale = fields[previousField]["scale"];
            let self = fields[previousField]["df"][j];
            return scale(self);
          } else {
            // for the other fields, we can get the actual x position
            let previousPreviousField = columns[i - 1];
            let previousX = getPreviousX(previousPreviousField, previousField,
                    cluster, d);
            return previousX;
          }
        })
        .attr("y1", yScale(previousField) - yScale.bandwidth()/2)
        .attr("x2", (d, j) => {
          if(i == 1) {
            // we will count the colinear lines
            let scale = fields[nextField]["scale"];
            let self = fields[nextField]["df"][j];

            let noiseRange = 2;
            let dir = d3.map(data, d => d[nextField]);
            dir = dir[dir.length - 1];
            let noise;
            if(self == d3.max(fields[nextField]["df"])) {
              noise = randomNoise(.1, noiseRange * 1.5);
            } else if(self == d3.min(fields[nextField]["df"])) {
              noise = randomNoise(-noiseRange * 1.5, -.1);
            } else {
              noise = randomNoise(-noiseRange, noiseRange);
            }

            return scale(self) + noise;
          } else {
            let previousPreviousField = columns[i - 1]

            let self = fields[nextField]["df"][j];
            let thisCluster = document.getElementById("cluster" + cluster + "Lines");
            let lines = thisCluster.getElementsByClassName(previousPreviousField +
                    previousField + "Lines")[0];

            let dir = d3.map(data, d => d[nextField]);
            dir = dir[dir.length - 1];

            let scale = fields[nextField]["scale"];
            let list = fields[nextField]["df"];

            let previousData = fields[previousField]["df"];
            let previousScale = fields[previousField]["scale"];

            let range = 2;
            let previousSelf = previousScale(previousData[j]);
            let previousX = getPreviousX(previousPreviousField, previousField,
                    cluster, d);
            let {noiseScale, index} = getNoise(lines, previousX, previousSelf, range);
            // this function will check for the previous lines
            // and choose the random noise based on it
            // console.log(dir);
            if(dir == 1 || d3.min(list) == d3.max(list)) {
              if(self == d3.min(list)) {
                noiseScale = noiseScale.range([.1, range * 1.5]);
              } else if(self == d3.max(list)) {
                noiseScale = noiseScale.range([-range * 1.5, -.1]);
              }
            } else if(dir == -1) {
              if(self == d3.min(list)) {
                noiseScale = noiseScale.range([-range * 1.5, -.1]);
              } else if(self == d3.max(list)) {
                noiseScale = noiseScale.range([.1, range * 1.5]);
              }
            }

            let noise = noiseScale(index);
            // maybe the noise isn't needed in the bottom axis.
            return scale(self) + noise;
          }
        })
        .attr("y2", yScale(nextField) - yScale.bandwidth()/2)
        .attr("stroke-width", .5 || thickScale(clusterSizes[cluster]))
        .attr("stroke", "blue")
        .on("mouseover", function(event, d) {
          // console.log(d)
          var elementClass = "cluster" + cluster + d;
          d3.select("#cluster" + this.attributes.cluster.value + "Lines")
            .selectAll("line")
            .attr("opacity", .05);

          d3.selectAll("." + elementClass)
            .attr("stroke", "red")
            .attr("stroke-width", 1)
            .attr("opacity", 1);
        })
        .on("mouseout", function(event, d) {
            var elementClass = "cluster" + cluster + d;
            d3.select("#cluster" + this.attributes.cluster.value + "Lines")
              .selectAll("line")
              .attr("stroke", "blue")
              .attr("stroke-width", .5 || thickScale(clusterSizes[cluster]))
              .attr("opacity", 1);
        });


    let lineMouseGroup = svgMouseOver.append("g")
            .attr("id", "lineMouseGroup" + previousField + nextField);

  }

}
let margin = {top: 25, bottom: 25, left: 125, right: 17};
let height = 599;
let width = 219;

d3.csv("df_full.csv").then(function(data) {
  // read the data

  let svg = setGroups("#vis", data);
  let container = d3.select("#vis");

  // get the columns and the Y scale
  let columns = Object.keys(data[0])
  let ncol = columns.length - 1;

  // get the clusters
  let clusters = d3.map(data, d => d.Clusters);
  clusters = clusters.filter((v, i, s) => s.indexOf(v) == i && v != -1);
  clusters = parseNumbers(clusters).sort((a, b) => a - b);

  let yScale = d3.scaleBand()
          .domain(columns.slice(1, ncol))
          .range([margin.top, height - margin.bottom]);

  // draw both axis
  let yAxis = d3.axisLeft()
          .scale(yScale);

  d3.select("#yAxis")
    .call(yAxis)
    .call(g => g.selectAll("line").attr("opacity", 0))
    .call(g => g.selectAll(".domain").attr("opacity", 0));

  // for the thickness scale, we need to get the
  // max size of a cluster

  var maxCluster = 0;
  var clusterSizes = {};
  for(let cluster of clusters) {
    var curSize = d3.filter(data, d => d.Clusters == cluster).length;
    clusterSizes[cluster] = curSize;
    if(curSize > maxCluster) {
      maxCluster = curSize;
    }
  }
  let thickScale = d3.scaleLinear()
          .domain([0, maxCluster])
          .range([0, 2.5]);

  // now, we draw the horizontal axis
  // for this, we take the values of each field
  var skip = false;
  // let svgToSave = [];
  for(let cluster of clusters) {

    drawCluster(svg, cluster, data, columns, yScale,
              clusterSizes, thickScale);

    if(!skip) {
      width = width - margin.left;
      margin.left = 9;
      skip = true;
    }

    if(cluster != d3.max(clusters)) {
      let boundingBox = svg._groups[0][0].getBoundingClientRect();
      svg = container
            .append("svg")
            .attr("width", width + 3.9)
            .attr("height", height)
            .attr("id", "cluster" + (cluster + 1));
    }
  }
  // drawCluster(svg, 1, data, columns, yScale)

});
