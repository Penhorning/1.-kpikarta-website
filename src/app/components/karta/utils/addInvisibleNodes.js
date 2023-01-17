function addNodes(params, phases) {
  let children = (params.children || []);

  if (children.length > 0) {
    let modified_childrens = [];
    
    for (let i = 0; i < children.length; i++ ) {
      let child = children[i];

      let parentPhaseIndex = phases.map(item => item.id).indexOf(params.phaseId);
      let childPhaseIndex = phases.map(item => item.id).indexOf(child.phaseId);

      let invisibleNodeObject, insertFinalNode = false;
      function setInvisibleNode(invisibleNodeObject, node) {
        if (invisibleNodeObject.children.length > 0) setInvisibleNode(invisibleNodeObject.children[0], node);
        else if (insertFinalNode) {
          node.children.push(child);
          invisibleNodeObject.children.push(node);
        } else invisibleNodeObject.children.push(node);
      }
      if ((childPhaseIndex - parentPhaseIndex) > 1) {
        for (let j=0; j<(childPhaseIndex-parentPhaseIndex)-1; j++) {
          let data = {
            name: "Invisible",
            isInvisible: true,
            phaseId: phases[parentPhaseIndex + (j+1)].id,
            phase: phases[parentPhaseIndex + (j+1)],
            parentId: params.id,
            invisibleId: `${j}_${params.id}`,
            weightage: child.weightage,
            children: []
          }
          if (j === (childPhaseIndex-parentPhaseIndex)-2) insertFinalNode = true;
          if (!invisibleNodeObject) invisibleNodeObject = data;
          else setInvisibleNode(invisibleNodeObject, data);
        }
        modified_childrens.push(invisibleNodeObject);
      }
      if (!insertFinalNode) {
        let childData = addNodes(child, phases);
        modified_childrens.push(childData);
      }
    }
    params.children = modified_childrens;
    return params;
  } else return params;
}

export function addInvisibleNodes(tree, phases) {
  const children = (tree.children || tree._children || []);

  // if (children.length > 0) {
  //   let d = addNodes(tree, phases);
  //   console.log(d);
  //   return d;
  // }
  // else return tree;
  return tree;
}