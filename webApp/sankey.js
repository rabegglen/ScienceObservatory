/// the sankey function snippet, taken from here: 




d3.sankey = function() {
  var sankey = {},
      nodeWidth = 24,
      nodePadding = 8,
      size = [1, 1],
      nodes = [],
      links = [];

  sankey.nodeWidth = function(_) {
    if (!arguments.length) return nodeWidth;
    nodeWidth = +_;
    return sankey;
  };

  sankey.nodePadding = function(_) {
    if (!arguments.length) return nodePadding;
    nodePadding = +_;
    return sankey;
  };

  sankey.nodes = function(_) {
    if (!arguments.length) return nodes;
    nodes = _;
    return sankey;
  };

  sankey.links = function(_) {
    if (!arguments.length) return links;
    links = _;
    return sankey;
  };

  sankey.size = function(_) {
    if (!arguments.length) return size;
    size = _;
    return sankey;
  };

  sankey.layout = function(iterations) {
    computeNodeLinks();
    computeNodeValues();
    computeNodeBreadths();
    computeNodeDepths(iterations);
    computeLinkDepths();
    return sankey;
  };

  sankey.relayout = function() {
    computeLinkDepths();
    return sankey;
  };

  sankey.link = function() {
    var curvature = .5;

    function link(d) {
      var x0 = d.source.x + d.source.dx,
          x1 = d.target.x,
          xi = d3.interpolateNumber(x0, x1),
          x2 = xi(curvature),
          x3 = xi(1 - curvature),
          y0 = d.source.y + d.sy + d.dy / 2,
          y1 = d.target.y + d.ty + d.dy / 2;
      return "M" + x0 + "," + y0
           + "C" + x2 + "," + y0
           + " " + x3 + "," + y1
           + " " + x1 + "," + y1;
    }

    link.curvature = function(_) {
      if (!arguments.length) return curvature;
      curvature = +_;
      return link;
    };

    return link;
  };

  function computeNodeLinks() {
    nodes.forEach(function(node) {
      node.sourceLinks = [];
      node.targetLinks = [];
    });
    links.forEach(function(link) {
      var source = link.source,
          target = link.target;
      if (typeof source === "number") source = link.source = nodes[link.source];
      if (typeof target === "number") target = link.target = nodes[link.target];
      source.sourceLinks.push(link);
      target.targetLinks.push(link);
    });
  }

  function computeNodeValues() {
    nodes.forEach(function(node) {
      node.value = Math.max(
        d3.sum(node.sourceLinks, value),
        d3.sum(node.targetLinks, value)
      );
    });
  }

  function computeNodeBreadths() {
    var remainingNodes = nodes,
        nextNodes,
        x = 0;

    while (remainingNodes.length) {
      nextNodes = [];
      remainingNodes.forEach(function(node) {
        node.x = x;
        node.dx = nodeWidth;
        node.sourceLinks.forEach(function(link) {
          nextNodes.push(link.target);
        });
      });
      remainingNodes = nextNodes;
      ++x;
    }

    //
    moveSinksRight(x);
    scaleNodeBreadths((size[0] - nodeWidth) / (x - 1));
  }

  function moveSourcesRight() {
    nodes.forEach(function(node) {
      if (!node.targetLinks.length) {
        node.x = d3.min(node.sourceLinks, function(d) { return d.target.x; }) - 1;
      }
    });
  }

  function moveSinksRight(x) {
    nodes.forEach(function(node) {
      if (!node.sourceLinks.length) {
        node.x = x - 1;
      }
    });
  }

  function scaleNodeBreadths(kx) {
    nodes.forEach(function(node) {
      node.x *= kx;
    });
  }

  function computeNodeDepths(iterations) {
    var nodesByBreadth = d3.nest()
        .key(function(d) { return d.x; })
        .sortKeys(d3.ascending)
        .entries(nodes)
        .map(function(d) { return d.values; });

    //
    initializeNodeDepth();
    resolveCollisions();
    for (var alpha = 1; iterations > 0; --iterations) {
      relaxRightToLeft(alpha *= .99);
      resolveCollisions();
      relaxLeftToRight(alpha);
      resolveCollisions();
    }

    function initializeNodeDepth() {
      var ky = d3.min(nodesByBreadth, function(nodes) {
        return (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value);
      });

      nodesByBreadth.forEach(function(nodes) {
        nodes.forEach(function(node, i) {
          node.y = i;
          node.dy = node.value * ky;
        });
      });

      links.forEach(function(link) {
        link.dy = link.value * ky;
      });
    }

    function relaxLeftToRight(alpha) {
      nodesByBreadth.forEach(function(nodes, breadth) {
        nodes.forEach(function(node) {
          if (node.targetLinks.length) {
            var y = d3.sum(node.targetLinks, weightedSource) / d3.sum(node.targetLinks, value);
            node.y += (y - center(node)) * alpha;
          }
        });
      });

      function weightedSource(link) {
        return center(link.source) * link.value;
      }
    }

    function relaxRightToLeft(alpha) {
      nodesByBreadth.slice().reverse().forEach(function(nodes) {
        nodes.forEach(function(node) {
          if (node.sourceLinks.length) {
            var y = d3.sum(node.sourceLinks, weightedTarget) / d3.sum(node.sourceLinks, value);
            node.y += (y - center(node)) * alpha;
          }
        });
      });

      function weightedTarget(link) {
        return center(link.target) * link.value;
      }
    }

    function resolveCollisions() {
      nodesByBreadth.forEach(function(nodes) {
        var node,
            dy,
            y0 = 0,
            n = nodes.length,
            i;

        nodes.sort(ascendingDepth);
        for (i = 0; i < n; ++i) {
          node = nodes[i];
          dy = y0 - node.y;
          if (dy > 0) node.y += dy;
          y0 = node.y + node.dy + nodePadding;
        }

        dy = y0 - nodePadding - size[1];
        if (dy > 0) {
          y0 = node.y -= dy;

          for (i = n - 2; i >= 0; --i) {
            node = nodes[i];
            dy = node.y + node.dy + nodePadding - y0;
            if (dy > 0) node.y -= dy;
            y0 = node.y;
          }
        }
      });
    }

    function ascendingDepth(a, b) {
      return a.y - b.y;
    }
  }

  function computeLinkDepths() {
    nodes.forEach(function(node) {
      node.sourceLinks.sort(ascendingTargetDepth);
      node.targetLinks.sort(ascendingSourceDepth);
    });
    nodes.forEach(function(node) {
      var sy = 0, ty = 0;
      node.sourceLinks.forEach(function(link) {
        link.sy = sy;
        sy += link.dy;
      });
      node.targetLinks.forEach(function(link) {
        link.ty = ty;
        ty += link.dy;
      });
    });

    function ascendingSourceDepth(a, b) {
      return a.source.y - b.source.y;
    }

    function ascendingTargetDepth(a, b) {
      return a.target.y - b.target.y;
    }
  }

  function center(node) {
    return node.y + node.dy / 2;
  }

  function value(link) {
    return link.value;
  }

  return sankey;
};



 
 import { nwData } from "./dataHandler.js"
 
 console.log("oatypeYear: ", nwData)
 
 /// parse some years and other stuff
 



 //// the years for the drop down
 
   let years = new Array 
   for(var i in nwData.links){
   
     var yrd = nwData.links[i].year
     // console.log(yrd)
     years.push(yrd)
   
   }
   console.log("years", years)
 
