class Timeline {
    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data; // Pass the data to the timeline

        this.initVis();
    }

    initVis() {
        const vis = this;

        vis.MARGIN = { LEFT: 80, RIGHT: 100, TOP: 0, BOTTOM: 30 };
        vis.WIDTH = 1200 - vis.MARGIN.LEFT - vis.MARGIN.RIGHT;
        vis.HEIGHT = 150 - vis.MARGIN.TOP - vis.MARGIN.BOTTOM;

        vis.svg = d3.select(vis.parentElement).append("svg")
        .attr("width", vis.WIDTH + vis.MARGIN.LEFT + vis.MARGIN.RIGHT)
        .attr("height", vis.HEIGHT + vis.MARGIN.TOP + vis.MARGIN.BOTTOM);

        vis.g = vis.svg.append("g")
        .attr("transform", `translate(${vis.MARGIN.LEFT}, ${vis.MARGIN.TOP})`);

        // Scales
        vis.x = d3.scaleTime().range([0, vis.WIDTH]);
        vis.y = d3.scaleLinear().range([vis.HEIGHT, 0]);

        // X-axis
        vis.xAxisCall = d3.axisBottom();
        vis.xAxis = vis.g.append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(0, ${vis.HEIGHT})`);

        // Initialize brush component
        vis.brush = d3.brushX()
            .handleSize(10)
            .extent([[0, 0], [vis.WIDTH, vis.HEIGHT]])
            .on("brush", function(event) {
                const [x0, x1] = event.selection.map(d => vis.x.invert(d));
                updateCharts(x0, x1);
            });

        // Append brush component
        vis.brushComponent = vis.g.append("g")
            .attr("class", "brush")
            .call(vis.brush);
    }

    update(data) {
        const vis = this;

        // Group data by year and calculate average rent
        const aggregatedData = Array.from(d3.rollup(data, 
            v => d3.mean(v, d => d.rent), 
            d => d.year
        ), ([year, avgRent]) => ({
            date: new Date(year, 0), // Assuming year is just the year number
            avgRent
        }));

        // Update scales
        vis.x.domain(d3.extent(aggregatedData, d => d.date));
        vis.y.domain([0, d3.max(aggregatedData, d => d.avgRent)]);

        // Update axes
        vis.xAxisCall.scale(vis.x);
        vis.xAxis.transition().duration(1000).call(vis.xAxisCall);

        // Define the area generator for average rent
        vis.area = d3.area()
            .x(d => vis.x(d.date))
            .y0(vis.HEIGHT)
            .y1(d => vis.y(d.avgRent));

        // Draw the area
        vis.g.selectAll(".area")
            .data([aggregatedData])
            .join("path")
            .attr("class", "area")
            .transition().duration(1000)
            .attr("d", vis.area)
            .attr("fill", "#ccc") // Set the fill color to gray
            .attr("opacity", 0.5); // Set the opacity to make it slightly transparent
    }
    

    brushed(event) {
        const vis = this;
        if (event.selection) {
            const [x0, x1] = event.selection.map(d => vis.x.invert(d));
            console.log("Brushed:", x0, x1); // Check the brushed date range
            updateCharts(x0, x1);
        }
    }
    
}
