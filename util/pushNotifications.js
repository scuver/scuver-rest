const axios = require('axios');

exports.sendPushMessage = (msg) => {

  const notification = {};
  notification.app_id = '53676b4c-7ef5-4af2-901c-349ea94e410a';
  notification.included_segments = ['All Users'];
  // notification.filters = [
  //   {"field": "country", "relation": "=", "value": "PT"},
  //   {"operator": "OR"},
  //   {"field": "country", "relation": "=", "value": "BR"},
  //   {"operator": "OR"},
  //   {"field": "country", "relation": "=", "value": "US"},
  //   {"operator": "OR"},
  //   {"field": "country", "relation": "=", "value": "UK"}
  // ]
  notification.contents = {
    en: msg,
    pt: msg
  };

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://onesignal.com/api/v1/notifications',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': 'Basic OTY2MTJkYzAtYzk5NS00MmRiLWFlMDYtOGVjMmM5NzYwMzAw',
    },
    data : JSON.stringify(notification)
  };

  axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });
}
