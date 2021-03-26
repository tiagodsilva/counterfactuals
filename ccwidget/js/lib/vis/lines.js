import * as d3 from "d3";
export const features = ["BusStops", "ExpansionPhase", "Favelas", "FontainArea",
        "GarbageCollection", "HighIncomeHolder", "HighRiskAreas", "ImprovisedHousing",
        "LiterateHouseHolder", "Passengers", "PermanentHousing", "Population", "PopulationDensity",
        "Schools", "SewageCollection", "TravelingTime", "Verticalization", "WaterSupply",
        "WomanHouseHolder", "YoungManRate", "Bars"];

const nFeatures = features.length;
const nSteps = 3;
const height = 39;
const width = 259;
const margin = {left: 35, bottom: 9, right: 15, top: 4};
const TransitionTime = 500; 
const padding = 9.5; 

export function drawCanvas(divID, data) { 
    const main = d3.select("#" + divID) 
                    .append("svg") 
                    .attr("width", width * 1.1) 
                    .attr("height", height * nFeatures) 
                    .attr("id", "CFLinesSVG"); 
    // window.dataset = data; 
    // console.log(document.getElementById(divID)); 
}  

function insertIcon(id, feat, dy) { 
  const path =  `M3366 4468 c-48 -154 -57 -278 -31 -423 l14 -80 -372 -373 -372 -372
    -71 30 c-236 99 -525 124 -779 69 -102 -22 -265 -76 -265 -87 0 -4 145 -152
    322 -329 l322 -322 -30 -38 c-35 -44 -1512 -1951 -1528 -1973 -9 -12 -8 -13 4
    -4 22 16 1929 1493 1973 1528 l38 30 322 -322 c177 -177 325 -322 329 -322 11
    0 65 163 87 265 55 254 30 543 -69 779 l-30 71 372 372 373 372 80 -14 c95
    -17 186 -19 275 -5 72 12 230 59 230 69 0 8 -1153 1161 -1161 1161 -4 0 -18
    -37 -33 -82z m-1198 -1278 c45 -6 112 -20 149 -32 l68 -22 -66 -6 c-86 -8
    -162 -46 -240 -117 l-60 -56 -103 102 -103 101 36 10 c39 10 156 27 206 29 17
    0 67 -4 113 -9z` 
    // console.log(document.getElementById(id), feat, id, dy); 
    d3.select("#" + feat) 
      .append("g") 
      .attr("transform", "matrix(.005, 0, 0, .005, " + (width - margin.right) + ", 4)")  
      .attr("id", "icon" + feat) 
      .append("path") 
      .attr("d", path);  
  
} 

export class LinePath {

  constructor(data, divID, feat, index, view, dir) {
    const self = this; 

    self.data = data;
    self.feat = feat;
    self.index = index; 
    self.divID = divID; 
    self.dir = dir; // console.log(dir); 
    let x = d3.map(self.data, d => d[""]);
    let y = d3.map(self.data, d => d["1"]);

    // const dir = fdir[feat];
    // console.log(fdir);
    self.view = view; 
    self.xScale = d3.scaleLinear()
            .domain([self.dir == 1 ? d3.min(x) : d3.max(x),
                      self.dir == 1 ? d3.max(x) : d3.min(x)])
            .range([margin.left + padding, width - margin.right - padding]);

    self.yScale = d3.scaleLinear()
            .domain([0, 1])
            .range([height - margin.bottom - 2, margin.top + 2])
            .nice();

    self.mapped = [];
    self.data.forEach((d, i) => {
      self.mapped[i] = {};
      // console.log(d, i);
      self.mapped[i][""] = self.xScale(d[""]);
      self.mapped[i]["1"] = self.yScale(d["1"]);
    });

    self.mapped.sort((a, b) => a[""] - b[""]);
    }

  draw() {
    const self = this;
    self.dy = self.index * height;

    self.svg = d3.select("#" + self.divID)
            .append("g")
            .attr("id", self.feat)
            .attr("class", "lineChart")
            .attr("height", height)
            .attr("width", width)
            .attr("step", 0)
            .attr("transform", "translate(0, " + self.dy + ")"); 
    
    self.border = self.svg
            .append("rect")
            .attr("x", margin.left)
            .attr("y", margin.top)
            .attr("width", width - margin.right - margin.left)
            .attr("height", height - margin.bottom - margin.top)
            .attr("stroke", "black")
            .attr("fill", "transparent");
  }

