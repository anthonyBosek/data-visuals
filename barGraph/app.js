const h = 800;
const w = document.body.clientWidth * 0.9;

const svg = d3.select("body").append("svg").attr("height", h).attr("width", w);

const render = (arr) => {
  const xData = (d) => d.date;
  const yData = (d) => d.gdp;

  const m = { t: 100, r: 50, b: 100, l: 120 };
  const bar = 4;

  const gridHeight = h - (m.t + m.b);
  const gridWidth = w - (m.l + m.r);

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(arr, xData))
    .range([0, gridWidth]);
  // .nice()

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(arr, yData)])
    .range([gridHeight, 0])
    .nice();

  const mainGroup = svg
    .append("g")
    .attr("transform", `translate(${m.l}, ${m.t})`);

  // title
  svg
    .append("text")
    .attr("class", "title")
    .attr("x", w / 2)
    .attr("y", 50)
    .attr("text-anchor", "middle")
    .text("United States Annual Gross Domestic Product (GDP)");

  // border rt
  mainGroup
    .append("line")
    .attr("x1", gridWidth + bar)
    .attr("y1", 0)
    .attr("x2", gridWidth + bar)
    .attr("y2", gridHeight)
    .attr("stroke", "whitesmoke");

  // x-axis
  const xAxis = d3
    .axisBottom(xScale)
    .tickSize(6)
    // .tickSize(-gridHeight)
    .tickPadding(10)
    .ticks(18);
  const xAG = mainGroup
    .append("g")
    .call(xAxis)
    .attr("transform", `translate(0, ${gridHeight})`);
  xAG.select(".domain").remove();
  svg
    .append("text")
    .attr("class", "sub-title")
    .attr("x", w / 2 - 20)
    .attr("y", h - 30)
    .attr("text-anchor", "middle")
    .text("Fiscal Year");

  // y-axis
  const yAxis = d3
    .axisLeft(yScale)
    .tickSize(-gridWidth - bar)
    .tickPadding(5);
  const yAG = mainGroup.append("g").call(yAxis);
  // yAG
  //     .select('.domain')
  //     .remove()
  svg
    .append("text")
    .attr("class", "sub-title")
    .attr("transform", `rotate(-90)`)
    .attr("x", -h / 2)
    .attr("y", 40)
    .attr("text-anchor", "middle")
    .text("U.S. Dollars in Billions");

  // rectangle
  mainGroup
    .selectAll("rect")
    .data(arr)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("width", bar)
    .attr("height", (d) => gridHeight - yScale(yData(d)))
    .attr("x", (d) => xScale(xData(d)))
    .attr("y", (d) => yScale(yData(d)))
    .append("title")
    .attr("id", "tooltip")
    .text((d) => `Date:${d[0]} • GDP:${d[1]}`);

  // footnote
  svg
    .append("text")
    .attr("x", 60)
    .attr("y", h - 20)
    .text('~ Source: "U.S. Federal Reserve Economic Data" ~')
    .attr("fill", "whitesmoke")
    .attr("opacity", 0.5);
};

d3.json("./data/GDP-data.json").then((item) => {
  item.data.forEach((element) => {
    element.date = new Date(element[0]);
    element.gdp = element[1];
  });
  render(item.data);
});
