// global variables
const urlPaths = {
  edu: "./data/user-education.json",
  map: "./data/counties.json",
};
// ----------
const h = document.body.clientHeight * 0.8;
const w = document.body.clientWidth * 0.8;
const p = { t: 80, r: 200, b: 20, l: 100 };
// ----------
let eduData = [];
let mapData = [];
let loadCount = 0;
// ----------

// DOM load eventlistener
document.addEventListener("DOMContentLoaded", () => {
  // iterate thru urlPaths & make AJAX request
  for (const key in urlPaths) {
    let req = new XMLHttpRequest();
    req.open("GET", urlPaths[key], true);
    req.send();
    req.onload = () => {
      if (key === "edu") {
        eduData = JSON.parse(req.responseText);
        loadCount += 1;
      } else if (key === "map") {
        mapData = JSON.parse(req.responseText);
        loadCount += 1;
      } //

      if (loadCount === Object.keys(urlPaths).length) {
        renderD3();
      } //
    }; // END .onload()
  } // END for loop
  // ----------

  // renderD3 func to create chart
  const renderD3 = () => {
    // local vars
    const legendInfo = {
      rect: 7,
      h: (h - p.t - p.b) / 8 - 10,
      w: 10,
      p: 40,
    };
    // const minCol = '#FFFCDC'
    // const pivCol = '#FEF590'
    // const maxCol = '#343009'
    const minCol = "#E8F3E8";
    const pivCol = "#92C591";
    const maxCol = "#0A3409";
    const stateBrdrCol = "#333";
    // ----------

    // svg
    const svg = d3
      .select("body")
      .append("svg")
      .attr("id", "chart")
      .attr("height", h)
      .attr("width", w);
    // ----------

    // title and description here
    svg
      .append("text")
      .text("United States Higher Education Rates - by County")
      .attr("id", "title")
      .attr("transform", `translate(${w / 2}, ${p.t - 25})`)
      .attr("text-anchor", "middle")
      .attr("fill", "whitesmoke");
    // ***
    svg
      .append("text")
      .text(
        `Percentage of Adults Age 25+ w/ Bachelor's Degree or Higher (2010-2014)`
      )
      .attr("id", "description")
      .attr("transform", `translate(${w / 2}, ${p.t + 10})`)
      .attr("text-anchor", "middle")
      .attr("fill", "whitesmoke");
    // ***
    svg
      .append("text")
      .text(`~ Source: \"U.S. Education Bureau ® 2015\" ~`)
      .attr("transform", `translate(${w - 320}, ${h - 20})`)
      .attr("fill", "whitesmoke")
      .attr("opacity", 0.6);
    // ***
    // ----------

    // colorScale gradient
    const eduMin = d3.min(eduData, (d) => d.bachelorsOrHigher);
    const eduMean = d3.mean(eduData, (d) => d.bachelorsOrHigher);
    const eduMax = d3.max(eduData, (d) => d.bachelorsOrHigher);
    const colorScale = d3
      .scaleLinear()
      .domain([eduMin, eduMean, eduMax])
      .range([minCol, pivCol, maxCol]);
    // ----------

    // chart info
    let selectEdData = [eduData[0]];
    const fetchEdData = (d, key) => {
      let _id = typeof d == "number" ? d : d.id;
      if (typeof d == "number") _id = d;
      if (selectEdData[0].fips !== d.id) {
        selectEdData = eduData.filter((x) => x.fips == _id);
      } //
      return selectEdData[0][key];
    }; // END fetchEdDat func

    const toolBox = d3.select("body").append("div").attr("id", "tool-box");

    const toolBoxInfo = (d) => {
      let _id = d.target.dataset.fips;
      let county = eduData.filter((val) => val.fips == _id)[0];
      let area_name = county.area_name;
      let state = county.state;
      let fips = d.id;
      let eduLev = county.bachelorsOrHigher;
      return `${area_name}, ${state}<br>${eduLev}%`;
    }; // END toolBoxInfo func
    // ----------

    // legend section
    const legend = svg
      .append("g")
      .attr("id", "legend")
      .attr("transform", `translate(${w - p.r}, ${h - p.t + 10})`);

    const legendData = () => {
      let arr = [eduMin];
      let size = (eduMax - eduMean) / legendInfo.rect;
      for (let i = 1; i <= legendInfo.rect - 1; i++) {
        arr.push(parseFloat((i * size + eduMin).toFixed(2)));
      }
      arr.push(eduMax);
      return arr;
    }; // END legendData func

    legend
      .selectAll("rect")
      .data(legendData())
      .enter()
      .append("rect")
      .attr("y", (d, i) => i * -legendInfo.h - legendInfo.h)
      .attr("height", legendInfo.h)
      .attr("width", legendInfo.w)
      .attr("fill", (d) => colorScale(d))
      .attr("stroke", stateBrdrCol)
      .attr("stroke-width", 1);

    legend
      .selectAll("line")
      .data(legendData())
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("y1", (d, i) => i * -legendInfo.h)
      .attr("x2", 20)
      .attr("y2", (d, i) => i * -legendInfo.h)
      .attr("stroke", "whitesmoke");

    legend
      .append("g")
      .selectAll("text")
      .data(legendData())
      .enter()
      .append("text")
      .text((d) => `${d.toFixed(1)}%`)
      .attr("y", (d, i) => i * -legendInfo.h + 3)
      .attr("transform", `translate(${legendInfo.p - 10}, 0)`)
      .attr("fill", "whitesmoke");
    // ----------

    // path generation section
    const pathGenerator = d3.geoPath();
    // .projection()

    const counties = svg
      .append("g")
      .attr("id", "counties")
      .attr("transform", `translate(${p.l}, ${p.t})`);

    const states = svg
      .append("g")
      .attr("id", "states")
      .attr("transform", `translate(${p.l}, ${p.t})`);

    counties
      .selectAll("path")
      .data(topojson.feature(mapData, mapData.objects.counties).features)
      .enter()
      .append("path")
      .attr("class", "county")
      .attr("d", pathGenerator)
      .attr("data-fips", (d) => d.id)
      // .attr("data-education", (d) => fetchEdData(d, "bachelorsOrHigher"))
      .attr("fill", (d) => colorScale(fetchEdData(d, "bachelorsOrHigher")))
      // tooltip event handler
      .on("mouseover", (d) => {
        toolBox
          .style("top", `${d.clientY + 10}px`)
          .style("left", `${d.clientX + 10}px`)
          .style(
            "background",
            colorScale(fetchEdData(+d.target.dataset.fips, "bachelorsOrHigher"))
          )
          .style("visibility", "visible")
          .html(toolBoxInfo(d));
      }); //

    states
      .selectAll("path")
      .data(topojson.feature(mapData, mapData.objects.states).features)
      .enter()
      .append("path")
      .attr("class", "state")
      .attr("d", pathGenerator)
      .attr("fill", "none")
      .attr("stroke", stateBrdrCol)
      .attr("stroke-width", 0.5)
      .on("mouseout", (d) => {
        toolBox.style("visibility", "hidden");
      }); //
    // ----------

    // ----------
  }; // END renderD3 func
}); // END eventListener

