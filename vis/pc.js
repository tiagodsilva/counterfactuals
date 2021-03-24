import * as d3 from "d3";
import { sortParallel, applyNoise } from "../utils/noise.js";
import { clone, parseNumbers } from "../utils/utils.js";
//export const colors = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
var colors = d3.scaleOrdinal(d3.schemePastel1);//d3.schemeAccent); 

console.log(d3.schemeSet2)

function filterCluster(data, cluster) {
  // console.log(data, cluster);
  return d3.filter(data, d => cluster.includes(d[""]));
}

function setGroups(divID, df) {

  let div = d3.select(divID);

  let axisWidth = 129;

  let svgAxis = div.append("svg")
        .attr("height", height)
        .attr("width", axisWidth)
        .attr("id", "yAxisGraphic");

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

function getFieldRange(data, field) {
  let v = d3.map(data, d => d[field]);
  v = v.slice(0, v.length - 1);
  return [d3.min(v), d3.max(v)];
}

function getClusterData(data, columns, ncol, cluster, clusterIndex, yScale) {
  let fields = {}
  let featureDirections = data[data.length - 1];
  let noiseFree = filterCluster(data, cluster);
  let nf = {};
  for(let field of columns) {
    nf[field] = d3.map(noiseFree, d => d[field]);
  }
  // console.log(nf);
  let origin = {};

  for(let field of columns) {
    origin[field] = d3.map(data, d => d[field])[0];
  }
  console.log(origin);
  let dummyData = clone(data, columns);
  // console.log(dummyData);
  let noiseData = applyNoise(filterCluster(dummyData, cluster), columns, ncol, origin);
  let df = noiseData.data;
  let steps = noiseData.steps;

  let fullNoiseData = applyNoise(clone(data, columns), columns, ncol, origin).data;
  let axisGroup = d3.select("#cluster" + clusterIndex + "Axis");
  for(let i = 0; i < ncol; i++) {
    let field = columns[i];
    let dfField = parseNumbers(d3.map(df, d => d[field]));
    // let nf = parseNumbers(d3.map(filterCluster(data, cluster), d => d[field]));

    fields[field] = {}
    // the df.length'th row is the feature direction
    fields[field]["df"] = dfField;
    fields[field]["nf"] = nf;
    // console.log(nf);
    // fields[field]["nf"] = nf;
    var fdir = d3.map(data, d => d[field]);
    fdir = fdir[fdir.length - 1];
    // draw the horizontal axis correspondent to
    // this field
    var vShift = margin.top + yScale(field) - yScale.bandwidth()/2;
    var hShift = 5
    fields[field]["dummyGroup"] = axisGroup.append("g")
            .attr("id", "axis" + field)
            .attr("transform",
                "translate(" + hShift + "," + vShift + ")");

    fields[field]["group"] = axisGroup.append("g")
            .attr("id", "axis" + field)
            .attr("transform",
                  "translate(" + hShift + "," + vShift + ")");

    // add the axis (check feature direction)
    let min = d3.min(dfField);
    let max = d3.max(dfField);

    let domain = getFieldRange(fullNoiseData, field);

    fields[field]["fdir"] = fdir;
    // I am using a random nosie; however,
    // the visual was a kinda of strange
    fields[field]["origin"] = origin[field];
    // console.log(nf);
    let mid = (margin.left + width - margin.right)/2;
    let range = fdir == 1 ? [mid, width - margin.right] : [margin.left, mid];
    // console.log(field, domain);

    if(d3.min(nf[field]) == d3.max(nf[field]) && d3.max(nf[field]) == origin[field]) {
      fields[field]["scale"] = d3.scaleLinear()
              .domain([min - (max/15 + 1), max + (max/15 + 1)])
              .range([margin.left, width - margin.right]);
      // console.log(origin[field]);
      // let midScale = fields[field]["scale"].invert(mid);
      fields[field]["dummyAxis"] = d3.axisBottom()
              .scale(fields[field]["scale"])
              .ticks(2)
              .tickSizeInner(0)
              .tickSizeOuter(0)
              .tickFormat(x => Math.floor(x * 1000)/1000)
              .tickValues([max]);

      fields[field]["axis"] = d3.axisBottom()
              .scale(fields[field]["scale"])
              // .ticks(2)
              .tickSizeOuter(0)
              .tickFormat(x => Math.floor(x * 1000)/1000)
              .tickValues([origin[field]]);

    } else {
      let temp = d3.scaleLinear()
              .domain([min, max])
              .range([margin.left, width - margin.right]);

      fields[field]["dummyAxis"] = d3.axisBottom()
              .scale(temp)
              .ticks(2)
              .tickSizeInner(0)
              .tickSizeOuter(0)

      // console.log(field, steps[field]);
      if(steps[field]) {
        // console.assert(origin[field]);
        let s = temp;
        let inc = +origin[field] - fdir * steps[field][1];
        inc = Math.abs(s(inc) - s(+origin[field]));
        fdir == 1 ? range[0] = range[0] - inc/2 : range[1] = range[1] + inc/2;
      }

      // console.log(range, mid, fdir);
      let domain = fdir == 1 ? [origin[field], max] : [min, origin[field]];
      if(fdir == 1 && origin[field] > min) domain[0] = min;
      if(fdir == -1 && origin[field] < max) domain[1] = max;
      // console.log(domain, [min, max]);
      fields[field]["scale"] = d3.scaleLinear()
              .domain(domain)
              .range(range);

      fields[field]["axis"] = d3.axisBottom()
              .scale(fields[field]["scale"])
              .ticks(1)
              .tickSizeOuter(0);
          }

    fields[field]["dummyGroup"].call(fields[field]["dummyAxis"])
        .call(g => g.select(".domain"))
        .call(g => g.attr("font-size", 1e-15));
        // .call(g => g.attr("stroke", fdir == 1 ? "green" : "red")
              // .attr("stroke-width", d3.min(nf[field]) == d3.max(nf[field]) ? 4 : 1));

  // with the centralized origin, we need two axis:
  // one with the line itself and other with
  // the ticks (the marks!).

    fields[field]["group"].call(fields[field]["axis"])
            .call(g => g.select(".domain").attr("stroke", "transparent"))
            .call(g => g.attr("font-size", 9));
  }

  return fields;
}

export function drawCluster(svg, cluster, clusterIndex, data, columns, ncol, yScale,
          clusterSizes, thickScale) {
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

  let mid = (width - margin.right + margin.left)/2;

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

          // return "[" + previousSelf + "," +  nextSelf + "]";
          return "{origin: " + fields[previousField]["origin"] + "," +
                  fields[previousField]["df"][j] + "}"
        })
        .attr("x1", (d, j) => {
          let scale = fields[previousField]["scale"];
          let self = fields[previousField]["df"][j];
          let fdir = fields[previousField]["fdir"];
          return scale(self);
        })
        .attr("y1", yScale(previousField) - yScale.bandwidth()/2)
        .attr("x2", (d, j) => {
            let data = fields[nextField]["df"];
            let previousData = fields[previousField]["df"];
            let self = data[j];
            let scale = fields[nextField]["scale"];
            let fdir = fields[nextField]["fdir"];
            return scale(self);
        })
        .attr("y2", yScale(nextField) - yScale.bandwidth()/2)
        .attr("opacity", 1)
        .attr("stroke-width", .5 || thickScale(clusterSizes[cluster]))
        .attr("stroke", d => d.includes("R") ? '#8da0cb' : d.includes("S") ?
                                    '#fdbb84' : "red")//fc8d62
        .on("mouseover", function(event, d) {
          // console.log(d)
          var elementClass = "cluster" + this.attributes.cluster.value + d;
          d3.select("#cluster" + this.attributes.cluster.value + "Lines")
            .selectAll("line")
            .attr("opacity", .05);
          // console.log(elementClass);
          // console.log(fields[previousField]["df"], fields[previousField]["origin"])
          d3.selectAll("." + elementClass)
            .attr("stroke-width", 0.5)
            .attr("opacity", 1);
        })
        .on("mouseout", function(event, d) {
            var elementClass = "cluster" + clusterIndex + d;
            d3.select("#cluster" + this.attributes.cluster.value + "Lines")
              .selectAll("line")
              .attr("stroke-width", .5 || thickScale(clusterSizes[cluster]))
              .attr("opacity", 1);
        });


    let lineMouseGroup = svgMouseOver.append("g")
            .attr("id", "lineMouseGroup" + previousField + nextField);

  }

}

