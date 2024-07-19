const express = require("express");
// const ptp = require("pdf-to-printer");
// const fs = require("fs");
// const path = require("path");
const cors = require('cors')({origin: '*'});

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
const device = new USB();

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
    return printEscpos(req.body.escpos, req.body.qrcode).then(() => res.send('OK')).catch(e => {
      console.log('e', e);
      res.status(400).send(e);
    });
  });
})

async function printEscpos(escpos, qrcode) {
  await device.open(async function(err){
    if(err) {
      throw err;
    }
    const result = Buffer.from(escpos, 'base64');
    const qrResult = Buffer.from(qrcode, 'base64');
    const options = { encoding: "GB18030" /* default */ }
    let printer = new Printer(device, options);
    if (qrcode) {
      await printer.qrcode(qrcode);
    }
    await printer.raw(qrResult);
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

app.listen(port, () => {
  console.log(`Print API listening on port ${port}`)
})

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
