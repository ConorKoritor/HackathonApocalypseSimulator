let tick = 0;
let infectedHexagons = new Set(); // Track infected hexagons
var epicenters = [];
epicenters.push([100, 100, 1]);


// Apply the chart to the DOM
setInterval(() => {
    tick += 1;
    d3.select('#vis').call(hexmap(tick));
}, 100); // Update every 100 milliseconds

function hexmap(tick) {

    epicenters = determineEpicenters(epicenters);

    for(var i = 0; i < epicenters.length; i++){
        epicenters[i][2]++
    }
    //________________________________________________
    // GET/SET defaults
    //________________________________________________

    // Private variables
    var dispatch = d3.dispatch('customHover');

    // Getter setter defaults
    var opts = {
        width: 960,
        height: 500,
        margin: { top: 20, right: 10, bottom: 20, left: 10 }
    };

    var hexbin = d3.hexbin()
        .size([opts.width, opts.height])
        .radius(1.66666666666);

    var color = d3.scaleLinear()
        .domain([1, 255])
        .range(['#fff', '#e5e5e5'])
        .interpolate(d3.interpolateHcl);

    //________________________________________________
    // RENDER
    //________________________________________________

    function exports(_selection) {
        // Append canvas for drawing the map
        var canvas = _selection.selectAll('canvas').data([0]);

        // Enter selection: create canvas if not exists
        var canvasEnter = canvas.enter()
            .append('canvas')
            .attr('width', opts.width)
            .attr('height', opts.height)
            .attr('id', 'mapCanvas');

        canvas = canvasEnter.merge(canvas); // Merge enter and update selections

        var context = canvas.node().getContext('2d'); // Get context of the canvas

        // Clear previous frame
        context.clearRect(0, 0, opts.width, opts.height);

        var points = [];
        var hexagons = [];

        var projection = d3.geoMercator()
            .rotate([0, 0])
            .scale(140)
            .center([12, 25]);

        context.fillStyle = 'tomato';
        context.strokeStyle = 'none';

        var path = d3.geoPath()
            .projection(projection)
            .context(context);

        // Fetch the world data
        d3.json('https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/world-50m.json')
            .then(function (world) {
                path(topojson.feature(world, world.objects.land));
                context.fill();

                var image = context.getImageData(0, 0, opts.width, opts.height);

                // Rescale the colors
                for (var i = 0, n = opts.width * opts.height * 4; i < n; i += 4) {
                    points.push([i / 4 % opts.width, Math.floor(i / 4 / opts.width), image.data[i]]);
                }

                hexagons = hexbin(points);
                hexagons.forEach(function (d) {
                    d.mean = d3.mean(d, function (p) {
                        return p[2];
                    });
                });

                // Handle SVG overlay for hexagons
                var svg = _selection.selectAll('svg').data([0]);

                // Enter selection: create SVG if not exists
                var svgEnter = svg.enter()
                    .append('svg')
                    .attr('width', opts.width)
                    .attr('height', opts.height)
                    .attr('id', 'hexSvg');

                svg = svgEnter.merge(svg); // Merge enter and update selections

                // Join hexagon data
                var hexagonGroup = svg.selectAll('.hexagons').data(hexagons);

                // Enter selection for new hexagons
                hexagonGroup.enter()
                    .append('path')
                    .attr('class', 'hexagons')
                    .attr('d', hexbin.hexagon(1.5))
                    .style('fill', function (d) {
                        return getColor(d, tick);
                    })
                    .merge(hexagonGroup) // Merge enter with existing hexagons
                    .attr('transform', function (d) {
                        return 'translate(' + d.x + ',' + d.y + ')';
                    })
                    .style('fill', function (d) {
                        return getColor(d, tick);
                    });

                // Exit selection for hexagons that are no longer needed
                hexagonGroup.exit().remove(); // Remove old hexagons
            })
            .catch(function (error) {
                console.error('Error loading the world data:', error);
            });
    }

    function getColor(d, tick) {

            // Only color land
            if (d.mean > 0) {

                for (var i = 0; i < epicenters.length; i++) {
                    // Define infected area
                    var epicenter_x = epicenters[i][0] + (Math.random() - 0.5) * 20; // Randomize epicenter x
                    var epicenter_y = epicenters[i][1] + (Math.random() - 0.5) * 20; // Randomize epicenter y
                    var time_passed = 1 * epicenters[i][2];
                    var spread_rate = 2 * time_passed;

                    // Calculate distance from the hexagon to the randomized epicenter
                    var distance = Math.sqrt((d.x - epicenter_x) ** 2 + (d.y - epicenter_y) ** 2);
                    var randomVariation = Math.random() * 30; // Random spread variation

                    if (distance <= spread_rate + randomVariation) {
                        infectedHexagons.add(d); // Add to infected set
                        return '#FF0000'; // Inside the infected area (irregular circle)}
                    }
                }

                return color(d.mean + 100);
            }
        return color(0);

    }

    // Export the function
    return exports;
}

function determineEpicenters(epicenters){

    if(Math.random() * 100 <= 50){
        var epicenter_x = Math.random() * 960; // Randomize epicenter x
        var epicenter_y = Math.random() * 500; // Randomize epicenter y

        epicenters.push([epicenter_x, epicenter_y, 1]);
    }

    return epicenters;
}