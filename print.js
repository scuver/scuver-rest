const express = require("express");
const ptp = require("pdf-to-printer");
const fs = require("fs");
const path = require("path");
const cors = require('cors')({origin: '*'});
const { exec } = require('child_process');

const app = express()
const port = 3222
app.use(express.json({
  extended: true,
  limit: '50mb'
}));
app.use( express.urlencoded( {
  extended: true,
  limit: '50mb'
} ) )

app.options('/*', function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.end();
});

app.post('/printPdf', express.raw({ type: 'application/pdf', limit: '200mb' }), (req, res) => {
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
  const tmpFilePath = path.join(`/tmp/${Math.random().toString(36).substr(7)}.pdf`);
  let base64String = pdf;
  let binaryString = window.atob(base64String);
  let len = binaryString.length;
  let bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  fs.writeFileSync(tmpFilePath, bytes, 'binary');

  exec(`lp -d ${printer} ${tmpFilePath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error printing PDF: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Error output: ${stderr}`);
      return;
    }
    console.log(`PDF sent to printer: ${stdout}`);
    fs.unlinkSync(tmpFilePath);  // Clean up the temp file
  });
};
