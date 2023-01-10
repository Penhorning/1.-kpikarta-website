let leftMostLeafNodes = {};

function calculateDimensions(params, level = 0) {
  let children = (params.children || params._children || []);
  if (children.length > 0) {
    let halfWeightage = parseInt(children.length/2);
    let hw = halfWeightage;

    let childrenType = "odd";
    if (children.length % 2 === 0) childrenType = "even";

    let modified_children = children.map((child, index) => {
      let isLeafNode = true;
      if (child.hasOwnProperty("children") && child.children.length > 0) isLeafNode = false;
      let weightValue = Math.abs(params.hw + hw);
      if (isLeafNode && !leftMostLeafNodes.hasOwnProperty(params.id)) leftMostLeafNodes[params.id] = weightValue;
      child.level = level;
      child.hw = weightValue;
      child.isLeafNode = isLeafNode;
      
      if (childrenType === "odd") hw = hw-1;
      else {
        if (hw > 1 && index < halfWeightage) hw = hw-1;
        else if (hw === 1 && index === halfWeightage) hw = 1;
        else hw = hw+1 > halfWeightage ? hw : hw+1;
      }
      return calculateDimensions(child, level+1);
    });
    params.children = modified_children;
    return params;
  } else return params;
}

export function calculateSVGSize(tree) {
  const children = (tree.children || tree._children || []);

  if (children.length > 0) {
    tree.level = 0;
    tree.hw = 0;
    tree = calculateDimensions(tree, 1);
    
    let width = 0;
    console.log(leftMostLeafNodes)
    for (let key in leftMostLeafNodes) {
      width += 100 * leftMostLeafNodes[key];
    }
    return { width }
  }
  else return { width: 100 }
}