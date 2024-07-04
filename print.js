const express = require("express");
const ptp = require("pdf-to-printer");
const fs = require("fs");
const path = require("path");
const cors = require('cors')({origin: '*'});

const app = express()
const port = 3222
app.use(express.json());
app.use(express.bodyParser({limit: '200mb'}));

app.options('/*', function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.end();
});

app.post('/printPdf', express.raw({ type: 'application/pdf' }), (req, res) => {
  return cors(req, res, () => {
    console.log('Print new pdf', req.body);
    return printPdf(req.query.printer || 'TasticPrinter', req.body).then(() => res.send('OK')).catch(e => {
      console.log('e', e);
      res.status(400).send(e);
    });
  });
})

app.listen(port, () => {
  console.log(`Print API listening on port ${port}`)
})

const printPdf = async (printer, pdf) => {
  const options = {};
  if (printer) {
    options.printer = printer;
  }
  const tmpFilePath = path.join(`${Math.random().toString(36).substr(7)}.pdf`);
  fs.writeFileSync(tmpFilePath, pdf, 'binary');
  await ptp.print(tmpFilePath, options);
  // await ptp.print('/tmp/pd.pdf', {});
  fs.unlinkSync(tmpFilePath);  // await ptp.print('/tmp/pd.pdf', {});

  return true;
}
