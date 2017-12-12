"use strict";


var graph_data = JSON.parse(data)


//document.addEventListener('DOMContentLoaded', function() {
var cy = cytoscape({
container: document.getElementById('cy'),

elements: graph_data,

style: [ // the stylesheet for the graph
	{
	  selector: 'node',
	  style: {
	    'background-color': '#FE642E',
		'width': '1px',
        'height': '1px',
        'border-color': '#fff',
        'border-width': '0.2px',
        'border-opacity': 0.7
	  }
	},

	{
	  selector: 'edge',
	  style: {
	    'width': 0.1,
	    'line-color': '#ccc',
	  }
	}
]
});
var spring_layout = cy.layout({
  name: 'cose'
});

//var nodes = cy.nodes("[gender = 'female']");
//var eles = nodes.union(cy.edges("[distance < 0.1]"));
//cy.remove(eles.absoluteComplement());

spring_layout.run()

//});

document.getElementById("dist_thresh").value = '0.1';


var removed;

function updateGraph(){

	cy.startBatch();
	
//	cy.add(removed);
	var gender_selection = document.getElementById("input_gender").value;	
	var race_selection = document.getElementById("input_race").value;
	var dist_threshold = document.getElementById("dist_thresh").value;
	
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
	
	var keep_nodes = race_nodes.intersection(gender_nodes);
	var keep_edges = cy.edges('[distance < ' + dist_threshold + ']');
	
	var updated_graph = keep_nodes.union(keep_edges);
	
	removed = cy.remove(updated_graph.absoluteComplement());
	
	cy.endBatch();
	
	
	//var t1 = cy.nodes("[gender = 'female']");
	//var t2 = t1.union(cy.edges("[distance < 0.05]"));
	//cy.remove(t2.absoluteComplement());
	return false;
}





