import * as d3 from "d3";
import { width, height, margin,
	drawCluster, colors, addContextMenu } from "./vis/pc.js";

export class Cluster {

	constructor(counterfactuals, index, view) {
			const self = this;

			let container = d3.select("#vis");

			self.counterfactuals = counterfactuals;
			self.index = index;
			self.view = view;
			self.svg = container
							.append("svg")
							.attr("width", width)
							.attr("height", height)
							.attr("id", "cluster" + index);
			addContextMenu(self.svg, self.index, self);
	}

	draw(data) {
		const self = this;
		let columns = Object.keys(data[0]).filter((v, i, s) => v != "");
		let ncol = columns.length;

		let yScale = d3.scaleBand()
						.domain(columns)
						.range([margin.top, height - margin.bottom]);

		drawCluster(self.svg, self.counterfactuals, self.index,
						data, columns, ncol, yScale);
	}
}
