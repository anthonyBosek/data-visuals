const url = "./data/global-temp.json";

const h = 850;
const w = document.body.clientWidth * 0.95;
const p = { t: 180, r: 10, b: 100, l: 160 };

let tempData;
let baseTemp;

document.addEventListener("DOMContentLoaded", () => {
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      console.log(data.monthlyVariance);
      data.monthlyVariance.forEach((element) => {
        element.Year = new Date(element.year, element.month - 1, 1);
      });
      tempData = data.monthlyVariance;
      baseTemp = data.baseTemperature;
      render();
    });

  const render = () => {
    const svg = d3
      .select("body")
      .append("svg")
      .attr("height", h)
      .attr("width", w)
      .style("border", "1px solid black");

    const graphHeight = h - (p.t + p.b);
    const graphWidth = w - (p.l + p.r);

    const xData = (d) => d.Year;
    const yData = (d) => d.month;

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(tempData, xData))
      .range([0, graphWidth]);
    // .nice()

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

    const yAxis = d3
      .axisLeft(yScale)
      .tickFormat((d) => {
        switch (d) {
          case 1:
            return "January";
          case 2:
            return "February";
          case 3:
            return "March";
          case 4:
            return "April";
          case 5:
            return "May";
          case 6:
            return "June";
          case 7:
            return "July";
          case 8:
            return "August";
          case 9:
            return "September";
          case 10:
            return "October";
          case 11:
            return "November";
          case 12:
            return "December";
        }
      })
      .tickSize(10)
      .tickPadding(10);

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

    const xAG = maingraph
      .append("g")
      .call(xAxis)
      .attr("transform", `translate(0, ${graphHeight})`);

    xAG.select(".domain").remove();

    const yAG = maingraph.append("g").call(yAxis);

    yAG.select(".domain").remove();

    let test = graphWidth / 265;
    let m = 0; // ********
    let rectH = graphHeight / 12;
    const b = -4.715;
    // const b = p.l
    maingraph
      .selectAll("rect")
      .data(tempData)
      .enter()
      .append("rect")
      .attr("height", (d) => yScale.bandwidth())
      .attr("width", 5.715) //
      .attr("x", (d, i) => {
        if (i % 12 === 0) {
          m += test;
        }
        return b + m;
      })
      // .attr('y', (d) => '')
      .attr("y", (d, i) => {
        return d.month === 1
          ? rectH * (d.month - 1)
          : d.month === 2
          ? rectH * (d.month - 1)
          : d.month === 3
          ? rectH * (d.month - 1)
          : d.month === 4
          ? rectH * (d.month - 1)
          : d.month === 5
          ? rectH * (d.month - 1)
          : d.month === 6
          ? rectH * (d.month - 1)
          : d.month === 7
          ? rectH * (d.month - 1)
          : d.month === 8
          ? rectH * (d.month - 1)
          : d.month === 9
          ? rectH * (d.month - 1)
          : d.month === 10
          ? rectH * (d.month - 1)
          : d.month === 11
          ? rectH * (d.month - 1)
          : d.month === 12
          ? rectH * (d.month - 1)
          : null;
      })
      // .attr('fill', (d) => '')
      .attr("fill", (d) => {
        return baseTemp + d.variance >= 12.8
          ? "#940000"
          : baseTemp + d.variance >= 11.7
          ? "#c00505"
          : baseTemp + d.variance >= 10.6
          ? "#e02d2d"
          : baseTemp + d.variance >= 9.5
          ? "#f18832"
          : baseTemp + d.variance >= 8.3
          ? "#f5b339"
          : baseTemp + d.variance >= 7.2
          ? "#f5e939"
          : baseTemp + d.variance >= 6.1
          ? "#c8ecf5"
          : baseTemp + d.variance >= 5
          ? "#49d1f3"
          : baseTemp + d.variance >= 3.9
          ? "#2198dd"
          : baseTemp + d.variance >= 2.8
          ? "#2252ca"
          : baseTemp + d.variance < 2.8
          ? "#02199d"
          : null;
      })
      .attr("opacity", ".8");
  }; //
}); //
