const features = ["BusStops", "ExpansionPhase", "Favelas", "FontainArea",
        "GarbageCollection", "HighIncomeHolder", "HighRiskAreas", "ImprovisedHousing",
        "LiterateHouseHolder", "Passengers", "PermanentHousing", "Population", "PopulationDensity",
        "Schools", "SewageCollection", "TravelingTime", "Verticalization", "WaterSupply",
        "WomanHouseHolder", "YoungManRate", "Bars"];

const dataPath = "../projection/data/recFiltering/";
const nFeatures = features.length;
const nSteps = 3;
const height = 59;
const width = 259;
const margin = {left: 35, bottom: 16, right: 15, top: 14};

let temp = [];
for(let i = 0; i < nSteps; i++) {
  temp[i] = {};
  for(let feat of features) {
    const file = dataPath + "Step" + i + "/" + feat + ".csv";
    d3.csv(file).then(data => temp[i][feat] = data);
  }
  const file = dataPath + "Step" + i + "/order.csv";
  d3.csv(file).then(data => temp[i]["order"] = data);
}

const dataset = temp;

function translation(currStep, nextStep, height) {
  let svg = document.getElementById("main");
  let svgs = svg.getElementsByClassName("lineChart");
  let curr = dataset[currStep]["order"];
  let next = dataset[nextStep]["order"];
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
  const filePath = dataPath + "Step" + step + "/";
  for(let feat of features) {
    let data = dataset[step][feat];
    data.forEach(d => {d["1"] = +d["1"]; d[""] = +d[""];});
    if(feat == "Bars") console.log(step, data);
    let linePath = new LinePath(data, "vis", feat, null)
    let path = linePath.update();
    linePath.axis();
  }
}

class LinePath {

  constructor(data, divID, feat, index) {
    const self = this;

    self.data = data;
    self.feat = feat;
    self.index = index;
    self.divID = divID;
    let x = d3.map(self.data, d => d[""]);
    let y = d3.map(self.data, d => d["1"]);
    self.xScale = d3.scaleLinear()
            .domain([d3.min(x), d3.max(x)])
            .range([margin.left + 9.5, width - margin.right - 9.5]);

    self.yScale = d3.scaleLinear()
            .domain([0, 1])
            .range([height - margin.bottom - 2, margin.top + 2])
            .nice();

    self.xAxis = d3.axisBottom()
            .scale(self.xScale)
            .ticks(3)
            .tickSizeOuter(1e-15)
            .tickSizeInner(3)
            .tickValues(d3.map(self.data, d => d[""]));

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
    let dy = self.index * height;

    self.svg = d3.select("#" + self.divID)
            .append("g")
            .attr("id", self.feat)
            .attr("class", "lineChart")
            .attr("height", height)
            .attr("width", width)
            .attr("step", 0)
            .attr("transform", "translate(0, " + dy + ")")
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
    self.svg
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

    self.svg
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

function drawStep(step) {
  let folder = "Step" + step + "/";
  let pathOrder = dataPath + folder + "order.csv";
  for(let i = 0; i < nFeatures; i++) {
    let file = dataPath + folder + features[i] + ".csv";
    // console.log(file);
    let feat = features[i];
    let order = {};
    dataset[step]["order"].forEach(d => order[d["0"]] = +d[""]);

    let data = dataset[step][feat];
    // console.log(data);
    // console.log(feat, order[feat], height * order[feat], features.length);
    // parse numbers
    data.forEach(d => {d["1"] = +d["1"]; d[""] = +d[""];});
    // console.log(data);
    let lineChart = new LinePath(data, "main", feat, order[feat]);
    lineChart.draw();
    lineChart.axis();
    lineChart.path();
    lineChart.circles();
    lineChart.label();
  }
}

setTimeout(() => {
  const main = d3.select("#vis")
          .append("svg")
          .attr("width", width)
          .attr("height", height * (nFeatures + 1))
          .attr("id", "main");

  drawStep(0);
}, 1999);
