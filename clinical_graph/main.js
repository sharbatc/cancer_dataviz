"use strict";

var graph_data = JSON.parse(data)

document.addEventListener('DOMContentLoaded', function() {
  var mainUser;
  var cy = window.cy = cytoscape({
    container: document.getElementById('cy'),
    elements: graph_data,
  });
});

