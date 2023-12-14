


class PieChart {
    constructor(element, data) {
        this.parentElement = element;
        this.data = data;

        this.initVis();
    }

    initVis() {
        const vis = this;
    
        vis.MARGIN = { LEFT: 0, RIGHT: 0, TOP: 70, BOTTOM: 0 };
        vis.WIDTH = 400 - vis.MARGIN.LEFT - vis.MARGIN.RIGHT;
        vis.HEIGHT = 400 - vis.MARGIN.TOP - vis.MARGIN.BOTTOM;
        vis.RADIUS = Math.min(vis.WIDTH, vis.HEIGHT) / 2;
    
        vis.svg = d3.select(vis.parentElement).append("svg")
            .attr("width", vis.WIDTH + vis.MARGIN.LEFT + vis.MARGIN.RIGHT)
            .attr("height", vis.HEIGHT + vis.MARGIN.TOP + vis.MARGIN.BOTTOM);

        // Append title text element
        vis.svg.append("text")
            .attr("x", vis.WIDTH / 2) // Position at the center of the width
            .attr("y", vis.MARGIN.TOP / 4) // Position a bit below the top margin
            .attr("text-anchor", "middle") // Center the text
            .style("font-size", "20px") // Adjust font size as needed
            .text("Pie Chart - Room Distribution");
    
        // Centralize the pie chart within the container
        vis.g = vis.svg.append("g")
            .attr("transform", `translate(${vis.WIDTH / 2 + vis.MARGIN.LEFT}, ${vis.HEIGHT / 2 + vis.MARGIN.TOP})`);


        vis.pie = d3.pie()
            .padAngle(0.03)
            .value(d => d.count)
            .sort(null);
    
        vis.arc = d3.arc()
            .innerRadius(vis.RADIUS - 80) // Increase the inner radius to make the donut thinner
            .outerRadius(vis.RADIUS - 20);
    
        vis.color = d3.scaleOrdinal(d3.schemeCategory10);
    
        vis.update(vis.data)
    }

    render() {
        const vis = this;
        vis.drawLabels();

        // Select the tooltip element
        vis.tooltip = d3.select("#piechart-tooltip");
    
        // Draw the pie slices with mouse event handlers
        vis.path = vis.g.selectAll("path")
            .data(vis.pie(vis.data))
            .enter().append("path")
            .attr("d", vis.arc)
            .attr("fill", d => vis.color(d.data.room))
            .each(function(d) { this._current = d; }) // Store the initial angles
            .on("mouseover", function(event, d) {
                vis.tooltip.transition().duration(200).style("opacity", .9);
                vis.tooltip.html(`Room: ${d.data.room}<br/>Count: ${d.data.count}<br/>Percentage: ${d.data.percentage.toFixed(2)}%`)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                vis.tooltip.transition().duration(500).style("opacity", 0);
            });
    }

    drawLabels() {
        const vis = this;
    
        
    
        vis.labels = vis.g.selectAll("text.label")
            .data(vis.pie(vis.data))
            .enter().append("text")
            .attr("transform", d => `translate(${vis.arc.centroid(d)})`)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .each(function(d) {
                if (d.endAngle - d.startAngle > 0.1) {  // Label threshold
                    const lines = [
                        `${d.data.room} rooms: ${d.data.percentage.toFixed(2)}%`,
                        `${d.data.count.toLocaleString()}`
                    ];
                    d3.select(this).selectAll("tspan")
                        .data(lines)
                        .enter()
                        .append("tspan")
                        .attr("x", 0)
                        .attr("dy", (d, i) => i ? "1.2em" : 0)
                        .text(d => d);
                }
            });
    }
    

    update(newData) {
        const vis = this;
    
        // Update data
        vis.data = newData;
        const pieData = vis.pie(vis.data);
    
        // Update pie slices
        vis.path = vis.g.selectAll("path").data(pieData);
    
        // Remove old slices
        vis.path.exit().remove();
    
        // Add new slices
        vis.path.enter().append("path")
            .attr("fill", d => vis.color(d.data.room))
            .merge(vis.path) // Merge new slices with existing slices
            .transition().duration(750)
            .attrTween("d", d => {
                const interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return t => vis.arc(interpolate(t));
            });
    
        // Update labels
        let labels = vis.g.selectAll("text.label").data(pieData);
    
        // Remove old labels
        labels.exit().remove();
    
        // Add new labels
        labels = labels.enter().append("text")
            .attr("class", "label")
            .merge(labels) // Merge new labels with existing labels
            .attr("transform", d => `translate(${vis.arc.centroid(d)})`)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .each(function(d) {
                // Clear existing tspan elements
                d3.select(this).selectAll("tspan").remove();
                if (d.endAngle - d.startAngle > 0.1) {
                    const lines = [
                        `${d.data.room} rooms: ${d.data.percentage.toFixed(2)}%`,
                        `${d.data.count.toLocaleString()}`
                    ];
                    d3.select(this).selectAll("tspan")
                        .data(lines)
                        .enter()
                        .append("tspan")
                        .attr("x", 0)
                        .attr("dy", (d, i) => i ? "1.2em" : 0)
                        .text(d => d);
                        
                }
            });
    }
    
}