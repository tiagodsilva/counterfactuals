import * as d3 from "d3";
export const features = ["BusStops", "ExpansionPhase", "Favelas", "FontainArea",
        "GarbageCollection", "HighIncomeHolder", "HighRiskAreas", "ImprovisedHousing",
        "LiterateHouseHolder", "Passengers", "PermanentHousing", "Population", "PopulationDensity",
        "Schools", "SewageCollection", "TravelingTime", "Verticalization", "WaterSupply",
        "WomanHouseHolder", "YoungManRate", "Bars"];

export const fdir = {
  "Passengers": -1,
  "TravelingTime": 1,
  "HighRiskAreas": 1,
  "FontainArea": 1,
  "ExpansionPhase": 1,
  "Population": -1,
  "Favelas": 1,
  "WaterSupply": 1,
  "HighIncomeHolder": 1,
  "LiterateHouseHolder": 1,
  "WomanHouseHolder": 1,
  "PopulationDensity": 1,
  "ImprovisedHousing": -1,
  "PermanentHousing": 1,
  "SewageCollection": 1,
  "GarbageCollection": 1,
  "YoungManRate": 1,
  "Verticalization": -1,
  "Bars": -1,
  "Schools": -1,
  "BusStops": -1
};

const nFeatures = features.length;
const nSteps = 3;
const height = 59;
const width = 259;
const margin = {left: 35, bottom: 16, right: 15, top: 14};


export function drawCanvas(divID, data) { 
    const main = d3.select("#" + divID) 
                    .append("svg") 
                    .attr("width", width) 
                    .attr("height", height * nFeatures) 
                    .attr("id", "CFLinesSVG"); 
    window.dataset = data; 
    // console.log(document.getElementById(divID)); 
}  

function translation(currStep, nextStep, height, dataset) {
  let svg = document.getElementById("CFLinesSVG");
  let svgs = svg.getElementsByClassName("lineChart"); 
  let curr = window.dataset[currStep]["order"];
  let next = window.dataset[nextStep]["order"];
  // console.log(svgs.length);
  for(let svg of svgs) {
    let feat = svg.id;
    // console.log(curr.filter(d => d["0"] == feat))
    let dy = (next.filter(d => d["0"] == feat)[0][""] -
            curr.filter(d => d["0"] == feat)[0][""]) * height;
    let affine = svg.transform.baseVal.consolidate();
    affine = affine ? affine.matrix : false;
    dy = dy + (affine ? affine["f"] : 0);
    d3.select(svg)
        .transition()
        .duration(459)
        .attr("transform", "translate(0, " + dy + ")");
  }
}

function changeStep(step) {
  d3.selectAll("g").attr("step", step);
  // const filePath = dataPath + "Step" + step + "/";
  for(let feat of features) {
    let data = dataset[step][feat];
    data.forEach(d => {d["1"] = +d["1"]; d[""] = +d[""];});
    if(feat == "Bars") console.log(step, data);
    let linePath = new LinePath(data, "vis", feat, null)
    let path = linePath.update();
    linePath.axis();
  }
}

export class LinePath {

  constructor(data, divID, feat, index, view) {
    const self = this; 

    self.data = data;
    self.feat = feat;
    self.index = index;
    self.divID = divID; 
    let x = d3.map(self.data, d => d[""]);
    let y = d3.map(self.data, d => d["1"]);

    const dir = fdir[feat];
    // console.log(fdir);
    self.view = view; 
    self.xScale = d3.scaleLinear()
            .domain([dir == 1 ? d3.min(x) : d3.max(x),
                      dir == 1 ? d3.max(x) : d3.min(x)])
            .range([margin.left + 9.5, width - margin.right - 9.5]);

    self.yScale = d3.scaleLinear()
            .domain([0, 1])
            .range([height - margin.bottom - 2, margin.top + 2])
            .nice();

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
            .tickSizeOuter(1e-15)
            .tickSizeInner(3);

    self.mapped = [];
    self. data.forEach((d, i) => {
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
            .attr("transform", "translate(0, " + self.dy + ")")
            .on("click", function(event, d) {
              let curr = d3.select(this).attr("step");
              let next = (curr + 1) % 3;
              translation(curr, next, height);
              changeStep(next);
            });

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
    let xAxisGroup = d3.select("#" + self.feat)
            .append("g")
            .attr("id", "xAxis" + self.feat + "group")
            .attr("transform", "translate(0," + (height - margin.bottom) + ")");

    xAxisGroup.call(self.xAxis)
              .call(g => g.selectAll("text").attr("font-size", 14/2));

    let yAxisGroup = d3.select("#" + self.feat)
            .append("g")
            .attr("id", "yAxis" + self.feat + "group")
            .attr("transform", "translate(" + margin.left + ",0)");

    yAxisGroup.call(self.yAxis)
            .call(g => g.selectAll("text").attr("font-size", 14/2));
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
          d3.select(this).call(brush.move, [margin.left, margin.left + 2]);
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
        
        let i = 0; 
        while(self.mapped[i + 1] && self.mapped[i + 1][""] < selection[1]) {
            i = i + 1; 
        } 
        console.log(self.mapped, i, selection); 
        const interaction = self.mapped[i] ? self.xScale.invert(self.mapped[i][""]) : -9999; 
        self.view.model.set("_feature_interacted", self.feat); 
        self.view.touch(); 
        self.view.model.set("_interaction", interaction); 
        self.view.touch(); 
      }
    }
  }

  update() {
    const self = this;
    let path = "M " + self.mapped[0][""] + " " + self.mapped[0]["1"] + " ";
    for(let i = 1; i < self.mapped.length; i++) {
      path = path + "L " + self.mapped[i][""] + " " + self.mapped[i]["1"] + " ";
    }

    self.svg = d3.select("#path" + self.feat);
    self.svg
            .transition()
            .duration(459)
            .attr("d", path);

    d3.select("#" + self.feat)
            .selectAll("circle")
            .data(self.data)
            .join("circle")
            .transition()
            .duration(459)
            .attr("cx", d => self.xScale(d[""]))
            .attr("cy", d => self.yScale(d["1"]));

    let xAxis = document.getElementById("xAxis" + self.feat + "group");
    let yAxis = document.getElementById("yAxis" + self.feat + "group");
    if(xAxis) d3.select(xAxis).remove();
    if(yAxis) d3.select(yAxis).remove();
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


