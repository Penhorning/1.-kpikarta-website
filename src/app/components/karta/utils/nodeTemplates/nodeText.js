
/*
 * Return the HTML representation of a node.
 */
export default (node, source) => {
  return `<div class="text-node">${ node.name || ''} (${node.percentage || 0}%)</div>`;
}
