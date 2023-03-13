const fetch = require('node-fetch');

exports.sms = (tel, msg) => {

  // scriptsLog('A enviar sms.', tel, msg);

  const myHeaders = {
    Authorization: 'Basic QUNkNjljY2YwNTQ1MTI3NGNiMWJkYTI5MTdiMjUwM2ZlZDoxMDg0YzFlNmVlZTk3NjEyMDRlYzliOTVhYTliZWFlNA==',
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  const urlencoded = new URLSearchParams();
  urlencoded.append('To', '' + (tel.indexOf('+351') !== -1 ? `${tel}` : `+351${tel}`));
  //urlencoded.append('From', '+351965965392');
  urlencoded.append('From', '+351927946901');
  urlencoded.append('Body', msg);

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: urlencoded,
    redirect: 'follow'
  };

  return fetch('https://api.twilio.com/2010-04-01/Accounts/ACd69ccf05451274cb1bda2917b2503fed/Messages.json', requestOptions)
    .then((response) => response.text())
    .then((result) => {
      // scriptsLog(result)
    })
    .catch((error) => scriptsLog('error', error));
};
