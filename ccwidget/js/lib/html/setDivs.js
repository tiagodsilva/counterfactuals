export default function setDivs(el) {
	let body = document.createElement("body");
	body.setAttribute("style", "background-color: #EDF2F8");

	body.innerHTML = `
	<div id="container">
			<!-- <div style="width: calc(100% / 4.2)" id="leftChart"></div> -->
			<div align = "left" style="width: calc(100%/1.5)" id="map">
					<div id="First_ScatterPlot" style="width: calc(100%); height: 100%; margin: 0px; display: inline-block; padding: 0px; "></div>
					<div id="Second_ScatterPlot" style="width: calc(100% / 7); height: 100%; margin: 0px; display: inline-block; padding: 0px; "></div>
			</div>
			<div id="vis" style="height:100%; display: inline-block;"></div>
			<!-- <div style="width: calc(100% / 4.2)" id="bubleChart"></div> -->
	</div>
	`

	el.appendChild(body);
}
