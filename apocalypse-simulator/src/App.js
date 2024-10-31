import React, { useEffect } from 'react';
import * as d3 from 'd3';
import { hexbin } from 'd3-hexbin';
import * as topojson from 'topojson';
import './App.css';

function App() {
  useEffect(() => {
    const width = 960;
    const height = 600;

    const svg = d3.select("#vis")
      .html("") // Clear the SVG content
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const projection = d3.geoMercator()
      .scale(150)
      .translate([width / 2, height / 1.5]);

    d3.json("https://unpkg.com/world-atlas@1/world/110m.json").then(world => {
      const countries = topojson.feature(world, world.objects.countries).features;

      const hexbinGenerator = hexbin()
        .radius(10)
        .extent([[0, 0], [width, height]]);

      const hexbinData = hexbinGenerator(d3.range(width * height).map(i => {
        const x = (i % width);
        const y = Math.floor(i / width);
        return [x, y];
      }));

      const isLand = (point) => {
        return countries.some(country => {
          return d3.geoContains(country, projection.invert(point));
        });
      };

      // Filter hexagons that are on land
      const landHexagons = hexbinData.filter(d => isLand([d.x, d.y]));

      // Select 5 random hexagons from the land hexagons
      const randomHexagons = d3.shuffle(landHexagons).slice(0, 5);

      // Add more red hexagons
      const addRedHexagons = (count) => {
        while (count > 0) {
          const newRedHex = d3.shuffle(landHexagons).find(d => !randomHexagons.includes(d));
          if (newRedHex) {
            randomHexagons.push(newRedHex);
            count--;
          }
        }
      };

      // Add initial 5 red hexagons
      addRedHexagons(5);

      let redHexagonCount = 5;

      // Add red hexagons every 100 milliseconds, doubling the count each time
      setInterval(() => {
        redHexagonCount *= 2;
        addRedHexagons(redHexagonCount);
        svg.selectAll("path")
          .data(hexbinData)
          .attr("fill", d => randomHexagons.includes(d) ? "red" : (isLand([d.x, d.y]) ? "green" : "blue"));
      }, 100);

      svg.append("g")
        .selectAll("path")
        .data(hexbinData)
        .enter().append("path")
        .attr("d", hexbinGenerator.hexagon())
        .attr("transform", d => `translate(${d.x},${d.y})`)
        .attr("fill", d => randomHexagons.includes(d) ? "red" : (isLand([d.x, d.y]) ? "green" : "blue"))
        .attr("stroke", "black");
    });
  }, []);

  return (
    <div className="App">
      <div id="vis"></div>
    </div>
  );
}

export default App;