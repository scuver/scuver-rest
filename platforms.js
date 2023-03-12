const puppeteer = require("puppeteer");
const {UIDGenerator} = require('../util/util');
const {MyMoment, MyTime} = require('../util/time-helper');
const moment = require('moment');
const io = require('socket.io-client');
const os = require("os");
const axios = require('axios');
const request_client = require('request-promise-native');
const {sendEmail} = require('../util/email');
const {sms} = require('../util/sms');
const argv = require('minimist')(process.argv.slice(2));

const SHOP_UID = argv.shop || 'kBxRLzdrxEvajpB5whyI';
const PUPETTEER_SESSION = `${os.homedir()}/chromeSession_${SHOP_UID}`;
const LOCAL = (process.env.LOCAL || argv.local) || false;
const STAGING = (process.env.STAGING || argv.staging) || false;
const GLOVO_ENABLED = (process.env.GLOVO_ENABLED || argv.glovo) || false;
const HEADLESS = (process.env.HEADLESS || argv.headless) || false;

const refs = {
  pending: [],
  viewed: [],
  bringing: []
}
let page;
let glovoPage;
let checkPage;
let clickPage;
let checkUberInterval;
let isTryingToCreateOrder;
const WAIT_FOR_PAGE_LOAD = 1000;

let SERVER_URL = 'https://scuver.services';
if (LOCAL) {
  SERVER_URL = 'http://localhost';
}
if (STAGING) {
  SERVER_URL = 'https://staging.scuver.services';
}

let uberHeaders = {};

// args: headers, isJSON, method, body, url
const httpCall = (args) => {

  // console.log('httpCall', args)

  const config = {
    method: args.method.toUpperCase(),
    url: args.url,
    headers: {
      ...args.headers,
      'x-req-org': '928hy49n38y7h3479gbfw76e'
    }
  };

  if (args.method === 'POST' || args.method === 'PUT') {
    config.data = args.body;
  }

  return axios(config)
    .then(function (response) {
      if (response.data && response.data.data) {
        return response.data.data;
      } else if(response.data) {
        return response.data;
      } else {
        return null;
      }
    })
    .catch(function (error) {
      console.error(error);
    });
};

const addOrUpdate = async (collection, record) => {
  let recordToSave = record;
  let isNew = !recordToSave.uid;
  if (isNew) {
    recordToSave.uid = UIDGenerator.generate();
  }
  delete recordToSave._id;
  return await httpCall({
    isJSON: true,
    body: {collection, record},
    url: `${SERVER_URL}/addOrUpdate`,
    method: 'POST'
  });
}

const getRecord = async (collection, uid) => {
  return await httpCall({
    isJSON: true,
    url: `${SERVER_URL}/get/${collection}/${uid}`,
    method: 'GET'
  });
}

