function filterCluster(data, cluster) {
  return d3.filter(data, d => d.Clusters == cluster);
}

function parseNumbers(arr) {
  for(let i = 0; i < arr.length; i++) arr[i] = eval(arr[i]);
  return arr;
}

function setGroups(divID) {

  let div = d3.select(divID);

  let svg = div.append("svg")
        .attr("height", height)
        .attr("width", width)
        .attr("id", "cluster0");

  let yAxisGroup = svg.append("g")
          .attr("id", "yAxis")
          .attr("transform", "translate(" + margin.left + ", 0)");

  return svg;
}

function drawCluster(svg, cluster, data, columns, yScale,
          clusterSizes, thickScale) {
  let df = filterCluster(data, cluster);
  let ncol = columns.length - 1;
  let fields = [];
  let counterfactuals = d3.map(df, d => d[""]);

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
            .range([margin.left, width - margin.right]);

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

  // we draw the lines
  let svgLines = svg.append("g")
          .attr("id", "cluster" + cluster + "Lines")
          .attr("transform", "translate(" + hShift + "," + margin.top + ")");

  let svgMouseOver = svg.append("g")
          .attr("id", "mouseOverArea")
          .attr("transform", "translate(" + hShift + "," + margin.top + ")");

  for(let i = 1; i < ncol - 1; i ++) {
    var previousField = columns[i];
    var nextField = columns[i + 1];

    var lineGroup = svgLines.append("g")
        .attr("id", previousField + nextField + "Lines");

    lineGroup.selectAll("line")
      .data(counterfactuals)
        .join("line")
        .attr("class", d => "cluster" + cluster + d)
        .attr("cluster", cluster)
        .attr("x1", (d, j) => {
          return fields[previousField]["scale"](fields[previousField]["df"][j]);
        })
        .attr("y1", yScale(previousField) - yScale.bandwidth()/2)
        .attr("x2", (d, j) => {
          return fields[nextField]["scale"](fields[nextField]["df"][j]);
        })
        .attr("y2", yScale(nextField) - yScale.bandwidth()/2)
        .attr("stroke-width", thickScale(clusterSizes[cluster]))
        .attr("stroke", "blue");


    let lineMouseGroup = svgMouseOver.append("g")
            .attr("id", "lineMouseGroup" + previousField + nextField);

    // insert transparent lines for highlight on mouse over

    lineMouseGroup.selectAll("line")
      .data(counterfactuals)
        .join("line")
        .attr("class", d => "mouseOverArea" + cluster + d)
        .attr("cluster", cluster)
        .attr("x1", (d, j) => {
          return fields[previousField]["scale"](fields[previousField]["df"][j]);
        })
        .attr("y1", yScale(previousField) - yScale.bandwidth()/2)
        .attr("x2", (d, j) => {
          return fields[nextField]["scale"](fields[nextField]["df"][j]);
        })
        .attr("y2", yScale(nextField) - yScale.bandwidth()/2)
        .attr("stroke-width", 6.9)
        .attr("stroke", "transparent")
        .on("mouseover", function(event, d) {
          // console.log(d)
          var elementClass = "cluster" + cluster + d;
          d3.select("#cluster" + this.attributes.cluster.value + "Lines")
            .selectAll("line")
            .attr("opacity", .05);

          d3.selectAll("." + elementClass)
            .attr("stroke", "red")
            .attr("stroke-width", 3)
            .attr("opacity", 1);
        })
        .on("mouseout", function(event, d) {
            var elementClass = "cluster" + cluster + d;
            d3.select("#cluster" + this.attributes.cluster.value + "Lines")
              .selectAll("line")
              .attr("stroke", "blue")
              .attr("stroke-width", thickScale(clusterSizes[cluster]))
              .attr("opacity", 1);
        });
  }

}
let margin = {top: 25, bottom: 25, left: 125, right: 17};
let height = 599;
let width = 219;

d3.csv("df_full.csv").then(function(data) {
  // read the data

  let svg = setGroups("#vis");
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
  for(let cluster of clusters) {

    drawCluster(svg, cluster, data, columns, yScale,
              clusterSizes, thickScale);

    if(!skip) {
      width = width - margin.left;
      margin.left = 5;
      skip = true;
    }

    if(cluster != d3.max(clusters)) {
      svg = container
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("id", "cluster" + (cluster + 1));
    }
  }
  // drawCluster(svg, 1, data, columns, yScale)

});
