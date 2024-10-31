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

    const path = d3.geoPath().projection(projection);

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

      svg.append("g")
        .selectAll("path")
        .data(hexbinData)
        .enter().append("path")
        .attr("d", hexbinGenerator.hexagon())
        .attr("transform", d => `translate(${d.x},${d.y})`)
        .attr("fill", d => isLand([d.x, d.y]) ? "green" : "blue")
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