(async function init() {

  if (!LOCAL) {

    const socket = io(SERVER_URL);

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    socket.on('update:orders', async (order) => {
      if (order.platform && order.platform === 'uber' && order.shop.uid === SHOP_UID) {
        if (order.status === 'viewed' && (!order.platformStatus || (order.platformStatus !== 'ACCEPTED' && order.platformStatus !== 'SENT_TO_KITCHEN'))) {
          await confirmOrder(order);
        }
        if (order.status === 'bringing' && (!order.platformStatus || order.platformStatus !== 'FOOD_PICKED_UP')) {
          await orderReady(order);
        }
      }
      // if (order.platform && order.platform === 'glovo' && order.shop.uid === SHOP_UID) {
      //   if (order.status === 'viewed') {
      //     await confirmOrder(order);
      //   }
      //   if (order.status === 'bringing') {
      //     await orderReady(order);
      //   }
      // }
    });
  }
  const browser = await puppeteer.launch({headless: HEADLESS, args: ["--disable-dev-shm-usage"], devtools: false, dumpio:false, userDataDir: `${PUPETTEER_SESSION}`});

  page = await browser.newPage();
  checkPage = await browser.newPage();
  clickPage = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
  );
  await checkPage.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
  );
  await clickPage.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
  );
  await page.setViewport({ width: 1920, height: 976 });
  await checkPage.setViewport({ width: 1920, height: 976 });
  await clickPage.setViewport({ width: 1920, height: 976 });

  page.on('error', function(err) {
    console.error(err);
  });
  checkPage.on('error', function(err) {
    console.error(err);
  });
  clickPage.on('error', function(err) {
    console.error(err);
  });


  // SCRAPING
  await checkPage.goto("https://merchants.ubereats.com/dashboard_v2/orders/new");
  checkUE();

  // INTERCEPT
  await page.setRequestInterception(true);
  // Listen to Uber
  page.on('request', request => {
    if (request.url().indexOf('active-orders') !== -1) {

      uberHeaders = request.headers();
      uberHeaders['x-csrf-token'] = 'x';

      request_client({
        uri: request.url(),
        headers: request.headers(),
        resolveWithFullResponse: true,
      }).then(response => {

        // const request_url = request.url();
        // const request_headers = request.headers();
        // const request_post_data = request.postData();
        // const response_headers = response.headers;
        // const response_size = response_headers['content-length'];
        // const response_body = response.body;
        //
        // result.push({
        //   request_url,
        //   request_headers,
        //   request_post_data,
        //   response_headers,
        //   response_size,
        //   response_body,
        // });
        //
        // console.log(result);

        try {
          const body = JSON.parse(response.body);
          // console.log('body', body);
          // console.log('body.orders', body.orders);
          for (const order of body.orders) {
            const orderData = order.restaurantOrder;
            // console.log('About to process order', orderData);
            processUberOrder(orderData);
          }
        } catch (e) {
          console.error(e);
        }

        request.continue();
      }).catch(error => {
        console.error(error);
        request.abort();
      });
    } else {
      request.continue();
    }
  });
  await page.goto("https://merchants.ubereats.com/dashboard_v2/orders/new");


  // CLICK
  await clickPage.goto("https://merchants.ubereats.com/dashboard_v2/orders/new");

  // if (GLOVO_ENABLED) {
  //   glovoPage = await browser.newPage();
  //   glovoPage.on('error', function(err) {
  //     console.error(err);
  //   });
  //   await glovoPage.setUserAgent(
  //     "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
  //   );
  //
  //   await glovoPage.setRequestInterception(true);
  //
  //   // Listen to Uber
  //   glovoPage.on('request', request => {
  //     if (request.url().indexOf('orders') !== -1) {
  //
  //       uberHeaders = request.headers();
  //       uberHeaders['x-csrf-token'] = 'x';
  //
  //       request_client({
  //         uri: request.url(),
  //         headers: request.headers(),
  //         resolveWithFullResponse: true,
  //       }).then(response => {
  //
  //         try {
  //           const body = JSON.parse(response.body);
  //           // console.log('body', body);
  //           // console.log('body.orders', body.orders);
  //           for (const order of body.orders) {
  //             const orderData = order.orderInformation;
  //             // console.log('About to process order', orderData);
  //             //processGlovoOrder(orderData);
  //           }
  //         } catch (e) {
  //           console.error(e);
  //         }
  //
  //         request.continue();
  //       }).catch(error => {
  //         console.error(error);
  //         request.abort();
  //       });
  //     } else {
  //       request.continue();
  //     }
  //   });
  //   await glovoPage.goto("https://partners.glovoapp.com/orders");
  // }

})();

