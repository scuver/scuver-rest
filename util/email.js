const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: 'scuverpt@gmail.com',
    clientId: '326732084118-59ntm58brtpocolvotik3790cn79edek.apps.googleusercontent.com',
    clientSecret: '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',
    refreshToken: '1//043j0OIb3sHjACgYIARAAGAQSNwF-L9IrDsghTTK4qqMNW8c-XTqZvMbUR1ONqMTqQcc0mQzC4PR7gz_cCsN4wMBrTD8_Hgdwxec'
  }
}, {
  from: 'scuverpt@gmail.com'
});

exports.sendEmail = (recipientAddress, subject, body, isHTML = false, callback = null) => {
  return transport.sendMail({
    to: recipientAddress,
    subject,
    text: isHTML ? null : body,
    html: isHTML ? body: null
  }, callback);
}