// ______________________________________________________________________________________________________________
// const h = document.body.clientHeight * .8
// const w = document.body.clientWidth * .8

// const svg = d3.select('body')
//     .append('svg')
//     .attr('height', h)
//     .attr('width', w)

// const renderD3 = (data) => {
//     const p = { t: 50, r: 200, b: 50, l: 200 }

// const g = svg
//     .append('g')
//     .attr('transform', `translate(${p.l}, ${p.t})`)

// const pathGenerator = d3.geoPath()

// const paths = g.selectAll('path')
//     .data(data)
//     .enter()
//     .append('path')
//     .attr('d', pathGenerator)

// } //

// // D3 .json() method *sample*
// d3.json('./data/counties.json')
//     .then((data) => {
//         // console.log('d3.json', data)
//         const counties = topojson.feature(data, data.objects.counties)
//         renderD3(counties.features)

//     }) //
// ----------

// **other API request examples
// **
// // fetch method() *sample*
// fetch('./data/counties.json')
//     .then(response => response.json())
//     .then(data => {
//         console.log('fetch', data)
//     })
// // ----------

// // XMLHttpRequest 'GET' *sample*
// req = new XMLHttpRequest();
// req.open("GET",'./data/counties.json',true);
// req.send();
// req.onload = () => {
//   json = JSON.parse(req.responseText);
//   console.log('XMLHttpRequest', json)
// };
// // ----------
