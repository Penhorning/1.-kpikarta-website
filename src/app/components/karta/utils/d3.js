'use strict';

var nodeToHTML = require("./nodeTemplates/nodeToHTML.js").default;
const { calculateSVGSize } = require("./calculateSVGSize.js");


// var levelDepth = [];
var totalPhases = 0;
let width2, height2;
var getSVGSize = (tree) => {
    let dimensions = calculateSVGSize(tree);
    console.log(" my size rt ", dimensions);

    width2 = $(".karta_column").width();
    height2 = totalPhases * 65;
    return {
        width: dimensions.width > width2 ? dimensions.width : width2,
        height: totalPhases * 65
    }
    // height2 = $(".karta_column").height();

    // var children = (tree.children || tree._children || []);
    // width2 = $(".karta_column").width();
    // height2 = $(".karta_column").height();
    // // height2 = 455;
    // if (!level) {
    //     levelDepth = [children.length * 100 || width2];
    // } else {
    //     if (!levelDepth[level]) {
    //         levelDepth[level] = children.length * 100;
    //     } else {
    //         levelDepth[level] += children.length * 100;
    //     }
    // }
    // if ((level + 1) * 65 > levelHeight) {
    //     levelHeight = (level + 1) * 65;
    // }

    // children.forEach(child => {
    //     getSVGSize(child, level + 1);
    // })
    // // console.log(levelDepth)
    // return {
    //     width: levelDepth.reduce((a, b) => a > b ? a : b) < width2 ? width2 : levelDepth.reduce((a, b) => a > b ? a : b),
    //     height: levelHeight > height2 ? levelHeight : height2
    // };
}
var tree = null, root = null, nodes = null, parentLink = null, links = null, nodePaths = null, nodesExit = null;
// variables for drag/drop
var selectedNode = null, draggingNode = null, draggingNodeType = null, dragStarted = null, domNode = null;
var dragErrorMsg = "You cannot drag this node here";