years =  _.uniq(years)


// initialise the sankey


var units = "Publications"


var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 1200 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom; 


/// for formatting the right numbers and avoid commas, etc


var formatNumber = d3.format(",.0f"),    // zero decimal places
    format = function(d) { return formatNumber(d) + " " + units; },
    //color = d3.scaleOrdinal(d3.schemeCategory10),
    color = d3.scaleOrdinal()
//.domain(["publication", "No Open Access", "Open Access", "Publisher (Gold Open Access)", "Repository (Green Open Access)", "Unknown Type", "Website"])
.range(["#66ccff", "#0099ff", "#ff9933", "#ffd633", "#00ff99", "#334d00", "#d966ff"]);








console.log("color", color)

console.log("formatNumber", formatNumber)

/// create the svg canvas in the html document





 // var svg = d3.select("#sankey").append("svg")
 // .attr('viewBox', '0 0 1200 500')
 // .append("g")
 // .attr("transform",
 //       "translate(" + margin.left + "," + margin.top + ")")
 //   .attr('preserveAspectRatio','xMinYMin');






 var svg = d3.select("#sankey").append("svg")
     .attr("width", width + margin.left + margin.right)
     .attr("height", height + margin.top + margin.bottom)
   .append("g")
     .attr("transform", 
           "translate(" + margin.left + "," + margin.top + ")");


//// diagram properties


var sankey = d3.sankey()
.nodeWidth(36)
.nodePadding(10)
.size([width, height]);

console.log("sankey", sankey)

var path = sankey.link();



/// feed the data into the graph

var data = nwData

console.log("data before change: ", data)



