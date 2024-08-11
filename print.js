const express = require("express");
const ptp = require("pdf-to-printer");
const path = require("path");
const { exec } = require('child_process');
const cors = require('cors')({origin: '*'});
const https = require('https');
var http = require('http');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const { Parser } = require('escpos-parser');
const { Buffer } = require('buffer');

const options = {
  key: fs.readFileSync(__dirname + '/server.key'), // replace it with your key path
  cert: fs.readFileSync(__dirname + '/server.crt'), // replace it with your certificate path
}

// const { ThermalPrinter, PrinterTypes, CharacterSet, BreakLine } = require('node-thermal-printer');
//
// const escpos = require('escpos');
// escpos.USB = require('escpos-usb');
// const device  = new escpos.USB();
//
// const options = { encoding: "GB18030" /* default */ }
// const printer = new escpos.Printer(device, options);

const { Printer, Image } = require("@node-escpos/core");
const USB = require("@node-escpos/usb-adapter");
const Network = require("@node-escpos/network-adapter");

const app = express()
app.use(express.json({
  extended: true,
  limit: '50mb'
}));
app.use( express.urlencoded( {
  extended: true,
  limit: '50mb'
} ) )
app.use(cors);

app.options('/*', function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.end();
});

app.post('/printEscpos', express.raw({ type: 'application/json', limit: '200mb' }), (req, res) => {
  return cors(req, res, () => {
    console.log('Print new escpos', req.body);
    return convertBase64EscposToPdf(req.body.escpos, 'temp.pdf').then(() => res.send('OK')).catch(e => {
      console.log('e', e);
      res.status(400).send(e);
    });
  });
})

app.post('/printPdf', express.raw({ type: 'application/pdf', limit: '200mb' }), (req, res) => {
  return cors(req, res, () => {
    console.log('Print new pdf', req.body);
    return printPdf(req.query.printer || 'TasticPrinter', req.body).then(() => res.send('OK')).catch(e => {
      console.log('e', e);
      res.status(400).send(e);
    });
  });
})


// Function to convert base64 to PDF
function convertBase64EscposToPdf(base64String, outputFilePath) {
  // Decode base64 to binary
  const escposBuffer = Buffer.from(base64String, 'base64');

  // Parse the ESC/POS commands
  const parser = new Parser();
  const parsed = parser.parse(escposBuffer);

  // Create a new PDF document
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(outputFilePath));

  // Iterate through the parsed commands and render to PDF
  parsed.commands.forEach(command => {
    switch (command.name) {
      case 'text':
        doc.text(command.data.toString('utf-8'));
        break;
      case 'linefeed':
        doc.moveDown();
        break;
      case 'image':
        // Handle image printing here (not fully implemented, requires decoding image data)
        break;
      case 'drawLine':
        doc.moveTo(doc.x, doc.y).lineTo(doc.page.width - doc.x, doc.y).stroke();
        break;
      // Handle other ESC/POS commands as needed
      default:
        console.log(`Unknown command: ${command.name}`);
    }
  });

  // Finalize the PDF file
  doc.end();
}


async function printEscpos(escpos, qrcode) {
  const device = new USB();
  // const device = new Network('192.168.68.104', 9100);
  await device.open(async function(err){
    if(err) {
      throw err;
    }
    const result = Buffer.from(escpos, 'base64');
    const options = { encoding: "GB18030" /* default */ }
    let printer = new Printer(device, options);
    if (qrcode) {
      await printer.qrimage(qrcode);
    }
    await printer.raw(result);
    await printer.close();
  });
  // await device.open(async function(err){
  //   if(err) {
  //     throw err;
  //   }
  //   const options = { encoding: "GB18030" /* default */ }
  //   let printer = new Printer(device, options);
  //   await printer.qrcode(qrcode);
  //   return printer.cut().close();
  // });
}

