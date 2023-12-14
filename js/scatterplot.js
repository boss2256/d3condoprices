class ScatterPlot {
    constructor(element, data) {
        this.parentElement = element;
        this.data = data;
        this.initVis();
    }

    initVis() {
        const vis = this;

        vis.MARGIN = { LEFT: 100, RIGHT: 10, TOP: 30, BOTTOM: 100 };
        vis.WIDTH = 1200 - vis.MARGIN.LEFT - vis.MARGIN.RIGHT;
        vis.HEIGHT = 700 - vis.MARGIN.TOP - vis.MARGIN.BOTTOM;

        vis.svg = d3.select(vis.parentElement).append("svg")
            .attr("width", vis.WIDTH + vis.MARGIN.LEFT + vis.MARGIN.RIGHT)
            .attr("height", vis.HEIGHT + vis.MARGIN.TOP + vis.MARGIN.BOTTOM)
            .append("g")
            .attr("transform", `translate(${vis.MARGIN.LEFT}, ${vis.MARGIN.TOP})`);

        // Append chart title
        vis.svg.append("text")
            .attr("x", vis.WIDTH / 2)
            .attr("y", 0 - (vis.MARGIN.TOP / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .text("Scatter Plot - Average Price vs. Area");

        vis.x = d3.scaleBand().range([0, vis.WIDTH]).padding(0.1);
        vis.y = d3.scaleLinear().range([vis.HEIGHT, 0]);

        vis.xAxisGroup = vis.svg.append("g")
            .attr("transform", `translate(0, ${vis.HEIGHT})`);
        vis.yAxisGroup = vis.svg.append("g");

        // Tooltip setup
        this.tooltip = d3.select("#scatterplot-tooltip");

        // Call update method
        vis.update(vis.data);
    }

    update(data) {
        const vis = this;

        // Calculate count for each area category
        const countByArea = d3.rollup(data, v => v.length, d => d.area);

        // Process data to calculate average rent for each area category
        const avgRentByArea = Array.from(d3.rollup(data, 
            v => d3.mean(v, d => d.rent), 
            d => d.area
        ), ([area, avgRent]) => ({ area, avgRent }));

        // Sort the area categories
        const sortedAreas = avgRentByArea.map(d => d.area).sort(sortArea);

        // Update scales
        vis.x.domain(sortedAreas);
        vis.y.domain([0, d3.max(avgRentByArea, d => d.avgRent)]);

        // Define a scale for the circle radius
        const radiusScale = d3.scaleSqrt()
            .domain([0, d3.max(countByArea.values())])
            .range([3, 20]); // Adjust the range to control the min and max sizes

        // Update axes
        vis.xAxisGroup.call(d3.axisBottom(vis.x))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".30em")
            .attr("transform", "rotate(-45)");

        vis.yAxisGroup.call(d3.axisLeft(vis.y));

        // Draw circles
    vis.svg.selectAll(".scatter")
    .data(avgRentByArea)
    .join("circle")
    .attr("class", "scatter")
    .attr("cx", d => vis.x(d.area) + vis.x.bandwidth() / 2)
    .attr("cy", d => vis.y(d.avgRent))
    .attr("r", d => radiusScale(countByArea.get(d.area))) // Use the radiusScale for radius
    .attr("fill", "blue")
    .on("mouseover", function(event, d) {
        vis.tooltip.transition().duration(200).style("opacity", .9);
        vis.tooltip.html(`Area: ${d.area}<br/>Average Rent: ${d.avgRent.toFixed(2)}<br/>Count: ${countByArea.get(d.area)}`)
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function(d) {
        vis.tooltip.transition().duration(500).style("opacity", 0);
    });

            // X Axis Title
        vis.svg.append("text")
        .attr("x", vis.WIDTH / 2)
        .attr("y", vis.HEIGHT + 80) // Adjust as needed
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Average Rent Price");

        // Y Axis Title
        vis.svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -vis.HEIGHT / 2)
        .attr("y", -60) // Adjust as needed
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Floor Area");
            
    }
}
