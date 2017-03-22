var widthOverall = 900;
var heightOverall = 900;

var widthGraphics = widthOverall / 3 *2,
    heightGraphics = 700,
    radius = (Math.min(widthGraphics, heightGraphics) / 2) - 10;
  
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

//y axis scale for data slider 
var yScaleDateSlider = d3.scaleTime();  

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
d3.json("../Data/flare_2_1.json", function (error, root) {
    if (error) throw error;

    //setting up data for sunburst diagram
    root = d3.hierarchy(root);
    
    
    
    //returns 1000 if this is a leaf node (no children) ...means i do not need 
    // a size property in my json data
    root.sum(function (d) { return (d.children ? 0 : 1000); });



    //get the oldest and newest date
    partition(root).descendants().forEach(function (d)
    {
        //check whether date is older than oldest date
        if (parseDate(d.data.Date)<=dateRangeOldest) {
            dateRangeOldest = parseDate(d.data.Date);
        }
        if (parseDate(d.data.Date)>=dateRangeNewest) {
            dateRangeNewest =  parseDate(d.data.Date);
        }
        //console.log(parseDate(d.data.Date));
    });

    // Basic set up of page elements.
    iniSunBurstDateSlider();

    var selection = svg.selectAll("path")
        .data(partition(root).descendants())
        .enter().append("path")
        .attr("d", arc)
        .attr("id", function (d) { return "_"+d.data.Id; })
        .style("fill", function (d) { return color((d.children ? d : d.parent).data.name); })
        .on("click", onClick);

    //add data
    selection.append("number")
      .text(function (d) { return d.data.number; });
    selection.append("name")
      .text(function (d) { return d.data.name; });
    selection.append("department")
      .text(function (d) {return d.data.department;});
    selection.append("subdepartment")
      .text(function (d) { return d.data.subdepartment; });
    selection.append("functionalgroup")
      .text(function (d) { return d.data.functionalgroup; });
    selection.append("areabriefed")
      .text(function (d) { return d.data.areabriefed; });
    selection.append("areadesigned")
      .text(function (d) { return d.data.areadesigned; });
    selection.append("id")
      .text(function (d) { return d.data.Id; });
});

//---------------------------------------------------------event handler

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