export function addContextMenu(svg,index,cluster) {
	// this function will add the buttons
  // to the cluster: the exit button
  // and the getCluster button

  // the rect for accessing the Clusters

  svg.append("rect")
    .attr("x", margin.left)
    .attr("y", margin.top/2)
    .attr("width", width - margin.right - 9)
    .attr("height", 9)
    .attr("id", "getCluster")
    .attr("fill", d => colors(index))
    .on("mouseover", function(event, d) {
      this.__cluster = cluster;
      d3.select(this)
        .attr("opacity", .5);
    })
    .on("mouseout", function(event, d) {
      d3.select(this)
        .attr("opacity", 1);
    })
    .on("click", function(event, d) {
      let i = +this.parentElement.id.replace("cluster", "");
      console.log(this.__cluster.counterfactuals);
      let cluster = this.__cluster;
      cluster.view.model.set("_selected_clusters", cluster.counterfactuals)
      cluster.view.touch();
      return window.clusters[i];
    })

  // the rect for removing the cluster
	svg.append("rect")
    .attr("x", width - margin.right)
    .attr("y", margin.top/2)
    .attr("width", 9)
    .attr("height", 9)
    //.attr("stroke", "black")
    //.attr("fill", "red")
	.attr("fill", function(){return colors(index)})
    .on("mouseover", function(event, d) {
      d3.select(this)
        .attr("opacity", .1);
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
    // console.log(self);
		let regex = /\d+/;
		let clusterIndex = +self.id.match(regex)[0];
		let container = document.getElementById("vis");
		let cluster = container.lastChild;
		let maxCluster = +cluster.id.match(regex)[0];
		d3.selectAll(".c"+clusterIndex).attr('class','c-1').style("stroke-width", 0.2).style("stroke","black");
    // console.log(clusterIndex, maxCluster);
		// now, we will rename each cluster
		// that lies after this
		for(let i = clusterIndex + 1; i < maxCluster + 1; i++) {
  		let cluster = d3.select("#cluster" + i)

      cluster
        .select("#cluster" + i + "Axis")
        .attr("id", "cluster" + (i - 1) + "Axis");

      cluster
        .selectAll("rect")
        .attr("fill", colors(i - 1));

      // console.log(i, d3.selectAll(".c" + i)._groups);
      d3.selectAll(".c" + i)
        .style("stroke", colors(i - 1));
        // .attr("stroke", colors[i - 2]);
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

				d3.selectAll(".c" + i)
                  .attr("class", "c" + (i - 1))
                  .attr("stroke",colors(i - 1))

      window.clusters[i - 1] = window.clusters[i];
		}
    window.clusters.pop(window.clusters.length - 1);
		// now, we can remove this svg
		d3.select(self).remove();

	})
}

export function drawAxis(data) {
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

export let margin = {top: 25, bottom: 25, left: 9, right: 17};
//let height = 599;
export let height = 493;
export let width = 113;

/*
d3.csv("data/df_full.csv").then(function(data) {
  // read the data
  drawAllClusters(data);
});
*/
