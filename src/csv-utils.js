// See README.md for expected csv format
import * as csvtojson from 'csvtojson';

export function importCSV (cb, ev) {
  const reader = new FileReader();

  reader.addEventListener('load', (e) => {
    let csv = e.target.result;

    // replace the col names, which can be like 'SSEC.Open', 'SSEC.Close', or just 'Open', 'Close' to 'open', 'close' etc
    let csvSplit = csv.split(/\r?\n/);
    if (csvSplit.length > 1) {
      const colNames = csvSplit[0]
        .split(',')
        .map(cn => cn
            .toLowerCase()
            .replace(/"/g, '')
            .replace(/^.*\./, ''))
        .map(cn => `"${cn}"`)
        .join(',');
      csvSplit[0] = colNames;
      csv = csvSplit.join('\r\n');
    }

    let converter = new csvtojson.Converter({
      flatKeys: true
    });
    converter.fromString(csv, function(err, result){
      if (err) throw new Error(err);
      cb(result);
    });
  });

  reader.readAsText(ev.target.files[0]);
  ev.target.value = '';
};

export function exportCSV (data) {
  const csv = '"open","high","low","close"\r\n'
    + data
      .map(d => [d.open, d.high, d.low, d.close].join(','))
      .join('\r\n');

  const a = document.createElement('a');
  a.href = 'data:attachment/csv,' + encodeURIComponent(csv);
  a.target = '_blank';
  a.download = 'data.out.csv';
  document.body.appendChild(a);
  a.click();
};