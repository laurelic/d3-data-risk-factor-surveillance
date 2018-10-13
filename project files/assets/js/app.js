var svgWidth = 800;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

//Initial Params
var chosenXaxis = "poverty";
var chosenYaxis = "healthcare";

//Build a function that updates the x-scale upon a click
function xScale(riskData, chosenXaxis) {
  //create scales
  var xLinearScale = d3.scaleLinear()
  .domain([d3.min(riskData, d => d[chosenXaxis]) * 0.8, d3.max(riskData, d => d[chosenXaxis])*1.2])
  .range([0, width]);

  return xLinearScale
}

//Build a function that updates the y-scale upon a click
function yScale(riskData, chosenYaxis) {
  //create scales
  var yLinearScale = d3.scaleLinear()
  .domain([0, d3.max(riskData, d => d[chosenYaxis])])
  .range([height, 0]);

  return yLinearScale
}

//Build a function that updates the xAxis var upon click of axis label
function renderXaxes(newXscale, xAxis) {
  var bottomAxis = d3.axisBottom(newXscale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

    return xAxis;
}

//Build a function that updates the yAxis var upon click of axis label
function renderYaxes(newYscale, yAxis) {
  var leftAxis = d3.axisLeft(newYscale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

    return yAxis;
}

//function used for updating the datapoints
function renderCirlces(circlesGroup, labelGroup, newXscale, chosenXaxis, newYscale, chosenYaxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXscale(d[chosenXaxis]))
    .attr("cy", d => newYscale(d[chosenYaxis]));
  
  labelGroup.transition()
    .duration(1000)
    .attr("x", d => newXscale(d[chosenXaxis]))
    .attr("y", d=> newYscale(d[chosenYaxis])+3);

  return circlesGroup;
  return labelGroup;
}


//function used for updating circles group with new tooltip
function updateToolTip(chosenXaxis, chosenYaxis, circlesGroup, labelGroup) {

  if (chosenXaxis === "poverty") {
    var xlabel = "Poverty Rate:";
    var xformat = d3.format(".1%");
    var xfactor = 100;
  } else if (chosenXaxis === "age") {
    var xlabel = "Median Age:";
    var xformat = d3.format(".1f");
    var xfactor = 1;
  } else {
    var xlabel = "Median Income:";
    var xformat = d3.format("$,");
    var xfactor = 1;
  }

  if (chosenYaxis === "healthcare") {
    var ylabel = "Lacks Healthcare (%):";
  } else if (chosenYaxis === "smokes") {
    var ylabel = "Smokes (%):";
  } else {
    var ylabel = "Obese (%):";
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xlabel} ${xformat(d[chosenXaxis]/xfactor)}<br>${ylabel} ${d[chosenYaxis]}%`);
    });
  
  circlesGroup.call(toolTip);
  labelGroup.call(toolTip);

  //mouseover trigger
  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })

  //mouseout trigger
  .on("mouseout", function(data, index) {
    toolTip.hide(data);
  });

  labelGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })

  //mouseout trigger
  .on("mouseout", function(data, index) {
    toolTip.hide(data);
  });

  return circlesGroup;
  return labelGroup;
}

//Retrieve data from the CSV file
d3.csv("assets/data/data.csv", function(err, riskData) {
  if (err) throw err;

  //console.log(riskData);

  //cast data to assign data types
  riskData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.healthcare = +data.healthcare;
    data.smokes = +data.smokes;
    data.obesity = +data.obesity;
  });

  //call the xLinearScale function to assign dynamic x-axis
  var xLinearScale = xScale(riskData, chosenXaxis);

  //create y scale function
  var yLinearScale = yScale(riskData, chosenYaxis);

  //initialize axes
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  //append x axes
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  //append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(riskData)
    .enter()
    .append("circle")
    .classed("stateCircle", true)
    .attr("cx", d => xLinearScale(d[chosenXaxis]))
    .attr("cy", d => yLinearScale(d[chosenYaxis]))
    .attr("r", 10);
  
    // append initial data labels
  var labelGroup = chartGroup.selectAll("text.stateText")
    .data(riskData)
    .enter()
    .append("text")
    .text(d => d.abbr)
    .classed("stateText", true)
    .attr("x", d => xLinearScale(d[chosenXaxis]))
    .attr("y", d => yLinearScale(d[chosenYaxis])+3)
    .attr("font-size", "10px");


  //create a group of x-axis labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 15)
    .attr("value", "poverty")
    .classed("active", true)
    .text("Poverty Rate (%)");
  
  var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 35)
    .attr("value", "age")
    .classed("inactive", true)
    .text("Median Age");
  
  var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 55)
    .attr("value", "income")
    .classed("inactive", true)
    .text("Median Household Income ($)");
  
  //create a group of y-axis labels
  var ylabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(-30, ${height / 2})`);
  
  var healthLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0)
    .attr("y", 0)
    .attr("value", "healthcare")
    .classed("active", true)
    .text("Lacks Healthcare (%)");
  
  var smokeLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0)
    .attr("y", -20)
    .attr("value", "smokes")
    .classed("inactive", true)
    .text("Smokes (%)")
  
  var obeseLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0)
    .attr("y", -40)
    .attr("value", "obesity")
    .classed("inactive", true)
    .text("Obese (%)")
  
  //call updateToolTip function
  var circlesGroup = updateToolTip(chosenXaxis, chosenYaxis, circlesGroup, labelGroup);

  //x-axis label event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {
      //get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXaxis) {

        //replace chosenXaxis with value
        chosenXaxis = value;

        //call function to update x-axis
        xLinearScale = xScale(riskData, chosenXaxis);

        //updates x axis with transition
        xAxis = renderXaxes(xLinearScale, xAxis);

        //updates circles with new x values
        circlesGroup = renderCirlces(circlesGroup, labelGroup, xLinearScale, chosenXaxis, yLinearScale, chosenYaxis);

        //updates tooltips accordingly
        // circlesGroup = updateToolTip(chosenXaxis, chosenYaxis, circlesGroup, labelGroup);

        //changes classes to change bold text
        if (chosenXaxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        } else if(chosenXaxis === "age") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        } else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
  
  //y axis labels event listener
  ylabelsGroup.selectAll("text")
    .on("click", function() {
      //get value of the selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYaxis) {

        //replace chosenYaxis with value
        chosenYaxis = value;
      
        //call function to update yaxis
        yLinearScale = yScale(riskData, chosenYaxis);

        //update yaxis with transition
        yAxis = renderYaxes(yLinearScale, yAxis);

        //update circles and labels with new y values
        circlesGroup = renderCirlces(circlesGroup, labelGroup, xLinearScale, chosenXaxis, yLinearScale, chosenYaxis);

        //update tooltips with new info
        circlesGroup = updateToolTip(chosenXaxis, chosenYaxis, circlesGroup, labelGroup);

        //change classes to bold text
        if (chosenYaxis === "healthcare") {
          healthLabel
            .classed("active", true)
            .classed("inactive", false);
          smokeLabel
            .classed("active", false)
            .classed("inactive", true);
          obeseLabel
            .classed("active", false)
            .classed("inactive", true);
        } else if (chosenYaxis === "smokes") {
          healthLabel
            .classed("active", false)
            .classed("inactive", true)
          smokeLabel
            .classed("active", true)
            .classed("inactive", false);
          obeseLabel
            .classed("active", false)
            .classed("inactive", true)
        } else {
          healthLabel
            .classed("active", false)
            .classed("inactive", true);
          smokeLabel
            .classed("active", false)
            .classed("inactive", true);
          obeseLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
  });
