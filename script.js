// Definition de la taille du svg
const margin = { top: 0, right: 30, bottom: 20, left: 10 },
width = 960,
height = 960;

// ajout du svg à une 'div id="matrice"' déjà créee dans la page html
var svg = d3
.select("#visu-tp4")
.append("svg")
.attr("width", width)
.attr("height", height)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("data/got_social_graph.json").then(function (graph) {
    let matrix = createAdjacencyMatrix(graph.nodes, graph.links, appearances);
    console.log(matrix);

    var scale = d3.scaleQuantize() 
	.domain([0, d3.max(matrix, function (d) { return d.weight; })])
	.range(["#fff0f5",  "#f8c9dd",  "#ee92c3",  "#d85a9c",  "#d63384"]);

    console.log(scale(10));
    console.log(scale(0));

    var positionsPersonnages = 
	d3.range(graph.nodes.length);	// un tableau d'autant d'element que de personnages 
					// [0, 1, ..., 106]

    var echellexy = d3.scaleBand()
        .range([0, height]) // TODO correspond [0, largeur du dessin]
        .domain(positionsPersonnages) 
        .paddingInner(0.1) 
        .align(0)
        .round(true);

    var labels = d3.select("svg")
	.append("g")
	.attr("transform", "translate(60, 60)")
	.style("font-size", "8px")
	.style("font-family", "sans-serif");

    var columns = labels
        .append("g")
        .selectAll()
        .data(graph.nodes)
        .join("text")
        .attr("text", d => d.character)
        .attr("transform", "rotate(-90)"); // on tourne tout l'axe de 90°

    var rows = labels
        .append("g")
        .selectAll()
        .data(graph.nodes)
        .join("text")
        .attr("text","titi");
    console.log("rows");
    console.log(rows);

    matrixViz = svg.selectAll("rect")
	.data(matrix)
	.join("rect")
	.attr("width", echellexy.bandwidth())
	.attr("height",echellexy.bandwidth())
	.attr("x", function (d) {
        //console.log(d.x);
		//return d.x*5;
        return echellexy(d.x);
	})
	.attr("y", function (d) {
        //console.log(d.y);
		//return d.y*5;
        return echellexy(d.y);
 
	})
	.style("stroke", "black")
	.style("stroke-width", ".2px")
	.style("fill", function (d) {
        //console.log(d.weight);
        return scale(d.weight);
	})
    .call(d3.axisBottom());
});