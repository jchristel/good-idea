var widthOverall = 900;
var heightOverall = 900;

var widthGraphics = widthOverall / 3 *2,
    heightGraphics = 700,
    radius = (Math.min(widthGraphics, heightGraphics) / 2) - 10;

var widthSequence = widthOverall,
    heightSequence = heightOverall/4,
    paddingSequence = 100;
  
var widthDataContainer = widthOverall - widthGraphics,
    heightDataContainer = heightGraphics;

var widthBarsLeft = 100,
    heightBarsLeft = heightGraphics;

//var xSlider = d3.scaleLinear()
//    .domain([0, 180])
//    .range([0, heightGraphics])
//    .clamp(true);

var x = d3.scaleLinear()
    .range([0, 2 * Math.PI]);

var y = d3.scaleSqrt()
    .range([0, radius]);

//date from json converter
var parseDate = d3.timeParse("%d/%m/%Y %I:%M:%S %p");
//date parser for date slider
var formatDateSlider = d3.timeFormat("%B");
//date output format
var formatDate = d3.timeFormat("%Y-%m-%d");

//date range for x-axis in bread crumb data
var dateRangeOldest = new Date(),
    dateRangeNewest = new Date(1000); //get a very early start date...

//x axis scale for bread crumb data 
var xScaleSequence = d3.scaleTime();

//y axis scale for data slider 
var yScaleDateSlider = d3.scaleTime();

//scale for bread crumb data circle size
var rScaleSequence = d3.scaleSqrt()
    .domain([1, 40])
    .range([5, 20]);  

//variable returning a colour value
var color = d3.scaleOrdinal(d3.schemeCategory20);

var partition = d3.partition();

var arc = d3.arc()
    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x0))); })
    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x1))); })
    .innerRadius(function(d) { return Math.max(0, y(d.y0)); })
    .outerRadius(function(d) { return Math.max(0, y(d.y1)); });

//set up date slider for main graphics
var widthDateSlider = 100,
    heightDateSlider = heightGraphics,
    radiusDateSlider = 6,
    marginDateSlider = 50;

var xSlider = marginDateSlider+(marginDateSlider/2);
var ySliderMin = marginDateSlider;  //min range
var ySliderMax = heightDateSlider-marginDateSlider; //max range
var y1Slider = ySliderMin; //current y coordinate of the min slider
var y2Slider = ySliderMax; //current y coordinate of the max slider

var svgDateSlider = d3.select("body").select("div.chart").append("svg")
     .attr("width", widthDateSlider)
     .attr("height", heightDateSlider);

var sliderGroup = svgDateSlider.append("g")
    .attr("class", "slider");

//---------------------- sun burst
//global variable containing svg for sunburst diagram
var svg = d3.select("body").select("div.chart").append("svg")
    .attr("width", widthGraphics)
    .attr("height", heightGraphics)
    .attr("id", "sunburstGraphicMain")
  .append("g")
    .attr("transform", "translate(" + widthGraphics / 2 + "," + (heightGraphics / 2) + ")");
 
//---------------------- data
//global variable containing svg for additional data
var svg_dataText = d3.select("body").select("div.col2");//.append("svg")
var svg_dataDetailed = d3.select("body").select("div.col3");

//------------------------------------------------------------------ entry 

//method creating the sunburst diagram
d3.json("data.php", function (error, data) {
    if (error) console.log(error);
    data.forEach(function (d) {
        console.log(d);
    });
});

//---------------------------------------------------------event handler

//zooms sunburst
function onDblclick(d) {
  svg.transition()
      .duration(750)
      .tween("scale", function() {
        var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
            yd = d3.interpolate(y.domain(), [d.y0, 1]),
            yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
        return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
      })
    .selectAll("path")
      .attrTween("d", function(d) { return function() { return arc(d); }; });
}

