const urlPaths = {
  movie: "./data/movie-data.json",
  game: "./data/video-game-sales-data.json",
};
//
const h = 800;
const w = document.body.clientWidth * 0.9;
const p = { t: 80, r: 40, b: 80, l: 40 };
const fillScale = d3
  // .scaleOrdinal(d3.schemePaired)
  // .scaleOrdinal(d3.schemeCategory10)
  .scaleOrdinal(d3.schemeSet3);
// const strokeScale = d3
//     .scaleOrdinal(d3.schemeDark2)
//
let movieData;
let gameData;
let loadCount = 0;
//
// tooltip
const toolBox = d3.select("body").append("div").attr("class", "tool-box");
// const tooltip = d3.select('body')
//     .append('div')
//     .attr('class', 'tooltip')

// tooltip
//     .append('p')
//     .attr('class', 'description')
//
document.addEventListener("DOMContentLoaded", () => {
  for (const key in urlPaths) {
    let req = new XMLHttpRequest();
    req.open("GET", urlPaths[key], true);
    req.send();
    req.onload = () => {
      if (key === "movie") {
        movieData = JSON.parse(req.responseText);
        loadCount += 1;
      } else if (key === "game") {
        gameData = JSON.parse(req.responseText);
        loadCount += 1;
      } //

      if (loadCount === Object.keys(urlPaths).length) {
        renderD3();
      } //
    }; //
  } //

  const renderD3 = () => {
    // console.log('movieData', movieData)
    // let data = movieData
    // console.log('gameData', gameData)
    let data = gameData;

    // svg
    const svg = d3
      .select("body")
      .append("svg")
      .attr("id", "svg")
      .attr("height", h)
      .attr("width", w);

    svg
      .append("text")
      .attr("class", "title")
      .attr("x", w / 2)
      .attr("y", 50)
      .attr("text-anchor", "middle")
      .text(data.name);

    const mainGraph = svg
      .append("g")
      .attr("transform", `translate(${p.l}, ${p.t})`);

    // hierarchy
    let hierarchy = d3.hierarchy(data);
    hierarchy.sum((d) => d.value);

    // treemap
    const treemap = d3.treemap();
    // layout
    const layout = treemap(hierarchy);
    // modified data array
    const children = layout.children
      .map((item) => item.children.map((child) => child))
      .flat(1);
    // modify name key to array for cleaner display
    children.forEach((element) => {
      if (element.data.name.includes(":")) {
        let first = element.data.name.slice(
          0,
          element.data.name.indexOf(":") + 1
        );
        let second = element.data.name
          .slice(element.data.name.indexOf(":") + 1)
          .trim();
        element.Name = [first, second];
      } else if (element.data.name.includes("/")) {
        let first = element.data.name.slice(
          0,
          element.data.name.indexOf("/") + 1
        );
        let second = element.data.name
          .slice(element.data.name.indexOf("/") + 1)
          .trim();
        element.Name = [first, second];
      } else {
        element.Name = [element.data.name];
      }
    });

    // rectangle
    mainGraph
      .selectAll("rect")
      .data(children)
      .enter()
      .append("rect")
      .on("mouseenter", (d) => {
        // console.log(d.target.__data__.data)
        toolBox
          .style("visibility", "visible")
          .style("top", `${d.clientY + 10}px`)
          .style("left", `${d.clientX + 10}px`)
          .html(
            `Console: ${d.target.__data__.data.category} <br> Title: ${d.target.__data__.data.name}`
          )
          .style("background", fillScale(d.target.__data__.data.category));
      })
      .on("mouseout", () => toolBox.style("visibility", "hidden"))
      .attr("x", (d) => d.x0 * (w - (p.l + p.r)))
      .attr("y", (d) => d.y0 * (h - (p.t + p.b)))
      .attr("width", (d) => (d.x1 - d.x0) * (w - (p.l + p.r)))
      .attr("height", (d) => (d.y1 - d.y0) * (h - (p.t + p.b)))
      .attr("fill", (d) => fillScale(d.data.category))
      .attr("stroke", (d) => "#333")
      .attr("stroke-width", 0.25);

    // text
    mainGraph
      .selectAll("text")
      .data(children)
      .enter()
      .append("text")
      .attr("x", (d) => d.x0 * (w - (p.l + p.r)) + 6)
      .attr("y", (d) => d.y0 * (h - (p.t + p.b)) + 12)
      .attr("font-size", "0.75rem")
      .attr("fill", "#444")
      .text((d) => d.data.name)
      .attr("class", "wrapme")
      .attr("width", (d) => (d.x1 - d.x0) * (w - (p.l + p.r)) - 10)
      .attr("text-anchor", "start")
      .call(wrap);

    // children.map(child => {
    //     mainGraph
    //         .append('text')
    //         .attr('x', (child.x0 * (w - (p.l + p.r))) + 6)
    //         .attr('y', (child.y0 * (h - (p.t + p.b))) + 12)
    // .attr('font-size', '0.75rem')
    // .attr('fill', '#444')
    // .text(child.Name[0])
    //     if (child.Name.length > 1) {
    //         mainGraph
    //             .append('text')
    //             .attr('x', (child.x0 * (w - (p.l + p.r))) + 6)
    //             .attr('y', (child.y0 * (h - (p.t + p.b))) + 24)
    //             .attr('font-size', '0.75rem')
    //             .attr('fill', '#444')
    //             .text(child.Name[1])
    //     }
    // }) //

    // legend
    let categories = children
      .map((item) => item.data.category)
      .filter((x, i, arr) => arr.indexOf(x) === i);

    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${w / 5}, ${h - 60})`);

    legend
      .selectAll("rect")
      .data(categories)
      .enter()
      .append("rect")
      .attr("width", 50)
      .attr("height", 20)
      .attr("x", (d, i) => i * 50)
      .attr("y", 0)
      .attr("fill", (d) => fillScale(d))
      .attr("stroke", "#333")
      .attr("stroke-width", 0.25);

    legend
      .selectAll("text")
      .data(categories)
      .enter()
      .append("text")
      .attr("class", "legend")
      .attr("x", (d, i) => i * 50 + 25)
      .attr("y", 35)
      .attr("text-anchor", "middle")
      .attr("font-size", "0.75rem")
      .text((d) => d);
  }; //
}); //

function wrap(text) {
  // console.log(text)
  text.each(function () {
    var text = d3.select(this);
    var words = text.text().split(/\s+/).reverse();
    var lineHeight = 14;
    var width = parseFloat(text.attr("width"));
    var y = parseFloat(text.attr("y"));
    var x = text.attr("x");
    var anchor = text.attr("text-anchor");

    var tspan = text
      .text(null)
      .append("tspan")
      .attr("x", x)
      .attr("y", y)
      .attr("text-anchor", anchor);
    var lineNumber = 0;
    var line = [];
    var word = words.pop();

    while (word) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        lineNumber += 1;
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text
          .append("tspan")
          .attr("x", x)
          .attr("y", y + lineNumber * lineHeight)
          .attr("anchor", anchor)
          .text(word);
      }
      word = words.pop();
    }
  });
}
d3.selectAll(".wrapme").call(wrap);