const processUberOrder = async (orderData) => {
  // console.log('Processing Order', orderData.displayId);
  const scuverOrder = await getRecord('orders', `UBER_${orderData.displayId}`).catch(e => console.error(e));
  // console.log('scuverOrder', scuverOrder);
  if (!scuverOrder) {
    console.log('Creating order on Scuver', orderData);
    const newScuverOrder = await createScuverOrderFromData(orderData);
    await addOrUpdate('orders', newScuverOrder);
  } else {
    if (scuverOrder.status === 'viewed') {
      console.log('Order VIEWED scuverOrder.platformRef orderData.foodPreparationState', scuverOrder.platformRef, orderData.foodPreparationState);
      if (orderData.foodPreparationState !== 'SENT_TO_KITCHEN' && orderData.foodPreparationState !== 'ACCEPTED' && orderData.foodPreparationState !== 'FOOD_PICKED_UP') {
        await confirmOrder(scuverOrder)
        if (!refs.viewed.find(r => r === scuverOrder.platformRef)) {
          await confirmOrderScraping(scuverOrder);
          refs.viewed.push(scuverOrder.platformRef)
        }
      }
    } else if (scuverOrder.status === 'bringing') {
      console.log('Order BRINGING scuverOrder.platformRef orderData.foodPreparationState', scuverOrder.platformRef, orderData.foodPreparationState);
      if (orderData.foodPreparationState !== 'FOOD_PICKED_UP') {
        await orderReady(scuverOrder)
        if (!refs.bringing.find(r => r === scuverOrder.platformRef)) {
          await orderReadyScraping(scuverOrder);
          refs.bringing.push(scuverOrder.platformRef)
        }
      }
    } else if (scuverOrder.status === 'pending') {
      try {
        console.log('Order in PENDING ', scuverOrder.platformRef);
        const now = moment();
        console.log('now', now);
        const time = MyTime.parse(now.format('HH:mm'));
        console.log('time', time);
        const submittedAt = MyMoment.parse(scuverOrder.submittedAt).time;
        console.log('submittedAt', submittedAt);
        const warnAt = MyMoment.parse(scuverOrder.submittedAt).time;
        warnAt.addMinutes(3);
        console.log('warnAt', warnAt);
        console.log('time.isWithinTimeSpan(submittedAt, warnAt)', time.isWithinTimeSpan(submittedAt, warnAt));
        if (!time.isWithinTimeSpan(submittedAt, warnAt) && !refs.pending.find(r => r === scuverOrder.platformRef)) {
          sendEmail('scuverpt@gmail.com', 'Encomenda não visualizada ' + scuverOrder.platformRef)
          refs.pending.push(scuverOrder.platformRef);
          // sms('936256982', 'Encomenda não visualizada ' + scuverOrder.platformRef)
        }
      } catch(e) {
        console.error('error', e)
      }
    }
  }
}

