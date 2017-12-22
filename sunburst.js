/*
Coded based on the following references:
https://bl.ocks.org/kerryrodden/766f8f6d31f645c39f488a0befa1e3c8
https://denjn5.github.io/sunburst-1/
http://bl.ocks.org/kaz-a/5c26993b5ee7096c8613e0a77bdd972b
http://tietyk.github.io/D3/
*/

//Defining size of the svg element
var width = 1500;
var height = 1300;
//Defining radius of the circle
var radius = 280;
//Defining Scales for x and y axis
var x = d3.scaleLinear().range([0,2*Math.PI]);
var y = d3.scaleLinear().range([0,radius]);

//Defining colors for each parent and children used in the sunburst
var color ={
  "gender":"#ffffff",
  //Gender:
  "Male":"#fc4e68",
  "Female":"#fdb9c2",
  //Race: Orange
  "Asian":"#654d1e",
  "Black":"#b18734",
  "Latino":"#fdc24b",
  "Native American":"#fdd481",
  "White":"#feecc9",
  //Countries:
  "Pakistan":"#254e4e",
  "USA":"#387575",
  "Nigeria":"#4b9c9c",
  "Canada":"#5ec4c4",
  "Germany":"#8ed5d5",
  "Brazil":"#bee7e7",
  "Poland":"#eef9f9",
  //Age group: blue
  "Under 50":"#178baa",
  "Between 50 and 60":"#22c7f4",
  "Between 60 and 70":"#64d7f7",
  "Above 70":"#d2f3fc",
  //Undefined data: grey
  "Undefined":"#dcdcdd"
};

//Defining colors for each parent and children. Note that this variable will be used for the
var colors_scale = d3.scaleOrdinal()
    .domain(["Gender", "Male", "Female",
      "Race", "Asian", "Black", "Latino", "Native American", "White",
      "Country","Pakistan", "USA", "Nigeria", "Canada", "Germany", "Brazil", "Poland",
      "Age group", "Under 50", "Between 50 and 60","Between 60 and 70","Above 70",
      "Undefined"])
    .range(["None", "#fc4e68", "#fdb9c2","None",
      "#654d1e","#b18734","#fdc24b","#fdd481","#feecc9","None",
      "#254e4e","#387575","#4b9c9c","#5ec4c4","#8ed5d5","#bee7e7","#eef9f9","None",
      "#178baa","#22c7f4","#64d7f7","#d2f3fc",
      "#dcdcdd"]);

//Setting up the svg element according to the size
var svg = d3.select('body').append("svg")
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr("viewBox", "0 0 10 50")
  .attr('transform', 'translate(' + 650 + ',' + height / 2 + ')');

//Getting the sizes of the slices of the elements of the sunburst.
var arc = d3.arc()
      .startAngle(function (d) {return Math.max(0, Math.min(2 * Math.PI, x(d.x0)));})
      .endAngle(function (d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x1)));})
      .innerRadius(function (d) { return Math.max(0, y(d.y0));})
      .outerRadius(function (d) { return Math.max(0, y(d.y1));});

//We create the partition variable to organize the data in the sunburst form
var partition = d3.partition();

//Key function that returns the ancestors (4 levels: 1: Gender, 2: Race, 3: Country and 4: Group age) of the the selected element
function key_html(d) {
  var k = new Array();
  while (d.depth){
    if(d.depth==1){
      k.push("<b>"+"Gender: "+"</b>"+d.data.name)
    }
    if(d.depth==2){
      k.push("<b>"+"Race: "+"</b>"+d.data.name)
    }
    if (d.depth==3){
      k.push("<b>"+"Country: "+"</b>"+d.data.name)
    }
    if (d.depth==4){
      k.push("<b>"+"Age group: "+"</b>"+d.data.name)
    }
    d = d.parent;

  }
  return k.reverse().join(" > ");
}

//Defining two tooltip variables:
//One (tooltip_fixed) in case of clicking on an element of the sunburst (will show the percentage (in terms of the size) of the element considering the whole tree)
//The other (tooltip) used in case of moving through an element (this is moving according the cursor)
var tooltip_fixed = d3.select("body").append("div").attr("class","tooltip").style("opacity",0);
var tooltip = d3.select("body").append("div").attr("class","tooltip").style("opacity",0);

