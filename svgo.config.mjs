export default {
  multipass: true,
  js2svg: { indent: 2, pretty: true },
  plugins: [
    'preset-default',
    { name: 'removeDimensions', active: true },
    { name: 'addAttributesToSVGElement', params: { attributes: [{ role: 'img' }] } },
    { name: 'prefixIds', params: { prefix: 'sv-' } },
    { name: 'removeAttrs', params: { attrs: '(data-name|fill-rule|clip-rule)' } },
    { name: 'removeEmptyAttrs', active: true },
    { name: 'removeEmptyContainers', active: true },
    { name: 'removeEmptyText', active: true },
    { name: 'removeHiddenElems', active: true },
    { name: 'removeUselessDefs', active: true },
    { name: 'removeUselessStrokeAndFill', active: true },
    { name: 'removeViewBox', active: false },
    { name: 'removeXMLNS', active: false },
    { name: 'sortAttrs', active: true },
    { name: 'sortDefsChildren', active: true }
  ]
};