  axis() {
    const self = this; 
    const round = function(x, feat) {
      return feat == "ImprovisedHousing" ? Math.floor(1000 * x)/1000 :
              Math.floor(100 * x)/100;
    } 
    self.xAxis = d3.axisBottom()
      .scale(self.xScale)
      .ticks(3)
      .tickSizeOuter(1e-15)
      .tickSizeInner(3)
      .tickValues(d3.map(self.data, d => d[""]))
      .tickFormat(x => round(x, self.feat)); 

  self.yAxis = d3.axisLeft()
      .scale(self.yScale)
      .ticks(2)
      .tickSizeOuter(0)
      .tickSizeInner(1.3); 
    let xAxisGroup = d3.select("#" + self.feat)
            .append("g")
            .attr("id", "xAxis" + self.feat + "group")
            .attr("transform", "translate(0," + (height - margin.bottom) + ")");

    xAxisGroup.call(self.xAxis)
              .call(g => g.selectAll("text").attr("font-size", 5));

    let yAxisGroup = d3.select("#" + self.feat)
            .append("g")
            .attr("id", "yAxis" + self.feat + "group")
            .attr("transform", "translate(" + margin.left + ",0)");

    yAxisGroup.call(self.yAxis)
            .call(g => g.selectAll("text").attr("font-size", 5));
  }

  path() {
    const self = this;
    let path = "M " + self.mapped[0][""] + " " + self.mapped[0]["1"] + " ";
    for(let i = 1; i < self.mapped.length; i++) {
      path = path + "L " + self.mapped[i][""] + " " + self.mapped[i]["1"] + " ";
    }
    // path = path + "Z";
    self.path = self.svg
            .append("path")
            .attr("d", path)
            .attr("stroke", "gray")
            .attr("stroke-width", 1.5)
            .attr("id", "path" + self.feat)
            .attr("fill", "none");
    return path;
  }

  circles() {
    const self = this;

    self.circles = self.svg
      .selectAll("circle")
      .data(self.data)
      .join("circle")
      .attr("cx", d => self.xScale(d[""]))
      .attr("cy", d => self.yScale(d["1"]))
      .attr("r", 1.5)
      .attr("fill", "darkgray")
      .attr("id", "circle" + self.feat);
  }

  label() {
    const self = this;

    const featLength = self.feat.length;
    self.labelContainer = self.svg
            .append("rect")
            .attr("x", margin.left + 4)
            .attr("y", margin.top + 2)
            .attr("width", featLength * 4.9)
            .attr("height", 9)
            .attr("fill", "white");

    self.label = self.svg
            .append("text")
            .attr("x", margin.left + 4)
            .attr("y", margin.top + 9)
            .attr("font-size", 9)
            .attr("fill", "black")
            .text(self.feat);

  }

  brush() {
    const self = this;

    const brush = d3.brushX()
            .extent([[margin.left, margin.top],
                      [width - margin.right - margin.left, height - margin.bottom]])
            .on("start brush end", brushed);

    self.svg
      .append("g")
      .attr("id", "brushGroup" + self.feat)
      .on("contextmenu", function(event) {
        if(event.shiftKey) {
          d3.select(this).call(brush.move, [margin.left, margin.left + .9]);
        }
      })
      .call(brush)
      .call(brush.move, [margin.left, margin.left + 2])
      .call(g => g.select(".handle--w").remove())
      .call(g => g.select(".selection").attr("cursor", "default"))
      .call(g => g.select(".handle--e")
              .attr("fill", "black")
              .attr("opacity", .4)
              .attr("stroke-width", 3)
              .attr("stroke", "white"));

    function brushed(event) {
      const selection = event.selection;
      if(selection == null) {
        self.circles.attr("stroke", "red");
        d3.select("#brushGroup" + self.feat).call(brush.move, [margin.left, margin.left + 5]);
      } else {
        const [xa, xb] = selection.map(self.xScale.invert);
        let va = Math.min(xa, xb);
        let vb = Math.max(xa, xb);
        // console.log(d3.pointer(event)); 
        const box = document.getElementById("CFLinesSVG").getBoundingClientRect(); 
        let [x, y] = d3.pointer(event); 
        x = x - box.x; y = y - box.y;
        if(x && x > margin.left && x < width - margin.right) {
          d3.select("#brushGroup" + self.feat).call(brush.move, [margin.left, x]);
        } else if(x >= width - margin.right) {
          d3.select("#brushGroup" + self.feat).call(brush.move, [margin.left, width - margin.right]);
        }
        self.circles.attr("stroke", d => {
          // console.log(xa, d[""], xb);
          return va <= d[""] && d[""] <= vb ? "blue" : "darkgray";
        }); 
        
        let i = -1; 
        while(self.mapped[i + 1] && self.mapped[i + 1][""] < selection[1]) {
            i = i + 1; 
        } 
        // console.log(event.sourceEvent); 
        // window.temp = event; 
        const interaction = self.mapped[i] && x ? self.xScale.invert(self.mapped[i][""]) : -9999; 
        if(event.sourceEvent && event.sourceEvent.type == "mouseup") { 
          self.view.model.set("_feature_interacted", self.feat); 
          self.view.touch(); 
          self.view.model.set("_interaction", interaction); 
          self.view.touch(); 
          const matrix = document.getElementById(self.feat).transform.baseVal.consolidate(); 
          const dy = matrix ? matrix.matrix : null; 
          if(interaction > 0) { 
            insertIcon("CFLinesSVG", self.feat, dy ? dy["f"] : 0); 
          } else {
            d3.select("#icon" + self.feat).remove(); 
          } 
        } else {
          d3.select("#icon" + self.feat).remove(); 
        } 
      }
    }
  }

