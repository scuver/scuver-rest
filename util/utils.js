const {sendEmail} = require('./email');
const fetch = require('node-fetch');
const cors = require('cors')({origin: '*'});

exports.initUtils = (app, server) => {
  app.post('/sendEmail', async (request, response) => {
    return cors(request, response, async () => {
      return sendEmail(request.body.recipientAddress, request.body.subject, request.body.body, request.body.isHTML);
    });
  });
  app.post('/sendSMS', async (req, res) => {
    return cors(req, res, async () => {
      console.log('POST /sendSMS', req.body);

      if (req.body.phoneNumber && req.body.message) {
        return server.serverListenersInstance.sms(req.body.phoneNumber, req.body.message);
      } else {
        return res.status(500).send('Body not valid: ' + JSON.stringify(req.body));
      }

    });
  });
  app.all('/corsCall', async (req, res) => {
    return cors(req, res, async () => {
      // console.log('/corsCall', req);
      const args = {
        method: req.body.method,
        headers: {Origin: 'localhost', ...req.body.headers},
        mode: 'no-cors',
        cache: 'no-cache',
      };

      if (req.body && req.body.body) {
        // @ts-ignore
        args.body = req.body.body;
      }

      fetch(req.body.url, args).then((result) => {
        result.json().then((resp) => {
          res.send(resp);
        });
      }).catch((err) => {
        console.log('error', err.message);
        res.send(err);
      });
    });
  });
}
