import drawStar from "./star.js";
const d3 = require("d3");
d3.lasso = require("./lasso").lasso;
import { drawAxis } from "./pc.js";
import { Cluster } from "../Cluster.js";
var colors = d3.scaleOrdinal(d3.schemeSet1); 
var CLASES ={};
var DICTIONARY ={};
var stars = [];
var CORRESPONDIENTES = [];
var sizes = {'CFR':6,'Orig':10,'CFROrig':8,'CFS':6};
window.clusters = [];
var counter = 0;

var dist_orig_real = [];

var flag_Chart = true;

function DrawPointGroups(divID,divLabel,dataset, data, dist_orig_real, view){
    d3.select("#"+divID).selectAll("svg").remove();
    let divHeight = document.getElementById(divID).clientHeight;
    let divWidth  = document.getElementById(divID).clientWidth;
    //let divWidth  = document.getElementById(divID).clientHeight;

    var marginMain = {top: 20, right: 20, bottom: 20, left: 20};
    var width = divWidth -marginMain.right - marginMain.left;
    var height = divHeight - marginMain.bottom -marginMain.top;
    var lasso;

    var svg = d3.select("#"+divID)
        .append("svg")
        .attr("width", divWidth)
        .attr("height",divHeight)
        .on("dblclick", function (d, i) {//contextmenu
            if(!flag_Chart){
                Principal();
                Addlegend(allgroups);
            }else{flag_Chart=false;
                GetAtrrayStar();
		legend.selectAll("*").remove();
		}
	});

    var LinesSvg = svg
         .append("g")
         .attr("width", width)
         .attr("height", height)
         .attr("transform","translate(" + marginMain.left + "," + marginMain.top + ")");

    var svgGroupScatter = svg
        .append("g")
        .attr("width", width)
        .attr("height", height)
        .attr("transform","translate(" + marginMain.left + "," + marginMain.top + ")");

    let legend = svg.append("g")
        .attr("class","legend")
        .attr("transform","translate(10,10)")
        .style("font-size","12px");


    var xScale = d3.scaleLinear().range([ 0, width]);
    var yScale = d3.scaleLinear().range([ height, 0]);
    let xmar  =  d3.extent(dataset, d=> d.x);
    let ymar  =  d3.extent(dataset,d=> d.y);

    xScale.domain(xmar);
    yScale.domain(ymar);


    // Axis for the parallel coordinates

    drawAxis(data);
    // d3.csv("data/cfa.csv").then(function(data) {drawAxis(data)});

    var svgCircle =svgGroupScatter.append('g')
    var circles = svgCircle.selectAll("circle")
        .data(dataset)
        .join("circle")
            .attr("id",d => d.id)
            //.attr("class", d => d.clase)
            .attr("class", "c-1")
            .attr("fill", function(d){if(d.clase=='CFR'){return '#8da0cb' }else{if(d.clase=='CFS'){ return '#fee8c8' }else{return 'red'}}})//
            .attr('stroke','black')
            .attr("stroke-width", 0.2)
            .attr("fill-opacity",0.7)
            .attr("cx", d => xScale(d.x)  )
            .attr("cy", d => yScale(d.y) )
            .attr("r", d => sizes[d.clase])
            .on("click", GetAtrrayStar);

    function Principal(){
        flag_Chart =true;
        d3.selectAll(".second").attr("fill-opacity",0).attr("stroke-opacity",0);
        d3.selectAll(".main").attr("fill-opacity",1).attr("stroke-opacity",1);
        d3.selectAll("#axis").remove();
        //svgCircle.selectAll("circle").remove();
        circles = svgCircle.selectAll("circle")
        .data(dataset)
        .join("circle")
        //.transition()           // apply a transition
        //.duration(400)
            .attr("id",d => d.id)
            //.attr("class", d => d.clase)
            .attr("fill", function(d){if(d.clase=='CFR'){return '#8da0cb' }else{if(d.clase=='CFS'){ return '#fee8c8' }else{return 'red'}}})
            .attr("fill-opacity",0.7)
            .attr("cx", d => xScale(d.x)  )
            .attr("cy", d => yScale(d.y) )
            .attr("r", d => sizes[d.clase])
            .on("click", GetAtrrayStar);

        LinesSvg.selectAll("line").attr("opacity",1);
    }

    function GetAtrrayStar(e){
        //svgCircle.selectAll("circle").remove();
        d3.selectAll(".second").attr("fill-opacity",1).attr("stroke-opacity",1);
        d3.selectAll(".main").attr("fill-opacity",0).attr("stroke-opacity",0);


        flag_Chart =false;

        let xmarStar = d3.extent(dist_orig_real,function(d){let dclase = d['Name'].replace(/[0-9]/g, ''); if(dclase=='CFS'){return d.DistOrig;}else{0}});
        let ymarStar = d3.extent(dist_orig_real, function(d){let dclase = d['Name'].replace(/[0-9]/g, ''); if(dclase=='CFS'){return d.DistCFR;}else{0}});
        //let maximo = Math.max(xmarStar[1],ymarStar[1])
        let xScaleStar = d3.scaleLinear().domain(xmarStar).range([ 0, width]);
        let yScaleStar = d3.scaleLinear().domain(ymarStar).range([ height, 0]);

        circles = svgCircle.selectAll("circle")
            .data(dist_orig_real)
            .join("circle")
            //.transition()           // apply a transition
            //.duration(400)
            //.attr("class",d => d['name'].replace(/[0-9]/g, ''))
            .attr("fill", function(d){let dclase = d['Name'].replace(/[0-9]/g, ''); if(dclase=='CFR'){return '#8da0cb' }else{if(dclase=='CFS'){ return '#fee8c8' }else{return 'red'}}})
            .attr("fill-opacity", function(d){let dclase = d['Name'].replace(/[0-9]/g, ''); if(dclase=='CFS'){return 0.7 }else{ return 0;}})
            .attr("cx", d => xScaleStar(d.DistOrig))
            .attr("cy", d => yScaleStar(d.DistCFR))
            .attr("r", d => sizes[d['Name'].replace(/[0-9]/g, '')]);
        
        
        var x_axis = d3.axisBottom()
            .scale(xScaleStar);
        var y_axis = d3.axisLeft()
            .scale(yScaleStar);

        svgCircle.append("g").attr("id","axis")
        .attr("transform", "translate("+0+", "+0+")")
        .call(y_axis);

        svgCircle.append("g").attr("id","axis")
        .attr("transform", "translate("+0+", "+height+")")
        .call(x_axis);

        LinesSvg.selectAll("line").attr("opacity",0);
        //svgCircle.exit().remove();
    }

    /************************* LASSO ***************************************** */
    /*********************** LASSO SELECT ************************************/
    // Lasso functions
    var lasso_start = function() {
        lasso.items()
            .classed("not_possible",true)
            .classed("selected",false);
    };

    var lasso_draw = function() {
        // Style the possible dots
        lasso.possibleItems()
            .classed("not_possible",false)
            .classed("possible",true);
        // Style the not possible dot
        lasso.notPossibleItems()
            .classed("not_possible",true)
            .classed("possible",false);
    };

    var lasso_end = function() {
        /*// Reset the color of all dots
        lasso.items()
            .classed("not_possible",false)
            .classed("possible",false);
            // Style the selected dots
        lasso.selectedItems()
            .classed("selected",true)
            ids = [];
        lasso.selectedItems()._groups[0].forEach(function(d){ids.push(d.id)});
        //Clase_TemporalSerieByArrayID(ids);
        // Reset the style of the not selected dots
        */
       // Reset the color of all dots
        //lasso.items()
        //.style("fill", function(d) { return color(d.species); });

        // Style the selected dots
        lasso.items()
            .classed("not_possible",false)
            .classed("possible",false);
            // Style the selected dots

        //var selectedDots = selected[0].map(d=>d.id);
        var selectedDots  = lasso.selectedItems()._groups[0].map(d=>d.id);

        if(selectedDots.length > 0) {
			lasso.selectedItems().style("stroke",colors(clusters.length)).attr('class',"c"+clusters.length);
			lasso.selectedItems().style("stroke-width", 1.5).attr('class',"c"+clusters.length);
          window.clusters.push(selectedDots);
          console.log(window.clusters)
          //Thiago
          let cluster = new Cluster(selectedDots, window.clusters.length - 1, view);
          cluster.draw(data);
        }

    };


    lasso = d3.lasso()
            .closePathSelect(true)
            .closePathDistance(100)
            .items(circles)
            .targetArea(svg)
            .on("start",lasso_start)
            .on("draw",lasso_draw)
            .on("end",lasso_end);

    svg.call(lasso);

    /************************ end lasso select *******************************/
    /************************* LASSO ***************************************** */
    /************************* LEGEND***************************************** */
    /************************* LEGEND***************************************** */
    var allgroups =[];
    for (const [key, value] of Object.entries(CLASES)) {allgroups.push(key); }
    Addlegend(allgroups);
    function Addlegend(allgroups){
        let size = 25;
        legend.selectAll("myrect")
            .data(allgroups)
            .enter()
            .append("circle")
                .attr("id",d =>"classeDot_"+d)
                .attr("class",d => d)
                .attr("cx", size)
                .attr("cy", (d,i) => i*size)//10 + i*(size+5)})
                .attr("r", 7);

        legend.selectAll("mylabels")
             .data(allgroups)
             .enter()
             .append("text")
                 .attr("x", size+size*0.5 )
                 .attr("y", (d,i) => i*size+4)//15 + i*(size+5)})
                 .style("fill", "#4C4C4C")
                 .text(d => d+" ("+CLASES[d].count+")")
                 .attr("text-anchor", "left")
                 .style("alignment-baseline", "middle");
    }

    /***********************END ** LEGEND************************************* */

    /***********************Drawing - IMPORTANT ************************************* */

    LinesSvg
        .selectAll("lines")
            .data(CORRESPONDIENTES)
            .enter()
            .append('line')
            .attr("stroke", "Gainsboro")
            .attr("stroke-width", 1)
            .attr("x1",function(d){
                return  xScale(d3.select("#"+d['1']).data()[0].x);
                })
            .attr("y1", function(d){
                return yScale(d3.select("#"+d['1']).data()[0].y);
                })
            .attr("x2", function(d) {return xScale(d3.select("#"+d['2']).data()[0].x);})
            .attr("y2", function(d) {return yScale(d3.select("#"+d['2']).data()[0].y);});
}

