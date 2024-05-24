const height = 775;
const width = 1550;

const svg = d3
  .select("body")
  .append("svg")
  .attr("height", `${height}`)
  .attr("width", `${width}`);

const legend = [
  { tempVariance: 2.8, color: "#313695" },
  { tempVariance: 2.8, color: "#4575b4" },
  { tempVariance: 3.9, color: "#74add1" },
  { tempVariance: 5.0, color: "#abd9e9" },
  { tempVariance: 6.1, color: "#e0f3f8" },
  { tempVariance: 7.2, color: "#ffffbf" },
  { tempVariance: 8.3, color: "#fee090" },
  { tempVariance: 9.5, color: "#fdae61" },
  { tempVariance: 10.6, color: "#f46d43" },
  { tempVariance: 11.7, color: "#d73027" },
  { tempVariance: 12.8, color: "#a50026" },
];

const render = (arr) => {
  // console.log(arr)

  const xData = (d) => d.year;

  const yData = (d) => d.month;

  const variance = (d) => d.variance + 8.66;

  const margin = {
    top: 200,
    right: 150,
    bottom: 100,
    left: 150,
  };

  const graphHeight = height - (margin.top + margin.bottom);

  const graphWidth = width - (margin.left + margin.right);

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(arr, xData))
    .range([0, graphWidth]);

  const yScale = d3
    .scaleBand()
    .domain(arr.map((d) => d.month))
    .range([0, graphHeight]);

  const mainGraph = d3
    .select("svg")
    .append("g")
    .attr("id", "main-graph")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  mainGraph // user story 1
    .append("text")
    .attr("id", "title")
    .attr("x", graphWidth / 4.5)
    .attr("y", -125)
    .text("Monthly Global Land-Surface Temperature")
    .style("font-size", "35px");

  mainGraph // user story 2
    .append("text")
    .attr("id", "description")
    .attr("x", graphWidth / 3)
    .attr("y", -60)
    .text("1753-2015: base temperature 8.66°C")
    .style("font-size", "20px");

  mainGraph
    .append("text")
    .attr("id", "y-label")
    .attr("x", -graphHeight / 2)
    .attr("y", -100)
    .text("Months")
    .style("font-size", "15px");

  const xAxis = d3
    .axisBottom(xScale) // user story 12
    .ticks(d3.timeYear.every(10));

  mainGraph // user story 3
    .append("g")
    .call(xAxis)
    .attr("id", "x-axis")
    .attr("transform", `translate(0, ${graphHeight})`)
    .attr("class", "tick");

  legend.forEach((item, i) => {
    // user story 17
    let width = 30;
    let x = margin.left + width * i;
    svg
      .append("rect")
      .attr("x", x)
      .attr("y", height - 50)
      .attr("height", 20)
      .attr("width", width)
      .attr("fill", item.color)
      .attr("stroke", "black")
      .append("title")
      .text(`Temperature in °C`);

    if (i > 0)
      svg
        .append("line")
        .attr("x1", x)
        .attr("y1", height - 50)
        .attr("x2", x)
        .attr("y2", height - 23)
        .attr("stroke", "black");

    if (i > 0)
      svg
        .append("text")
        .attr("x", x)
        .attr("y", height - 10)
        .text(item.tempVariance)
        .style("font-size", "10px");
  });

  const yAxis = d3
    .axisLeft(yScale) // user story 11
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
        default:
          return true;
      }
    });

  mainGraph // user story 4
    .append("g")
    .call(yAxis)
    .attr("id", "y-axis")
    .attr("class", "tick");

  mainGraph
    .selectAll("rect") // user story 5
    .data(arr)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("data-month", (d) => d.Month) // user story 7, 8
    .attr("data-year", (d) => d.Year)
    .attr("data-temp", (d) => d.variance)
    .attr("x", (d) => xScale(xData(d))) // user story 10
    .attr("y", (d) => yScale(yData(d)))
    .attr("width", 4.5)
    .attr("height", yScale.bandwidth()) // user story 9
    .attr(
      "fill",
      (
        d // user story 6
      ) =>
        variance(d) <= 2.9
          ? "#313695"
          : variance(d) <= 3.9
          ? "#4575b4"
          : variance(d) <= 5.0
          ? "#74add1"
          : variance(d) <= 6.1
          ? "#abd9e9"
          : variance(d) <= 7.2
          ? "#e0f3f8"
          : variance(d) <= 8.3
          ? "#ffffbf"
          : variance(d) <= 9.5
          ? "#fee090"
          : variance(d) <= 10.6
          ? "#fdae61"
          : variance(d) <= 11.7
          ? "#f46d43"
          : variance(d) <= 12.8
          ? "#d73027"
          : variance(d) > 12.8
          ? "#a50026"
          : null
    )
    .append("title")
    .text(
      (d) =>
        "Month: " +
        d.Month +
        ", Year: " +
        d.Year +
        ", Temp: " +
        variance(d).toFixed(2) +
        "°C"
    ); // user story 16
};

fetch("./Data/global-temperature.json")
  .then((response) => response.json())
  .then((item) => {
    item.monthlyVariance.map((obj) => {
      let yearFormat = "%Y";
      let monthFormat = "%B";

      obj.Month = new Date();
      obj.Month.setMonth(obj.month - 1);
      obj.Month = d3.timeFormat(monthFormat)(obj.Month);
      obj.year = d3.timeParse(yearFormat)(obj.year);
      obj.Year = new Date();
      obj.Year.setYear(obj.year);
      obj.Year = d3.timeFormat(yearFormat)(obj.year);
    });
    render(item.monthlyVariance.filter((item) => item.Year < 2015));
  });
