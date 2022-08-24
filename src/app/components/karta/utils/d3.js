var nodeToHTML = require("./nodeTemplates/nodeToHTML.js");

var getSVGSize = (tree,size={width:0,height:0},level=0)=>{
    if(size.width<tree.children.length*120){
        size.width =tree.children.length*120;
    }
    size.height=65*(level+1);
    return tree.children.length;
}
var tree = null,selectedNode = null;

function initiateDrag(d, domNode) {
    draggingNode = d;
    d3.select(domNode).select('.ghostCircle').attr('pointer-events', 'none');
    d3.selectAll('.ghostCircle').attr('class', 'ghostCircle show');
    d3.select(domNode).attr('class', 'node activeDrag');

    d3.selectAll("g.node").sort(function(a, b) { // select the parent and sort the path's
        if (a.id != draggingNode.id) return 1; // a is not the hovered element, send "a" to the back
        else return -1; // a is the hovered element, bring "a" to the front
    });
    // if nodes has children, remove the links and nodes
    if (nodes.length > 1) {
        // remove link paths
        links = tree.links(nodes);
        nodePaths = d3.selectAll("path.link")
            .data(links, function(d) {
                return d.target.id;
            }).remove();
        // remove child nodes
        nodesExit = d3.selectAll("g.node")
            .data(nodes, function(d) {
                return d.id;
            }).filter(function(d, i) {
                if (d.id == draggingNode.id) {
                    return false;
                }
                return true;
            }).remove();
    }

    // remove parent link
    parentLink = tree.links(tree.nodes(draggingNode.parent));
    d3.selectAll('path.link').filter(function(d, i) {
        if (d.target.id == draggingNode.id) {
            return true;
        }
        return false;
    }).remove();

    dragStarted = null;
}


var updateTempConnector = function() {
    var data = [];
    if (draggingNode !== null && selectedNode !== null) {
        // have to flip the source coordinates since we did this for the existing connectors on the original tree
        data = [{
            source: {
                x: selectedNode.y0,
                y: selectedNode.x0
            },
            target: {
                x: draggingNode.y0,
                y: draggingNode.x0
            }
        }];
    }
    var link = d3.selectAll(".templink").data(data);

    link.enter().append("path")
        .attr("class", "templink")
        .attr("d", d3.svg.diagonal())
        .attr('pointer-events', 'none');

    link.attr("d", d3.svg.diagonal());

    link.exit().remove();
};