const createScuverOrderFromData = async (orderData) => {

  const scuverOrder = {};
  scuverOrder.uid = `UBER_${orderData.displayId}`;
  scuverOrder.status = 'pending';
  scuverOrder.shop = await getRecord('shops', SHOP_UID);
  if (orderData.deliveryLocation.address) {
    scuverOrder.address = {addressLine1: orderData.deliveryLocation.address.address1 || '', addressLine2: `${orderData.deliveryLocation.address.title || ''} ${orderData.deliveryLocation.address.subtitle || ''} ${orderData.deliveryLocation.address.street || ''} ${orderData.deliveryLocation.address.businessName || ''} ${orderData.deliveryLocation.address.aptOrSuite || ''} ${orderData.deliveryInstructions || ''}`, local: `${orderData.deliveryLocation.address.city || ''} ${orderData.deliveryLocation.address.region || ''}`, postalCode: orderData.deliveryLocation.address.postalCode, coordinates: {latitude: orderData.deliveryLocation.latitude, longitude: orderData.deliveryLocation.longitude}};
    try {
      let response = await httpCall({
        method: 'get',
        url: `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(scuverOrder.shop.address.coordinates.latitude + ',' + scuverOrder.shop.address.coordinates.longitude)}&destinations=${encodeURIComponent(scuverOrder.address.coordinates.latitude + ',' + scuverOrder.address.coordinates.longitude)}&units=metric&key=AIzaSyB3McyHg_YiFoz7eU7xAkQNA9cwEkjnPvE`
      }).catch(e => console.error(e));
      console.log('Google Distance Matrix Response');
      console.log(response);
      const status = response.rows[0]?.elements[0]?.status;
      if (response.rows[0] && response.rows[0].elements.length && status === 'OK') {
        const lessDistance = response.rows[0].elements.sort((a, b) => a.distance.value > b.distance.value ? 1 : 0)
        const distanceInKm = lessDistance[0].distance.value / 1000;
        scuverOrder.distanceInKm = distanceInKm > 1 ? Math.round(distanceInKm) : 1;
      }
      else {
        console.error('NOT OK');
        scuverOrder.distanceInKm = 3;
      }
    } catch(e) {
      console.error(e);
    }
  }
  const now = moment();
  const nowTime = MyTime.parse(now.format('HH:mm'));
  scuverOrder.submittedAt = MyMoment.todayAt(nowTime).toString();
  if (orderData.isScheduledOrder) {
    console.log('SCHEDULED ORDER', orderData);
    scuverOrder.isNow = false;
    scuverOrder.isScheduled = true;
    const arrival = moment(new Date(orderData.preparationTime));
    const arrivalTime = MyTime.parse(arrival.format('HH:mm'));
    scuverOrder.arrivalExpectedAt = MyMoment.todayAt(arrivalTime).toString();
  } else {
    scuverOrder.isNow = true;
    scuverOrder.isScheduled = false;
    const arrival = moment().add(15, 'minutes');
    const arrivalTime = MyTime.parse(arrival.format('HH:mm'));
    scuverOrder.arrivalExpectedAt = MyMoment.todayAt(arrivalTime).toString();
  }
  scuverOrder.notes = `PIN: ${orderData.customerInfo.phonePinCode} ${orderData.storeInstructions ? ' Instruções: ' + orderData.storeInstructions : ''}`;
  scuverOrder.orderItems = [];
  if (orderData.items && orderData.items.length) {
    for (const orderItem of orderData.items) {
      scuverOrder.orderItems.push({
        uid: orderItem.uuid,
        name: orderItem.title,
        quantity: orderItem.quantity || 1,
        price: orderItem.price / 100,
        optionsSelected: orderItem.customizations ? orderItem.customizations.map(o => {
          return {
            name: `${o.title} - ${o.options.map(opt => opt.title).join('; ')}`,
            price: 0,
            quantity: 1
          }
        }) : []
      });
    }
  }
  scuverOrder.user = {};
  if (orderData.nif) {
    scuverOrder.user.fiscalNumber = orderData.nif;
  } else if (orderData.storeInstructions && orderData.storeInstructions.indexOf('NIF') !== -1) {
    scuverOrder.user.fiscalNumber = orderData.storeInstructions.substring(orderData.storeInstructions.indexOf('NIF') + 5);
  }
  scuverOrder.user.name = `${orderData.customerInfo.firstName} ${orderData.customerInfo.lastName}`;
  scuverOrder.user.phoneNumber = orderData.customerInfo.phone;
  scuverOrder.paid = true;
  scuverOrder.subTotal = orderData.checkoutInfo.find(info => info.key === 'total').rawValue;
  scuverOrder.total = orderData.checkoutInfo.find(info => info.key === 'total').rawValue;
  if (orderData.deliveryLocation.address) {
    scuverOrder.type = 'delivery';
  } else {
    scuverOrder.type = 'take-away';
  }

  scuverOrder.paymentMethod = 'card';
  scuverOrder.platform = 'uber';
  scuverOrder.platformRef = orderData.displayId;
  scuverOrder.platformUID = orderData.uuid;
  scuverOrder.platformStatus = 'PENDING';
  return scuverOrder;
}

const confirmOrder = async (order) => {
  console.log('Click confirm order', order.platformUID);
  if (uberHeaders) {
    httpCall({
      url: `https://merchants.ubereats.com/orders/_events`,
      method: 'POST',
      headers: uberHeaders,
      body: {"items":[{"type":"custom-hp-web-event","payload":{"name":"ping_online_request","type":"view","value":{"isForegrounded":true,"isLoggedIn":true},"webEventsMeta":{"dimensions":{"viewport_height":807,"viewport_width":516,"screen_height":1418,"screen_width":3360},"page":{"hostname":"merchants.ubereats.com","pathname":"/dashboard_v2/orders/new/"+order.platformUID,"referrer":"","url":"https://merchants.ubereats.com/dashboard_v2/orders/new/"+order.platformUID},"time_ms":new Date().getTime()}}}]}
    }).then(async r => {
      await confirmOrderScraping(order)
    }).catch(async err => {
      console.error(err);
      await confirmOrderScraping(order)
      // sendEmail('scuverpt@gmail.com', 'Erro ao aceitar encomenda Uber', err.toString());
    });
  }
}

