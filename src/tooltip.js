export function init (node, dispatch) {
  dispatch.on('tooltip.on', (state, d, i) => {
    if (state !== true) {
      node.classList.remove('visible');
      node.querySelector('.candle-num').innerHTML = '';
      node.querySelector('.open-val').innerHTML = '';
      node.querySelector('.close-val').innerHTML = '';
      node.querySelector('.low-val').innerHTML = '';
      node.querySelector('.high-val').innerHTML = '';

      return;
    }

    node.querySelector('.candle-num').innerHTML = i + 1;
    node.querySelector('.open-val').innerHTML = d.open.toFixed(2, 10);
    node.querySelector('.close-val').innerHTML = d.close.toFixed(2, 10);
    node.querySelector('.low-val').innerHTML = d.low.toFixed(2, 10);
    node.querySelector('.high-val').innerHTML = d.high.toFixed(2, 10);
    node.classList.add('visible');
  });
};