//function updating the additional data container
//on click events
function onClick(d) {
    //get all ancestors of this node including root node
    var sequenceArray = d.ancestors().reverse();
    var sequenceArrayofData = getAncestors(d).reverse();
    //check if root was clicked on
    //if so brighten all elements
    //otherwise go ahead and fade everything and then brighten path to node selected
    if (sequenceArray.length > 1) {
        //fade all elements in sun burst not selected 
        svg.selectAll("path")
            .each(function (d) {
                d3.select(this).raise().classed("sunStandard", false);
                d3.select(this).raise().classed("sunFaded", true);
            });
        // Then highlight only those that are an ancestor of the current segment.
        svg.selectAll("path") //selects all path elements in svg object
            .filter(function (node) {   //iterate over each path element (node)
                return (sequenceArray.indexOf(node) >= 0); //and check whether it exists in the sequence array
            })
            .each(function (d) {
                d3.select(this).raise().classed("sunStandard", true);
                d3.select(this).raise().classed("sunFaded", false);
            });
    } else {
        //remove opacity from all elements
        d3.selectAll("path")
            .each(function (d){
                d3.select(this).raise().classed("sunStandard", true);
                d3.select(this).raise().classed("sunFaded", false);
            });
    }

    //select all current text elements and delete them
    var trail = svg_dataText.selectAll("div")
        .remove();

    //create nee text elements in dom
    var selectionData = svg_dataText.selectAll("div")
        .data(sequenceArrayofData)
        .enter()
        .append("div")
            .attr("text-anchor", "start")
            .html(function (d) {
                //reformat date
                var dummy = parseDate(d.data.Date);
                var otherLinks = d.data.OtherLinks.length === 0 ? "Other links: none" : "Other links: " + d.data.OtherLinks;
                //build up new array with data
                var myData = formatDate(dummy) + " : " +
                    d.data.name + "<br>" +
                    d.data.description + "<br>" +
                    otherLinks + "<br>" + "<br>";
                return myData;
            })
        .on("click", onClickSummary);
}

//function displaying additional test data in third column
//also changing class of div in second column to high light selection
function onClickSummary(d)
{
    var id = d.data.Id;

    var myTestData = [id + "<br>"+"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas consequat lacus a risus efficitur condimentum. Morbi sed neque in erat molestie sodales. Sed euismod accumsan velit. Sed vel viverra elit. Integer sit amet orci venenatis lectus mollis commodo. Mauris porta est quam, gravida ullamcorper odio rhoncus eget. Nam elementum aliquet arcu, ac egestas tellus iaculis ut. Morbi gravida mattis iaculis. Phasellus auctor consectetur nunc. Curabitur quis aliquam sem, a aliquam ante. "];

    var selectionData = svg_dataText.selectAll("div")
        .each(function (d) {
            if (d.data.Id ===id) {
                d3.select(this).raise().classed("summaryHover", true);
                d3.select(this).raise().classed("summaryStandard", false);
                //show additional data next column over
                //select all current text elements and delete them
                svg_dataDetailed.selectAll("div")
                    .remove();
                //create nee text elements in dom
                svg_dataDetailed.selectAll("div")
                    .data(myTestData)
                    .enter()
                    .append("div")
                        .attr("text-anchor", "start")
                        .html(myTestData);
            }
            else {
                d3.select(this).raise().classed("summaryHover", false);
                d3.select(this).raise().classed("summaryStandard", true);
            }
            
    });
   
}

//show bread crumb trail on mouse over
//this is not working properly yet
function onMouseOver(d) {
    var sequenceArray = d.ancestors().reverse();
    sequenceArray.shift(); // remove root node from the array
    updateBreadcrumbs(sequenceArray);
}

//slider stuff
//set slider graphic to class active for css
function dragstarted(d) {
    var selection = d3.select(this).raise().classed("active", true);
}

//remove active from class (css)
function dragended(d) {
    d3.select(this).classed("active", false);
}

//move date sliders up and down and make sure they are not going out of bounds
function dragDateSliderMove(d) {
    // Get the updated Y location computed by the drag behavior.
    var y = d3.event.y;
    //check which circle was dragged
    var dummyCircle = d3.select(this);
    if (dummyCircle.attr("class") === "dateSliderCircleMin active") {
        //clamp range if required
        y = y < ySliderMin ? ySliderMin : y > y2Slider ? y2Slider : y;
        //store current y
        y1Slider = y;
    }
    else {
        //clamp range
        y = y > ySliderMax ? ySliderMax : y < y1Slider ? y1Slider : y;
        //store current y
        y2Slider = y;
    }
    // Update the circle location.
    dummyCircle.attr("cy", y);
    //filter data
    //get both slider dates from stored y locations
    var dateMin = yScaleDateSlider.invert(y1Slider);
    var dateMax = yScaleDateSlider.invert(y2Slider);
    
    //loop over data and mark nodes as either in or out bound
    var selection = svg.selectAll("path")
        .each(function (d) {
            //get the date
            var dummy = parseDate(d.data.Date);
            //check id in range
            if (dummy>=dateMin && dummy<=dateMax) {
                //mark as active
                d3.select(this).raise().classed("inbound", true);
                d3.select(this).raise().classed("outbound", false);
            }
            else {
                //mark as in active
                d3.select(this).raise().classed("outbound", true);
                d3.select(this).raise().classed("inbound", false);
            }
    })
}

//-------------------------------------------------------     utility functions

