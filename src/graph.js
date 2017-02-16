import * as _ from 'lodash';
import {event as currentEvent} from 'd3';
import {createForSelectionIfNotExists} from './utils';
import {init as initTooltip} from './tooltip';

const $stage = d3.select('#stage');
const stageWidth = parseInt($stage.style('width'));
const stageHeight = parseInt($stage.style('height'));

const dispatch = d3.dispatch('tooltip');

const generalStyle = {
  stroke: 'rebeccapurple',
  strokeWidth: '1px'
};

const handleHeight = 4;

initTooltip(document.querySelector('#chart-tooltip'), dispatch);

export function render (data) {
  const maxCandlesDefault = d3.max([60, data.length]);
  const minPrice = d3.min(data.map(d => d.low));
  const maxPrice = d3.max(data.map(d => d.high));

  const x = d3.scale.ordinal()
    .domain(_.range(0, maxCandlesDefault))
    .rangeBands([0, stageWidth], 0, 0.5);
  const y = d3.scale.linear()
    .domain([minPrice - 0.1 * maxPrice, maxPrice * 1.1])
    .range([0, stageHeight]);

  const yInverse = price => y.range()[1] - y(price);  // The origin of the graph is top, left in SVG

  const bandWidth = x.rangeBand();
  const candleGroup = $stage.selectAll('.candle-group')
    .data(data);
  
  candleGroup
    .enter()
      .append('g')
      .classed('candle-group', true)
      .attr('transform', (d, i) => 'translate(' + x(i) + ',0)');

  candleGroup
    .exit()
    .remove();


  candleGroup
    .attr('transform', (d, i) => 'translate(' + x(i) + ',0)')
    .attr('shape-rendering', 'crispEdges');

  // Moving the candle
  const drag = d3.behavior.drag()
    .on('drag', dragMove)
    .on('dragstart', dragStart)
    .on('dragend', dragEnd);
  // Faster to store these and not run queries more than once:
  let candleNodeParent;
  let candleShadow;
  let node;

  function dragStart () {
    node = d3.select(this);
    candleNodeParent = this.parentNode;
    candleShadow = d3.select(candleNodeParent.querySelector('.candle-shadow'));
    candleNodeParent.classList.add('dragging');
  }

  function dragMove (d) {
    const nodeY = parseInt(node.attr('y'));
    const shadowY1 = parseInt(candleShadow.attr('y1'));
    const shadowY2 = parseInt(candleShadow.attr('y2'));

    node.attr('y', nodeY + currentEvent.dy);
    candleShadow.attr('y1', shadowY1 + currentEvent.dy);
    candleShadow.attr('y2', shadowY2 + currentEvent.dy);
    Array.prototype.forEach.call(candleNodeParent.querySelectorAll('.handle'), handle =>
        handle.setAttribute('y', parseInt(handle.getAttribute('y')) + currentEvent.dy));

    Object.keys(d)
      .forEach(k => d[k] += domainDiff(currentEvent.dy));
  }

  // From the range diff to the domain diff
  function domainDiff (rangeDiff) {
    const diffSign = rangeDiff < 0 ? -1 : 1;
    const domainDiff = y.invert(Math.abs(rangeDiff)) - y.invert(y.range()[0]);

    return -1 * diffSign * domainDiff;
  }

  function dragEnd () {
    candleNodeParent.classList.remove('dragging');
  }


  // Hover behavior
  candleGroup
    .on('mouseover', (d, i) => dispatch.tooltip(true, d, i))
    .on('mouseout', d => dispatch.tooltip(false, d));


  // Background
  const candleLane = createForSelectionIfNotExists(candleGroup, 'candle-lane', 'rect');
  candleLane
    .attr('height', stageHeight)
    .attr('width', bandWidth)


  // Candle axis
  const candleAxis = createForSelectionIfNotExists(candleGroup, 'candle-axis', 'line');
  candleAxis
    .attr('x1', bandWidth/2)
    .attr('x2', bandWidth/2)
    .attr('y1', 0)
    .attr('y2', y.range()[1])
    .attr('stroke-dasharray', '1, 3')
    .style(generalStyle);


  // Shadow
  const candle = createForSelectionIfNotExists(candleGroup, 'candle', 'g');
  candleShadow = createForSelectionIfNotExists(candleGroup, 'candle-shadow', 'line');
  candleShadow
    .attr('x1', bandWidth/2)
    .attr('x2', bandWidth/2)
    .attr('y1', d => yInverse(d.low))
    .attr('y2', d => yInverse(d.high))
    .style(generalStyle);


  // Body
  const containerPadding = 0.1;
  const candleBody = createForSelectionIfNotExists(candleGroup, 'candle-body', 'rect');
  candleBody
    .attr('transform', `translate(${containerPadding * bandWidth}, 0)`)
    .attr('width', bandWidth * (1 - 2*containerPadding))
    .attr('height', d => Math.abs(y(d.close) - y(d.open)))
    .style(_.merge({
      fill: d => d.close < d.open ? 'rebeccapurple' : 'white'
    }, generalStyle))
    .attr('y', d => yInverse( d3.max([d.close, d.open]) ))
    .call(drag)
    .on('dblclick', function (d) {
      const aux = d.close;
      d.close = d.open;
      d.open = aux;

      this.style.fill = d.close < d.open ? 'rebeccapurple' : 'white';
    });


  // Delete
  const candleRemove = createForSelectionIfNotExists(candleGroup, 'candle-remove', 'g');
  const candleRemoveBg = createForSelectionIfNotExists(candleRemove, 'candle-remove-bg', 'rect');
  candleRemoveBg
    .attr('y', 0)
    .attr('width', bandWidth)
    .attr('height', 18)
    .classed('candle-remove-bg');
  const candleRemoveIcon = createForSelectionIfNotExists(candleRemove, 'candle-remove-icon', 'text');
  candleRemoveIcon
    .classed('glyphicon', true)
    .attr('y', 15)
    .attr('x', 2)
    .html('&#xe014;');
  $stage
    .selectAll('.candle-remove')
    .on('click', (d, i) => {
      data.splice(i, 1);
      render(data);
    });


  // Add to the right
  const candleAddRight = createForSelectionIfNotExists(candleGroup, 'candle-add-right', 'g');
  const candleAddRightBg = createForSelectionIfNotExists(candleAddRight, 'candle-add-right-bg', 'rect');
  candleAddRightBg
    .attr('y', 19)
    .attr('width', bandWidth)
    .attr('height', 18)
    .classed('candle-add-right-bg');
  const candleAddRightIcon = createForSelectionIfNotExists(candleAddRight, 'candle-add-right-icon', 'text');
  candleAddRightIcon
    .classed('glyphicon', true)
    .attr('y', 33)
    .attr('x', 2)
    .html('&#xe092;');
  $stage
    .selectAll('.candle-add-right')
    .on('click', (d, i) => {
      data.splice(i, 0, _.clone(d));
      render(data);
    });


  // Set all the resize handles:
  candleGroup.each(function (d) {
    const node = d3.select(this);

    const sizeOCMaxDrag = d3.behavior.drag();
    const sizeHighDrag = d3.behavior.drag();
    const sizeLowDrag = d3.behavior.drag();
    const sizeOCMinDrag = d3.behavior.drag();

    let candleGroupNode = null;
    let shadowLineNode = null;
    let bodyNode = null;

    // Open Resize Handle
    const ocmaxHandle = createForSelectionIfNotExists(node, 'ocmax-handle', 'rect');
    ocmaxHandle
      .classed('handle', true)
      .attr('y', d => yInverse(d3.max([d.close, d.open])) - handleHeight/2)
      .attr('height', handleHeight)
      .attr('width', bandWidth)
      .call(sizeOCMaxDrag);

    // High Resize Handle
    const highHandle = createForSelectionIfNotExists(node, 'high-handle', 'rect');
    highHandle
      .classed('handle', true)
      .attr('y', d => yInverse(d.high) - handleHeight/2)
      .attr('height', handleHeight)
      .attr('width', bandWidth)
      .call(sizeHighDrag);

    // Low Resize Handle
    const lowHandle = createForSelectionIfNotExists(node, 'low-handle', 'rect');
    lowHandle
      .classed('handle', true)
      .attr('y', d => yInverse(d.low) - handleHeight/2)
      .attr('height', handleHeight)
      .attr('width', bandWidth)
      .call(sizeLowDrag);

    // Close Resize Handle
    const ocminHandle = createForSelectionIfNotExists(node, 'ocmin-handle', 'rect');
    ocminHandle
      .classed('handle', true)
      .attr('y', d => yInverse(d3.min([d.close, d.open])) - handleHeight/2)
      .attr('height', handleHeight)
      .attr('width', bandWidth)
      .call(sizeOCMinDrag);

    // Set the drag behaviors
    sizeOCMaxDrag
      .on('dragstart', dragStart)
      .on('drag', dragMoveOCMax)
      .on('dragend', dragEnd);

    sizeHighDrag
      .on('dragstart', dragStart)
      .on('drag', dragMoveHigh)
      .on('dragend', dragEnd);

    sizeLowDrag
      .on('dragstart', dragStart)
      .on('drag', dragMoveLow)
      .on('dragend', dragEnd);

    sizeOCMinDrag
      .on('dragstart', dragStart)
      .on('drag', dragMoveOCMin)
      .on('dragend', dragEnd);

    function dragStart () {
      candleGroupNode = this.parentNode;
      shadowLineNode = candleGroupNode.querySelector('.candle-shadow');
      bodyNode = candleGroupNode.querySelector('.candle-body');
    }

    function dragEnd () {
      candleGroupNode = null;
      shadowLineNode = null;
      bodyNode = null;
    }

    function dragMoveOCMax (d) {
      this.setAttribute('y', parseInt(this.getAttribute('y')) + currentEvent.dy);
      bodyNode.setAttribute('y', parseInt(bodyNode.getAttribute('y')) + currentEvent.dy);
      bodyNode.setAttribute('height', parseInt(bodyNode.getAttribute('height')) - currentEvent.dy);
      d[d.close > d.open ? 'close' : 'open'] += domainDiff(currentEvent.dy);
    }

    function dragMoveHigh (d) {
      this.setAttribute('y', parseInt(this.getAttribute('y')) + currentEvent.dy);
      shadowLineNode.setAttribute('y2', parseInt(shadowLineNode.getAttribute('y2')) + currentEvent.dy);
      d.high += domainDiff(currentEvent.dy);
    }

    function dragMoveLow (d) {
      this.setAttribute('y', parseInt(this.getAttribute('y')) + currentEvent.dy);
      shadowLineNode.setAttribute('y1', parseInt(shadowLineNode.getAttribute('y1')) + currentEvent.dy);
      d.low += domainDiff(currentEvent.dy);
    }

    function dragMoveOCMin () {
      this.setAttribute('y', parseInt(this.getAttribute('y')) + currentEvent.dy);
      bodyNode.setAttribute('height', parseInt(bodyNode.getAttribute('height')) + currentEvent.dy);
      d[d.close < d.open ? 'close' : 'open'] += domainDiff(currentEvent.dy);
    }

  });
}
