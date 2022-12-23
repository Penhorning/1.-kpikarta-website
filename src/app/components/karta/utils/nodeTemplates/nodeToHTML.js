
/*
 * Return the HTML representation of a node.
 */
export default (node, source) => {
  return `
    <div id="nodeItem" nodeid=${node.id} class="d-flex align-self-center">
      <div class="center-options">
        ${node.phase.name !== 'KPI' ? `<div class="option add-item"><i id="addNode" class="fa fa-plus-circle"></i></div>` : ''}
        ${node.phase.name !== 'Goal' ? `<div class="option remove-item"><i id="removeNode" class="fa fa-minus-circle"></i></div>` : ''}
        ${node.phase.name !== 'KPI' ? `<div class="option toggle-item"><i id="toggleNode" class="fa ${node.children?'fa-chevron-circle-up':'fa-chevron-circle-up'}"></i></div>` : ''}
      </div>
      <div id="nodeItem" nodeid=${node.id} class="node-text node-body" title="${node.name}" style="border-color:${node.border_color};">
        <div class="node_body_disable">
          <p class="py-1" id="nodeItem" style="font-family:${node.font_style};text-align:${node.alignment};color:${node.text_color}">
            <span id="nodeItem" class="d-block short_text">${node.name || ''}</span>
            <span class="font-weight-bold nodePercentage">${node.percentage || 0}%</span>
          </p>
        </div>
      </div>
    </div>`;
}