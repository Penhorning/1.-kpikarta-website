
/*
 * Return the HTML representation of a node.
 */
export default (node, source) => {
  return `<div class="text-node">(${node.percentage || 0}%) ${ node.name || ''}</div>`;
}
