var width = 600;
var height = 600;

//Defining radius of the circle
var radius = Math.min(width, height) / 2;

var x=d3.scaleLinear().range([0,2*Math.PI]);
var y=d3.scaleLinear().range([0,radius]);
//Selecting colors
var color ={
  "gender":"ffffff",
  "male":"#247ba0",
  "female":"#ff1654",
  "asian":"ffb4a2",
  "black":"6d6875",
  "latino":"e5989b",
  "native american":"b5838d",
  "white":"ffcdb2",
  "Pakistan":"",
  "USA":"1d3557",
  "Nigeria":"50514f",
  "Canada":"ed63946",
  "Germany":"ffe066",
  "Brazil":"70c1b3",
  "Poland":"f25f5c",
  "less_than_50":"#e4fde1",
  "between_50_and_60":"#028090",
  "between_60_and_70":"#114b5f",
  "more_than_70":"#456990",
  "not_reported":"#dcdcdd",
  "not reported":"#dcdcdd"
};
var partition = d3.partition()

var formatNumber = d3.format(",.0f");

var arc = d3.arc()
      .startAngle(function (d) {return Math.max(0, Math.min(2 * Math.PI, x(d.x0)));})
      .endAngle(function (d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x1)));})
      .innerRadius(function (d) { return Math.max(0, y(d.y0));})
      .outerRadius(function (d) { return Math.max(0, y(d.y1));});

var svg = d3.select('body').append("svg")
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');


var tooltip_fixed = d3.select("body").append("div").attr("class","tooltip").style("opacity",0);
var tooltip = d3.select("body").append("div").attr("class","tooltip").style("opacity",0);

function click(d){
  svg.transition()
    .duration(500)
    .tween("scale",function(){
      var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
        yd = d3.interpolate(y.domain(), [d.y0,1]),
        yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
    return function(t){x.domain(xd(t)); y.domain(yd(t)).range(yr(t));};
  })
    .selectAll("path")
    .attrTween("d",function(d){return function(){ return arc(d);}; });

  
  //tooltip
  if (d.data.name =="gender"){
    d3.select(this).style("cursor","default")
    tooltip_fixed.style("opacity",0)
    return null;
  }else{
    d3.select(this).style("cursor","pointer");
    var percentage=(100 * d.value / total_size ).toPrecision(3);
    tooltip_fixed.text(key(d)+ " : " + percentage + " %")
      .style("opacity",0.8)
      .style("font-size","20px")
      //.style("left",width/2 + "px")
      //.style("top",height/5+ "px")
      .style('display', 'block');
  }
}


function key(d) {
  var k = new Array();
  while (d.depth){
    k.push(d.data.name)
    d = d.parent;
  }
  return k.reverse().join(" > ");
}

function mouseover(d){
  d3.select(this).style("cursor","pointer");
  var percentage=(100 * d.value / total_size ).toPrecision(3);
  if (d.data.name =="gender"){
    return null;
  }
  tooltip.text(key(d))
    .style("opacity",0.8)
    .style("left", (d3.event.pageX) +"px")
    .style("top", (d3.event.pageY)+ "px");
}
function mouseout(d){
  d3.select(this).style("cursor","default")
  tooltip.style("opacity",0)
}

function render_sunburst(){d3.json("clinical_data_nested.json",function(error,nodeData){
  
  var root = d3.hierarchy(nodeData).sum(function (d) { return d.size});
  var nodes = partition(root).descendants();
  var path = svg.data([nodes]).selectAll('path')
    .data(nodes)
    .enter()
    .append('path')
    .attr("d", arc)
    .style('stroke', '#ffffff')
    .style("fill", function (d) { return color[d.data.name]; })
    .style("opacity", 1)
    .on("click",click)
    .on("mouseout",mouseout)
    .on("mouseover",mouseover)
    total_size=path.datum().value;
})
}

function updateSunburst(){
  console.log("a");
  return false;
}

render_sunburst();