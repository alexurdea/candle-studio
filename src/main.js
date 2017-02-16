import * as d3 from 'd3';
import * as _ from 'lodash';
import {generateData} from './utils';
import {Title} from './title';
import {render} from './graph';
import {storage} from './storage';
import {pushNOfLast} from './utils';
import {importCSV, exportCSV} from './csv-utils';
import './scss/main.scss';

let sessionTitle = storage.getTitle();
let data = storage.getData() || generateData(10, 1, 100);
let title = storage.getTitle();


// Title
new Title('#title', title || undefined);
render(data);


// Storage
document.querySelector('.chart-toolbar .storage-save')
  .addEventListener('click', () => storage.saveData(data));
document.querySelector('.chart-toolbar .storage-reload')
  .addEventListener('click', () => {
    data = storage.getData();
    render(data);
  });
document.querySelector('.chart-toolbar .storage-clear')
  .addEventListener('click', () => {
    data = generateData(10, 1, 100);
    render(data);
  });

document.querySelector('.chart-toolbar .add-candles')
  .addEventListener('click', () => {
    pushNOfLast(data, 5);
    render(data);
  });


// Import/export
const csvImportCb = _.curry(importCSV)((_data) => {
  data = _data;
  render(data);
});
document.querySelector('#file-upload')
  .addEventListener('change', csvImportCb, false);
document.querySelector('#file-download')
  .addEventListener('click', () => exportCSV(data));


// DEV
window.d3 = d3;
window._ = _;
window.data = data; // debug
