// DrawPad v1.0

var margin   = { top: 0, right: 0, bottom: 0, left: 0 },
	height   = 400 - margin.top - margin.bottom,
	width 	 = 600 - margin.left - margin.right,
	modeSel  = 0,	
	startPos = [0, 0], 
	endPos   = [0, 0];

var menu,
	buttons,
	svg,
	canvas,
	preview,
	drawings,
	lines,
	rects;

// configuracion de herramientas del menu
buttons = [{
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

// setup de herramientas del menu
menu = d3.select("#menuContainer")
	.append("g")
	.attr("id", "menu")
	.selectAll("button")
    .data(buttons)
	.enter()
    	.append("button")
        .attr("id", function(d){ return d.id })
        .classed("guiButton", true)
		.classed("drawTool", function(d){ return d.toolType == "drawTool" })
		.classed("otherTool", function(d){ return d.toolType == "otherTool" })
		.classed("active", function(d,i){return i == modeSel})
        .style("background-image", function(d){ return d.image })
        .on("click", selectTool);

// seleccion de herramientas del menu
function selectTool (d,i){ 
	if (d3.select(this).classed("drawTool")) {
		modeSel = i;
		d3.selectAll(".guiButton.drawTool")
			.classed("active", function(d,i){return i == modeSel});
		console.log(":: "+d.id+" TOOL selected");	
	} else {
		clearCanvas();
	}
}

// setup svg canvas/area de dibujo
svg = d3.select("#svgContainer").append("svg")
	.attr("id", "svg")
    .attr("viewBox", "0 0 "+ width + " " + height)
	.call(d3.drag()
		  .on("start", startDrawing)
		  .on("drag", doDrawing)
		  .on("end", endDrawing));

canvas = 
	svg.append("g")
		.attr("id", "canvas");

// previsualizacion de forma
preview = 
	canvas.append("g")
		.attr("id", "preview");

// dibujos en canvas
drawings = 
	canvas.append("g")
		.attr("id", "drawings");

lines =
	drawings.append("g")
		.attr("id", "lines");

rects = 
	drawings.append("g")
		.attr('id', "rects");

// DRAW iniciar dibujo
function startDrawing() {
	startPos = endPos = d3.mouse(this);
	console.log("   Start at " + startPos);
	if (modeSel == 0) {
		preview.append("line")
			.classed("prevForm", true);
	} else {
		preview.append("rect")
			.classed("prevForm", true)
			.attr("fill", "transparent");
	}	
	console.log(".. DRAWING " + buttons[modeSel].id)
}

// DRAW previsualizar dibujo
function doDrawing() {
	endPos = d3.mouse(this);
	if (modeSel == 0) {
		// previsualizacion de linea
		preview.select(".prevForm")
			.attr("x1", startPos[0])
			.attr("y1", startPos[1])
			.attr("x2", endPos[0])
			.attr("y2", endPos[1]);		
	} else {
		// previsualizacion de rectangulo
		preview.select(".prevForm")
			.attr("x", d3.min([startPos[0], endPos[0]]))
			.attr("y", d3.min([startPos[1], endPos[1]]))
			.attr("width", Math.abs(startPos[0]-endPos[0])) 
			.attr("height", Math.abs(startPos[1]-endPos[1]));		
	}
}

// DRAW finalizar previsualizacion y dibujar forma definitiva
function endDrawing() {
	console.log("   End at   "+ endPos);
	d3.selectAll(".prevForm").remove();
	(modeSel == 0) ? drawNewLine() : drawNewRect();
}

// dibujar una linea en el canvas
function drawNewLine() {
	lines.append("line")
		.classed("draw", true)
		.attr("x1", startPos[0])
		.attr("y1", startPos[1])
		.attr("x2", endPos[0])
		.attr("y2", endPos[1]);
}
	
// dibuja un rectangulo en el canvas
function drawNewRect() {
	rects.append("rect")
		.classed("draw", true)
		.attr("x", d3.min([startPos[0], endPos[0]]))
		.attr("y", d3.min([startPos[1], endPos[1]]))
		.attr("width", d3.max([startPos[0], endPos[0]]) - d3.min([startPos[0], endPos[0]])) 
		.attr("height", d3.max([startPos[1], endPos[1]]) - d3.min([startPos[1], endPos[1]]))
		.style("fill", "transparent");
}

// si se confirma la accion > borrar el canvas
function clearCanvas() {
	if (confirm("Do you want to clear the canvas?") == true) {		
    	lines.selectAll("line").remove();
		rects.selectAll("rect").remove();
 		console.log(":: CANVAS CLEARED");
	}
}