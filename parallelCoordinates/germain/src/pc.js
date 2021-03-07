function filterCluster(data, cluster) {
  return d3.filter(data, d => cluster.includes(d[""]));
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

  let axisWidth = 129;

  let svgAxis = div.append("svg")
        .attr("height", height)
        .attr("width", axisWidth)
        .attr("id", "yAxisGraphic");
  /*
  let svg = div.append("svg")
        .attr("height", height)
        .attr("width", width + 3.9)
        .attr("id", "cluster0");
  */
  let yAxisGroup = svgAxis.append("g")
          .attr("id", "yAxis")
          .attr("transform", "translate(" + axisWidth + ", 0)");

  // return svg;
}

function setDiv(divID) {
  d3.select("#container")
    .append("div")
    .attr("id", divID)
    .style("display", "inline-block")
    .style("height", "100%");
}

function randomNoise(l, r) {
  let xl = l || -2
  var xr = r || 2
  return Math.random() * (xr - xl) + xl
}

function sortParallel(indexes, index, df, columns) {
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

function sortp(indexes, index, df, columns) {
  window.returnIndexes = [];
  // sortParallel(indexes, index, df, columns);
  // console.log(sortParallel(indexes, index, df, columns));
  return sortParallel(indexes, index, df, columns);
}
// utils functions for noise
// ************************************************************************ //
function getIndexes(list, feat, v) {
  let indexes = [];
  let index = 0;

  for(let key of Object.keys(list)) {
    if(list[key][feat] == v) {
      indexes.push(key);
    }
  }

  return indexes;
}

function filter(list, indexes) {
  let obj = {};
  for(let key of Object.keys(list)) {
    if(indexes.includes(key)) {
      obj[key] = list[key];
    }
  }
  return obj;
}

function unique(list, feat) {
  let arr = Object.values(list);
  arr = d3.map(arr, d => d[feat]);
  return arr.filter((v, i, s) => s.indexOf(v) == i);
}

function sorted(list) {
  return list.slice().sort((a, b) => a - b);
}

function map(list, field) {
  let df = d3.map(list, d => d[field]);
  return df.slice(0, df.length - 1);
}
// ************************************************************************ //

function debug(data, columns, ncol, fdir) {
  let step = 1e-2;

  let aData = Object.assign({}, data);
  delete aData["columns"];
  let indexes = [];
  for(let j = 0; j < ncol; j++) {
    let feat = columns[j];
    let values = unique(aData, feat);
    let max = d3.max(values);
    let min = d3.min(values);
    let range = max - min;

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
    }
  }

  return Object.values(aData);
}


