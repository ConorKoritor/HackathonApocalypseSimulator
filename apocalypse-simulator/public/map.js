let chart = hexmap();

// Apply the chart to the DOM
d3.select('#vis')
    .call(chart);

function hexmap() {
    //________________________________________________
    // GET/SET defaults
    //________________________________________________

    // Private variables
    var svg = undefined;
    var dispatch = d3.dispatch('customHover');

    // Getter setter defaults
    var opts = {
        width: 960,
        height: 500,
        margin: { top: 20, right: 10, bottom: 20, left: 10 }
    };

    var hexbin = d3.hexbin()
        .size([opts.width, opts.height])
        .radius(5);

    var color = d3.scaleLinear() // Update to d3.scaleLinear for D3 v5+
        .domain([1, 255])
        .range(['#fff', '#e5e5e5'])
        .interpolate(d3.interpolateHcl);

    //________________________________________________
    // RENDER
    //________________________________________________

    function exports(_selection) {
        var canvas = _selection
            .append('canvas')
            .attr('width', opts.width)
            .attr('height', opts.height)
            .attr('id', 'mapCanvas');

        var context = canvas.node().getContext('2d');
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

                var image = document.getElementById('mapCanvas');
                context.drawImage(image, 0, 0, opts.width, opts.height);
                image = context.getImageData(0, 0, opts.width, opts.height);

                // Rescale the colors
                for (var c, i = 0, n = opts.width * opts.height * 4, d = image.data; i < n; i += 4) {
                    points.push([i / 4 % opts.width, Math.floor(i / 4 / opts.width), d[i]]);
                }

                hexagons = hexbin(points);
                hexagons.forEach(function (d) {
                    d.mean = d3.mean(d, function (p) {
                        return p[2];
                    });
                });

                var svg = _selection.append('svg')
                    .attr('width', opts.width)
                    .attr('height', opts.height);

             var countries = topojson.feature(world, world.objects.countries).features

                var hexagon = svg.append('g')
                    .attr('class', 'hexagons')
                    .selectAll('path')
                    .data(hexagons)
                    .enter()
                    .append('path')
                    .attr('d', hexbin.hexagon(4.5))
                    .attr('transform', function (d) {
                        return 'translate(' + d.x + ',' + d.y + ')';
                    })
                    .style('fill', function (d) {
                        console.log(
                            d
                        )
                        if(d.mean > 0){

                            // this is colouring only land

                            return color(d.mean+100);


                        }
                        return color(0);
                    });
            })
            .catch(function (error) {
                console.error('Error loading the world data:', error);
            });
    }

    // Export the function
    return exports;
}