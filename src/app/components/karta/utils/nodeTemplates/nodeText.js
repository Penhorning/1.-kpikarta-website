
/*
 * Return the HTML representation of a node.
 */
export default (node, source) => {
  return `<div class="text-node"><span>(${node.percentage || 0}%) ${ node.name || ''}</span></div>`;
}