function getClusterData(data, columns, ncol, cluster, clusterIndex, yScale) {
  let fields = {}
  featureDirections = data[data.length - 1];
  let df = debug(filterCluster(data, cluster), columns, ncol, featureDirections);
  let noiseFree = filterCluster(data, cluster);
  // console.log(df);
  // df = debug(df, columns, ncol);
  // console.log(df);
  // let ncol = columns.length - 1;
  let axisGroup = d3.select("#cluster" + clusterIndex + "Axis");
  for(let i = 0; i < ncol; i++) {
    let field = columns[i];
    dfField = parseNumbers(d3.map(df, d => d[field]));
    let nf = parseNumbers(d3.map(noiseFree, d => d[field]));
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

    if(d3.min(nf) == d3.max(nf)) {
      fields[field]["scale"] = d3.scaleLinear()
              .domain([min, max * 2])
              .range([margin.left, width - margin.right]);

      fields[field]["axis"] = d3.axisBottom()
              .scale(fields[field]["scale"])
              .ticks(2)
              .tickSizeOuter(0);
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

function getPreviousX(fieldA, fieldB, cluster, d) {
  let thisCluster = document.getElementById("cluster" + cluster + "Lines");
  // console.log(fieldA, fieldB);
  let lines = thisCluster.getElementsByClassName(fieldA +
            fieldB + "Lines")[0];
  let previousLine = lines.getElementsByClassName("cluster" + cluster + d)[0];
  let previousX = d3.select(previousLine).attr("x2");
  return previousX;
}

function drawCluster(svg, cluster, clusterIndex, data, columns, ncol, yScale,
          clusterSizes, thickScale) {
  svg.append("g")
    .attr("class", "clusterName")
    .append("text")
    .attr("x", (margin.left + width - margin.right)/2)
    .attr("y", margin.top)
    .attr("text-anchor", "middle")
    .attr("font-size", 10.5)
    .text("Cluster " + clusterIndex);

  let axisGroup = svg.append("g")
          .attr("id", "cluster" + clusterIndex + "Axis");

  let fields = getClusterData(data, columns, ncol, cluster, clusterIndex, yScale);
  var hShift = 5;

  let df = filterCluster(data, cluster);
  // let ncol = columns.length - 1;
  let counterfactuals = d3.map(df, d => d[""]);

  // we draw the lines
  let svgLines = svg.append("g")
          .attr("id", "cluster" + clusterIndex + "Lines")
          .attr("transform", "translate(" + hShift + "," + margin.top + ")");

  let svgMouseOver = svg.append("g")
          .attr("id", "mouseOverArea")
          .attr("transform", "translate(" + hShift + "," + margin.top + ")");

  for(let i = 0; i < ncol - 1; i ++) {
    // we will draw the lines here
    var previousField = columns[i];
    var nextField = columns[i + 1];
    // console.log(fields[previousField]);
    var lineGroup = svgLines.append("g")
        .attr("class", previousField + nextField + "Lines");

    lineGroup.selectAll("line")
      .data(counterfactuals)
        .join("line")
        .attr("class", d => "cluster" + clusterIndex + d)
        .attr("cluster", clusterIndex)
        .attr("debug", (d, j) => {

          let previousScale = fields[previousField]["scale"];
          let previousSelf = fields[previousField]["df"][j];

          let nextScale = fields[nextField]["scale"];
          let nextSelf = fields[nextField]["df"][j];

          return "[" + previousSelf + "," +  nextSelf + "]";
        })
        .attr("x1", (d, j) => {
          let scale = fields[previousField]["scale"];
          let self = fields[previousField]["df"][j];
          return scale(self);
        })
        .attr("y1", yScale(previousField) - yScale.bandwidth()/2)
        .attr("x2", (d, j) => {
            let self = fields[nextField]["df"][j];
            let scale = fields[nextField]["scale"];
            return scale(self);
        })
        .attr("y2", yScale(nextField) - yScale.bandwidth()/2)
        .attr("stroke-width", .5 || thickScale(clusterSizes[cluster]))
        .attr("stroke", "blue")
        .on("mouseover", function(event, d) {
          // console.log(d)
          var elementClass = "cluster" + this.attributes.cluster.value + d;
          d3.select("#cluster" + this.attributes.cluster.value + "Lines")
            .selectAll("line")
            .attr("opacity", .05);
          // console.log(elementClass);
          d3.selectAll("." + elementClass)
            .attr("stroke", "red")
            .attr("stroke-width", 1)
            .attr("opacity", 1);
        })
        .on("mouseout", function(event, d) {
            var elementClass = "cluster" + clusterIndex + d;
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

function addContextMenu(svg) {
	// initially, we need to remove the svg
	svg.append("rect")
    .attr("x", width - margin.right)
    .attr("y", margin.top/2)
    .attr("width", 9)
    .attr("height", 9)
    .attr("stroke", "black")
    .attr("fill", "red")
    .on("mouseover", function(event, d) {
      d3.select(this)
        .attr("opacity", .5);
    })
    .on("mouseout", function(event, d) {
      d3.select(this)
        .attr("opacity", 1);
    })
    .on("click", function (event, d) {
		const self = this.parentElement;
    // console.log(self);
		// before removing it,
		// we need to move the subsequent clusters
		let regex = /\d+/;
		let clusterIndex = +self.id.match(regex)[0];
		let container = document.getElementById("vis");
		let cluster = container.lastChild;
		let maxCluster = +cluster.id.match(regex)[0];
    // console.log(clusterIndex, maxCluster);
		// now, we will rename each cluster
		// that lies after this
		for(let i = clusterIndex + 1; i < maxCluster + 1; i++) {
  		let cluster = d3.select("#cluster" + i)

      cluster
  			.selectAll(".clusterName")
        .selectAll("text")
  			.text("Cluster " + (i - 1));

      cluster
        .select("#cluster" + i + "Axis")
        .attr("id", "cluster" + (i - 1) + "Axis");

      // we need to modify the lines!
      let linesGroup = document.getElementById("cluster" + i + "Lines");
      let lines = linesGroup.getElementsByTagName("line");

      for(let line of lines) {
        let elementClass = line.classList[0];
        // let re = /\d+/;
        line.classList.replace(elementClass, elementClass.replace(regex, i - 1));
        line.setAttribute("cluster", i - 1);

      }

      // console.log(clusters);
      linesGroup.id = "cluster" + (i - 1) + "Lines";

			d3.select("#cluster" + i)
				.attr("id", "cluster" + (i - 1));

      clusters[i - 1] = clusters[i];
		}
    clusters.pop(clusters.length - 1);
		// now, we can remove this svg
		d3.select(self).remove();

	})
}

function drawAxis(data) {
  setGroups("#vis", data);
  let columns = Object.keys(data[0]);
  columns = columns.filter(d => d != "Clusters" && d != "");
  let yScale = d3.scaleBand()
          .domain(columns)
          .range([margin.top, height - margin.bottom]);
  console.log(columns);
  let yAxis = d3.axisLeft()
          .scale(yScale);

  d3.select("#yAxis")
    .call(yAxis)
    .call(g => g.selectAll("line").attr("opacity", 0))
    .call(g => g.selectAll(".domain").attr("opacity", 0));

}

function newCluster(data, columns, ncol, cluster, index) {
  let container = d3.select("#vis");
  let svg = container
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("id", "cluster" + index);
  addContextMenu(svg);
  let yScale = d3.scaleBand()
          .domain(columns)
          .range([margin.top, height - margin.bottom]);

  drawCluster(svg, cluster, index, data, columns, ncol, yScale);
}

let margin = {top: 25, bottom: 25, left: 9, right: 17};
let height = 599;
let width = 113;

/*
d3.csv("data/df_full.csv").then(function(data) {
  // read the data
  drawAllClusters(data);
});
*/
