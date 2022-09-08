
/*
 * Return the HTML representation of a node.
 */
module.exports = (node, source) => {
  if (node.phaseId === "62b079b0c389310e2c74f58c") {
    return `
    <div id="nodeItem" nodeid=${node.id} class="align-self-center d-flex">
      <div class="center-options" style="right: 47px;">
        <div class="option remove-item"><i id="removeNode" class="fa fa-minus-circle"></i></div>
      </div>
      <div id="nodeItem" nodeid=${node.id} class="node-text node-body" style="font-family:${node.font_style};text-align:${node.alignment};color:${node.text_color}">${node.name || ''} <b>(${node.percentage || 0}%)</b></div>
    </div>`;
  } else if (node.phaseId === "62b079b4c389310e2c74f58d") {
    return `
    <div id="nodeItem" nodeid=${node.id} class="align-self-center d-flex">
      <div id="nodeItem" nodeid=${node.id} class="node-text node-body" style="font-family:${node.font_style};text-align:${node.alignment};color:${node.text_color}">${node.name || ''}</div>
    </div>`;
  } else {
    return `
    <div id="nodeItem" nodeid=${node.id} class="align-self-center d-flex">
      <div class="left-options">
        <div class="option add-item"><i id="addNodeRight" class="fa fa-plus-circle"></i></div>
      </div>
      <div class="center-options">
        <div class="option add-item"><i id="addNode" class="fa fa-plus-circle"></i></div>
        <div class="option remove-item"><i id="removeNode" class="fa fa-minus-circle"></i></div>
        <div class="option toggle-item"><i id="toggleNode" class="fa ${node.children?'fa-chevron-circle-up':'fa-chevron-circle-up'}"></i></div>
      </div>
      <div id="nodeItem" nodeid=${node.id} class="node-text node-body" style="font-family:${node.font_style};text-align:${node.alignment};color:${node.text_color}">
        <span class="tests" title="${node.name}">${node.name || ''}</span> <span><b>(${node.percentage || 0}%)</b></span>
      </div>
      <div class="right-options">
        <div class="option add-item"><i id="addNodeRight" class="fa fa-plus-circle"></i></div>
      </div>
    </div>`;
  }
}