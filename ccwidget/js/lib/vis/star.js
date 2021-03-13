export default function drawStar(divID){
   d3.select("#"+divID).selectAll("svg").remove();
   size  = document.getElementById(divID).clientWidth;

   var divWidth = size;
   var divHeight = size;

   var marginMain = {top: 20, right: 20, bottom: 20, left: 20};
   var width = divWidth -marginMain.right - marginMain.left;
   var height = divHeight - marginMain.bottom -marginMain.top;

   var svg = d3.select("#"+divID).append("svg")
   .attr("width", divWidth)
   .attr("height", divHeight);

   starpr =  svg
       .append("g")
       .attr("width", width)
       .attr("height", height)
       .attr("transform","translate(" + marginMain.left + "," + marginMain.top + ")");

   var axis ={};
   var b=parseFloat(360.0/parseFloat(CORRESPONDIENTES.length));
   stars.forEach(function(d){
       var valor=(d['i'])*parseFloat(b);
       var Radianes=(parseFloat(valor)*Math.PI/parseFloat(180.0));
       d["x"] = Math.cos(parseFloat(Radianes))*parseFloat(d.length);
       d["y"] = Math.sin(parseFloat(Radianes))*parseFloat(d.length);
   });

   xmar = d3.extent(stars, d=> d.x);
   ymar = d3.extent(stars,d=> d.y);
   var xScale = d3.scaleLinear().domain(xmar).range([ 0, width]);
   var yScale = d3.scaleLinear().domain(ymar).range([ height, 0]);

   var circle = starpr.append("g")
       .selectAll("circle.node")
       .data(stars)
       .enter()
       .append("circle")
       .attr("class",d => d['name'].replace(/[0-9]/g, ''))
       .attr("cx", d => xScale(d.x))
       .attr("cy", d => yScale(d.y))
       .attr("r", d => sizes[d['name'].replace(/[0-9]/g, '')]);
}