const confirmOrderScraping = async (order) => {
  console.log('confirmOrderScraping', order.platformRef);
  try {
    await clickPage.goto(`https://merchants.ubereats.com/dashboard_v2/orders/new/${order.platformUID}`);
    await clickPage.waitForTimeout(WAIT_FOR_PAGE_LOAD * 4);
    await clickPage.click('div[data-testid=order-details-confirm-button]');
    await addOrUpdate('orders', {...order, platformStatus: 'SENT_TO_KITCHEN'})
  } catch(e)  {
    console.error('Erro', e);
    sendEmail('scuverpt@gmail.com', 'Erro ao aceitar encomenda Uber', e.toString());
  }
}

const orderReady = async (order) => {
  console.log('Click order ready', order.platformRef);

  if (uberHeaders) {
    httpCall({
      url: `https://merchants.ubereats.com/orders/rt/eats/v1/orders/${order.platformUID}/update-preparation-state`,
      method: 'POST',
      headers: uberHeaders,
      body: {"request":{"foodPreparationState":"FOOD_PICKED_UP","entityType":"RESTAURANT"}}
    }).then(async r => {
      await orderReadyScraping(order)
    }).catch(async err => {
      console.error(err);
      await orderReadyScraping(order)
    });
  }
}

const orderReadyScraping = async (order) => {
  console.log('orderReadyScraping', order.platformRef);
  try {
    await clickPage.goto(`https://merchants.ubereats.com/dashboard_v2/orders/in_progress/${order.platformUID}`);
    await clickPage.waitForTimeout(WAIT_FOR_PAGE_LOAD * 4);
    const path = "//div[contains(text(), 'Out for delivery')]";
    const result = await clickPage.$x(path);
    const div = result[result.length-1];
    if (div) {
      await div.click();
    }
    await clickPage.goto(`https://merchants.ubereats.com/dashboard_v2/orders/new/${order.platformUID}`);
    await clickPage.waitForTimeout(WAIT_FOR_PAGE_LOAD * 4);
    const result2 = await clickPage.$x(path);
    const div2 = result2[result2.length-1];
    if (div2) {
      await div2.click();
    }
    await addOrUpdate('orders', {...order, platformStatus: 'FOOD_PICKED_UP'})
  } catch(e)  {
    console.error('Erro', e);
    // sendEmail('scuverpt@gmail.com', 'Erro ao enviar para entrega encomenda Uber', e.toString());
  }
}

// SCRAPING CHECK ORDERS (failsafe)

const checkUE = async () => {
  await checkPage.waitForTimeout(WAIT_FOR_PAGE_LOAD * 5);
  if (checkUberInterval) {
    clearInterval(checkUberInterval);
  }

  checkUberInterval = setInterval(async () => {
    if (!isTryingToCreateOrder) {
      await doCheck();
    } else {
      console.log('Trying to create order.')
    }
  }, 30000);

}

