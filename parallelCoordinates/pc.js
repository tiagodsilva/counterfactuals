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
  let mainSVG = d3.select("#visContainer")
          .append("svg")
          .attr("height", height)
          .attr("width", width + (width + 9 - margin.left) * (lenClusters - 1))
          .attr("id", "vis");

  let svg = mainSVG.append("svg")
        .attr("height", height)
        .attr("width", width)
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
  for(let field of columns.slice(1, columns.length - 1)) {
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

    fields[field]["scale"] = d3.scaleLinear()
            .domain([min, max])
            .range([margin.left - 2, width - margin.right + 2]);

    fields[field]["axis"] = d3.axisBottom()
            .scale(fields[field]["scale"])
            .ticks(2)
            .tickSizeOuter(0)

    if(min == max) {
      fields[field]["axis"] = fields[field]["axis"]
              .tickFormat(x => Math.floor(x * 1000)/1000);
    }

    fields[field]["group"].call(fields[field]["axis"])
        .call(g => g.select(".domain"))
        .call(g => g.attr("font-size", 8));
  }

  return fields;
}

function getNoise(lines, id) {
  let line = lines.getElementsByClassName(id)[0];
  let lineX = d3.select(line).attr("x2");

  // we will get the near lines
  let toArray = d => Array.prototype.slice.call(d);
  let arrayOfLines = toArray(lines.getElementsByTagName("line"));
  let nearLines = [];
  for(let l of arrayOfLines) {
    let x = d3.select(l).attr("x2");
    if(Math.abs(x - lineX) < 4) {
      nearLines.push(l);
    }
  }

  let xs = d3.map(nearLines, d => d3.select(d).attr("x2"));

  let noise = 0;
  if(nearLines.length != 0) {
    let noiseScale = d3.scaleLinear()
            .domain([d3.min(xs), d3.max(xs)])
            .range([-2, 2]);
    noise = noiseScale(lineX);
  }

  return noise;
}

function drawCluster(svg, cluster, data, columns, yScale,
          clusterSizes, thickScale) {
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
        .attr("x1", (d, j) => {
          if(i == 1) {
            // for the initial field
            return fields[previousField]["scale"](fields[previousField]["df"][j]);
          } else {
            // for the other fields, we can get the actual x position
            let previousPreviousField = columns[i - 1];
            let thisCluster = document.getElementById("cluster" + cluster + "Lines");
            let lines = thisCluster.getElementsByClassName(previousPreviousField +
                      previousField + "Lines")[0];
            let previousLine = lines.getElementsByClassName("cluster" + cluster + d)[0];
            let previousX = d3.select(previousLine).attr("x2");
            return previousX;
          }
        })
        .attr("y1", yScale(previousField) - yScale.bandwidth()/2)
        .attr("x2", (d, j) => {
          if(i == 1) {
            // we will count the colinear lines
            let noise = randomNoise(-2, 2);
            console.assert(noise >= -4 && noise <= 4);
            return fields[nextField]["scale"](fields[nextField]["df"][j]) + noise;
          } else {
            let previousPreviousField = columns[i - 1]
            let thisCluster = document.getElementById("cluster" + cluster + "Lines");
            let lines = thisCluster.getElementsByClassName(previousPreviousField +
                    previousField + "Lines")[0];
            // this function will check for the previous lines
            // and choose the random noise based on it
            let noise = getNoise(lines,
                    "cluster" + cluster + d);
            let x = fields[nextField]["scale"](fields[nextField]["df"][j]);

            return x + noise;
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
  let svgToSave = [];
  for(let cluster of clusters) {

    drawCluster(svg, cluster, data, columns, yScale,
              clusterSizes, thickScale);

    if(!skip) {
      width = width - margin.left;
      margin.left = 9;
      skip = true;
    }

    svgToSave.push(svg);

    if(cluster != d3.max(clusters)) {
      let boundingBox = svg._groups[0][0].getBoundingClientRect();
      svg = container
            .append("svg")
            .attr("x", boundingBox.right - 15)
            .attr("width", width + 9)
            .attr("height", height)
            .attr("id", "cluster" + (cluster + 1));
    }
  }
  // drawCluster(svg, 1, data, columns, yScale)

});
