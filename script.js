// Definition de la taille du svg
const margin = { top: 150, right: 30, bottom: 20, left: 150 },
  width = 960,
  height = 960;

// on met la taille explicite d’une cellule
const cellSize = 20;

var svg = d3
  .select("#visu-tp4")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);

var mainGroup = svg
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("data/got_social_graph.json").then(function (graph) {

  // relations considérées dans les deux sens
  let matrix = createAdjacencyMatrix(
    graph.nodes,
    graph.links,
    appearances,
    true
  );

  // échelle de couleur (TA PALETTE)
  var scale = d3.scaleQuantize()
    .domain([0, d3.max(matrix, d => d.weight)])
    .range(["#fff0f5", "#f8c9dd", "#ee92c3", "#d85a9c", "#d63384"]);

  var positionsPersonnages =
    d3.range(graph.nodes.length); // [0, 1, ..., 106]

  var echellexy = d3.scaleBand()
    .domain(positionsPersonnages)
    .range([0, graph.nodes.length * cellSize])
    .paddingInner(0.1)
    .align(0)
    .round(true);

  // ================= MATRICE =================
  var matrixViz = mainGroup
    .selectAll("rect")
    .data(matrix)
    .join("rect")
    .attr("width", echellexy.bandwidth())
    .attr("height", echellexy.bandwidth())
    .attr("x", d => echellexy(d.x))
    .attr("y", d => echellexy(d.y))
    .style("stroke", "black")
    .style("stroke-width", ".2px")
    // couleur = force du lien (COMME TU AVAIS FAIT)
    .style("fill", d => scale(d.weight))
    // bonus demandé dans le sujet : force visible
    .style("opacity", d => d.weight === 0 ? 0 : d.weight / d3.max(matrix, m => m.weight));

  // ================= LABELS =================
  var labels = mainGroup
    .append("g")
    .style("font-size", "8px")
    .style("font-family", "sans-serif");

  // Colonnes
  var columns = labels
    .append("g")
    .selectAll("text")
    .data(graph.nodes)
    .join("text")
    .text(d => d.character)
    .attr("x", (d, i) => echellexy(i) + echellexy.bandwidth() / 2)
    .attr("y", -10)
    .attr("text-anchor", "start")
    .attr("dominant-baseline", "middle")
    .attr("transform", (d, i) =>
      `rotate(-90, ${echellexy(i) + echellexy.bandwidth() / 2}, -10)`
    );

  // Lignes
  var rows = labels
    .append("g")
    .selectAll("text")
    .data(graph.nodes)
    .join("text")
    .text(d => d.character)
    .attr("x", -10)
    .attr("y", (d, i) => echellexy(i) + echellexy.bandwidth() / 2)
    .attr("text-anchor", "end")
    .attr("dominant-baseline", "middle");

  // ================= REORDONNEMENT =================
  var appearancesOrder = graph.nodes.map(d => d.id);

  var zonesOrder = graph.nodes
    .slice()
    .sort((a, b) => a.zone - b.zone)
    .map(d => d.id);

  var influencesOrder = graph.nodes
    .slice()
    .sort((a, b) => b.influence - a.influence)
    .map(d => d.id);

  function update(newPositions) {
    echellexy.domain(newPositions);

    rows
      .transition()
      .duration(800)
      .attr("y", d =>
        echellexy(newPositions.indexOf(d.id)) +
        echellexy.bandwidth() / 2
      );

    columns
      .transition()
      .duration(800)
      .attr("x", d =>
        echellexy(newPositions.indexOf(d.id)) +
        echellexy.bandwidth() / 2
      )
      .attr("transform", d =>
        `rotate(-90, ${
          echellexy(newPositions.indexOf(d.id)) +
          echellexy.bandwidth() / 2
        }, -10)`
      );

    matrixViz
      .transition()
      .duration(800)
      .attr("x", d => echellexy(newPositions.indexOf(d.x)))
      .attr("y", d => echellexy(newPositions.indexOf(d.y)));
  }

  d3.select("#orderSelect").on("change", function () {
    var value = d3.select(this).property("value");
    if (value === "appearances") update(appearancesOrder);
    if (value === "zones") update(zonesOrder);
    if (value === "influences") update(influencesOrder);
  });
});
