export default function setCSS(el) {
	let head = document.createElement("head");

	let style = document.createElement("style");

	style.innerHTML = `
	#container {
	    width:100%;
	    text-align:left;
	    margin:0px;
	    margin:0px;
	}
	#container > div {
	    height:500px;
	    display: inline-block;
	    vertical-align: top;
	    border-radius: 2px;
	    text-align:left;
	    left:0px;
	    margin:0px;
	    padding-left:5px;
	    margin-top:5px;
	    background-color:white;
	    position: relative;
	    box-shadow: 0 2px 5px 0 rgba(0,0,0,0.16),0 2px 10px 0 rgba(0,0,0,0.12);
	}

	.cfWidget {
		height:550px;
		white-space:nowrap; 
		overflow-x:scroll;
	}

	.CFR {
	    stroke: white;
	    fill: #8da0cb;/*#dc3912*/
	    fill-opacity:0.5;
	    stroke-opacity:1;
	}

	.Orig{
	    stroke: white;
	    fill: #dc3912;
	    fill-opacity:1;
	    stroke-opacity:1;
	}
	.CFROrig {
	    stroke: white;
	    fill: #12dc77;
	    fill-opacity:1;
	    stroke-opacity:1;
	}

	.CFS {
	    stroke: white;
	    fill: #fee8c8;
	    fill-opacity:1;
	    stroke-opacity:1;
	}


	.lasso path {
	stroke: rgb(80,80,80);
	stroke-width:2px;
	}

	.lasso .drawn {
	fill-opacity:.05 ;
	}

	.lasso .loop_close {
	fill:none;
	stroke-dasharray: 4,4;
	}

	.lasso .origin {
	fill:#3399FF;
	fill-opacity:.5;
	}

	.not_possible {
	fill:rgb(200,200,200);
	}

	.possible {
	fill:#EC888C;
	}
	`

	head.appendChild(style);
	head.innerHTML = head.innerHTML + `
	<link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
	   integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
	   crossorigin=""/>

	<script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"
	   integrity="sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA=="
	   crossorigin=""></script>
 `
	// head.appendChild(style);
	el.appendChild(head);
}