const doCheck = async () => {
  try {
    // const greenScreenSelector = `#root > div > div > div > div.css-1dbjc4n.r-13awgt0 > div > div > div > div > div.css-1dbjc4n.r-1p0dtai.r-1d2f490.r-u8s1d.r-zchlnj.r-ipm5af > div > div.r-2mlnnh.r-1p0dtai.r-1d2f490.r-u8s1d.r-zchlnj.r-ipm5af.css-1dbjc4n`;
    // if ((await checkPage.$(greenScreenSelector)) !== null) {
    //   await checkPage.click(greenScreenSelector);
    // }
    // await checkPage.waitForTimeout(WAIT_FOR_PAGE_LOAD);
    const orderHeaders = await checkPage.$$('[data-testid="order-details-header"]');

    let foundRefElementHandle = null;
    let name = null;
    let ref = null;
    let orderHeaderRef = null;
    if (orderHeaders.length) {
      // console.log('Found orders in the new tab (could have been processed already)', orderHeaders.length);
    }
    for (const orderHeader of orderHeaders) {
      const nds = await orderHeader.$$('div[dir=auto]');
      let count = 0;
      for (const nd of nds) {
        if (count === 1) {
          ref = await (await nd.getProperty('textContent')).jsonValue()
          const scuverOrder = await getRecord('orders', `UBER_${ref}`).catch(e => console.error(e));
          if (!scuverOrder) {
            foundRefElementHandle = nd;
            orderHeaderRef = orderHeader;
            name = await (await nds[0].getProperty('textContent')).jsonValue();
            break;
          }
        }
        count++;
      }
    }

    if (foundRefElementHandle) {
      isTryingToCreateOrder = true;
      let orderData = await grabUEOrderDetails(foundRefElementHandle, orderHeaderRef, ref, name);

      if ((!orderData.address || !orderData.orderItems || !orderData.orderItems.length || !orderData.orderItems[0].quantity)) {
        await sendEmail('scuverpt@gmail.com', `Encomenda Uber Falhou - ${ref}`, 'https://merchants.ubereats.com/dashboard_v2/orders/new https://admin-scuver.web.app/batatas', false, (emailResult) => {});
        await sms('936256982', `Falhou passagem encomenda uber ${ref}`);
        await sms('910932078', `Falhou passagem encomenda uber ${ref}`);
      } else {
        await checkPage.waitForTimeout(WAIT_FOR_PAGE_LOAD * 10);
        const scuverOrder = await getRecord('orders', `UBER_${orderData.ref}`).catch(e => console.error(e));
        if (!scuverOrder) {
          const newScuverOrder = await createScuverOrderFromScraping(orderData);
          await addOrUpdate('orders', newScuverOrder);
        }
      }
      try {
        console.log('Navigate');
        await checkPage.goto('https://merchants.ubereats.com/dashboard_v2/orders/new');
        await checkPage.waitForTimeout(WAIT_FOR_PAGE_LOAD * 2);
      } catch(e)  {
        console.error(e);
      }
      isTryingToCreateOrder = false;
    }
  } catch(e)  {
    isTryingToCreateOrder = false;
    console.error(e);
  }
}

