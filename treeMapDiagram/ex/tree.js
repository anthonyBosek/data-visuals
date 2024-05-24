// select the container in which to include the data visualization and begin by appending a title and a description
const container = d3.select("div.container");

container.append("h1").attr("id", "title").text("Movie Sales");

container
  .append("h3")
  .attr("id", "description")
  .text("Highest Grossing Movies, by Genre");

// include a div for the tooltip
// text is included in the paragraphs appended to the tooltip
const tooltip = container.append("div").attr("id", "tooltip");

tooltip.append("p").attr("class", "name");

// define an ordinal color scale with a predefined scheme, provided by the library
// such an ordinal scale maps a discrete input (the movie's category) to a discrete output (one of the provided colors)
const colorScale = d3.scaleOrdinal(d3.schemeSet2);

// for the SVG, define an object with the margins, used to nest the SVG content safe inside the SVG boundaries
// as there is no need for axis, the margin is used to safely draw the legend and the overall visualization
const margin = {
  top: 20,
  right: 20,
  // the legend is included at the bottom of the visualization, and therfore relies on additional spacing
  bottom: 50,
  left: 20,
};
// define and append an SVG element
const width = 800 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

const svgContainer = container
  .append("svg")
  .attr(
    "viewBox",
    `0 0 ${width + margin.left + margin.right} ${
      height + margin.top + margin.bottom
    }`
  );

// define the group element nested inside the SVG, in which to actually plot the map
const svgCanvas = svgContainer
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// retrieve the JSON format and pass it in a function responsible to draw the diagram itself
const URL = "./data/movie-data.json";

fetch(URL)
  .then((response) => response.json())
  .then((json) => drawDiagram(json));

function drawDiagram(data) {
  // log the JSON file
  // console.log(data);

  /* 
  d3.treemap() cannot use the JSON format directly
  it is first necessary to include a root node and values for all the branches, outlining the relative weight of each division
  d3.hierarchy includes the node
  node.sum allows to include the value for each data point and branch
  */

  // include a root node
  let hierarchy = d3.hierarchy(data);

  // compute the value for each branch, dividing the nodes on the basis of the nodes' values
  hierarchy.sum((d) => d.value);

  // create a treemap layout
  const treemap = d3.treemap();

  const treemapLayout = treemap(hierarchy);

  // display the data, as modified per the treemap layout
  // console.log(treemapLayout);

  /*
  in order to draw the rectangle elements, what is needed is an an array nesting one object for each movie 
  by looping through the modified dataset, it is possible to obtain such a set of information 
  */
  let movies = [];
  // loop through the movies categories
  for (let i = 0; i < treemapLayout.children.length; i++) {
    // loop through the movies names
    for (let j = 0; j < treemapLayout.children[i].children.length; j++) {
      // include each movie in the prescribed array
      movies.push(treemapLayout.children[i].children[j]);
    }
  }

  /* 
  movies is now an array of objects
  objects with the following pertinent information
    data, an object detailing the movie with the following property
      name
      category
      value
    x0, x1
    y0, y1, describing the position of the rectangles' edges, with a number representing a fraction of 1
    x and y indeed total to 1, considering all elements
  */
  // console.log(movies);

  // append one rectangle per movie
  svgCanvas
    .selectAll("rect")
    .data(movies)
    .enter()
    .append("rect")
    // include the class and data attribute prescribed by the user stories
    .attr("class", "tile")
    .attr("data-name", (d, i) => d.data.name)
    .attr("data-category", (d, i) => d.data.category)
    .attr("data-value", (d, i) => d.data.value)
    // when hovering on the tiles, show the tooltip displaying pertinent information in the paragraph it nests
    .on("mouseenter", (d, i) => {
      tooltip
        .style("opacity", 1)
        .attr("data-value", (d) => d.data.value)
        .style("left", `${d3.event.layerX + 5}px`)
        .style("top", `${d3.event.layerY + 5}px`);
      tooltip.select("p.name").text(() => d.data.name);
    })
    // when leaving the tiles, hide the tooltip back
    .on("mouseout", () => tooltip.style("opacity", 0))
    // the rectangles themselves are drawn based on the edges retrieved with d3.treemap()
    // the width and height are given by the difference in the x1, y1 and x0, y0 values (right edge - left edge, top edge - bottom edge)
    // as these values are in the 0-1 range, multiplying the value by the width and height normalizes the range to 0-width
    .attr("width", (d, i) => (d.x1 - d.x0) * width)
    .attr("height", (d, i) => (d.y1 - d.y0) * height)
    // the horizontal and vertical coordinates are given by the left and top edge, normalized for the width
    .attr("x", (d, i) => d.x0 * width)
    .attr("y", (d, i) => d.y0 * height)
    // the fill color is determined through the color scale, on the basis of the discrete value representing the movie category
    .attr("fill", (d, i) => colorScale(d.data.category));

  // based on the retrieved data, include a legend including the movies' categories
  let categoriesArr = movies.map((movie) => movie.data.category);
  // remove duplicates
  let categories = categoriesArr.filter((category, i) => {
    if (categoriesArr.slice(0, i).indexOf(category) === -1) {
      return category;
    }
  });

  // include a legend at the below the SVG canvas
  const legend = svgCanvas
    .append("g")
    .attr("id", "legend")
    .attr("transform", `translate(0, ${height + 10})`);

  legend
    // include one rectangle per legend value, with a different fill color
    .selectAll("rect")
    .data(categories)
    .enter()
    .append("rect")
    .attr("class", "legend-item")
    .attr("width", 50)
    .attr("height", 20)
    .attr("x", (d, i) => i * 50)
    .attr("y", 0)
    // fill to match the fill color of the tiles
    .attr("fill", (d, i) => colorScale(d))
    // opacity to match the default opacity for the same rectangles
    .attr("opacity", 0.7);

  legend
    // below each legend item, include a text detailing the movie category
    .selectAll("text")
    .data(categories)
    .enter()
    .append("text")
    .attr("x", (d, i) => i * 50)
    .attr("font-size", "0.5rem")
    .attr("y", 30)
    .text((d, i) => d);
}