module.exports = function BuildKPIKarta(treeData, treeContainerDom,options) {
    var margin = { top: 0, right: 120, bottom: 20, left: 120 };
    var width = window.screen.width - margin.right - margin.left;
    var height = (65*8) - margin.top - margin.bottom;
    var i = 0, duration = 750;
    tree = d3.layout.tree()
        .nodeSize([150, 100])
        .separation(function (a, b) {
            return a.parent == b.parent ? 1 : 1.25;
        });
    //   .size([height, width])
    options.updateNode = updateNode;

    var diagonal = d3.svg.diagonal()
        .projection(function (d) { return [d.x + 60, d.y + 30]; });
    var svg = d3.select(treeContainerDom).append("svg")
        .style("width", width)
        .style("height", height)
        // .attr("viewBox", [0, 0, width, height])
        .append("g")
        .attr("transform", "translate(" + ((width / 2)) + "," + (margin.top) + ")");
    var root = treeData;

    // Setup lining
    (new Array(parseInt(window.screen.height/65))).fill(0).forEach((val,index)=>{
        if (index <=7) {
            var pathGenerator =d3.svg.line();
            svg.append('path')
            .attr('stroke','lightgrey')
            .attr('stroke-width','1px')
            .attr('d',pathGenerator([[-(window.screen.width/2),(index+1)*65],[window.screen.width/2,(1+index)*65]]))
        }
    })

    // Drag/Drop
    var dragListener = d3.behavior.drag()
.on("dragstart", function(d) {
    if (d == root) {
        return;
    }
    dragStarted = true;
    nodes = tree.nodes(d);
    d3.event.sourceEvent.stopPropagation();
    // it's important that we suppress the mouseover event on the node being dragged. Otherwise it will absorb the mouseover event and the underlying node will not detect it d3.select(this).attr('pointer-events', 'none');
}).on("drag", function(d) {
    if (d == root) {
        return;
    }
    if (dragStarted) {
        domNode = this;
        initiateDrag(d, domNode);
    }

    // get coords of mouseEvent relative to svg container to allow for panning
    // relCoords = d3.mouse($('svg').get(0));
    // if (relCoords[0] < panBoundary) {
    //     panTimer = true;
    //     pan(this, 'left');
    // } else if (relCoords[0] > ($('svg').width() - panBoundary)) {

    //     panTimer = true;
    //     pan(this, 'right');
    // } else if (relCoords[1] < panBoundary) {
    //     panTimer = true;
    //     pan(this, 'up');
    // } else if (relCoords[1] > ($('svg').height() - panBoundary)) {
    //     panTimer = true;
    //     pan(this, 'down');
    // } else {
    //     try {
    //         clearTimeout(panTimer);
    //     } catch (e) {

    //     }
    // }

    d.x0 += d3.event.dy;
    d.y0 += d3.event.dx;
    var node = d3.select(this);
    node.attr("transform", "translate(" + d.y0 + "," + d.x0 + ")");
    updateTempConnector();
}).on("dragend", function(d) {
    if (d == root) {
        return;
    }
    domNode = this;
    if (selectedNode) {
        // now remove the element from the parent, and insert it into the new elements children
        var index = draggingNode.parent.children.indexOf(draggingNode);
        if (index > -1) {
            draggingNode.parent.children.splice(index, 1);
        }
        if (typeof selectedNode.children !== 'undefined' || typeof selectedNode._children !== 'undefined') {
            if (typeof selectedNode.children !== 'undefined') {
                selectedNode.children.push(draggingNode);
            } else {
                selectedNode._children.push(draggingNode);
            }
        } else {
            selectedNode.children = [];
            selectedNode.children.push(draggingNode);
        }
        // Make sure that the node being added to is expanded so user can see added node is correctly moved
        // expand(selectedNode);
        // sortTree();
        endDrag();
    } else {
        endDrag();
    }
});
    // Drag/Drop

    update(root);
    function update(source) {
        // Compute the new tree layout.
        var nodes = tree.nodes(root).reverse(),
            links = tree.links(nodes);

        // Normalize for fixed-depth.
        nodes.forEach(function (d) { d.y = d.depth * 65; });
        // Declare the nodes…
        var node = svg.selectAll("g.node")
            .data(nodes, function (d) { return d.id || (d.id = ++i); });
        // Enter the nodes.
        var nodeEnter = node.enter().append("g")
            .call(dragListener)
            .attr("class", "node")
            .attr("width", 120)
            .attr("height", 60)
            .on("mouseover", function(node) {
                selectedNode =node;
            })
            .attr("transform", function (d) {
                return "translate(" + source.x + "," + source.y + ")";
                //   });
            }).on("click", nodeclick);
        nodeEnter
            .append("foreignObject")
            .attr("class", "mindmap-node")
            .attr("width", 120)
            .attr("height", 60)
            .html(node => nodeToHTML(node, nodeEnter))
        //.attr("r", 10)
        //.style("fill", "#fff");
        // Transition nodes to their new position.
        //horizontal tree
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });


        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function (d) { return "translate(" + source.x + "," + source.y + ")"; })
            .remove();
        // Update the links…
        // Declare the links…
        var link = svg.selectAll("path.link")
            .data(links, function (d) {
                if (!d.source.yupdated || (d.source.oldy && (d.source.oldy == d.source.y))) {
                    d.source.oldy = d.source.y;
                    d.source.y += 30;
                    d.source.yupdated = true;
                }
                return d.target.id;
            })
        // Enter the links.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("stroke", options.events.linkColor)
            .attr("stroke-width", options.events.linkWidth)
            .attr("d", function (d) {
                var o = { x: source.x, y: source.y };
                return diagonal({ source: o, target: o });
            });
        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", (d) => {
                return diagonal(d)
            });


        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr("d", function (d) {
                var o = { x: source.x, y: source.y };
                return diagonal({ source: o, target: o });
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function (d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    // Toggle children on click.
    function nodeclick(d) {
        d3.event.stopPropagation();
        if (events[d3.event.target.id]) {
            events[d3.event.target.id](d);
        }
        if(options.events && options.events[d3.event.target.id]){
            options.events[d3.event.target.id](d);
        }
    }

    function updateNode(d) {
        $(`.node-text[nodeid=${d.id}]`).html(d.name)
        $(`.node-text[nodeid=${d.id}]`).css('color',d.text_color);
        $(`.node-text[nodeid=${d.id}]`).css('font-family',d.font_style);
        $(`.node-text[nodeid=${d.id}]`).css('text-align',d.alignment);
    }

    function endDrag() {
        selectedNode = null;
        d3.selectAll('.ghostCircle').attr('class', 'ghostCircle');
        d3.select(domNode).attr('class', 'node');
        // now restore the mouseover event or we won't be able to drag a 2nd time
        d3.select(domNode).select('.ghostCircle').attr('pointer-events', '');
        updateTempConnector();
        if (draggingNode !== null) {
            update(root);
            // centerNode(draggingNode);
            draggingNode = null;
        }
    }

    var events = {
        addNode: (d) => {
            d.children = d.children || []
            d.children.push({
                "name": "Child",
                "children": []
            })
            width = 120*d.children.length;
            update(d)
        },
        removeNode: (d) => {
            d.parent.children = d.parent.children.filter(c => {
                return c.id != d.id;
            })
            update(d.parent);
        },
        toggleNode: (d) => {
            if (d.children) {
                if (d.children.length) {
                    $(d3.event.target).toggleClass('fa-eye fa-eye-slash')
                }
                d._children = d.children;
                d.children = null;
            } else {
                if (d._children.length) {
                    $(d3.event.target).toggleClass('fa-eye fa-eye-slash')
                }
                d.children = d._children;
                d._children = null;
            }
            update(d);
        }
    }
}