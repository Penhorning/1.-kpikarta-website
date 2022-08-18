var nodeToHTML = require("./nodeTemplates/nodeToHTML.js");
module.exports = function BuildKPIKarta(treeData, treeContainerDom,options) {
    var margin = { top: 40, right: 120, bottom: 20, left: 120 };
    var width = window.screen.width - margin.right - margin.left;
    var height = window.screen.height - margin.top - margin.bottom;

    var i = 0, duration = 750;
    var tree = d3.layout.tree()
        .nodeSize([150, 100])
        .separation(function (a, b) {
            return a.parent == b.parent ? 1 : 1.25;
        });
    //   .size([height, width])


    var diagonal = d3.svg.diagonal()
        .projection(function (d) { return [d.x + 60, d.y + 40]; });
    var svg = d3.select(treeContainerDom).append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + ((width / 2) + 60) + "," + (margin.top + 10) + ")");
    var root = treeData;

    update(root);
    function update(source) {
        // Compute the new tree layout.
        var nodes = tree.nodes(root).reverse(),
            links = tree.links(nodes);

        // Normalize for fixed-depth.
        nodes.forEach(function (d) { d.y = d.depth * 100; });
        // Declare the nodes…
        var node = svg.selectAll("g.node")
            .data(nodes, function (d) { return d.id || (d.id = ++i); });
        // Enter the nodes.
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("width", 120)
            .attr("height", 80)
            .attr("transform", function (d) {
                return "translate(" + source.x + "," + source.y + ")";
                //   });
            }).on("click", nodeclick);
        nodeEnter
            .append("foreignObject")
            .attr("class", "mindmap-node")
            .attr("width", 120)
            .attr("height", 80)
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

    var events = {
        addNode: (d) => {
            d.children = d.children || []
            d.children.push({
                "name": "#" + Date.now(),
                "children": []
            })
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