export function sendWhatsAppMessage(tel, template) {
  var axios = require('axios');
  var data = JSON.stringify({
    "messaging_product": "whatsapp",
    "to": tel.indexOf('+351') !== -1 ? `${tel}` : `+351${tel}`,
    "type": "template",
    "template": {
      "name": template,
      "language": {
        "code": "pt_PT"
      }
    }
  });

  var config = {
    method: 'post',
    url: 'https://graph.facebook.com/v15.0/105723732447658/messages',
    headers: {
      'Authorization': 'Bearer EAARc61w4q7YBAJTL2bCVsFLeEIZApS0PcksQG6VA52mlCZCP48uLZBBujgnMlTA83Gt8U4t2ZAHrvmNNZCgDoDfqKw3PR847LEZApZCx4ZBpMtfaZA4C1LwImNdzxJcxyaIPVZAJh52mbMG60hZBrJ3PKutyYopsZBAYS6rZCZAZA5OcRgq401MZCjkwhlyhLyRosH2k8qudFFiRoVUH5ARZA2ZBVWZBtX7',
      'Content-Type': 'application/json'
    },
    data : data
  };

  axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });

}
