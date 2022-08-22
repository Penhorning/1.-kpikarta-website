
/*
 * Return the HTML representation of a node.
 */
module.exports = (node, source) => {
  return `
  <div id="nodeItem" nodeid=${node.id} class="node-body">
    <div class="options">
      <div class="option add-item"><i id="addNode" class="fa fa-plus-circle"></i></div>
      <div class="option remove-item"><i id="removeNode" class="fa fa-minus-circle"></i></div>
      <div class="option toggle-item"><i id="toggleNode" class="fa ${node.children?'fa-eye-slash':'fa-eye'}"></i></div>
    </div>
    <div id="nodeItem" nodeid=${node.id} class="node-text" style="font-family:${node.font_style};text-align:${node.alignment};color:${node.text_color}">${node.name || ''}</div>
  </div>`;
}