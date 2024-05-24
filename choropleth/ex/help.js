// We need to make two XMLHttpRequests, so let's start by saving our target URLs to an object:
const urlList = {
  // education: "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json",
  // map: "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json"
  education: "./data/user-education.json",
  map: "./data/counties.json",
};

// We'll be saving all of our data to two arrays, which we'll create and leave empty here in the global scope.
let eduData = [];
let mapData = [];
// Because the AJAX is asynchronous, and the datasets quite large (3000+ indexes each), there's a risk that the data won't be fully ready by the time we start building our chart. To avoid this, we'll also set up a counter which we'll use to keep track of how many datasets we've received:
let readyCount = 0;

// Now, let's make our data requests once the page has loaded:
document.addEventListener("DOMContentLoaded", function () {
  // We'll iterate through our urlList object and make an AJAX request each time, saving the received data to our two arrays:
  for (const property in urlList) {
    let request = new XMLHttpRequest();
    request.open("GET", urlList[property], true);
    request.send();

    // When the request is succesful and we receive the data from the server:
    request.onload = function () {
      if (property == "education") {
        eduData = JSON.parse(request.responseText);
        readyCount += 1;
      } else if (property == "map") {
        mapData = JSON.parse(request.responseText);
        readyCount += 1;
      }

      // Let's check that the amount of responses received matches the number of URL's we had, and if so, we'll call the function that holds all of our chart-building code:
      if (readyCount === Object.keys(urlList).length) {
        buildChart();
      }
    }; // END of .onload()
  } // END of FOR loop

  // Let's build our chart!
  const buildChart = function () {
    // With all of our data nicely received and stored in our dataset arrays, let's carry on by setting up all the variables for our choropleth chart:

    const paddingTop = 40;
    const paddingLeft = 20;
    const paddingRight = 60;
    const paddingBottom = 20;

    const w = 1000 + paddingLeft + paddingRight;
    const h = 600 + paddingTop + paddingBottom;

    const legendRectCount = 10; // how many rectangles we want to have in our legend (project requirement is a minimum of 4)
    const legendRectH = (h - paddingTop - paddingBottom) / legendRectCount;
    const legendRectW = 10;
    const legendSpacing = 55; // for spacing the legend's text labels from their rectangles

    // Note that the three colours we've picked have the same hue and lightness, only their saturation values are different:
    const minColor = "#dae6f2"; // hsl(208, 10, 95)
    const pivotColor = "#6db4f2"; // hsl(208, 55, 95)
    const maxColor = "#0081f2"; // hsl(208, 100, 95)
    const stateBorderColor = "orange";

    // With our variables set out, let's create and place the SVG that will be our chart:
    const svg = d3
      .select("#container")
      .append("svg")
      .attr("id", "chart")
      .attr("width", w)
      .attr("height", h);
    // As per the user stories, let's give our chart a title...
    svg
      .append("text")
      .text("Higher Education Rates by US county")
      .attr("id", "title") // project requirement
      .attr("transform", "translate(" + w / 2 + ", " + paddingTop + ")")
      .attr("text-anchor", "middle");
    // ... and a description:
    svg
      .append("text")
      .text("Adults age ≥25 with a bachelor's degree or higher (2010-2014)")
      .attr("id", "description") // project requirement
      .attr("transform", "translate(" + w / 2 + ", " + 1.7 * paddingTop + ")")
      .attr("text-anchor", "middle");

    // In order to display our colors and have these progress very granularly based on the data for each county, we'll use a linear scale to create a color "gradient":
    const eduMin = d3.min(eduData, (d) => d.bachelorsOrHigher);
    const eduMean = d3.mean(eduData, (d) => d.bachelorsOrHigher);
    const eduMax = d3.max(eduData, (d) => d.bachelorsOrHigher);

    const colorScale = d3
      .scaleLinear()
      .domain([eduMin, eduMean, eduMax]) // We pass a middle value, in our case the mean, to get a better color contrast
      .range([minColor, pivotColor, maxColor]); // We pass a pivot color that will be matched up to the pivot value in our domain.
    // For our chart's county colors, education rates, county names, state names, etc. we need to compare --on multiple occasions--  the ID of our mapData to the FIPS of our eduData in order to find a match, and then pull from the matching eduData object the data that we need. Rather than clutter our D3 commands later on and repeat our code unecessarily, we'll write a function here that we can reuse multiple times.
    // Note that because each county or tooltip requires us to access multiple pieces of information (e.g., for tooltip: area_name, state, bachelorsOrHigher), we will create a variable for temporarily saving the most recently matched eduData. By doing this, whenever we need to retireve multiple pieces of data for the same county, we'll be able to avoid calling a .filter() methods over the entire 3000+ length of eduData EACH TIME just to retrieve the same eduData object:
    // We'll store the most recent eduData object in a variable. By default, we'll set it to the first object in eduData, mostly as a place holder:
    let recentEduData = [eduData[0]];
    // With our temporary storage variable ready, let's write the function that returns the correct eduData value for a given county:
    const fetchEduData = function (d, keyName) {
      // If the object in recentEduData doesn't match the ID of the county we're working on, then we'll update recentEduData...
      if (recentEduData[0].fips != d.id) {
        recentEduData = eduData.filter((val) => val.fips == d.id);
      }
      // .. and in return either the value we wanted from the prexisting recentEduData, or from the updated recentEduData variable:
      return recentEduData[0][keyName];
    };

    // Let's now turn our attention to the tooltip part of the project. We'll start by placing the DIV that will hold our tooltip on the page:
    const toolTipBox = d3
      .select("#container")
      .append("div")
      .attr("id", "tooltip");
    // Next, we'll put together a function that will automatically create the HTML content of our tooltips:
    const toolTipContent = function (d) {
      // Rather than use our fetchEduData function for each piece of information we need for our tooltips, we'll filter for the correct county's education data once only, and save a copy of it. By doing this, we avoid having to filter three times through 3000+ entries for the same data:
      let currentCounty = eduData.filter((val) => val.fips == d.id)[0];

      let area_name = currentCounty.area_name;
      let state = currentCounty.state;
      let fips = d.id;
      let eduLevel = currentCounty.bachelorsOrHigher;

      return area_name + ", " + state + "<br>" + eduLevel + "%";
    };

    // The project's user stories also call for a legend, so let's get cracking on that. First, we'll create and place a groupd that will hold all of our legend elements:
    const legend = svg
      .append("g")
      .attr("id", "legend") // project requirement
      .attr(
        "transform",
        "translate(" +
          (w - paddingLeft - paddingRight) +
          ", " +
          (h - paddingBottom) +
          ")"
      ); // we move the whole group to where we want it, so that we don't have to also move the children elements one-by-one, thus saving on clutter and repeated code. Note that because we want the lowest value in our legend to be at the bottom, we have placed our legend in the bottom-right corner.
    // In order to populate our legend with labels and rectangles, we'll first build a function that can dynamically create the limits for each of the steps:
    const legendData = function () {
      // We'll start by defining an array and prepopulating it with the lowest value...
      let arr = [eduMin];
      // .. then determine how far apart each of the steps should be based on how many rectangles we want in our legend.
      let stepSize = (eduMax - eduMean) / legendRectCount;
      // With this info, we'll populate the array with the values for each step (minus 1)...
      for (i = 1; i <= legendRectCount - 1; i++) {
        arr.push(parseFloat((i * stepSize + eduMin).toFixed(1)));
      }
      // ... and finally add the largest value to our array...
      arr.push(eduMax);
      // ... before returning our array of values:
      return arr;
    };

    // With all of the setup work done for our array, let's build it!
    // First, we'll palce the rectangles...
    legend
      .selectAll("rect")
      .data(legendData().slice(0, -1)) // We remove the last rectangle so that we end on the eduMax value
      .enter()
      .append("rect")
      .attr("id", "legend-rect")
      .attr("y", (d, i) => i * -legendRectH - legendRectH) // adding rectangles upwards
      .attr("width", legendRectW)
      .attr("height", legendRectH)
      .attr("fill", (d) => colorScale(d)) // determine the fill color based on the rectangle's value
      .attr("stroke", "white"); // to make it easier to see the change from one rectangle to the next
    // ... and then we'll place the labels, inline with the edge of each rectangle in our legend:
    legend
      .append("g")
      .attr("id", "legend-axis")
      .selectAll("text")
      .data(legendData())
      .enter()
      .append("text")
      .attr("id", "legend-label")
      .text((d) => d + "%")
      .attr("y", (d, i) => i * -legendRectH) // populating the labels "upwards"
      .attr("transform", "translate(" + legendSpacing + ", 0)"); // moving the label text over to the right

    // Now that we have all of the smaller elements in place on our chart, let's get to the task of adding the counties and states to create our choropleth chart. To achieve this goal, we'll use topoJSON. When given a GeoJSON geometry or feature object, topoJSON generates an SVG path data string or renders the path. Paths can be used with projections or transforms, or they can be used to render planar geometry directly to Canvas or SVG.
    // NB: TopoJSON is an extension of GeoJSON that encodes topology. Rather than representing geometries discretely, geometries in TopoJSON files are stitched together from shared line segments called arcs. This means that the border between two counties, for example, doesn't get represented twice, but rather one border is shared by both county shapes. This makes maps generated with topoJSON lighter.
    // In our case, it appears that the data we've received from our AJAX request is not latitude/longitude coordinates, but rather pre-projected arcs (GeometryCollection). For this reason, we don't need to/can't specify any projection details (e.g. d3.geoAlbersUSA(), scale, etc.) when we define our path generator:
    const geoPathMaker = d3.geoPath();
    //.projection(null)
    // With our D3 path generator defined and ready to go, we'll create a container for all of our counties using a group:
    const counties = svg
      .append("g")
      .attr("id", "counties")
      .attr("transform", "translate(" + paddingLeft + ", " + paddingTop + ")"); // moving the whole group and its children
    // We'll also create a container group for the individual states:
    const states = svg
      .append("g")
      .attr("id", "states")
      .attr("transform", "translate(" + paddingLeft + ", " + paddingTop + ")"); // moving the whole group and its children
    // With our two map groups ready, next we'll load up our county data and have D3 place the elements within our counties group with the help of topoJSON and the path generator we defined:
    counties
      .selectAll("path")
      .data(topojson.feature(mapData, mapData.objects.counties).features) // how to pass data to topoJSON
      .enter()
      .append("path") // we're adding path elements (line segments) to our SVG to create the map
      .attr("class", "county") // project requirement
      .attr("d", geoPathMaker) // we call our path generator, which we defined earlier
      .attr("data-fips", (d) => d.id) // fips (in eduData) and id (in mapData) are the unique identifiers that allow us to match data between the two datasets, so we can just return d.id here instead of fips (https://en.wikipedia.org/wiki/Federal_Information_Processing_Standards)
      .attr("data-education", (d) => fetchEduData(d, "bachelorsOrHigher")) // project requirement
      .attr("fill", (d) => colorScale(fetchEduData(d, "bachelorsOrHigher")))
      .on("mouseover", (d, i) => {
        toolTipBox
          .style("top", d3.event.pageY + 10 + "px") // we use the coordinates (from the viewport) of where the mouseover event happened in order to place our tooltips. Note the need to add a unit, as we're placing a DIV, and not an SVG element
          .style("left", d3.event.pageX + 10 + "px")
          .attr("data-education", fetchEduData(d, "bachelorsOrHigher")) // project requirement
          .style("background", colorScale(fetchEduData(d, "bachelorsOrHigher"))) // we'll go the extra step and make the background color of the tooltip match the color of its county
          .style("visibility", "visible") // Our tooltip defaults to hidden (at load, and also after mouseout events), so we need to make it visible at mouseover events
          .html(toolTipContent(d)); // we use out HTML content generator, which we defined earlier, to populate the tooltip
      })
      .on("mouseout", (d, i) => {
        toolTipBox.style("visibility", "hidden");
      });
    // With the counties added, we'll also place the elements for our state borders in order to make it easier for the user to make sense of where all the counties (3000+) are:
    states
      .selectAll("path")
      .data(topojson.feature(mapData, mapData.objects.states).features)
      .enter()
      .append("path")
      .attr("class", "state")
      .attr("d", geoPathMaker)
      .attr("fill", "none") // so that the states are transparent
      .attr("stroke", "orange"); // So we can identify the states

    // And just like that, we're done!
  }; // END of buildChart() function
}); // END of DOMContentLoaded event listener