const grabUEOrderDetails = async (refElementHandle, orderHeader, ref, name) => {
  console.log('grabUEOrderDetails ref: ', ref, name);
  await orderHeader.click({force: true});
  if ((await checkPage.$('#root div[style="opacity: 1; width: 67vw; height: 83vh;"] > div > div > div > div:nth-child(2)')) == null){
    console.log('Clicking the element');
    await refElementHandle.click();
  }
  // const carefullSelector = `#root > div > div > div > div.css-1dbjc4n.r-13awgt0 > div > div > div > div > div.css-1dbjc4n.r-1awozwy.r-1p0dtai.r-1777fci.r-1d2f490.r-u8s1d.r-zchlnj.r-ipm5af > div:nth-child(2) > div > div.css-1dbjc4n.r-18u37iz.r-17s6mgv > div`;
  // if ((await checkPage.$(carefullSelector)) !== null) {
  //     await checkPage.click(carefullSelector);
  // }
  await checkPage.waitForTimeout(WAIT_FOR_PAGE_LOAD * 5);
  return await checkPage.evaluate(orderRow => {
    try {
      const order = {};
      order.name = orderRow.querySelectorAll('div[dir=auto]')[0]?.textContent;
      order.ref = orderRow.querySelectorAll('div[dir=auto]')[1]?.textContent;
      const detailsElSelector = '#root div[style="opacity: 1; width: 67vw; height: 83vh;"] > div > div > div > div:nth-child(2)';
      console.log('document.querySelector(detailsElSelector)', document.querySelector(detailsElSelector));
      const addressRows = document.querySelectorAll(`${detailsElSelector} div:nth-child(1) > div > div:nth-child(2) > div:nth-child(2) > div > div > div:nth-child(1) [dir=auto]`);
      console.log('addressRows', addressRows);
      order.street = addressRows[0]?.textContent;
      order.address = addressRows[1]?.textContent;
      order.locality = addressRows[2]?.textContent;
      order.addressNotes = addressRows[3]?.textContent;
      const phoneElement = document.querySelector(`${detailsElSelector} div:nth-child(1) > div > div:nth-child(2) > div:nth-child(2) > div > div > div:nth-child(2) [dir=auto]`);
      order.phone = phoneElement?.textContent;
      const codeElement = document.querySelector(`${detailsElSelector} div:nth-child(1) > div > div:nth-child(2) > div:nth-child(2) > div > div > div:nth-child(2) > div:nth-child(2) [dir=auto]:nth-child(2)`);
      order.foodNotes = codeElement?.textContent + ' ';
      const deliveryNotesRows = document.querySelectorAll(`${detailsElSelector} div:nth-child(1) > div > div:nth-child(2) > div:nth-child(2) > div > div > div:nth-child(3) [dir=auto]`);
      order.addressNotes += (deliveryNotesRows[2] ? (' ' + deliveryNotesRows[2]?.textContent) : '');
      order.foodNotes += document.querySelector(`${detailsElSelector} div:nth-child(1) > div > div:nth-child(3) > div:nth-child(1) > div > div:nth-child(2) [dir=auto]`)?.textContent || '';
      console.log('order', order);
      const orderItemsSelector = `${detailsElSelector} > div:nth-child(1) > div > div:nth-child(3) > div:nth-child(1) > div`;
      let orderItemRows = document.querySelectorAll(orderItemsSelector);
      console.log('orderItemRows 1', orderItemRows);
      const foodNotesSelector = `${orderItemsSelector} > div:nth-child(1) > div > div`;
      try {
        if (orderItemRows.item(0).querySelector('[dir=auto]')?.textContent?.indexOf('NIF') !== -1) {
          console.log('HAS NIF');
          order.nif = orderItemRows.item(0).querySelector('[dir=auto]')?.textContent.indexOf('NIF');
          orderItemRows = document.querySelectorAll(`${detailsElSelector} > div:nth-child(1) > div > div:nth-child(3) > div:nth-child(2) > div`);
        }
        if (document.querySelector(foodNotesSelector) && document.querySelector(foodNotesSelector)?.getAttribute('style') && document.querySelector(foodNotesSelector)?.getAttribute('style')?.indexOf('AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAX') && document.querySelector(foodNotesSelector)?.getAttribute('style')?.indexOf('AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAX') !== -1) {
          console.log('HAS MAIN FOOD NOTES');
          order.foodNotes = `${order.foodNotes} ${orderItemRows.item(0).querySelector('[dir=auto]')?.textContent}`;
          orderItemRows = document.querySelectorAll(`${detailsElSelector} > div:nth-child(1) > div > div:nth-child(3) > div:nth-child(2) > div`);
        } else if (orderItemRows.item(0).querySelector('img') && orderItemRows.item(0).querySelector('img').getAttribute('src').indexOf('iVBORw0KGgoAAAANSUhEUgAAAB') !== -1) {
          console.log('HAS ITEM FOOD NOTES');
          order.foodNotes = `${order.foodNotes} ${orderItemRows.item(0).querySelector('[dir=auto]')?.textContent}`;
        }
      } catch (e) {
        console.error('Failed trying to get NIF or food notes', e);
      }
      console.log('orderItemRows 2', orderItemRows);
      order.orderItems = [];
      if (orderItemRows && orderItemRows.length) {
        orderItemRows.forEach(orderItemRow => {
          console.log('orderItemRow', orderItemRow);
          const textEls = orderItemRow.querySelectorAll('[dir=auto]');
          const orderItem = {};
          orderItem.quantity = textEls[0]?.textContent.replace('×', '');
          orderItem.name = textEls[1]?.textContent;
          orderItem.price = textEls[2]?.textContent.replace('€', '');
          if (textEls.length > 3) {
            orderItem.options = [];
            textEls.forEach((textEl, it) => {
              if (it > 2) {
                orderItem.options.push(textEl.textContent);
              }
            });
          }
          order.orderItems.push(orderItem);
        });
      }
      console.log('orderItemRows 3', orderItemRows);
      console.log('orderItemRows length', orderItemRows.length);
      const url = window.location.href;
      console.log('url', url);
      order.uuid = url.substring(url.lastIndexOf('/') + 1)
      console.log('order', order);
      return order;
    } catch(e) {
      return e;
    }
  }, orderHeader);
}

