// DrawPad v0.4

// configuracion de herramientas del menu
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

// setup de herramientas del menu
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
var svg = d3.select("#svgContainer").append("svg")
    .attr("id", "svg")
	.call(d3.drag()
		  .on("start", startDraw)
		  .on("drag", dragDraw)
		  .on("end", endDraw));

// dibujos/formas
var canvasGroup = svg.append("g").attr("id", "canvasGroup");
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

// DRAW iniciar dibujo
function startDraw() {
	
	// para que no disparen otros eventos del mouse
	d3.event.stopPropagation(); 
	
	startPos[0] = endPos[0] = d3.event.x;
	startPos[1] = endPos[1] = d3.event.y;	

	console.log(".. DRAWING " + buttonData[modeSel].id)
	console.log("   Start at " + startPos);

	prevLine.attr("visibility", modeSel == 0 ? "visible" : "hidden");
	prevRect.attr("visibility", modeSel == 1 ? "visible" : "hidden");
}

// DRAW previsualizar dibujo
function dragDraw() {
	endPos[0] = d3.event.x;
	endPos[1] = d3.event.y;

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

// DRAW finalizar previsualizacion y dibujar forma definitiva
function endDraw() {

	// para que no se disparen otros eventos del mouse
	d3.event.stopPropagation(); 
	
	console.log("   End at   "+ endPos);

	prevLine.attr("visibility", "hidden");
	prevRect.attr("visibility", "hidden");

	(modeSel == 0) ? drawNewLine() : drawNewRect();
}

// dibujar una linea en el canvas
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

// si se confirma la accion > borrar el canvas
function clearCanvas() {
	if (confirm("Do you want to clear the canvas?") == true) {		
    	lineGroup.selectAll("line").remove();
		rectGroup.selectAll("rect").remove();
 		console.log(":: CANVAS CLEARED");
	}
}