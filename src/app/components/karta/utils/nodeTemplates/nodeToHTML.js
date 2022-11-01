
/*
 * Return the HTML representation of a node.
 */
module.exports = (node, source) => {
  if (node.phase.name === "KPI") {
    return `
    <div id="nodeItem" nodeid=${node.id} class="align-self-center da-flex">
      <div class="center-options">
        <div class="option remove-item"><i id="removeNode" class="fa fa-minus-circle"></i></div>
      </div>
      <div id="nodeItem" nodeid=${node.id} class="node-text node-body">
        <p class="py-1" id="nodeItem" style="font-family:${node.font_style};text-align:${node.alignment};color:${node.text_color}">
          <span id="nodeItem" class="d-block short_text" title="${node.name}">${node.name || ''}</span>
          <span class="font-weight-bold nodePercentage">${node.percentage || 0}%</span>
        </p>
      </div>
    </div>`;
  } else {
    return `
    <div id="nodeItem" nodeid=${node.id} class="align-self-center d-flex">
      <div class="center-options">
        <div class="option add-item"><i id="addNode" class="fa fa-plus-circle"></i></div>
        <div class="option remove-item"><i id="removeNode" class="fa fa-minus-circle"></i></div>
        <div class="option toggle-item"><i id="toggleNode" class="fa ${node.children?'fa-chevron-circle-up':'fa-chevron-circle-up'}"></i></div>
      </div>
      <div id="nodeItem" nodeid=${node.id} class="node-text node-body">
        <p class="py-1" id="nodeItem" style="font-family:${node.font_style};text-align:${node.alignment};color:${node.text_color}">
          <span id="nodeItem" class="d-block short_text" title="${node.name}">${node.name || ''}</span>
          <span class="font-weight-bold nodePercentage">${node.percentage || 0}%</span>
        </p>
      </div>
    </div>`;
  }
}