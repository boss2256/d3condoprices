class LineChart {
    constructor(element, data) {
        this.parentElement = element;
        this.data = data;
        this.initVis();
    }

    initVis() {
        const vis = this;

        vis.MARGIN = { LEFT: 100, RIGHT: 0, TOP: 50, BOTTOM: 50 };
        vis.WIDTH = 600 - vis.MARGIN.LEFT - vis.MARGIN.RIGHT;
        vis.HEIGHT = 400 - vis.MARGIN.TOP - vis.MARGIN.BOTTOM;

        // Tooltip setup
        vis.tooltip = d3.select("#linechart-tooltip");

        vis.svg = d3.select(vis.parentElement).append("svg")
            .attr("width", vis.WIDTH + vis.MARGIN.LEFT + vis.MARGIN.RIGHT)
            .attr("height", vis.HEIGHT + vis.MARGIN.TOP + vis.MARGIN.BOTTOM)
            .append("g")
            .attr("transform", `translate(${vis.MARGIN.LEFT}, ${vis.MARGIN.TOP})`);

        // Append title text element
        vis.svg.append("text")
            .attr("x", vis.WIDTH / 2) // Position at the center of the width
            .attr("y", 0 - (vis.MARGIN.TOP / 2)) // Position above the top margin
            .attr("text-anchor", "middle") // Center the text
            .style("font-size", "20px") // Adjust font size as needed
            .text("Line Chart - Average Rental Trends Over Time");

        vis.x = d3.scaleTime().range([0, vis.WIDTH]);
        vis.y = d3.scaleLinear().range([vis.HEIGHT, 0]);

        vis.xAxisGroup = vis.svg.append("g")
            .attr("transform", `translate(0, ${vis.HEIGHT})`);
        vis.yAxisGroup = vis.svg.append("g");

        vis.line = d3.line()
            .x(d => vis.x(new Date(d.year, d.month - 1)))
            .y(d => vis.y(d.rent));

        vis.update(vis.data);



        // X Axis Label
        vis.svg.append("text")
            .attr("class", "x axis-label")
            .attr("x", vis.WIDTH / 2)
            .attr("y", vis.HEIGHT + 40)
            .attr("text-anchor", "middle")
            .text("Year");

        // Y Axis Label
        vis.svg.append("text")
            .attr("class", "y axis-label")
            .attr("transform", "rotate(-90)")
            .attr("x", -vis.HEIGHT / 2)
            .attr("y", -40)
            .attr("text-anchor", "middle")
            .text("Rent Price");

    }

    update(data) {
        const vis = this;

        // Group data by year and month and calculate average rent
        const aggregatedData = Array.from(d3.rollup(data, 
            v => d3.mean(v, d => d.rent), 
            d => `${d.year}-${d.month}` // Group by year-month combination
        ), ([yearMonth, avgRent]) => {
            const [year, month] = yearMonth.split('-').map(Number);
            return {
                date: new Date(year, month - 1),
                avgRent
            };
            

        });

        // Update scales
        vis.x.domain(d3.extent(aggregatedData, d => d.date));
        vis.y.domain([0, d3.max(aggregatedData, d => d.avgRent)]);

        // Update axes
        vis.xAxisGroup.call(d3.axisBottom(vis.x));
        vis.yAxisGroup.call(d3.axisLeft(vis.y));

        // Update line chart
        vis.svg.selectAll(".line")
            .data([aggregatedData])
            .join("path")
            .attr("class", "line")
            .attr("d", vis.line.x(d => vis.x(d.date)).y(d => vis.y(d.avgRent)))
            .attr("fill", "none")
            .attr("stroke", "steelblue");


        // Update tooltip circles
        vis.svg.selectAll(".tooltip-circle")
            .data(aggregatedData)
            .join("circle")
            .attr("class", "tooltip-circle")
            .attr("cx", d => vis.x(d.date))
            .attr("cy", d => vis.y(d.avgRent))
            .attr("r", 3) // Radius of the circle
            .attr("fill", "blue") // Fill color of the circle
            .attr("stroke", "white") // Stroke color of the circle
            .attr("stroke-width", 1) // Stroke width
            .attr("pointer-events", "all")
            .on("mouseover", function(event, d) {
                vis.tooltip.transition().duration(200).style("opacity", .9);
                vis.tooltip.html(`Date: ${d.date.toLocaleDateString()}<br/>Rent: ${d.avgRent.toFixed(2)}`)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                vis.tooltip.transition().duration(500).style("opacity", 0);
            });

    }
}