"use strict";


// Hide graph div until layout has run
function toggle_cy(){
    var x = document.getElementById("cy");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}
document.getElementById('toggle_cy').style.visibility = 'hidden'

var toggle = document.getElementById('toggle_cy');
toggle.click();

// Parse sjon data
var graph_data = JSON.parse(data)

// Initialize child-parent relationship to add collapsibility

function reset_parents(){
	graph_data['nodes'].forEach(function (node){
		node['data']['parent'] = node['data']['id'];
	});
}
reset_parents();

function find_reps(cy){
	var id1, id2, id3, id4, id5;
	var f1, f2, f3, f4, f5;
	f1 = f2 = f3 = f4 = f5 = 0;

	if(cy.nodes('[age_groups = less_than_50]').nonempty()){
		cy.nodes('[age_groups = less_than_50]').forEach( function (node){
			id1 = node.id();
			break;
		});
	}
}


// Define cytoscape instance
var cy = cytoscape({
	container: document.getElementById('cy'),

	elements: graph_data,

	style: [ // the stylesheet for the graph
		{
		  selector: 'node',
		  style: {
			'background-color': '#FE642E',
			'width': '10px',
		    'height': '10px',

		  }
		},
		{
			selector: ':parent',
			style: {
				'background-opacity': 0.1
			}
		},
		{
		  selector: 'edge',
		  style: {
			'width': 0.3,
			'line-color': 'mapData(distance, 0.01, 0.05, #A9A9A9, #000000)',
			'opacity': 'mapData(distance, 0.01, 0.05, 0.1, 1)',
		  }
		},
		{
		    selector: ':selected',
		    style: {
		      'border-width': '1px',
		      'border-style': 'solid',
		      'border-color': 'black' 
		    }
		  },
		 {
			selector: "node.cy-expand-collapse-collapsed-node",
			style: {
				"background-color": "darkblue",
				"shape": "rectangle"
			}
		  }
	],
	hideEdgesOnViewport: true,
	
}); 

// remove isolated nodes
var nodes_not_isolated = cy.edges().connectedNodes();
var to_keep = cy.edges().union(nodes_not_isolated);
var removed = to_keep.absoluteComplement().remove();


// Define layout
var options = {
  name: 'cose-bilkent',
  idealEdgeLength: 50,
  randomize: true,
  tilingPaddingVertical: 1,
  tilingPaddingHorizontal: 1
};
var cose_layout = cy.layout(options);

// API for collapsibility 
var api = cy.expandCollapse({
					layoutBy: {
						name: "cose-bilkent",
						animate: "end",
						randomize: false,
						fit: true
					},
					fisheye: true,
					animate: true,
					undoable: false
				});


// Run layout
cose_layout.run();

// Show the graph-div
toggle.click();

// Add a qtip
function qtipText(node) {
  return 'Reference:' + node.data('reference') + '&nbsp</br>' +'Race: '+ node.data('race') +  '&nbsp </br>' + 'Age group: ' + node.data('age_groups') + '&nbsp </br>' + 'Gender: ' + node.data('gender') + '&nbsp</br> ' + 'Country: ' + node.data('tissue_source_country');
}

// qtip specifications
cy.nodes().forEach(function(ele) {
        ele.qtip({
          content: {
            text: qtipText(ele),
            title: 'Patient details'
          },
          style: {
            classes: 'qtip-tipsy'
          },
          position: {
            my: 'bottom center',
            at: 'top center',
            target: ele
          },
          show: {
          	event: 'click',
          	delay: 0
          }
        });
      });


// Set the threshold
document.getElementById("dist_thresh").value = '0.05';

// Function to filter the graph based on the filters
function updateGraph(){

	cy.startBatch();	
	
	var gender_selection = document.getElementById("input_gender").value;	
	var race_selection = document.getElementById("input_race").value;
	var age_selection = document.getElementById("input_age").value;
	var country_selection = document.getElementById("input_country").value;
	var dist_threshold = document.getElementById("dist_thresh").value;
	
	removed.restore();	
	
	if(gender_selection == 'all'){
		var gender_nodes = cy.nodes();
	} else {
		var gender_nodes = cy.nodes('[gender = \'' + gender_selection + '\']');
	}
	
	if(race_selection == 'all'){
		var race_nodes = cy.nodes();
	} else {
		var race_nodes = cy.nodes('[race = \'' + race_selection + '\']');
	}
	
	if(age_selection == 'all'){
		var age_nodes = cy.nodes();
	} else {
		var age_nodes = cy.nodes('[age_groups = \'' + age_selection + '\']');
	}
	
	if(country_selection == 'all'){
		var country_nodes = cy.nodes();
	} else {
		var country_nodes = cy.nodes('[tissue_source_country = \'' + country_selection + '\']');
	}
	
	var keep_nodes = race_nodes.intersection(gender_nodes).intersection(age_nodes).intersection(country_nodes);
	var keep_edges = cy.edges('[distance < ' + dist_threshold + ']');
		
	var updated_graph = keep_nodes.union(keep_edges);
	
	// Store as a variable to be added back later
	removed = updated_graph.absoluteComplement().remove();
	
	// Remove isolated nodes
	nodes_not_isolated = cy.edges().connectedNodes();
	to_keep = cy.edges().union(nodes_not_isolated);
	removed = removed.union(to_keep.absoluteComplement().remove());

	// Rerun layout
	var layout = cy.elements().layout(options);
	layout.run();
	
	cy.endBatch();
	
	return false;
}





