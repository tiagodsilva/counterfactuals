const colors = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
CLASES ={};
DICTIONARY ={};
var stars = [];
var CORRESPONDIENTES = [];
sizes = {'CFR':6,'Orig':10,'CFROrig':8,'CFS':6};
var clusters = [];
var counter = 0;

function DrawPointGroups(divID,divLabel,dataset){
    d3.select("#"+divID).selectAll("svg").remove();
    d3.select("#"+divLabel).selectAll("svg").remove();
    divHeight = document.getElementById(divID).clientHeight;
    divWidth  = document.getElementById(divID).clientWidth;

    var marginMain = {top: 20, right: 20, bottom: 20, left: 20};
    var width = divWidth -marginMain.right - marginMain.left;
    var height = divHeight - marginMain.bottom -marginMain.top;


    var svg = d3.select("#"+divID)
        .append("svg")
        .attr("width", divWidth)
        .attr("height",divHeight);

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

    /*svgGroupScatter.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill",'white' )
        .attr("stroke", "gray")
        .attr("stroke-opacity", 0.3);*/

    //       AXIS  AND SCALE      //
    //xmar = d3.extent(dataset, function(d) { return d.x; });
    xmar = d3.extent(dataset, d=> d.x);
    ymar  = d3.extent(dataset,d=> d.y);
    var xScale = d3.scaleLinear().domain(xmar).range([ 0, width]);
    var yScale = d3.scaleLinear().domain(ymar).range([ height, 0]);


    // Axis for the parallel coordinates

    d3.csv("data/cfa.csv").then(function(data) {drawAxis(data)});

    var svgCircle =svgGroupScatter.append('g')
    var circles = svgCircle.selectAll("dot")
        .data(dataset)
        .enter()
        .append("circle")
            .attr("id",d => d.id)
            .attr("class", d => d.clase)
            .attr("cx", d => xScale(d.x)  )
            .attr("cy", d => yScale(d.y) )
            .attr("r", d => sizes[d.clase])
            .on("click", GetAtrrayStar);

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
          clusters.push(selectedDots);
          // console.log(clusters)
          //Thiago

          d3.csv("data/cfa.csv").then(function(data) {

            let columns = Object.keys(data[0]);
            columns = columns.filter(d => d != "Clusters" && d != "");
            let ncol = columns.length;

            newCluster(data, columns, ncol, clusters[clusters.length - 1],
                    clusters.length - 1);
          });
        }

    };

    var lasso = d3.lasso()
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
    var allgroups =[];
    for (const [key, value] of Object.entries(CLASES)) {allgroups.push(key); }
    var size = 25;

    document.getElementById(divLabel).style.overflow = "auto";
    var marginLabel = {top: 30, right: 2, bottom: 2, left: 5};
    var width_label = document.getElementById(divLabel).clientWidth;
    var height_label= (allgroups.length)*size+marginLabel.top+marginLabel.bottom;

    var svg_width_label = width_label-marginLabel.left - marginLabel.right;
    var svg_height_label = (allgroups.length)*size+100;

    var Scatterlegend =  d3.select("#"+divLabel)
        .append("svg")
        .attr("width", width_label)
        .attr("height",height_label)

    Scatterlegend_SVG = Scatterlegend.append('g')
        .append("g")
        .attr("width", svg_width_label)
        .attr("height", svg_height_label)
        .attr("transform","translate(" + (marginLabel.left ) + "," + marginLabel.top + ")");

    Scatterlegend_SVG.selectAll("myrect")
        .data(allgroups)
        .enter()
        .append("circle")
             .attr("id",d =>"classeDot_"+d)
             .attr("class",d => d)
             .attr("cx", size)
             .attr("cy", (d,i) => i*size)//10 + i*(size+5)})
             .attr("r", 7);

    Scatterlegend_SVG.selectAll("mylabels")
        .data(allgroups)
        .enter()
        .append("text")
            .attr("x", size+size*0.5 )
            .attr("y", (d,i) => i*size+4)//15 + i*(size+5)})
            .style("fill", "#4C4C4C")
            .text(d => d+" ("+CLASES[d].count+")")
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle");

    /***********************END ** LEGEND************************************* */

    /***********************Drawing - IMPORTANT ************************************* */
    /*
    LinesSvg
        .selectAll("lines")
            .data(CORRESPONDIENTES)
            .enter()
            .append('line')
            .attr("stroke", "lightgreen")
            .attr("stroke-width", 1)
            .attr("x1",function(d){
                return  xScale(d3.select("#"+d['1']).data()[0].x);
                })
            .attr("y1", function(d){
                return yScale(d3.select("#"+d['1']).data()[0].y);
                })
            .attr("x2", function(d) {return xScale(d3.select("#"+d['2']).data()[0].x);})
            .attr("y2", function(d) {return yScale(d3.select("#"+d['2']).data()[0].y);}); */
}

Read_CFS2CFR();
function Read_CFS2CFR(){
    d3.csv("data/CFS2CFR_355030804000048.csv")
    .then((data) => {
        CORRESPONDIENTES = data;
    });
    //projStars(stars);
}

d3.csv("data/contra_Clusters_proj.csv")
    .then((data) => {
        data.forEach(function(d){
            d.clase = d['id'].replace(/[0-9]/g, '');
            d.x = parseFloat(d.x);
            d.y = parseFloat(d.y);
        });
        var tempArray = Array.from(d3.group(data,function(g){return g.clase}));
        tempArray.forEach(function(d){ CLASES[d[0]] = {'count':d[1].length}; });
        DrawPointGroups('First_ScatterPlot','Second_ScatterPlot',data);
});


d3.csv("data/distAllCFA_355030804000048.csv")
    .then((data) => {
        data.forEach(function(d){
            Object.keys(d).forEach(function(key) {
                if((DICTIONARY[d['name']+"_"+key] === undefined) && (DICTIONARY[key+"_"+d['name']] === undefined)){
                    DICTIONARY[d['name']+"_"+key] = parseFloat(parseFloat(d[key]).toFixed(4));
                }
            });
        });
});




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
     drawStar("bubleChart");
}