//click function that will make a "zoom" over the selected element and will show the tooltip_fixed with the whole selected path and percentage
function click(d){
  svg.transition()
    .duration(750)
    //Collapsing the Sunburst
    .tween("scale",function(){
      var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
          yd = d3.interpolate(y.domain(), [d.y0,1]),
          yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
    return function(t){x.domain(xd(t)); y.domain(yd(t)).range(yr(t));};
  })
    .selectAll("path")
    .attrTween("d",function(d){return function(){ return arc(d);}; });
  //Showing up the tooltip
  //in case of moving through the center, don't show anything, since it doesn't have information (it's only the root "gender")
  if (d.data.name =="gender"){
    d3.select(this).style("cursor","default");
    tooltip_fixed.style("opacity",0);
    return null;
  }else{
    //show the percentage up as well as the path from the root, according to the selected element of the sunburst
    d3.select(this).style("cursor","pointer");
    var percentage=(100 * d.value / total_size ).toPrecision(3);
    tooltip_fixed.html(key_html(d)+ " > " + "<b>" +percentage + " %</b>")
      .style("opacity",0.8)
      .style("font-size","15px")
      .style('display', 'block');
  }
}

//mousemove function to show up a tooltip that will be moving according to the cursor procesor showing information about the path of the selected element
function mousemove(d){
  //Do nothing if moving through the middle (i.e. gender) of the sunburst when its fully expanded.
  if (d.data.name =="gender"){
    return null;
  }else{
  d3.select(this).style("cursor","pointer");
  //Displaying tooltip
  tooltip.html(key_html(d))
    .style("opacity",0.8)
    .style("left", (d3.event.pageX)+"px") //The tooltip follows the cursor in the X axis
    .style("top", (d3.event.pageY)+ "px"); //The tooltip follows the cursor in the Y axis
  //Highlighting selection
  d3.select(this)
    .style("stroke-opacity",1.0) //Highlight the single element of the sunburst when moving through it with the cursor
    .raise();
  }
}

//mouseout function that will make the tooltip (not the tooltip_fixed) dissapear as well undoing the highlight selection of the previous selected element
function mouseout(d){
  d3.select(this).style("cursor","default");
  tooltip.style("opacity",0);
  //Undoing highlighting
  d3.select(this)
  .style("stroke-opacity",0)
  .lower();
}

//Adding a static legend with the colors and their meaning
var legend= d3.select("svg")
  .attr("class","legend")
  .append("g")
  .selectAll("g")
  .data(colors_scale.domain())
  .enter()
  .append("g")
    .attr("transform", function(d,i) { //Aligning the legend (each of the circles and the text) to the right side of the sunburst
        var legend_height = 20;
        var x = 1000;
        var y = i * legend_height+((height-400)/2);
        return 'translate(' + x + ',' + y + ')';
  });
//Appending circles to the legend. These circles will be filled with the color of their respective label
legend.append("circle")
    .attr("r",10)
    .style("fill", colors_scale)
    .style("stroke",colors_scale);

//Adding the label to their respective color (circle)
legend.append("text")
    .attr("x",16)
    .attr("y",4)
    .attr("font-size","12px")
    .attr("font-family","sans-serif")
    .attr("fill","black")
    .attr("font-weight",function(d){ if ((d=="Gender") || (d=="Race") || (d=="Country" || (d=="Undefined")|| (d=="Age group") ) ){ return "bold"}}) //Making the categories bold
    .html(function(d){return d;});

//render_sunburst function to create the sunburst form according to the data.
//clinical_data_nested_revisited.json file contains the information (previously pre-processed in python) in an specific nested (parents and children)
function render_sunburst(){d3.json("clinical_data_nested_revisited.json",function(error,nodeData){
  if (error) throw error;
  var root = d3.hierarchy(nodeData).sum(function(d) { return d.size});
  var nodes = partition(root).descendants();
  var path = svg.selectAll("path")
    .data(nodes)
    .enter()
    .append('path')
    .attr("d", arc)
    .style('stroke', 'white')
    .style("stroke-opacity",0)
    .style("stroke-width","3px")
    .style("fill", function (d) { return color[d.data.name]; }) //filling the areas of the sunburst with colors according to the color dictionary
    .style("opacity", 1)
    .on("click",click)
    .on("mouseout",mouseout)
    .on("mousemove",mousemove)

  total_size=path.datum().value; //Getting the total size of the tree, so that we can compute the percentages of the selected areas (elements)
  });
};
render_sunburst();
