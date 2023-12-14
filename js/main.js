/*
*    main.js
*    Assignment 
*/

// main.js

// Define the sortArea function
function sortArea(a, b) {
    // Handle special cases
    if (a === "<= 200") return -1;
    if (b === "<= 200") return 1;
    if (a === ">3000") return 1;
    if (b === ">3000") return -1;

    // Extract the lower bound of the range for sorting
    const rangeA = parseInt(a.split(" to ")[0]);
    const rangeB = parseInt(b.split(" to ")[0]);
    return rangeA - rangeB;
}


let pieChart;
let barChart; // Add this line to declare the barChart
let lineChart;
let scatterPlot;
let timeline;
let allData; // Store all loaded data

// Time parsers/formatters for your dataset
const parseTime = d3.timeParse("%Y-%m-%d");
const formatTime = d3.timeFormat("%d/%m/%Y");

// Prepare pie chart data by counting room instances
function preparePieData(data) {
    const countByRoom = {};
    let totalCount = 0;

    data.forEach(d => {
        countByRoom[d.room] = (countByRoom[d.room] || 0) + 1;
        totalCount++;
    });

    return Object.entries(countByRoom).map(([room, count]) => ({
        room: room,
        count: count,
        percentage: (count / totalCount) * 100 // Calculate the percentage
    }));
}

// Update the pie chart based on the selected date range
function updateCharts(startDate, endDate) {
    const filteredData = allData.filter(d => {
        const date = new Date(d.year, d.month - 1, 1);
        return date >= startDate && date <= endDate;
    });

    const pieData = preparePieData(filteredData);
    pieChart.update(pieData);
}

$(document).ready(function() {
    $("#date-slider").slider({
        range: true,
        max: new Date(2022, 12, 31).getTime(),
        min: new Date(2019, 0, 1).getTime(),
        step: 86400000, // one day
        values: [new Date(2019, 0, 1).getTime(), new Date(2022, 12, 31).getTime()],
        slide: (event, ui) => {
            const startDate = new Date(ui.values[0]);
            const endDate = new Date(ui.values[1]);
            $("#dateLabel1").text(formatTime(startDate));
            $("#dateLabel2").text(formatTime(endDate));
            updateCharts(startDate, endDate);
        }
    });


    $("#room-select").on("change", function() {
        const startDate = new Date($("#date-slider").slider("values", 0));
        const endDate = new Date($("#date-slider").slider("values", 1));
        updateCharts(startDate, endDate);
    });

    // Load and process data
    d3.csv("data/sg_condo_rental2019-2022.csv").then(data => {
        allData = data.map(d => ({
            ...d,
            year: +d.year,
            month: +d.month,
            room: +d.room, // Ensure 'room' is treated as a number
            rent: +d.rent // Ensure 'rent' is treated as a number
        }));

        const initialPieData = preparePieData(allData);
        pieChart = new PieChart("#piechart-area", initialPieData);
        pieChart.render();

        barChart = new BarChart("#bar-chart", allData);

        lineChart = new LineChart("#linechart-area", allData); // Initialize line chart
        
        scatterPlot = new ScatterPlot("#scatter-plot", allData); // Initialize scatter plot

        timeline = new Timeline("#timeline-area");
        timeline.update(allData); // Update the timeline with all data
    });


    function updateCharts(startDate, endDate) {
        const selectedRoom = $("#room-select").val();
        const filteredData = allData.filter(d => {
            const date = new Date(d.year, d.month - 1, 1);
            const isDateInRange = date >= startDate && date <= endDate;
            const isRoomMatch = selectedRoom === "all" || d.room.toString() === selectedRoom;
            return isDateInRange && isRoomMatch;
        });
    

    


    const pieData = preparePieData(filteredData);
    pieChart.update(pieData);

    // Update bar chart with filtered data
    barChart.update(filteredData);

    lineChart.update(filteredData); // Update line chart

    // Update scatter plot
    scatterPlot.update(filteredData);

    timeline.update(filteredData); // Update the timeline
}

});