  translation(curr, next) {
    const self = this; 
    console.log(self.feat, curr, next); 
    // const dy = (next - curr) * height; 
    // console.log(dy); 
    let affine = document.getElementById(self.feat)
              .transform.baseVal.consolidate(); 
    affine = affine ? affine.matrix : false; 
    const dy = (next - curr) * height + (affine ? affine["f"] : 0); 
    d3.select("#" + self.feat) 
            .transition() 
            .duration(TransitionTime) 
            .attr("transform", "translate(0, " + dy + ")"); 
    self.index = next; 
  } 

  scale(data) {
    const self = this; 
    
    const x = d3.map(self.data, d => d[""]); 
    self.xScale = d3.scaleLinear() 
            .domain([self.dir == 1 ? d3.min(x) : d3.max(x), 
              self.dir == 1 ? d3.max(x) : d3.min(x)]) 
            .range([margin.left + padding, width - margin.right - padding]); 
    } 

  update(data, order) { 
    const self = this; 
    let mapped = []; 
    self.data = data; 
    self.scale(); 
    data.forEach((d, i) => { 
      mapped[i] = {}; 
      mapped[i][""] = self.xScale(d[""]); 
      mapped[i]["1"] = self.yScale(d["1"]);
    }) 

    let path = "M " + mapped[0][""] + " " + mapped[0]["1"] + " ";
    for(let i = 1; i < mapped.length; i++) {
      path = path + "L " + mapped[i][""] + " " + mapped[i]["1"] + " ";
    }

    // self.svg = d3.select("#path" + self.feat);
    d3.select("#path" + self.feat) 
            .transition()
            .duration(TransitionTime)
            .attr("d", path);

    d3.select("#" + self.feat)
            .selectAll("circle")
            .data(data)
            .join("circle")
            .transition()
            .duration(TransitionTime)
            .attr("cx", d => self.xScale(d[""]))
            .attr("cy", d => self.yScale(d["1"]));

    self.translation(self.index, order); 
    
    let xAxis = document.getElementById("xAxis" + self.feat + "group");
    let yAxis = document.getElementById("yAxis" + self.feat + "group");
    if(xAxis) d3.select(xAxis).remove(); 
    if(yAxis) d3.select(yAxis).remove(); 

    self.axis(); 
  }
}

export function drawStep(step, divID, view) { 
  let folder = "Step" + step + "/";
  // let pathOrder = dataPath + folder + "order.csv";
  for(let i = 0; i < nFeatures; i++) {
    // let file = dataPath + folder + features[i] + ".csv";
    // console.log(file);
    let feat = features[i];
    let order = {}; 
    // console.log(dataset); 
    window.dataset[step]["order"].forEach(d => order[d["0"]] = +d[""]);

    let data = window.dataset[step][feat];
    // console.log(data);
    // console.log(feat, order[feat], height * order[feat], features.length);
    // parse numbers
    data.forEach(d => {d["1"] = +d["1"]; d[""] = +d[""];});
    // console.log(data);
    let lineChart = new LinePath(data, divID, feat, order[feat], view);
    lineChart.draw();
    lineChart.axis();
    lineChart.path();
    lineChart.circles();
    lineChart.label();
    lineChart.brush();
  }
}


