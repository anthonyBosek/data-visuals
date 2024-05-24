const h = 800;
const w = document.body.clientWidth * 0.9;

const svg = d3.select("body").append("svg").attr("height", h).attr("width", w);

const render = (arr) => {
  const xData = (d) => d.Year;
  const yData = (d) => d.Time;

  const title = "Doping in the Tour de France";
  const subTitle = "• 35 Fastest Assents up Alpe d'Huez •";
  const xAxisLabel = "Tour Year";
  const yAxisLabel = "Stage Time in Minutes";
  const sourceData =
    '~ Source: "http://www.cyclingnews.com/news/doping-allegations/" ~';
  const doping = " - Cyclists with Doping Allegations";
  const noDoping = " - Cyclists with no Doping Allegations";
  const dope = "lightskyblue";
  const noDope = "lightgreen";

  const timesArray = arr.map((d) => d3.timeParse("%M:%S")(d.Time));

  const plotRadius = 8;
  const m = { t: 140, r: 50, b: 100, l: 120 };

  const gridWidth = w - (m.l + m.r);
  const gridHeight = h - (m.t + m.b);

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(arr, xData))
    .range([110, gridWidth])
    .nice();

  const yScale = d3
    .scaleTime()
    .domain(d3.extent(timesArray))
    .range([0, gridHeight])
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
    .text(title);
  svg
    .append("text")
    .attr("class", "sub-title")
    .attr("x", w / 2)
    .attr("y", 90)
    .attr("text-anchor", "middle")
    .text(subTitle);

  // x-axis
  const xAxis = d3.axisBottom(xScale).tickSize(-gridHeight).tickPadding(15);
  mainGroup
    .append("g")
    .call(xAxis)
    .attr("transform", `translate(0, ${gridHeight})`);
  svg
    .append("text")
    .attr("class", "sub-title")
    .attr("x", w / 2)
    .attr("y", h - 30)
    .attr("text-anchor", "middle")
    .text(xAxisLabel);

  // y-axis
  const yAxis = d3
    .axisLeft(yScale)
    .tickSize(-gridWidth)
    .tickPadding(5)
    .tickFormat((d) => d3.timeFormat("%M:%S")(d));
  mainGroup.append("g").call(yAxis);
  svg
    .append("text")
    .attr("class", "sub-title")
    .attr("transform", `rotate(-90)`)
    .attr("x", -h / 2)
    .attr("y", 40)
    .attr("text-anchor", "middle")
    .text(yAxisLabel);

  // circle
  mainGroup
    .selectAll("circle")
    .data(arr)
    .enter()
    .append("circle")
    .attr("fill", (d) => (d.Doping === "" ? noDope : dope))
    .attr("stroke", (d) => (d.Doping === "" ? "green" : "blue"))
    .attr("cx", (d) => xScale(xData(d)))
    .attr("cy", (d) => yScale(d3.timeParse("%M:%S")(d.Time)))
    .attr("r", plotRadius)
    .append("title")
    .text(
      (d) => `Cyclist: ${d.Name}, Time: ${yData(d)}, Final Place: ${d.Place}`
    );

  // footnote
  svg
    .append("text")
    .attr("x", 60)
    .attr("y", h - 20)
    .text(sourceData)
    .attr("fill", "whitesmoke")
    .attr("opacity", 0.5);

  // legend
  const legend = svg
    .append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${m.l}, ${120})`);

  // doping
  legend.append("text").attr("x", 145).attr("y", 0).text(doping);
  legend
    .append("rect")
    .attr("fill", dope)
    .attr("stroke", "blue")
    .attr("height", 20)
    .attr("width", 20)
    .attr("x", 120)
    .attr("y", -15);

  // no-doping
  legend
    .append("text")
    .attr("x", w / 2 + 125)
    .attr("y", 0)
    .text(noDoping);
  legend
    .append("rect")
    .attr("fill", noDope)
    .attr("stroke", "green")
    .attr("height", 20)
    .attr("width", 20)
    .attr("x", w / 2 + 100)
    .attr("y", -15);
}; //

d3.json("./data/cyclist-data.json").then((item) => {
  item.map((element) => {
    element.Year = d3.timeParse("%Y")(element.Year);
  }); //
  render(item);
}); //
