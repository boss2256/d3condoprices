class BarChart {
    constructor(element, data) {
        this.parentElement = element;
        this.data = data;
        this.initVis();

        // Tooltip setup
        this.tooltip = d3.select("#barchart-tooltip");
    }

    initVis() {
        const vis = this;
    
        // Adjust these dimensions based on the new container size
        vis.MARGIN = { LEFT: 60, RIGHT: 20, TOP: 40, BOTTOM: 300 };
        vis.WIDTH = 1200 - vis.MARGIN.LEFT - vis.MARGIN.RIGHT; // Adjusted width
        vis.HEIGHT = 600 - vis.MARGIN.TOP - vis.MARGIN.BOTTOM;
    
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
            .text("Bar Chart - Rental Distribution by District");
    
        vis.x = d3.scaleBand()
            .range([0, vis.WIDTH])
            .padding(0.2);
    
        vis.y = d3.scaleLinear()
            .range([vis.HEIGHT, 0]);
    
        vis.xAxisGroup = vis.svg.append("g")
            .attr("transform", `translate(0, ${vis.HEIGHT})`);
    
        vis.yAxisGroup = vis.svg.append("g");
    
        vis.update(vis.data);
    }
    
    update(data) {
        const vis = this;
    
        vis.data = data;
    
        // Process data
        let avgRentByDistrict = d3.rollup(vis.data, 
            v => d3.mean(v, d => d.rent), 
            d => d.district_name);
        avgRentByDistrict = Array.from(avgRentByDistrict, ([district, avgRent]) => ({ district, avgRent }));
    
        // Update scales
        vis.x.domain(avgRentByDistrict.map(d => d.district));
        vis.y.domain([0, d3.max(avgRentByDistrict, d => d.avgRent)]);
    
        // Update axes
        vis.xAxisGroup.call(d3.axisBottom(vis.x))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-90)");
            
        vis.yAxisGroup.call(d3.axisLeft(vis.y));
    
        // Data join for bars
        const rects = vis.svg.selectAll("rect")
            .data(avgRentByDistrict);
    
        // Exit
        rects.exit().remove();
    
        // Enter
        rects.enter().append("rect")
            .merge(rects) // Enter + Update
            .attr("x", d => vis.x(d.district))
            .attr("width", vis.x.bandwidth())
            .attr("y", d => vis.y(d.avgRent))
            .attr("height", d => vis.HEIGHT - vis.y(d.avgRent))
            .attr("fill", "steelblue");

        // Enter
        rects.enter().append("rect")
        .merge(rects) // Enter + Update
        .attr("x", d => vis.x(d.district))
        .attr("width", vis.x.bandwidth())
        .attr("y", d => vis.y(d.avgRent))
        .attr("height", d => vis.HEIGHT - vis.y(d.avgRent))
        .attr("fill", "steelblue")
        .on("mouseover", function(event, d) {
            vis.tooltip.transition().duration(200).style("opacity", .9);
            vis.tooltip.html(`District: ${d.district}<br/>Average Rent: ${d.avgRent.toFixed(2)}`)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            vis.tooltip.transition().duration(500).style("opacity", 0);
        });

    }
}