const createScuverOrderFromScraping = async (orderData) => {

  const scuverOrder = {};
  scuverOrder.uid = `UBER_${orderData.ref}`;
  scuverOrder.status = 'pending';
  scuverOrder.shop = await getRecord('shops', SHOP_UID);
  scuverOrder.address = {addressLine1: orderData.address, addressLine2: orderData.addressNotes, local: orderData.locality, coordinates: {}};
  try {
    let response = await httpCall({
      method: 'get',
      url: `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(scuverOrder.shop.address.coordinates.latitude + ',' + scuverOrder.shop.address.coordinates.longitude)}&destinations=${encodeURIComponent(scuverOrder.address.addressLine1)}&units=metric&key=AIzaSyB3McyHg_YiFoz7eU7xAkQNA9cwEkjnPvE`
    }).catch(e => console.error(e));
    console.log('response');
    console.log(response);
    const status = response.rows[0]?.elements[0]?.status;
    if (response.rows[0] && response.rows[0].elements.length && status === 'OK') {
      const lessDistance = response.rows[0].elements.sort((a, b) => a.distance.value > b.distance.value ? 1 : 0)
      const distanceInKm = lessDistance[0].distance.value / 1000;
      scuverOrder.distanceInKm = distanceInKm > 1 ? Math.round(distanceInKm) : 1;
    }
    else {
      console.error('NOT OK');
      scuverOrder.distanceInKm = 3;
    }
  } catch(e) {
    console.error(e);
  }
  const now = moment();
  const nowTime = MyTime.parse(now.format('HH:mm'));
  scuverOrder.submittedAt = MyMoment.todayAt(nowTime).toString();
  const arrival = moment().add(15, 'minutes');
  const arrivalTime = MyTime.parse(arrival.format('HH:mm'));
  scuverOrder.arrivalExpectedAt = MyMoment.todayAt(arrivalTime).toString();
  scuverOrder.notes = '';
  if (orderData.foodNotes) {
    scuverOrder.notes += ` ${orderData.foodNotes}`;
  }
  scuverOrder.orderItems = [];
  let total = 0;
  if (orderData.orderItems && orderData.orderItems.length) {
    for (const orderItem of orderData.orderItems) {
      scuverOrder.orderItems.push({
        uid: UIDGenerator.generate(),
        name: orderItem.name,
        quantity: orderItem.quantity || 1,
        price: 0,
        optionsSelected: orderItem.options ? orderItem.options.map(o => {
          return {
            name: o,
            price: 0,
            quantity: 0
          }
        }) : []
      });
    }
  }
  scuverOrder.user = {};
  if (orderData.nif) {
    scuverOrder.user.fiscalNumber = orderData.nif;
  }
  scuverOrder.user.name = orderData.name;
  scuverOrder.user.phoneNumber = orderData.phone;
  scuverOrder.paid = true;
  scuverOrder.subTotal = total;
  scuverOrder.total = total;
  scuverOrder.type = 'delivery';
  scuverOrder.paymentMethod = 'card';
  scuverOrder.platform = 'uber';
  scuverOrder.isNow = true;
  scuverOrder.platformRef = orderData.ref;
  scuverOrder.platformUID = orderData.uuid;
  scuverOrder.platformStatus = 'PENDING';
  return scuverOrder;
}

