export function generateData (num = 10, min, max) {
  const m = (min + max) / 2;
  const shadowSize = (max - min) / 60;
  const bodySize = (max-min)/100;
  const o = m - bodySize / 2;
  const c = m + bodySize / 2;
  const h = m + shadowSize / 2;
  const l = m - shadowSize / 2;
  const res = [];

  for (var i=0; i < num; i++) {
    res.push({
      open: o,
      high: h,
      low: l,
      close: c
    });
  }

  return res;
}

export function createForSelectionIfNotExists (parentSelection, childClass, elem) {
  parentSelection.each(function () {
    let candleLane = d3.select(this)
      .select('.' + childClass);

    if (candleLane.empty()){
      d3.select(this)
        .append(elem)
        .classed(childClass, true);
    }

  });
  return parentSelection.selectAll('.' + childClass);
}

export function pushNOfLast (arr, n) {
  const last = arr[arr.length - 1];

  for (var i=1; i<=n; i++) {
    arr.push(_.clone(last));
  }
}