d3.json("./inputData/networkData.json").then(function(data) {
  
/// initialise the plot at 2016, because why not?
var links = data.links 
links = links.filter(d => d.year == 2000)
data.links = links




  var nodeMap = {};
  data.nodes.forEach(function(x) { nodeMap[x.name] = x; });
  data.links = data.links.map(function(x) {
    return {
      source: nodeMap[x.source],
      target: nodeMap[x.target],
      value: x.value
    };
  });



sankey
    .nodes(data.nodes)
    .links(data.links)
    .layout(50);




// add in the links
var link = svg.append("g").selectAll(".link")
    .data(data.links)
  .enter().append("path")
    .attr("class", "link")
    .attr("d", path)
    .style("stroke-width", function(d) { return Math.max(1, d.dy); })
    .sort(function(a, b) { return b.dy - a.dy; });

// add the link titles
link.append("title")
      .text(function(d) {
      return d.source.name + " → " + 
              d.target.name + "\n" + format(d.value); });

// add in the nodes
var node = svg.append("g").selectAll(".node")
    .data(data.nodes)
  .enter().append("g")
    .attr("class", "node")
    .attr("transform", function(d) { 
    return "translate(" + d.x + "," + d.y + ")"; })
  .call(d3.drag()
      .subject(function(d) {
        return d;
      })
      .on("start", function() {
        this.parentNode.appendChild(this);
      })
      .on("drag", dragmove));

// add the rectangles for the nodes
node.append("rect")
    .attr("height", function(d) { return d.dy; })
    .attr("width", sankey.nodeWidth())
    .style("fill", function(d) { 
    return d.color = color(d.name.replace(/ .*/, "")); })
    .style("stroke", function(d) { 
    return d3.rgb(d.color).darker(2); })
  .append("title")
    .text(function(d) { 
    return d.name + "\n" + format(d.value); });

// add in the title for the nodes
node.append("text")
    .attr("x", -6)
    .attr("y", function(d) { return d.dy / 2; })
    .attr("dy", ".35em")
    .attr("text-anchor", "end")
    .attr("transform", null)
    .text(function(d) { 
      
      if(d.value > 0){

      console.log("is greater than zero", d.value)
      return d.name; 
    } else {
      return ""
    } })
  .filter(function(d) { return d.x < width / 2; })
    .attr("x", 6 + sankey.nodeWidth())
    .attr("text-anchor", "start");

// the function for moving the nodes
function dragmove(d) {
  d3.select(this).attr("transform", 
      "translate(" + d.x + "," + (
              d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))
          ) + ")");
  sankey.relayout();
  link.attr("d", path);
}


})


/// update the sankey


/// select the year

console.log(years)
years = years.filter(year => year > 1999)

var allGroup = years.sort()


d3.select("#year")
.selectAll('myOptions')
   .data(allGroup)
.enter()
  .append('option')
.text(function (d) { 
  return d
}) // text showed in the menu
.attr("value", function (d) { return d; }) // corresponding value returned by the button




function update(selectedGroup){

d3.json("./inputData/networkData.json").then(function(data) {

  var links = data.links 
links = links.filter(d => d.year == selectedGroup)
data.links = links

  console.log("nwData after update: ", data)



  var nodeMap = {};
  data.nodes.forEach(function(x) { nodeMap[x.name] = x; });
  data.links = data.links.map(function(x) {
    return {
      source: nodeMap[x.source],
      target: nodeMap[x.target],
      value: x.value
    };
  });

  console.log("nodeMap after update: ", nodeMap)



  sankey
    .nodes(data.nodes)
    .links(data.links)
    .layout(50);

    d3.selectAll(".link").remove()

// add in the links
var link = svg.append("g").selectAll(".link")
    .data(data.links)
  .enter().append("path")
    .attr("class", "link")
    .attr("d", path)
    .style("stroke-width", function(d) { return Math.max(1, d.dy); })
    .sort(function(a, b) { return b.dy - a.dy; });


    link.append("title")
    .text(function(d) {
    return d.source.name + " → " + 
            d.target.name + "\n" + format(d.value); });



  d3.selectAll(".node").remove()



  var node = svg.append("g").selectAll(".node")
  .data(data.nodes)
.enter().append("g")
  .attr("class", "node")
  .attr("transform", function(d) { 
  return "translate(" + d.x + "," + d.y + ")"; })
.call(d3.drag()
    .subject(function(d) {
      return d;
    })
    .on("start", function() {
      this.parentNode.appendChild(this);
    })
    .on("drag", dragmove));
   
   // add the rectangles for the nodes
   node.append("rect")
       .attr("height", function(d) { return d.dy; })
       .attr("width", sankey.nodeWidth())
       .style("fill", function(d) { 
       return d.color = color(d.name.replace(/ .*/, "")); })
       .style("stroke", function(d) { 
       return d3.rgb(d.color).darker(2); })
     .append("title")
       .text(function(d) { 
       return d.name + "\n" + format(d.value); });
   
  // add in the title for the nodes


   node.append("text")
       .attr("x", -6)
       .attr("y", function(d) { return d.dy / 2; })
       .attr("dy", ".35em")
       .attr("text-anchor", "end")
       .attr("transform", null)
       .text(function(d) {
        
       
        if(d.value > 0){

          console.log("is greater than zero", d.value)
          return d.name; 
        } else {
          return ""
        }

        console.log(d.value)
        console.log(d.name)
        
        
        })
     .filter(function(d) { return d.x < width / 2; })
       .attr("x", 6 + sankey.nodeWidth())
       .attr("text-anchor", "start");
 


// the function for moving the nodes
function dragmove(d) {
  d3.select(this).attr("transform", 
      "translate(" + d.x + "," + (
              d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))
          ) + ")");
  sankey.relayout();
  link.attr("d", path);
}



})




}


   // When the button is changed, run the updateChart function
   d3.select("#year").on("change", function(d) {
     // recover the option that has been chosen
     var selectedOption = d3.select(this).property("value")
 
     console.log(selectedOption)
     // run the updateChart function with this selected option
    update(selectedOption)
 })


