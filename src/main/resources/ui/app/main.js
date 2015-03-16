function toggleUpdating() {
    var lockButton = document.getElementById("lockButton");
    if (document.checkingForUpdate == true) {
        lockButton.className = "locked";
        lockButton.title = "Unlock Vizboard"
        document.checkingForUpdate = false;
        clearInterval(document.updater);
        document.updater = null;
    } else {
        lockButton.className = "unlocked"
        lockButton.title = "Lock Vizboard"
        document.updater = setInterval("checkForUpdate()",100);
        document.checkingForUpdate = true;
    }
}

$(document).ready(toggleUpdating);

function checkForUpdate() {
    $.ajax({
        url: "/chart/update",
        success: function(response) {
            if (response != "{}") {
                document.getElementById("content").innerHTML = "";
                var servable = JSON.parse(response);
                if (servable.type == "chart") {
                    generateSingleChart(servable.content)
                } else if (servable.type == "table") {
                    generateTable(servable.content)
                } else if (servable.type == "histogram") {
                    var bins = [{start:1.0, end:7, y:8}, {start: 7, end:13, y:2}, {start:13, end:50, y:1}];
                    generateHistogram(bins);
                } else {
                    console.log("Unrecognized response: " + response);
                }
            }
        }
    });
}

function generateSingleChart(chart) {

    function generateChartDiv(root, id) {
        var div = document.createElement('div');
        div.setAttribute("id", id);
        root.appendChild(div);
    }

    generateChartDiv(document.getElementById("content"), "chart")
    var chart = c3.generate(chart);

}

function generateTable(stats) {

    function generateTableSkeleton(root, id) {
        var table = document.createElement('table');
        table.setAttribute("id", id);
        var tableHead = document.createElement('thead');
        var tableBody = document.createElement('tbody');
        table.appendChild(tableHead);
        table.appendChild(tableBody);
        root.appendChild(table);
    }

    function generatePCVis(root, id) {
        var div = document.createElement('div');
        div.setAttribute("id", id);
        div.setAttribute("class", 'parcoords');
        div.setAttribute("style", 'height:350px');
        root.appendChild(div);
    }

    generatePCVis(document.getElementById("content"), "pcvis")

    var parcoords = d3.parcoords()("#pcvis")
        .data(stats)
        .alpha(0.5)
        .composite("darker")
        .reorderable()
        .interactive()
        .render()
        .brushMode("1D-axes");

    generateTableSkeleton(document.getElementById("content"), "table")

    var tableHead = d3.select("thead").selectAll("th")
        .data(d3.keys(stats[0]))
        .enter().append("th").text(function(key){ return key });
    var tr = d3.select("tbody").selectAll("tr")
        .data(stats).enter().append("tr");

    var td = tr.selectAll("td")
      .data(function(rows){ return d3.values(rows) })
      .enter().append("td")
      .text(function(value){ return value });
}

function generateHistogram(bins) {
    var margin = {top: 30, right: 60, bottom: 60, left: 60},
        width = window.innerWidth - margin.left - margin.right,
        height = window.innerHeight - margin.top - margin.bottom;

    var svg = d3.select("content").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scale.linear()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    bins = bins.map(function(bin) {
        bin.width = bin.end - bin.start;
        bin.height = bin.y / bin.width;
        return bin;
    });

    x.domain([0, d3.max(bins.map(function(bin) { return bin.start + bin.width; }))]);
    y.domain([0, d3.max(bins.map(function(bin) { return bin.height; }))]);

    svg.selectAll(".bin")
        .data(bins)
        .enter().append("rect")
        .attr("class", "bin")
        .attr("x", function(bin) { return x(bin.start); })
        .attr("width", function(bin) { return x(bin.width) - 1; })
        .attr("y", function(bin) { return y(bin.height); })
        .attr("height", function(bin) { return height - y(bin.height); });

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.svg.axis()
        .scale(x)
        .orient("bottom"));

    svg.append("g")
        .attr("class", "y axis")
        .call(d3.svg.axis()
        .scale(y)
        .orient("left"));
}
