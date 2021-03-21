const colors = ["red", "darkgray", "gray", "darkblue"]

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

class Draw {
	constructor(divID, height, width) {
		const self = this;
		const id = divID || "vis"
		self.container = d3.select("#" + id);
		self.height = height;
		self.width = width;
	}

	render(id, x, y, color, circle) {
		const self = this;
		self.id = id;
		self.svg = self.container
						.append("g")
						.attr("width", self.width)
						.attr("height", self.height)
						.attr("id", id)
            .attr("transform", "translate(" + x + "," + y + ")") 
            .style("background-color", color)
						.attr("opacity", .5);

		self.circle = self.svg
						.append("circle")
						.attr("cx", self.width/2)
						.attr("fill", color)
						.attr("r", 15);

		self.border = self.svg
						.append("rect")
						.attr("width", self.width)
						.attr("height", self.height)
						.attr("fill", "transparent")
						.attr("stroke", color)
            .attr("stroke-width", 4);
	}

	onClick(click, ...args) {
		const self = this;
		self.svg.on("click", d => click(...args));
	}
}

function transition(svgs, height, width) {
	let rand = [];
	for(let i = 0; i < Object.values(svgs).length; i++) rand[i] = i + 1;
	shuffle(rand);
	// on click, what will happen?
	// each svg will be translated;
	// and this will happen in consonance
	// with the order in rand;
	// for example, svgs[1] will be translated to rand[1].

	transitions = [];

	for(let i = 0; i < rand.length; i++) {
		let curr = i + 1;
		let next = rand[i];
		let dy = (next - curr) * (height + 2);
		// console.log(dy, height, next, curr);
		transitions.push(dy);
	}

	for(let i = 0; i < rand.length; i++) {
		let svg = svgs["a" + (i + 1)].svg;
		svg.selectAll("*")
      .transition()
			.duration(459)
			.attr("transform", "translate(0, " + transitions[i] + ")");
	}
}

const width = 159;
const height = 45;
let svgs = {};
setTimeout(() => {
	let n = 4;
	const main = d3.select("#vis")
					.append("svg")
					.attr("id", "main")
					.attr("height", height * (n + 1))
					.attr("width", width * (n * 1.49))
					.style("background-color", "transparent");

	for(let i = 0; i < n; i++) {
		let svg = new Draw("main", height, width);
		svg.render("a" + (i + 1), 0, (svg.height + 2) * i, colors[i]);
		svgs[svg.id] = svg;
	}
	for(let i = 0; i < n; i++) svgs["a" + (i + 1)].onClick(transition, svgs, height, width);
	// addTransition(svgs);
}, 239);
