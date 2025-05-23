
/*
 * Return the HTML representation of a node.
 */
export default (node, source, options=null) => {
  console.log('nodeText',  options.fontSize);
  return `<div class="text-node"><span style="font-size: ${options?.fontSize ? options.fontSize : 10}px;">(${node.percentage || 0}%) ${ node.name || ''}</span></div>`;
}
