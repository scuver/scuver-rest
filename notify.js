const io = require('socket.io-client');
const argv = require('minimist')(process.argv.slice(2));
const axios = require('axios');
const player = require('play-sound')(opts = {})

let SERVER_URL = 'https://scuver.services';
const SHOP_UID = argv.shop;

let playSoundInterval = null;
let audio;

const startPlaying = () => {
  console.log('Start playing...')
  stopPlaying();
  playSoundInterval = setInterval(() => {
      audio = player.play('bells.wav')
  }, 2500);
}

const stopPlaying = () => {
  console.log('Stop playing...')
  if (playSoundInterval) {
    clearInterval(playSoundInterval);
    playSoundInterval = null;
  }
  try {
    audio.kill();
  } catch(e) {}
  audio = null;
}

const update = () => {
  console.log('Updating...')
  axios({
    method: 'GET',
    url: `${SERVER_URL}/get/orders-underway`,
    headers: {
      'x-req-org': '928hy49n38y7h3479gbfw76e'
    }
  }).then(function (response) {
    let data;
    if (response.data && response.data.data) {
      data = response.data.data;
    } else if(response.data) {
      data = response.data;
    }
    stopPlaying();
    for (const order of data) {
      if (order.uidShop && order.uidShop === SHOP_UID && order.status === 'ready') {
        console.log('Playing');
        startPlaying();
        break;
      }
    }
  })
  .catch(function (error) {
    console.error(error);
  });
}

(async function init() {

  const socket = io(SERVER_URL);

  socket.on('connect', () => {
    console.log('Connected to server');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from server');
  });

  socket.on('update:orders-underway', async (order) => {
    update();
  });

  stopPlaying();

  update();
})();