export function DrawProjection(correspondents,
        projection, dist, cfa, dist_orig_real, view) {

  CORRESPONDIENTES = correspondents;
  projection.forEach(function(d){
      d.clase = d['id'].replace(/[0-9]/g, '');
      d.x = parseFloat(d.x);
      d.y = parseFloat(d.y);
  });
  var tempArray = Array.from(d3.group(projection,function(g){return g.clase}));
  tempArray.forEach(function(d){ CLASES[d[0]] = {'count':d[1].length}; });
  DrawPointGroups('First_ScatterPlot', 'Second_ScatterPlot', projection, cfa, dist_orig_real, view);

  dist.forEach(function(d){
      Object.keys(d).forEach(function(key) {
          if((DICTIONARY[d['name']+"_"+key] === undefined) && (DICTIONARY[key+"_"+d['name']] === undefined)){
              DICTIONARY[d['name']+"_"+key] = parseFloat(parseFloat(d[key]).toFixed(4));
          }
      });
  });

}

var selected_Variable = 'Orig'//'CFS9';
function GetAtrrayStar(d){
    selected_Variable =this.id;
    stars = [];
    CORRESPONDIENTES.forEach(function(d,i){
         //if (i<10){
         let length1,length2;
         if(DICTIONARY[selected_Variable+"_"+d['1']] == undefined){length1 = DICTIONARY[d['1']+"_"+selected_Variable]}else{length1 = DICTIONARY[selected_Variable+"_"+d['1']];}
         if(DICTIONARY[selected_Variable+"_"+d['2']] == undefined){length2 = DICTIONARY[d['2']+"_"+selected_Variable]}else{length2 = DICTIONARY[selected_Variable+"_"+d['2']];}
         stars.push({'i':i,'length':length1,'name':d['1']});
         stars.push({'i':i,'length':length2,'name':d['2']});
        // }
     });
     // drawStar("bubleChart");
}