module.exports = function BuildKPIKarta(treeData, treeContainerDom, options) {
    var margin = { top: 0, right: 0, bottom: 20, left: 0 };
    var width = window.screen.width - margin.right - margin.left;
    var height = window.screen.height - margin.top - margin.bottom;
    totalPhases = options.phases().length;
    var svgSize = getSVGSize(treeData);
    var width = svgSize.width;
    var height = svgSize.height;
    var i = 0, duration = 750;
    tree = d3.layout.tree()
        .nodeSize([90, 60])
        // .separation(function (a, b) {
        //     return a.parent == b.parent ? 1 : 1.25;
        // });
    //   .size([height, width]);
    options.update = update;
    options.updateNode = updateNode;
    options.updateNewNode = updateNewNode;
    options.updateRemovedNode = updateRemovedNode;
    options.hightlightNode = hightlightNode;
    options.getBase64Image = getBase64Image;
    options.exportAsImage = exportAsImage;
    options.exportAsPDF = exportAsPDF;
    options.inventoryDraggingNode = inventoryDraggingNode;
    options.buildOneKartaDivider = buildOneKartaDivider;
    options.removeOneKartaDivider = removeOneKartaDivider;

    options.rerender = function (data = root) {
        update(data, true);
    };

    // Context menu
    const contextMenuItems = [
        {
            title: 'Save',
            action: function(elm, d, i) {
                let node_type = "branch";
                if (d.phase.global_name === "KPI") node_type = d.node_type;
                options.events.onRightClick(d, node_type);
            }
        }
    ]
    // Get depth of nested child
    function getDepth(node) {
        let depth = 0;
        if (node.children) {
            node.children.forEach(function (d) {
                let tmpDepth = getDepth(d);
                if (tmpDepth > depth) {
                    depth = tmpDepth
                }
            });
        }
        return ++depth;
    }
    // Get phase by phase id
    function getPhase(phaseId, index = 0) {
        return options.phases()[options.phases().map(item => item.id).indexOf(phaseId) + index]
    }
    // Get phase index by phase id
    function getPhaseIndex(phaseId) {
        return options.phases().map(item => item.id).indexOf(phaseId);
    }
    // Check drop condition
    function isDroppable(selectedNode, draggingNode, isDraggingInventory = false) {
        // Getting depth
        const draggingDepth = getDepth(draggingNode);
        const selectedDepth = getPhaseIndex(selectedNode.phaseId);
        // Getting phase
        const selectedPhase = getPhase(selectedNode.phaseId);
        const draggingPhase = getPhase(draggingNode.phaseId);
        // Get last action phase name of just above the kpi (because we can have more than one action phase)
        const lastActionPhase = options.phases()[totalPhases-2];

        // If dragging is happening from the inventory's nodes that are not exists in the karta yet
        let exceededBy = 0;
        if (isDraggingInventory === true) {
            switch(true) {
                case selectedPhase.global_name === "KPI":
                    dragErrorMsg = "You cannot drop any node on KPI Phase!";
                    return false;
                case selectedPhase.global_name === lastActionPhase.global_name && draggingNodeType === "branch":
                    dragErrorMsg = "You can only drop Measure or Metrics node on Action Phase..!!";
                    return false;
                case selectedPhase.global_name !== lastActionPhase.global_name && (draggingNodeType === "measure" || draggingNodeType === "metric"):
                    dragErrorMsg = "You cannot drop any Branch on Action Phase..!!";
                    return false;
                case selectedPhase.global_name !== lastActionPhase.global_name && draggingNodeType === "branch" && (draggingDepth + selectedDepth) > totalPhases-2:
                    exceededBy = (draggingDepth + selectedDepth) - (totalPhases-2);
                    dragErrorMsg = `Your total node depth exceeded the last phase by ${exceededBy}! Please drop it ${exceededBy} phase above.`;
                    return false;
                default: 
                return true;
            }
        } else {
            switch(true) {
                case selectedPhase.global_name === "KPI":
                    dragErrorMsg = "You cannot drop any node on KPI Phase..!!";
                    return false;
                case selectedPhase.global_name !== lastActionPhase.global_name && draggingPhase.global_name === "KPI":
                    dragErrorMsg = "You can only drop KPI node on Action Phase..!!";
                    return false;
                case selectedPhase.global_name === lastActionPhase.global_name && draggingPhase.global_name !== "KPI":
                    dragErrorMsg = "You cannot drop Non-KPI node on Action Phase..!!";
                    return false;
                case selectedPhase.global_name !== lastActionPhase.global_name && draggingPhase.global_name !== "KPI" && (draggingDepth + selectedDepth) > totalPhases-2:
                    exceededBy = (draggingDepth + selectedDepth) - (totalPhases-2);
                    dragErrorMsg = `Your total node depth exceeded the last phase by ${exceededBy}! Please drop it ${exceededBy} phase above.`;
                    return false;
                default: 
                return true;
            }
        }
    }

    // Define the zoom function for the zoomable tree
    function zoom() {
        $("#karta-svg svg .node").css("pointer-events", "none", "cursor", "default");
        svg.selectAll('.karta_divider').remove();
        svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }
    // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
    var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);
    // Reset the zoom, when click on reset button
    $(document).on('click', '#reset_zoom_btn', function () {
        let g_attribute = d3.select("g").attr("transform");
        if (g_attribute) {
            let attributeArray = g_attribute.split(')');
            if (attributeArray.length > 2) {
                svg.transition().duration(500).attr("transform", d3.zoomIdentity);
                // Restore zoom position
                zoomListener.translate([0,0]).scale(1);
                // Draw phase lines
                buildKartaDivider();
                // Make chart editable based on the current chart mode
                let current_chart_mode = $("#chartMode").val();
                if (current_chart_mode === "enable") $("#karta-svg svg .node").css("pointer-events", "all", "cursor", "pointer");
            }
        }
    });

    var diagonal = d3.svg.diagonal()
        .projection(function (d) { return [d.x + 45, d.y + 30]; });
    var svg = d3.select(treeContainerDom).append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(zoomListener)
        .attr({ viewBox: "" + (-width / 2) + " " + 0 + " " + width + " " + height })
        .append("g");
        // .attr("transform", "translate(" + ((width / 2) - 45) + "," + (margin.top) + ")");
    root = treeData;
    // Setup lining
    buildKartaDivider();

    /* Drag and drop feature */
    // Initiate drag
    function initiateDrag(d, domNode) {
        draggingNode = d;
        d3.select(domNode).select('.ghostCircle').attr('pointer-events', 'none');
        d3.selectAll('.ghostCircle').attr('class', 'ghostCircle show');
        d3.select(domNode).attr('class', 'node activeDrag');

        d3.selectAll("g.node").sort(function (a, b) { // select the parent and sort the path's
            if (a.id != draggingNode.id) return 1; // a is not the hovered element, send "a" to the back
            else return -1; // a is the hovered element, bring "a" to the front
        });
        // if nodes has children, remove the links and nodes
        if (nodes.length > 1) {
            // remove link paths
            links = tree.links(nodes);
            nodePaths = d3.selectAll("path.link")
                .data(links, function (d) {
                    return d.target.id;
                }).remove();
            // remove child nodes
            nodesExit = d3.selectAll("g.node")
                .data(nodes, function (d) {
                    return d.id;
                }).filter(function (d, i) {
                    if (d.id == draggingNode.id) {
                        return false;
                    }
                    return true;
                }).remove();
        }

        // remove parent link
        parentLink = tree.links(tree.nodes(draggingNode.parent));
        d3.selectAll('path.link').filter(function (d, i) {
            if (d.target.id == draggingNode.id) {
                return true;
            }
            return false;
        }).remove();

        dragStarted = null;
    }
    // Drag end
    function endDrag(success = false) {
        if (selectedNode != null) $(`.node-text[nodeid=${selectedNode.id}]`).css('background', 'white');
        selectedNode = null;
        d3.selectAll('.ghostCircle').attr('class', 'ghostCircle');
        d3.select(domNode).attr('class', 'node');
        // now restore the mouseover event or we won't be able to drag a 2nd time
        d3.select(domNode).select('.ghostCircle').attr('pointer-events', '');
        if (draggingNode !== null) {
            update(root);
            if (success) options.events.updateDraggedNode(draggingNode);
            draggingNode = draggingNodeType = null;
        }
    }
    // Drag start
    var dragListener = d3.behavior.drag()
        .on("dragstart", function (d) {
            if (d == root) {
                return;
            }
            dragStarted = true;
            nodes = tree.nodes(d);
            d3.event.sourceEvent.stopPropagation();
            options.events.onDragStart(d);
            // it's important that we suppress the mouseover event on the node being dragged. Otherwise it will absorb the mouseover event and the underlying node will not detect it d3.select(this).attr('pointer-events', 'none');
        }).on("drag", function (d) {
            if (d == root) {
                return;
            }
            if (dragStarted) {
                domNode = this;
                initiateDrag(d, domNode);
            }
            
            var dX = d3.event.x - 30;
            var dY = d3.event.y - 30;
            d3.select(this).attr("transform", "translate(" + dX + ", " + dY + ")");
        }).on("dragend", function (d) {
            if (d == root) {
                return;
            } else if (draggingNode !== null && selectedNode !== null && draggingNode.parentId === selectedNode.id) {
                return endDrag(false);
            }
            domNode = this;

            if (selectedNode && draggingNode) {
                // Check whether the node is droppable or not
                if (!isDroppable(selectedNode, draggingNode)) {
                    alert(dragErrorMsg);
                    endDrag(false);
                } else {
                    // now remove the element from the parent, and insert it into the new elements children
                    const index = draggingNode.parent.children.indexOf(draggingNode);
                    const newPhaseId = getPhase(selectedNode.phaseId, 1).id;
                    if (index > -1) {
                        draggingNode.parent.children.splice(index, 1);
                    }
                    if (typeof selectedNode.children !== 'undefined' || typeof selectedNode._children !== 'undefined') {
                        if (typeof selectedNode.children !== 'undefined') {
                            draggingNode.parentId = selectedNode.id;
                            selectedNode.children.push(draggingNode);
                            draggingNode.parent = selectedNode;
                            draggingNode.phaseId = newPhaseId
                        } else {
                            draggingNode.parentId = selectedNode.id;
                            selectedNode._children.push(draggingNode);
                            draggingNode.parent = selectedNode;
                            draggingNode.phaseId = newPhaseId
                        }
                    } else {
                        selectedNode.children = [];
                        draggingNode.parentId = selectedNode.id;
                        selectedNode.children.push(draggingNode);
                        draggingNode.parent = selectedNode;
                        draggingNode.phaseId = newPhaseId
                    }
                    endDrag(true);
                }
            } else {
                endDrag(false);
            }
        });

    var overCircle = function (d, isDraggingInventory = false) {
        selectedNode = d;
        if (selectedNode != draggingNode && selectedNode !== null && draggingNode !== null) {
            let colorCode = "#76ff03";  // Green color
            // Check whether the node is droppable or not
            if (!isDroppable(selectedNode, draggingNode, isDraggingInventory)) colorCode = "#ff1744"; // Red color
            $(`.node-text[nodeid=${selectedNode.id}]`).css('background', colorCode);
        }
    };
    var outCircle = function (d) {
        if (selectedNode != draggingNode && selectedNode !== null)
            $(`.node-text[nodeid=${selectedNode.id}]`).css('background', 'white');
        selectedNode = null;
    };

    // Find max depth of phases
    function getPhaseDepth(node){
        return options.phases().map(item => item.id).indexOf(node.phaseId);
    }
    var initialDepth = getPhaseDepth(root);
    update(root);

    function update(source, isRoot = false) {
        totalPhases = options.phases().length;
        if (isRoot) root = source;
        // Compute the new tree layout.
        var svgSize = getSVGSize(root);
        width = svgSize.width;
        height = svgSize.height;
        var svg = d3.select('#karta-svg svg')
            .attr("width", svgSize.width)
            .attr("height", svgSize.height)
            .attr({ viewBox: "" + (-svgSize.width / 2) + " " + 0 + " " + svgSize.width + " " + svgSize.height })
            .select('g');
            // .attr("transform", "translate(" + ((svgSize.width / 2)) + "," + (margin.top) + ")");
        buildKartaDivider();
        var nodes = tree.nodes(root).reverse(),
            links = tree.links(nodes);

        // Normalize for fixed-depth
        nodes.forEach(function (d) { d.y = d.depth * 65; });
        // Change phase ids of every nodes when someone dragging nodes
        // nodes.forEach(function (d) {
        //     // if (d.depth >= options.phases().length) d.depth -= d.depth;
        //     // console.log("my depth ", d.depth)
        //     d.phaseId = options.phases()[d.depth].id;
        //     d.phase = options.phases()[options.phases().map(item => item.id).indexOf(d.phaseId)];
        // });
        nodes.forEach(function (d) {
            let children = (d.parent || { children: [] }).children;
            let hasSubPhases = children.find(item => options.phases().map(item => item.id).indexOf(item));
            if (hasSubPhases) {
                let subPhaseDepth = getPhaseDepth(d, 0);
                d.y = (subPhaseDepth)* 65;
            }
            else d.y = (d.depth + initialDepth) * 65;
        });
        // Declare the nodes…
        var node = svg.selectAll("g.node")
            .data(nodes, function (d) { return d.id || (d.id = ++i); });
        // Enter the nodes.
        var nodeEnter = node.enter().append("g")
            .call(dragListener)
            .attr("class", "node")
            .attr("width", 93)
            .attr("height", 60)
            .attr("transform", function (d) {
                return "translate(" + source.x + "," + source.y + ")";
            })
            .on("click", nodeclick)
            .on("contextmenu", d3.contextMenu(contextMenuItems))
            // Drag and drop from inventory
            .on("dragover", function(node) {
                d3.event.preventDefault();
                overCircle(node, true);
            })
            .on("dragleave", function(node) {
                d3.event.preventDefault();
                outCircle(node);
            })
            .on("drop", function(dropped_node) {
                if (!isDroppable(dropped_node, draggingNode, true)) alert(dragErrorMsg);
                else options.events.onInventoryDrop(draggingNode, dropped_node);

                outCircle(dropped_node);
                draggingNodeType = null;
            });
        nodeEnter
            .append("foreignObject")
            .attr("class", "mindmap-node")
            .attr("width", 93)
            .attr("height", 60)
            .html(node => nodeToHTML(node, nodeEnter));
        // phantom node to give us mouseover around it
        nodeEnter.append("foreignObject")
            .attr('class', 'ghostCircle')
            .attr("width", 93)
            .attr("height", 60)
            .attr('pointer-events', 'mouseover')
            .on("mouseover", function (node) {
                overCircle(node);
            })
            .on("mouseout", function (node) {
                outCircle(node);
            });
        // Transition nodes to their new position.
        //horizontal tree
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })
            node.select("foreignObject").html(node => nodeToHTML(node, nodeEnter));


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
            .attr("stroke", options.events.linkColor)
            .attr("stroke-width", options.events.linkWidth)
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
        if (options.events && options.events[d3.event.target.id]) {
            options.events[d3.event.target.id](d);
        }
    }

    // Draw horizontal lines for phases
    function buildKartaDivider() {
        svg.selectAll('.karta_divider').remove();
        (new Array(parseInt($(".karta_column").height() / 65))).fill(0).forEach((val, index) => {
            var pathGenerator = d3.svg.line();
            width2 = $(".karta_column").width();
            svg.append('path')
                .attr("class", "karta_divider")
                .attr('stroke', 'lightgrey')
                .attr('stroke-width', '1px')
                .attr('d', pathGenerator([[-100000, (index + 1) * 65], [100000, (1 + index) * 65]]));
        });
    }
    // Draw one horizontal line, when new child phase added
    function buildOneKartaDivider() {
        var pathGenerator = d3.svg.line();
        width2 = $(".karta_column").width();
        svg.append('path')
            .attr("class", "karta_divider")
            .attr('stroke', 'lightgrey')
            .attr('stroke-width', '1px')
            .attr('d', pathGenerator([[-width2, 65], [width2, 65]]));
    }
    // Remove horizontal lines for phases, when child phase deleted
    function removeOneKartaDivider() {
        let dividers = svg.selectAll('.karta_divider')[0];
        (dividers.length - 1).remove();
    }

    // Update node properties
    function updateNode(d, isRoot = false) {
        if (isRoot === true) root = d;
        var nodeHtml = `
            <p class="py-1" id="nodeItem">
                <span id="nodeItem" class="d-block short_text" title="${d.name}">${d.name || ''}</span>
                <span class="font-weight-bold nodePercentage">${d.percentage || 0}%</span>
            </p>`;
        $(`.node-text[nodeid=${d.id}]`).html(nodeHtml);
        $(`.node-text[nodeid=${d.id}] p`).css('color', d.text_color);
        $(`.node-text[nodeid=${d.id}] p`).css('font-family', d.font_style);
        $(`.node-text[nodeid=${d.id}] p`).css('text-align', d.alignment);
        if (d.parent) update(d.parent);
        if (d.hasOwnProperty("children") && d.children.length > 0) {
            d.children.forEach(item => updateNode(item));
        }
    }

    // Update newly added node
    function updateNewNode(parent, d) {
        parent.children = parent.children || []
        d.children = [];
        parent.children.push(d);
        update(parent);
        update(root);
        document.getElementById('karta-svg').scrollLeft += 50;
    }

    // Update Removed Node
    function updateRemovedNode(d) {
        d.parent.children = d.parent.children.filter(c => {
            return c.id != d.id;
        })
        update(d.parent);
    }

    // Dragging node from inventory
    function inventoryDraggingNode(node, node_type) {
        draggingNode = node;
        draggingNodeType = node_type;
    }

    // Hightlight nodes, while saving in catalog
    function hightlightNode(d) {
        $(`.node-text[nodeid=${d.id}]`).css('background-color', "#c1d2ef");
        if (d.hasOwnProperty("children") && d.children.length > 0) {
            d.children.forEach(item => hightlightNode(item));
        }
        
    }
    // Remove color from highlighted nodes
    function unHightlightNode(d) {
        $(`.node-text[nodeid=${d.id}]`).css('background-color', "#FFFFFF");
        if (d.hasOwnProperty("children") && d.children.length > 0) {
            d.children.forEach(item => unHightlightNode(item));
        }
    }
    // Get bas64Image of chart
    function getBase64Image(node, callback) {
        svgAsPngUri($("#karta-svg svg")[0], { scale: 2, backgroundColor: "#FFFFFF", left: -(width/2) }).then(uri => {
            unHightlightNode(node);
            callback(uri);
        });
    }

    // Export as image
    function exportAsImage(name) {
        saveSvgAsPng($("#karta-svg svg")[0], `${name}.png`, { scale: 2, backgroundColor: "#FFFFFF", left: -(width/2)});
    }
    // Export as pdf
    function exportAsPDF(name) {
        window.jsPDF = window.jspdf.jsPDF;
        svgAsPngUri($("#karta-svg svg")[0], { scale: 2, backgroundColor: "#FFFFFF", left: -(width/2) }).then(uri => {
            let imageBase64 = uri.split(',')[1];
            let svgWidth = $("#karta-svg svg").width();
            let doc = new jsPDF('1', 'px', [svgSize.width, height2]);
            doc.addImage(imageBase64, 'PNG', 0, 0, svgWidth, height2);
            doc.save(`${name}.pdf`);
        });
    }

    // Chart events
    var events = {
        addNode: (d) => { },
        addNodeRight: (d) => { },
        removeNode: (d) => {
            d.parent.children = d.parent.children.filter(c => {
                return c.id != d.id;
            })
            update(d.parent);
        },
        toggleNode: (d) => {
            if (d.children) {
                if (d.children.length) {
                    $(d3.event.target).toggleClass('fa-chevron-circle-down fa-chevron-circle-up');
                }
                d._children = d.children;
                d.children = null;
            } else {
                if (d._children.length) {
                    $(d3.event.target).toggleClass('fa-chevron-circle-down fa-chevron-circle-up');
                }
                d.children = d._children;
                d._children = null;
            }
            update(d);
        }
    }
}