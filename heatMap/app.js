const url = "./data/global-temp.json";
const h = 800;
const w = document.body.clientWidth;
const p = { t: 180, r: 140, b: 90, l: 115 };
const colors = [
  { temp: 12.8, color: "#940000" },
  { temp: 11.7, color: "#c00505" },
  { temp: 10.6, color: "#e02d2d" },
  { temp: 9.5, color: "#f18832" },
  { temp: 8.3, color: "#f5b339" },
  { temp: 7.2, color: "#f5e939" },
  { temp: 6.1, color: "#c8ecf5" },
  { temp: 5.0, color: "#49d1f3" },
  { temp: 3.9, color: "#2198dd" },
  { temp: 2.8, color: "#2252ca" },
  { temp: 0.0, color: "#02199d" },
];
let tempData;
let baseTemp;

document.addEventListener("DOMContentLoaded", () => {
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      data.monthlyVariance.forEach((element) => {
        element.Year = new Date(element.year, element.month - 1, 1);
        element.Month = element.Year.toString().match(/[a-z]{3}/gi)[1];
        element.GTemp = data.baseTemperature + element.variance;
        element.Color = colors
          .map(({ temp, color }) => (element.GTemp >= temp ? color : null))
          .filter((x) => x != null)[0];
      });
      tempData = data.monthlyVariance;
      baseTemp = data.baseTemperature;
      render();
    }); //

  render = () => {
    // console.log(tempData)
    const svg = d3
      .select("body")
      .append("svg")
      .attr("height", h)
      .attr("width", w);

    const graphHeight = h - (p.t + p.b);
    const graphWidth = w - (p.l + p.r);

    const xData = (d) => d.Year;
    // const xData = (d) => d.year
    const yData = (d) => d.Month;

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(tempData, xData))
      .range([0, graphWidth]);

    const yScale = d3
      .scaleBand()
      .domain(tempData.map(yData))
      .range([0, graphHeight]);

    const xAxis = d3
      .axisBottom(xScale)
      .tickFormat((d) => d3.timeFormat("%Y")(d))
      .ticks(26)
      .tickSize(10)
      .tickPadding(10);

    const yAxis = d3.axisLeft(yScale).tickSize(10).tickPadding(10);

    const maingraph = svg
      .append("g")
      .attr("transform", `translate(${p.l}, ${p.t})`);

    svg
      .append("text")
      .attr("class", "title")
      .attr("x", w / 2)
      .attr("y", 50)
      .attr("text-anchor", "middle")
      .text("Global Land-Surface Temperature by Month");

    svg
      .append("text")
      .attr("class", "sub-title")
      .attr("x", w / 2)
      .attr("y", 90)
      .attr("text-anchor", "middle")
      .text(`1753-2015 - Base Temperature ${baseTemp}℃`);

    svg
      .append("text")
      .attr("class", "sub-title")
      .attr("x", -(h / 2))
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(270)")
      .text("Month");

    svg
      .append("text")
      .attr("class", "sub-title")
      .attr("x", w / 2)
      .attr("y", h - 20)
      .attr("text-anchor", "middle")
      .text("Year");

    svg
      .append("text")
      .attr("x", 60)
      .attr("y", h - 20)
      .text('~ Source: "N.A.C.A. Global Thermal-Dynamic Study" ~')
      .attr("fill", "whitesmoke")
      .attr("opacity", 0.5);

    const xAG = maingraph
      .append("g")
      .call(xAxis)
      .attr("transform", `translate(0, ${graphHeight})`);

    xAG.select(".domain").remove();

    const yAG = maingraph
      .append("g")
      .call(yAxis)
      .attr("transform", "translate( 6, 0)");

    yAG.select(".domain").remove();

    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${w / 2 - 275}, ${120})`);
    colors.reverse().map(({ color }, i) => {
      legend
        .append("rect")
        .attr("x", i * 50)
        .attr("y", 0)
        .attr("height", 15)
        .attr("width", 50)
        .attr("fill", `${color}`)
        .attr("opacity", ".8");
      if (i > 0 && i < colors.length) {
        legend
          .append("line")
          .attr("x1", i * 50)
          .attr("y1", 0)
          .attr("x2", i * 50)
          .attr("y2", 20)
          .attr("stroke", "whitesmoke");
        legend
          .append("text")
          .attr("x", i * 50)
          .attr("y", 35)
          .text(`${(2.8 + (i - 1) * 1.109).toFixed(1)}`)
          .attr("fill", "whitesmoke")
          .attr("text-anchor", "middle");
      }
    }); //

    let x = graphWidth / 265;
    let rectX = 0;
    let rectY = graphHeight / 12;
    maingraph
      .selectAll("rect")
      .data(tempData)
      .enter()
      .append("rect")
      .attr("class", "rect")
      .attr("height", (d) => yScale.bandwidth())
      .attr("width", 5)
      // .attr('x', (d) => xScale(xData(d)))
      // .attr('y', (d) => yScale(yData(d)))
      .attr("x", (d, i) => (i % 12 === 0 ? (rectX += x) : rectX))
      .attr("y", (d) => rectY * (d.month - 1))
      .attr("fill", (d) => (d.Color ? d.Color : "#02199d"))
      .attr("opacity", ".8")
      .append("title")
      .html((d) => `${d.Month} ${d.year} • ${d.GTemp.toFixed(2)}℃`);
  }; //
}); //
