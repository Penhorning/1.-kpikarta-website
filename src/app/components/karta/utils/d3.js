'use strict';

var nodeToHTML = require("./nodeTemplates/nodeToHTML.js");

var levelDepth = [];
var levelHeight = 0;
let width2;
var getSVGSize = (tree,level=0)=>{
    var children = (tree.children || tree._children || []);
    width2 = $(".karta_column").width();
    if(!level){
        levelDepth = [children.length*170 || width2];
    } else {
        if(!levelDepth[level]){
            levelDepth[level] = children.length*170
        } else {
            levelDepth[level] += children.length*170
        }
    }
    if((level+1)*65 > levelHeight){
        levelHeight = (level+1)*65;
    }

    children.forEach(child=>{
        getSVGSize(child,level+1);
    })
    return {
        width:levelDepth.reduce((a,b)=>a>b?a:b) < width2 ? width2 : levelDepth.reduce((a,b)=>a>b?a:b),
        height:levelHeight
    };
}
var tree = null,selectedNode = null,root = null,
dragStarted = null,nodes = null, domNode = null,parentLink = null;
var draggingNode = null, links = null, nodePaths = null,nodesExit = null;

module.exports = function BuildKPIKarta(treeData, treeContainerDom, options) {
    var margin = { top: 0, right: 0, bottom: 20, left: 0 };
    var width = window.screen.width - margin.right - margin.left;
    var height = window.screen.height - margin.top - margin.bottom;
    var svgSize = getSVGSize(treeData);
    var width = svgSize.width;
    var height = svgSize.height;
    var i = 0, duration = 750;
    tree = d3.layout.tree()
        .nodeSize([90, 60])
        .separation(function (a, b) {
            return a.parent == b.parent ? 1 : 1.25;
        });
    //   .size([height, width])
    options.updateNode = updateNode;
    options.updateNewNode = updateNewNode;
    options.buildOneKartaDivider = buildOneKartaDivider;
    // options.removeOneKartaDivider = removeOneKartaDivider;

    var diagonal = d3.svg.diagonal()
        .projection(function (d) { return [d.x + 45, d.y + 30]; });
    var svg = d3.select(treeContainerDom).append("svg")
        .attr("width",width)
        .attr("height",height)
        .append("g")
        .attr("transform", "translate(" + ((width / 2)-45) + "," + (margin.top) + ")");
    root = treeData;

    // Setup lining
    buildKartaDivider();

    // Drag/Drop
//     var dragListener = d3.behavior.drag()
// .on("dragstart", function(d) {
//     if (d == root) {
//         return;
//     }
//     dragStarted = true;
//     nodes = tree.nodes(d);
//     d3.event.sourceEvent.stopPropagation();
//     // it's important that we suppress the mouseover event on the node being dragged. Otherwise it will absorb the mouseover event and the underlying node will not detect it d3.select(this).attr('pointer-events', 'none');
// }).on("drag", function(d) {
//     if (d == root) {
//         return;
//     }
//     if (dragStarted) {
//         domNode = this;
//         initiateDrag(d, domNode);
//     }

//     // get coords of mouseEvent relative to svg container to allow for panning
//     // relCoords = d3.mouse($('svg').get(0));
//     // if (relCoords[0] < panBoundary) {
//     //     panTimer = true;
//     //     pan(this, 'left');
//     // } else if (relCoords[0] > ($('svg').width() - panBoundary)) {

//     //     panTimer = true;
//     //     pan(this, 'right');
//     // } else if (relCoords[1] < panBoundary) {
//     //     panTimer = true;
//     //     pan(this, 'up');
//     // } else if (relCoords[1] > ($('svg').height() - panBoundary)) {
//     //     panTimer = true;
//     //     pan(this, 'down');
//     // } else {
//     //     try {
//     //         clearTimeout(panTimer);
//     //     } catch (e) {

//     //     }
//     // }

//     d.x0 += d3.event.dy;
//     d.y0 += d3.event.dx;
//     var node = d3.select(this);
//     node.attr("transform", "translate(" + d.y0 + "," + d.x0 + ")");
//     updateTempConnector();
// }).on("dragend", function(d) {
//     if (d == root) {
//         return;
//     }
//     domNode = this;
//     if (selectedNode && draggingNode) {
//         // now remove the element from the parent, and insert it into the new elements children
//         var index = draggingNode.parent.children.indexOf(draggingNode);
//         if (index > -1) {
//             draggingNode.parent.children.splice(index, 1);
//         }
//         if (typeof selectedNode.children !== 'undefined' || typeof selectedNode._children !== 'undefined') {
//             if (typeof selectedNode.children !== 'undefined') {
//                 selectedNode.children.push(draggingNode);
//             } else {
//                 selectedNode._children.push(draggingNode);
//             }
//         } else {
//             selectedNode.children = [];
//             selectedNode.children.push(draggingNode);
//         }
//         // Make sure that the node being added to is expanded so user can see added node is correctly moved
//         // expand(selectedNode);
//         endDrag();
//     } else {
//         endDrag();
//     }
// });
    // Drag/Drop

    // Find max depth of subphases
    function getPhaseDepth(node){
        return options.phases().map(item => item.id).indexOf(node.phaseId);
    }
    var initialDepth = getPhaseDepth(root);
    update(root);

    function update(source) {
        // Compute the new tree layout.
        var svgSize = getSVGSize(root);
        var svg = d3.select('#karta-svg svg')
        .attr("width",svgSize.width)
        .attr("height",svgSize.height)
        .select('g')
        .attr("transform", "translate(" + ((svgSize.width / 2)) + "," + (margin.top) + ")");
        buildKartaDivider();
        var nodes = tree.nodes(root).reverse(),
            links = tree.links(nodes);

        // Normalize for fixed-depth.
        nodes.forEach(function (d) {
            let children = (d.parent || {children:[]}).children;
            let hasSubPhases = children.find(item => options.subPhases().map(item => item.id).indexOf(item));
            if (hasSubPhases) {
                let subPhaseDepth = getPhaseDepth(d, 0);
                d.y = (subPhaseDepth)* 65;
            }
            else d.y = (d.depth+initialDepth) * 65;
        });
        // Declare the nodes…
        var node = svg.selectAll("g.node")
            .data(nodes, function (d) { return d.id || (d.id = ++i); });
        // Enter the nodes.
        var nodeEnter = node.enter().append("g")
            // .call(dragListener)
            .attr("class", "node")
            .attr("width", 93)
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
            .attr("width", 93)
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
                    d.source.y += 25;
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

    function initiateDrag(d, domNode) {
        draggingNode = d;
        // d3.select(domNode).select('.ghostCircle').attr('pointer-events', 'none');
        // d3.selectAll('.ghostCircle').attr('class', 'ghostCircle show');
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

    function buildKartaDivider() {
        svg.selectAll('.karta_divider').remove();
        (new Array(parseInt($(".karta_column").height() / 65))).fill(0).forEach((val, index) => {
            var pathGenerator = d3.svg.line();
            width2 = $(".karta_column").width();
            svg.append('path')
                .attr("class", "karta_divider")
                .attr('stroke', 'lightgrey')
                .attr('stroke-width', '1px')
                .attr('d', pathGenerator([[-width2, (index + 1) * 65], [width2, (1 + index) * 65]]));
        });
    }

    function buildOneKartaDivider() {
        var pathGenerator = d3.svg.line();
        width2 = $(".karta_column").width();
        svg.append('path')
            .attr("class", "karta_divider")
            .attr('stroke', 'lightgrey')
            .attr('stroke-width', '1px')
            .attr('d', pathGenerator([[-width2, 65], [width2, 65]]));
    }
    // function removeOneKartaDivider() {
    //     let dividers = svg.selectAll('.karta_divider')[0];
    //     // console.log(dividers)
    //     (dividers.length - 1).remove();
    // }

    $(document).on('click', '#sidebarCollapse', function () {
        width2 = $(".karta_column").width();
        d3.select('#karta-svg svg')
        .attr("width", width2);
        buildKartaDivider();
    });

    function updateNode(d, param = {}) {
        // d.children[d.children.length-1].phaseId = param.phaseId;
        // d.children[d.children.length-1] = {...d.children[d.children.length-1], ...param};
        var ttt = `
            <p class="py-1">
                <span class="d-block" title="${d.name}">${d.name || ''}</span>
                <span class="font-weight-bold">(${d.percentage || 0}%)</span>
            </p>`;
        $(`.node-text[nodeid=${d.id}]`).html(ttt);
        $(`.node-text[nodeid=${d.id}]`).css('color',d.text_color);
        $(`.node-text[nodeid=${d.id}]`).css('font-family',d.font_style);
        $(`.node-text[nodeid=${d.id}]`).css('text-align',d.alignment);
    }
    function updateNewNode(parent, d) {
        parent.children = parent.children || []
        d.children = [];
        parent.children.push(d);
        update(parent);
        update(root);
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
            // d.children = d.children || []
            // d.children.push({
            //     "name": "Child",
            //     "children": []
            // })
            // update(d);
        },
        addNodeRight: (d) => {
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
                    $(d3.event.target).toggleClass('fa-chevron-circle-down fa-chevron-circle-up')
                }
                d._children = d.children;
                d.children = null;
            } else {
                if (d._children.length) {
                    $(d3.event.target).toggleClass('fa-chevron-circle-down fa-chevron-circle-up')
                }
                d.children = d._children;
                d._children = null;
            }
            update(d);
        }
    }
}