//method setting up bread crumb data across top of screen
function initializeBreadcrumbTrail() {
    // Add the svg area.
    var trail = d3.select("#sequence").append("svg:svg")
        .attr("width", widthSequence)
        .attr("height", heightSequence)
        .attr("id", "trail");

    //fix up sequence x-axis date scale
    xScaleSequence.domain([dateRangeOldest, dateRangeNewest])
        .range([paddingSequence/2, widthSequence - paddingSequence]);   // map these to the sequence chart width = total width minus padding at both sides

    //append axis
    trail.append("g")
        .attr("transform", "translate(0," + (heightSequence - (paddingSequence)) + ")")
        .attr("class", "seqXAxis")
        .call(d3.axisBottom(xScaleSequence));
}

// Update the breadcrumb trail to show the current sequence and percentage.
function updateBreadcrumbs(nodeArray) {

    // Data join; key function combines name and depth (= position in sequence).
    var trail = d3.select("#trail")
        .selectAll("g.seqBread")
        .data(nodeArray, function(d) { return d.data.name + d.depth; });

    // Remove exiting nodes.
    trail.exit().remove();

    // Add breadcrumb and label for entering nodes.
    var entering = trail.enter().append("svg:g")
        .attr("class", "seqBread");
    //add circle
    entering.append("svg:circle")
        .attr("cx", function (d) { return xScaleSequence(parseDate(d.data.Date)); })
        .attr("cy", 100)
        .attr("r", function (d) {
            if (d.data.children == null) {
                return rScaleSequence(1);
            } else {
                return rScaleSequence(d.data.children.length);
            }
        })
        .attr("style", function (d) {
            return svg.selectAll("path") //select all path elements in svg container
            .filter(function (node) {   //iterate over each path element (node)
                return (node.data.Id === d.data.Id); //and check whether its data id is matching current node (d) data id
            })
            .attr("style");
        })
        .attr("stroke", "white");
    //add text and rotate it
    entering.append("svg:text")
        .attr("transform", function (d) {
            var x = xScaleSequence(parseDate(d.data.Date));
            var y = 80;
            return "translate(" + x + "," + y + ") rotate(-45)";
        })
        .attr("dy", "0.15em")
        .attr("class", "seqLabel")
        .text(function (d) { return shortenString(d.data.name,14); });
        
        //.call(textrotate("rotate("+45+")translate(12,0)"));
}

//function to sert up date slider selection to the right of sunburst diagram
function iniSunBurstDateSlider()
{
    //fix up sequence y-axis date scale
    yScaleDateSlider.domain([dateRangeOldest, dateRangeNewest])
        .range([marginDateSlider, heightDateSlider - marginDateSlider]);   // map these to the date slider height = total height minus padding at both sides

    var line = sliderGroup.append("line")
      .attr("x1", xSlider)
      .attr("x2", xSlider)
      .attr("y1", ySliderMin)
      .attr("y2", ySliderMax)
      .style("stroke", "black");
      
    sliderGroup.insert("g", ".track-overlay")
        .attr("class", "ticks")
        .attr("transform", "translate(0," + 18 + ")")
        .selectAll("text")
        .data(yScaleDateSlider.ticks(10))
        .enter().append("text")
        .attr("y", yScaleDateSlider)
        .attr("x",0)
        .attr("text-anchor", "right")
        .text(function (d) {
            return formatDateSlider(d);
        });

    //add min circle
    var circleSliderMin = sliderGroup.append("circle")
        .attr("r", radiusDateSlider)
        .attr("cy", ySliderMin)  //set to top of range
        .attr("cx", xSlider)
        .attr("class", "dateSliderCircleMin")
        .style("fill", "white")
        .style("stroke", "black")
        .style("cursor", "ns-resize")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragDateSliderMove)
            .on("end", dragended));

    //add max circle
    var circleSliderMax = sliderGroup.append("circle")
         .attr("r", radiusDateSlider)
         .attr("cy", ySliderMax) //set to bottom of range
         .attr("cx", xSlider)
         .attr("class", "dateSliderCircleMax")
         .style("cursor", "ns-resize")
         .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragDateSliderMove)
            .on("end", dragended));
}

// Given a node in a partition layout, return an array of all of its ancestor
// nodes, highest first, but excluding the root.
function getAncestors(node) {
    var path = [];
    var current = node;
    while (current.parent) {
        path.unshift(current);
        current = current.parent;
    }
    return path;
}

//method wrapping text to fit on bread crumb graphics
function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        x = text.attr("x"),
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}

//shortening a string to given threshold value of 15
function shortenString(message, messageLengthThreshold) {
    if (message.length < messageLengthThreshold)
    {
        return message;
    }
    else
    {
       
        var half = (messageLengthThreshold / 2) - 1;
        
        //cut out middle of string and replace with "..."
        var newMessage = message.substring(0, half) + "..." + message.substring(message.length - half, message.length);
        return newMessage;
    }
}

d3.select(self.frameElement).style("height", heightGraphics + "px");
