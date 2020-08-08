// DrawPad 
// by Alejandra Ines Aguirre (2020)

// Line icon by lvianwijaya from Noun Project
// Rect icon by Flatart from Noun Project
// Clear icon by iconlabs from Noun Project

var buttonData = [{
		id: "LINE",
		image: "url(img/button-line.png)",
		toolType: "drawTool"
    },	{
		id: "RECT",
		image: "url(img/button-rect.png)",
		toolType: "drawTool"
    },	{
		id: "CLEAR",
		image: "url(img/button-clear.png)",
		toolType: "otherTool"
    }];

// index modo/forma seleccionada
var	modeSel  = 0,		
	
// coordenadas de dibujo
	startPos = [0, 0], 			
	endPos   = [0, 0];

// svg canvas/area de dibujo
var svg = d3.select("#svgContainer").append("svg")
    .attr("id", "svg")
	.attr("width", "100%")
	.attr("height","100%")
 // 	.call(d3.drag()
//		  .on("start", startDrawing)
//		  .on("drag", draw)
//		  .on("end", endDrawing))
	.on("touchstart", startDrawing)
	.on("touchmove", draw)
	.on("touchend", endDrawing);

var canvasGroup = svg.append("g").attr("id", "canvasGroup");

// dibujos/formas
var drawGroup 	= canvasGroup.append("g").attr("id", "drawGroup");
var lineGroup 	= drawGroup.append("g").attr("id", "lineGroup");
var rectGroup 	= drawGroup.append("g").attr('id', "rectGroup");

// previsualizacion
var prevGroup	= canvasGroup.append("g").attr("id", "prevGroup");

// previsualizacion de linea
var prevLine = prevGroup.append("line")
	.attr("id", "prevLine")
	.classed("prevForm", true)
	.attr("visibility", "hidden");

// previsualizacion de rectangulo
var prevRect = prevGroup.append("rect")
	.attr("id", "prevRect")
	.classed("prevForm", true)
	.attr("fill", "transparent")
	.attr("visibility", "hidden");

// setea el punto de inicio de la forma segun el modo seleccionado
function startDrawing() {
	
	
	// VIENDO TOUCH
	// Prevents the browsers default behaviour (such as opening a link), but does not stop the event from bubbling up the DOM.
//        d3.event.preventDefault();
	//Prevents the event from bubbling up the DOM, but does not stop the browsers default behaviour.
 //       d3.event.stopPropagation();

	var t = d3.touches(this);
	startPos[0] = t[0].x;
	startPos[1] = t[0].y;
	
	console.log("DEBUGGING OK"); //
	console.log("TOUCH START = "+t);

	
	startPos[0] = d3.event.x;
	startPos[1] = d3.event.y;	
	endPos[0] = d3.event.x;
	endPos[1] = d3.event.y;

    console.log(".. DRAWING " + buttonData[modeSel].id)
	console.log("   Start position: " + startPos);
	
	prevLine.attr("visibility", modeSel == 0 ? "visible" : "hidden");
	prevRect.attr("visibility", modeSel == 1 ? "visible" : "hidden");
}

// previsualizacion de la forma segun el modo seleccionado
function draw() {	
	
//	var breakDebuggerButton = document.getElementById('break-debugger');
//breakDebuggerButton.addEventListener('click', function onClick(event) {
//  debugger;
//});
	// VIENDO TOUCH
	// Prevents the browsers default behaviour (such as opening a link), but does not stop the event from bubbling up the DOM.
        //d3.event.preventDefault();
	//Prevents the event from bubbling up the DOM, but does not stop the browsers default behaviour.
        d3.event.stopPropagation();
        var t = d3.touches(this);
	


//	endPos[0] = d3.event.x;
//	endPos[1] = d3.event.y;

	startPos[0] = t[1].x;
	startPos[1] = t[1].y;	
	endPos[0] = t[2].x;
	endPos[1] = t[2].y;
	
	console.log("DRAWING TOUCHES");
	console.log("obj = " "+t);
	
	
	/////
	
	if (modeSel == 0) {
		prevLine
			.attr("x1", startPos[0])
			.attr("y1", startPos[1])
			.attr("x2", endPos[0])
			.attr("y2", endPos[1]);		
	} else {
		prevRect 
			.attr("x", d3.min([startPos[0], endPos[0]]))
			.attr("y", d3.min([startPos[1], endPos[1]]))
			.attr("width", Math.abs(startPos[0]-endPos[0])) 
			.attr("height", Math.abs(startPos[1]-endPos[1]));		
	}
}


// finaliza el dibujo de la forma
function endDrawing() {
	
//	endPos[0] = d3.event.x;
//	endPos[1] = d3.event.y;
    console.log("   End position: "+ endPos);

        var t = d3.touches(this);	
	console.log("END DRAWING TOUCHES");
	console.log("obj = " "+t);

		    prevLine.attr("visibility", "hidden");
	prevRect.attr("visibility", "hidden");

	(modeSel == 0) ? drawNewLine() : drawNewRect();
}

// setup herramientas/modos del menu
var buttonGroup = d3.select("#menuContainer").append("g")
	.attr("id", "buttonGroup")
	.selectAll("button")
    .data(buttonData)
	.enter()
    .append("button")
        .attr("id", function(d){ return d.id })
        .classed("guiButton", true)
		.classed("drawTool", function(d){ return d.toolType == "drawTool" })
		.classed("otherTool", function(d){ return d.toolType == "otherTool" })
		.classed("active", function(d,i){return i == modeSel})
        .style("background-image", function(d){ return d.image })
        .on("click", selectTool);

// selecciona herramientas/modos del menu
function selectTool (d,i){ 
	if (d3.select(this).classed("drawTool")) {
		modeSel = i;
		d3.selectAll(".guiButton.drawTool").classed("active", function(d,i){return i == modeSel});
		console.log(":: "+d.id+" TOOL selected");	
	} else {
		if (confirm("Do you want to clear the canvas?") == true) {
 			clearCanvas();
			console.log(":: CANVAS CLEARED");	
		}
	}
}

// elimina las formas dibujadas en el canvas
function clearCanvas() {
    lineGroup.selectAll("line").remove();
    rectGroup.selectAll("rect").remove();
}

// dibuja una linea en el canvas
function drawNewLine() {
	lineGroup.append("line")
		.classed("draw", true)
		.attr("x1", startPos[0])
		.attr("y1", startPos[1])
		.attr("x2", endPos[0])
		.attr("y2", endPos[1]);
}
	
// dibuja un rectangulo en el canvas
function drawNewRect() {
	rectGroup.append("rect")
		.classed("draw", true)
		.attr("x", d3.min([startPos[0], endPos[0]]))
		.attr("y", d3.min([startPos[1], endPos[1]]))
		.attr("width", d3.max([startPos[0], endPos[0]]) - d3.min([startPos[0], endPos[0]])) 
		.attr("height", d3.max([startPos[1], endPos[1]]) - d3.min([startPos[1], endPos[1]]))
		.style("fill", "transparent");
}
