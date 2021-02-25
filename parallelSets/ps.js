function filterCluster(data, cluster) {
  return d3.filter(data, d => d.Clusters == cluster);
}

function parseNumbers(arr) {
  for(let i = 0; i < arr.length; i++) arr[i] = eval(arr[i]);
  return arr;
}

function getGraph(data, keys) {
  let index = -1;
  const nodes = [];
  const nodeByKey = new Map;
  const indexByKey = new Map;
  const links = [];

  for (const k of keys) {
    for (const d of data) {
      const key = JSON.stringify([k, d[k]]);
      if (nodeByKey.has(key)) continue;
      const node = {name: d[k]};
      nodes.push(node);
      nodeByKey.set(key, node);
      indexByKey.set(key, ++index);
    }
  }

  for (let i = 1; i < keys.length; ++i) {
    const a = keys[i - 1];
    const b = keys[i];
    const prefix = keys.slice(0, i + 1);
    const linkByKey = new Map;
    for (const d of data) {
      const names = prefix.map(k => d[k]);
      const key = JSON.stringify(names);
      const value = d.value || 1;
      let link = linkByKey.get(key);
      if (link) { link.value += value; continue; }
      link = {
        source: indexByKey.get(JSON.stringify([a, d[a]])),
        target: indexByKey.get(JSON.stringify([b, d[b]])),
        names,
        value
      };
      links.push(link);
      linkByKey.set(key, link);
    }
  }

  return {nodes, links};
}

function drawCluster(data, cluster, svg,
    width, height, sankey) {
  const df = d3.filter(data, d => d.Clusters == cluster);

  let keys = data.columns;
  keys = keys.slice(1, keys.length - 2);

  const graph = getGraph(df, keys);

  const {nodes, links} = sankey({
    nodes: graph.nodes.map(d => Object.assign({}, d)),
    links: graph.links.map(d => Object.assign({}, d))
  });

  svg.append("g")
    .selectAll("rect")
    .data(nodes)
    .join("rect")
      .attr("x", d => d.x0)
      .attr("y", d => d.y0)
      .attr("height", d => d.y1 - d.y0)
      .attr("width", d => d.x1 - d.x0)
    .append("title")
      .text(d => `${d.name}\n${d.value.toLocaleString()}`);

  svg.append("g")
      .attr("fill", "none")
    .selectAll("g")
    .data(links)
    .join("path")
      .attr("d", d3.sankeyLinkHorizontal())
      .attr("stroke", "blue")
      .attr("opacity", .5)
      .attr("stroke-width", d => d.width)
      .style("mix-blend-mode", "multiply")
    .append("title")
      .text(d => `${d.names.join(" → ")}\n${d.value.toLocaleString()}`);
}

d3.csv("df_full.csv").then(function(data) {
  // plot dimensions
  const width = 699;
  const height = 299;
  const margin = {right: 25, left: 25, top: 199, right: 55};

  let clusters = d3.map(data, d => d.Clusters);
  clusters = parseNumbers(clusters).filter((v, i, s) => {
    return s.indexOf(v) == i && v != -1;
  })
  clusters = clusters.sort((a, b) => b - a);

  let clustersSize = {};
  let maxSize = 0;

  for(let cluster of clusters) {
    var df = d3.filter(data, d => d.Clusters == cluster);
    var length = df.length;
    clustersSize[cluster] = length;
    if(length > maxSize) {
      maxSize = length;
    }
  }

  const wScale = d3.scaleLinear()
          .domain([0, maxSize])
          .range([0, height]);

  let sankey = d3.sankey()
    .nodeSort(null)
    .linkSort(null)
    .nodeWidth(4)
    .nodePadding(20)
    .extent([[0, 5], [width, wScale(clustersSize[clusters.length - 1]) - 5]]);

  let svg = d3.select("#vis")
          .append("svg")
          .attr("id", "cluster" + (clusters.length - 1))
          .attr("y", margin.top)
          .attr("height", wScale(clustersSize[clusters.length - 1]))
          .attr("width", width);

  let boundingBox, y;
  for(let cluster of clusters) {
    drawCluster(data, cluster, svg, wScale(clustersSize[cluster]),
            height, sankey);

    if(cluster == 0) break;

    boundingBox = svg._groups[0][0].getBoundingClientRect();
    y = boundingBox.bottom;
    svg = d3.select("#vis")
      .append("svg")
      .attr("id", "cluster" + (cluster - 1))
      .attr("y", y)
      .attr("height", wScale(clustersSize[cluster - 1]))
      .attr("width", width);

    sankey = d3.sankey()
      .nodeSort(null)
      .linkSort(null)
      .nodeWidth(4)
      .nodePadding(20)
      .extent([[0, 5], [width, wScale(clustersSize[cluster - 1]) - 5]]);
  }

  d3.select("#vis").attr("transform", "rotate(90)translate(-1699, -159)");

})
