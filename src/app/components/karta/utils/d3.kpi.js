var BuildKPIKarta = require('./d3');
var treeData =
{
    "name": "BU Head",
    "children": [
        {
            "name": "Manager",
            "children": [
                {
                    "name": "Team Lead",
                    "children": []
                },
                {
                    "name": "Team Lead",
                    "children": []
                }, {
                    "name": "Team Lead",
                    "children": []
                },
                {
                    "name": "Team Lead",
                    "children": []
                }
            ]
        },
        {
            "name": "Manager",
            "children": [
                {
                    "name": "Team Lead",
                    "children": [{
                        "name": "Team Lead",
                        "children": [{
                            "name": "Team Lead",
                            "children": []
                        },
                        {
                            "name": "Team Lead",
                            "children": []
                        }, {
                            "name": "Team Lead",
                            "children": []
                        },
                        {
                            "name": "Team Lead",
                            "children": []
                        }]
                    },
                    {
                        "name": "Team Lead",
                        "children": []
                    }, {
                        "name": "Team Lead",
                        "children": []
                    },
                    {
                        "name": "Team Lead",
                        "children": []
                    }]
                },
                {
                    "name": "Team Lead",
                    "children": []
                }, {
                    "name": "Team Lead",
                    "children": []
                },
                {
                    "name": "Team Lead",
                    "children": []
                }
            ]
        }
    ]
};

$(document).ready(function () {
    BuildKPIKarta(treeData, "#karta-svg");
});