const printPdf = async (printer, pdf) => {
  const tmpFilePath = path.join(`/tmp/${Math.random().toString(36).substr(7)}.pdf`);
  let binaryString = Buffer.from(pdf, 'base64').toString('utf8');
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


http.createServer(app).listen(3222);
https.createServer(options, app).listen(3333);

// app.listen(port, () => {
//   console.log(`Print API listening on port ${port}`)
// })

// app.post('/printPdf', express.raw({ type: 'application/pdf', limit: '200mb' }), (req, res) => {
//   return cors(req, res, () => {
//     console.log('Print new pdf', req.body);
//     return printPdf(req.query.printer || 'TasticPrinter', req.body).then(() => res.send('OK')).catch(e => {
//       console.log('e', e);
//       res.status(400).send(e);
//     });
//   });
// })

// printEscpos('G0AKG2ExGyEgU2N1dmVyChshAE1vZGVybiBNYXJhdGhvbiBMZGEKGyEATGFyZ28gZGEgQm9hdmlzdGEsIE4ubyAyIC0gMS5vIER0bwoyNzgwLTIwNSBPZWlyYXMKTklGOiA1MTQ0NzIzNTkKV2Vic2l0ZTogc2N1dmVyLnB0CnNjdXZlcnB0QGdtYWlsLmNvbQpUZWwuOiA5MTIgMjg3IDk2NwpUbG0uOiA5MTIgMjg3IDk2NwpDYXNjYWlzCkNhcGl0YWw6IEVVUiA1MS4wMCBFVVIKG2EwLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQobYTBGYXR1cmEgUmVjaWJvICAgICAgICAgICAgIEZSIDAxUDIwMjQvMzA0Ci0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0KT3JpZ2luYWwgICAgICAgICAgICAgICAgMjAyNC0wNi0yNSAxOToyNgoKTklGOiAtLS0tLS0tLS0KTm9tZTogQ29uc3VtaWRvciBGaW5hbApNb3JhZGE6IAoKLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQpSZWZlcmVuY2lhIFByb2R1dG8gICAgICAgICAgICAgICAgVG90YWwKICBRdGQuIHggUHJlY28gKElWQSkKLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQpWMS1GMjg1NS0yNDA2MjU5NSAgICAgICAgICAgICAgICAgIDUwLDE2CjEgRnJhbmdvCiAgMiB4IDI1LDA4ICgyMyUpCi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0KChshIFRvdGFsICAgICAgRXVyIDUwLDE2ChshAEFjZXJ0byBkZSBDb250YXMgICAgICAgICAgICAgICBFdXIgNTAsMTYKCi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0KJUlWQSAgICAgICAgQmFzZSAgICAgICBJVkEgICAgICAgICBUb3RhbAotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tCjIzJSAgICAgICAgNDAsNzggICAgICA5LDM4ICAgICAgICAgNTAsMTYKLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQoKVi8gUmVmLiBVQkVSX0RFRTRGCiAKG2ExQVRDVUQ6SkpGM04zVzMtMzA0CgobYTFpV3hoLVByb2Nlc3NhZG8gcG9yIHByb2dyYW1hIApjZXJ0aWZpY2FkbyBuLiAyMjMwL0FUChthMAobYTFPcGVyYWRvcjogR29uY2FsbyBHb21lcwoKT2JyaWdhZG8gcGVsYSBwcmVmZXJlbmNpYSEKG2EwG3AAYP8bSv4bbQ==')

// const printPdf = async (printerName, pdf) => {
//
//   // const options = {};
//   // if (printer) {
//   //   options.printer = printer;
//   // }
//   // console.log('Creating temp pdf file');
//   // const tmpFilePath = path.join(`${Math.random().toString(36).substr(7)}.pdf`);
//   // fs.writeFileSync(tmpFilePath, pdf, 'binary');
//   // console.log('Printing to', printer)
//   // await ptp.print(tmpFilePath, options);
//   // // await ptp.print('/tmp/pd.pdf', {});
//   // fs.unlinkSync(tmpFilePath);  // await ptp.print('/tmp/pd.pdf', {});
//
//   // let printer = new ThermalPrinter({
//   //   type: PrinterTypes.EPSON,                                  // Printer type: 'star' or 'epson'
//   //   characterSet: CharacterSet.PC852_LATIN2,                  // Printer character set
//   //   removeSpecialCharacters: false,                           // Removes special characters - default: false
//   //   lineCharacter: "=",                                       // Set character for lines - default: "-"
//   //   breakLine: BreakLine.WORD,                                // Break line after WORD or CHARACTERS. Disabled with NONE - default: WORD
//   //   options:{                                                 // Additional options
//   //     timeout: 5000                                           // Connection timeout (ms) [applicable only for network printers] - default: 3000
//   //   }
//   // });
//   // console.log('printer', printer);
//   // await printer.raw(Buffer.from("Hello world"));
//
//
//
//   device.open(async function(err){
//     if(err) {
//       // handle error
//       return
//     }
//
//
//   // printer
//   //   .font("a")
//   //   .align("ct")
//   //   .style("bu")
//   //   .size(1, 1)
//   //   .text("May the gold fill your pocket")
//   //   .text("恭喜发财")
//   //   .barcode(112233445566, "EAN13", { width: 50, height: 50 })
//   //   .table(["One", "Two", "Three"])
//   //   .tableCustom(
//   //     [
//   //       { text: "Left", align: "LEFT", width: 0.33, style: "B" },
//   //       { text: "Center", align: "CENTER", width: 0.33 },
//   //       { text: "Right", align: "RIGHT", width: 0.33 },
//   //     ],
//   //     { encoding: "cp857", size: [1, 1] }, // Optional
//   //   )
//
//   // inject qrimage to printer
//   // printer = await printer.qrimage("https://github.com/node-escpos/driver")
//   // // inject image to printer
//   // printer = await printer.image(
//   //   image,
//   //   "s8" // changing with image
//   // )
//
//     printer.raw(pdf);
//
//   printer
//     .cut()
//     .close()
// });
//   return true;
// }
