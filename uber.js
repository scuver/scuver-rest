const puppeteer = require("puppeteer");
const { UIDGenerator } = require("../util/util");
const { MyMoment, MyTime } = require("../util/time-helper");
const io = require("socket.io-client");
const axios = require("axios");
const { sendEmail } = require("../util/email");
const argv = require("minimist")(process.argv.slice(2));
const { DateTime } = require("luxon");
const moment = require("moment");
const SHOP_UID = argv.shop || "kBxRLzdrxEvajpB5whyI";
const PUPETTEER_SESSION = `${__dirname}/../../../${SHOP_UID}`;
const STAGING = process.env.STAGING || argv.staging || false;
const HEADLESS = process.env.HEADLESS || argv.headless || false;
const curli = require("axios-curlirize");
const cron = require("node-cron");
const fs = require("async-file");
const setTimeout = require("node:timers/promises").setTimeout;

curli(axios);

const refs = {
  processed: [],
  pending: [],
  viewed: [],
  bringing: [],
};
let browser;
let page;
let clickPage;

let SERVER_URL = "https://scuver.services";
if (STAGING) {
  SERVER_URL = "https://staging.scuver.services";
}

// args: headers, isJSON, method, body, url
const httpCall = (args) => {
  // console.log('httpCall', args)

  const config = {
    method: args.method.toUpperCase(),
    url: args.url,
    headers: {
      ...args.headers,
      "x-req-org": "928hy49n38y7h3479gbfw76e",
    },
  };

  if (args.method === "POST" || args.method === "PUT") {
    config.data = args.body;
  }

  return axios(config)
    .then(function (response) {
      if (response.data && response.data.data) {
        return response.data.data;
      } else if (response.data) {
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
    body: { collection, record },
    url: `${SERVER_URL}/addOrUpdate`,
    method: "POST",
  });
};

const getRecord = async (collection, uid) => {
  return await httpCall({
    isJSON: true,
    url: `${SERVER_URL}/get/${collection}/${uid}`,
    method: "GET",
  });
};

(async function init() {
  const socket = io(SERVER_URL);

  socket.on("connect", () => {
    console.log("Connected to server");
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from server");
  });

  socket.on("update:shops", async (shop) => {
    if (shop.uid === SHOP_UID) {
      checkSuspended();
    }
  });

  // socket.on('update:orders', async (order) => {
  //   if (order.platform && order.platform === 'uber' && order.shop.uid === SHOP_UID) {
  //     console.log('order.platformStatus', order.platformStatus, order.platformRef);
  //     if ((order.status === 'viewed' || order.status === 'ready' || order.status === 'bringing') && order.timeChanged) {
  //       // await orderTimeChanged(order);
  //     }
  //     if (order.status === 'viewed' && (!order.platformStatus || (order.platformStatus !== 'ACCEPTED' && order.platformStatus !== 'SENT_TO_KITCHEN'))) {
  //       await confirmOrder(order);
  //     }
  //     if (order.status === 'bringing' && (!order.platformStatus || order.platformStatus !== 'FOOD_PICKED_UP')) {
  //       await orderReady(order);
  //     }
  //   }
  // });

  // cron.schedule("0 11 * * *", function () {
  //   console.log("Cron initUber");
  //   initUber();
  // });
  // cron.schedule("0 16 * * *", function () {
  //   console.log("Cron stopUber");
  //   stopUber();
  // });
  // cron.schedule("30 17 * * *", function () {
  //   console.log("Cron initUber");
  //   initUber();
  // });
  // cron.schedule("30 23 * * *", function () {
  //   console.log("Cron stopUber");
  //   stopUber();
  // });

  initUber();
})();

async function initUber() {
  console.log("initUber");
  browser = await puppeteer.launch({
    headless: HEADLESS,
    args: ["--disable-dev-shm-usage"],
    devtools: false,
    dumpio: false,
    userDataDir: `${PUPETTEER_SESSION}`,
  });

  page = await browser.newPage();
  // checkPage = await browser.newPage();
  clickPage = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36",
  );
  // await checkPage.setUserAgent(
  //   "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
  // );
  await clickPage.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36",
  );
  await page.setViewport({ width: 1024, height: 700 });
  // await checkPage.setViewport({ width: 1920, height: 976 });
  await clickPage.setViewport({ width: 1024, height: 700 });
  await clickPage.emulate(puppeteer.KnownDevices["Galaxy S9+ landscape"]);

  page.on("error", function (err) {
    console.error(err);
  });
  clickPage.on("error", function (err) {
    console.error(err);
  });

  // INTERCEPT
  // await page.setRequestInterception(true);

  page.on("response", async (response) => {
    const request = response.request();
    if (request.url().includes("graphql")) {
      const body = await response.json();
      // console.log('body', body)
      if (
        body.data &&
        body.data.getActiveOrders &&
        body.data.getActiveOrders.result &&
        body.data.getActiveOrders.result.orders &&
        body.data.getActiveOrders.result.orders.length
      ) {
        for (const order of body.data.getActiveOrders.result.orders) {
          console.log("ORDER DATA", order);
          // if (!refs.processed.find(r => r === order.value.displayID)) {
          // getRecord('orders', `UBER_${order.value.displayID}`).catch(e => console.error(e)).then(o =>{
          // if (!o) {
          processUberOrder(order.value);
          // page.goto("https://merchants.ubereats.com/dashboard_v2/orders/new")
          // }
          // });
          // }
        }
      }
    }
    return response;
  });

  await Promise.all([
    page.goto("https://merchants-beta.ubereats.com/orders/overview"),
    page.waitForNavigation(),
  ]);

  await Promise.all([
    clickPage.goto("https://merchants-beta.ubereats.com/orders/overview"),
    clickPage.waitForNavigation(),
  ]);

  // await dismissNotification(page);
  // await dismissNotification(clickPage);
  getRecord("shops", SHOP_UID).then(async (shop) => {
    const timetable = shop.timetable;
    const now = DateTime.now().setZone("Europe/Lisbon");
    const day = now.weekday;
    const weekday = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][day+1];
    const weekdaySchedule = timetable[weekday];
    console.log("Cron weekdaySchedule", weekdaySchedule);
    if (weekdaySchedule) {
      for (const workingPeriod of weekdaySchedule.workingPeriods) {
        const startHour = workingPeriod.startTime.split(':')[0];
        const startMinute = workingPeriod.startTime.split(':')[1];
        console.log("Cron startHour", startHour);
        console.log("Cron startMinute", startMinute);
        cron.schedule(`${startMinute} ${startHour} * * *`, function () {
          console.log("Cron checkSuspended");
          checkSuspended();
        });
      }
    }
  });
  await checkSuspended();
}

async function stopUber() {
  console.log("stopUber");
  try {
    await page.close();
    // await checkPage.close();
    await clickPage.close();
  } catch (e) {
    // console.warn(e)
  } finally {
    if (browser) {
      await browser.close();
      browser = null;
    }
  }
}

async function checkSuspended() {
  try {
    getRecord("shops", SHOP_UID).then(async (s) => {
      console.log('checkSuspended s', s);
      // await Promise.all([
      //   clickPage.goto("https://merchants-beta.ubereats.com/orders/overview"),
      //   clickPage.waitForNavigation(),
      // ]);
      await setTimeout(5000);
      await setTimeout(5000);
      let result = await clickPage.$$(
        'xpath/.//div[@id="content-region"]//button[@data-testid="status-indicator-button"]',
      );
      let div = result[result.length - 1];
      if (div) {
        await div.click();
      } else {
        console.warn("No status-indicator-button");
      }
      await setTimeout(2000);
      result = await clickPage.$$(
        'xpath/.//div[@role="dialog"]//div[@role="radiogroup"]',
      );
      const go = result[result.length - 1];
      console.log("go: ", go ? "yes" : "no");
      if (go) {
        if (s && s.suspendOrders) {
          console.log('Suspending orders')
          await click('//div[@role="dialog"]//div[@role="radiogroup"]//label[position()=3]');
          await setTimeout(1000);
          await click('//div[@role="dialog"]//div[@role="radiogroup"]//label[position()=5]');
          await setTimeout(2000);
          await click('//div[@role="dialog"]//button[@data-testid="pause-order-button"]');
          await setTimeout(2000);
          await click('//div[@role="dialog"]//div[@role="radiogroup"]//label[position()=2]');
          await setTimeout(2000);
          await click('//div[@role="dialog"]//button[text()="Continue"]');
          await setTimeout(1000);
        } else if (s && !s.suspendOrders) {
          console.log('Shop not suspended')
          await clickPage.click(
            `div[role="dialog"] div[role="radiogroup"] label:first-child`,
          );
          // await clickPage.click(
          //   `button[data-testid="generic-modal-close-button"]`,
          // );
        }
      }
      // await Promise.all([
      //   clickPage.goto("https://merchants-beta.ubereats.com/orders/overview"),
      //   clickPage.waitForNavigation(),
      // ]);
    });
  } catch (e) {
    console.error(e);
  }
}

const processUberOrder = async (orderData) => {
  console.log("Processing Order", orderData.displayID);
  const scuverOrder = await getRecord(
    "orders",
    `UBER_${orderData.displayID}`,
  ).catch((e) => console.error(e));
  if (!refs.processed.find((r) => r === orderData.displayID)) {
    refs.processed.push(orderData.displayID);
  }
  // console.log('scuverOrder', scuverOrder);
  if (!scuverOrder) {
    console.log("Creating order on Scuver", orderData);
    const newScuverOrder = await createScuverOrderFromData(orderData);
    await addOrUpdate("orders", newScuverOrder);
    await addOrUpdate("uber-orders", {
      uid: orderData.displayID,
      ...orderData,
    });
  } else {
    if (
      scuverOrder.status === "viewed" &&
      orderData.state !== "PREPARING" &&
      orderData.state !== "READY_SOON" &&
      orderData.state !== "OUT_FOR_DELIVERY" &&
      orderData.state !== "DELIVERED" &&
      orderData.state !== "READY_NOW"
    ) {
      scrappingSetStatus("accept_order_cta", scuverOrder.platformUID);
    } else if (
      scuverOrder.status === "ready" &&
      orderData.state !== "READY_NOW" &&
      orderData.state !== "OUT_FOR_DELIVERY" &&
      orderData.state !== "DELIVERED"
    ) {
      scrappingSetStatus("ready_order_cta", scuverOrder.platformUID);
    } else if (
      scuverOrder.status === "bringing" &&
      orderData.state !== "OUT_FOR_DELIVERY" &&
      orderData.state !== "DELIVERED"
    ) {
      scrappingSetStatus("bringing", scuverOrder.platformUID);
    } else if (scuverOrder.status === "pending") {
      try {
        console.log("Order in PENDING ", scuverOrder.platformUID);
        // if (orderData.foodPreparationState === 'ACCEPTED' || orderData.foodPreparationState !== 'SENT_TO_KITCHEN') {
        //   addOrUpdate('orders', {...scuverOrder, status: 'viewed'})
        // } else if (orderData.foodPreparationState === 'FOOD_PICKED_UP') {
        //   addOrUpdate('orders', {...scuverOrder, status: 'ready'})
        // } else {
        const now = moment();
        console.log("now", now);
        const time = MyTime.parse(now.format("HH:mm"));
        console.log("time", time);
        const submittedAt = MyMoment.parse(scuverOrder.submittedAt).time;
        console.log("submittedAt", submittedAt);
        const warnAt = MyMoment.parse(scuverOrder.submittedAt).time;
        warnAt.addMinutes(3);
        console.log("warnAt", warnAt);
        console.log(
          "time.isWithinTimeSpan(submittedAt, warnAt)",
          time.isWithinTimeSpan(submittedAt, warnAt),
        );
        if (
          !time.isWithinTimeSpan(submittedAt, warnAt) &&
          !refs.pending.find((r) => r === scuverOrder.platformRef)
        ) {
          sendEmail(
            "scuverpt@gmail.com",
            "Encomenda não visualizada " + scuverOrder.platformRef,
          );
          refs.pending.push(scuverOrder.platformRef);
          // sms('936256982', 'Encomenda não visualizada ' + scuverOrder.platformRef)
        }
        // }
      } catch (e) {
        console.error("error", e);
      }
    }
  }
};

const amountE5ToPrice = (amountE5) => {
  console.log('amountE5 - ', amountE5);
  const bytes = new Uint8ClampedArray(amountE5.data);
  const size = bytes.byteLength;
  let x = 0;
  for (let i = 0; i < size; i++) {
    const byte = bytes[i];
    x *= 0x100;
    x += byte;
  }
  console.log('x - ', x);
  console.log('x / 100000 - ', x / 100000);
  return Number.parseFloat('' + (x / 100000));
}

const createScuverOrderFromData = async (orderData) => {
  const scuverOrder = {};
  scuverOrder.uid = `UBER_${orderData.displayID}`;
  scuverOrder.status = "pending";
  scuverOrder.shop = await getRecord("shops", SHOP_UID);
  if (orderData.deliveries && orderData.deliveries.length) {
    orderData.deliveryLocation = orderData.deliveries[0].location;
    scuverOrder.notes = `${scuverOrder.notes || ""} ${orderData.deliveries[0].deliveryInstructions || ""}`;
    scuverOrder.address = {
      addressLine1: orderData.deliveryLocation?.addressOne || "",
      addressLine2: `${orderData.deliveryLocation?.title || ""} ${orderData.deliveryLocation?.subtitle || ""} ${orderData.deliveryLocation?.street || ""} ${orderData.deliveryLocation?.businessName || ""} ${orderData.deliveryLocation?.aptOrSuite || ""} ${orderData.deliveries[0].deliveryInstructions || ""}`,
      local: `${orderData.deliveryLocation?.city || ""} ${orderData.deliveryLocation?.region || ""}`,
      postalCode: orderData.deliveryLocation?.postalCode,
      coordinates: {
        latitude: Number.parseFloat(orderData.deliveryLocation?.latitude),
        longitude: Number.parseFloat(orderData.deliveryLocation?.longitude),
      },
    };
    try {
      let response = await httpCall({
        method: "get",
        url: `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(scuverOrder.shop.address.coordinates.latitude + "," + scuverOrder.shop.address.coordinates.longitude)}&destinations=${encodeURIComponent(scuverOrder.address.coordinates.latitude + "," + scuverOrder.address.coordinates.longitude)}&units=metric&key=AIzaSyB3McyHg_YiFoz7eU7xAkQNA9cwEkjnPvE`,
      }).catch((e) => console.error(e));
      console.log("Google Distance Matrix Response");
      console.log(response);
      const status = response.rows[0]?.elements[0]?.status;
      if (
        response.rows[0] &&
        response.rows[0].elements.length &&
        status === "OK"
      ) {
        const lessDistance = response.rows[0].elements.sort((a, b) =>
          a.distance.value > b.distance.value ? 1 : 0,
        );
        const distanceInKm = lessDistance[0].distance.value / 1000;
        scuverOrder.distanceInKm =
          distanceInKm > 1 ? Math.round(distanceInKm) : 1;
      } else {
        console.error("NOT OK");
        scuverOrder.distanceInKm = 3;
      }
    } catch (e) {
      console.error(e);
    }
  }
  const now = moment();
  const nowTime = MyTime.parse(now.format("HH:mm"));
  scuverOrder.submittedAt = MyMoment.todayAt(nowTime).toString();
  if (orderData.isScheduledOrder) {
    console.log("SCHEDULED ORDER", orderData);
    scuverOrder.isNow = false;
    scuverOrder.isScheduled = true;
  } else {
    scuverOrder.isNow = true;
    scuverOrder.isScheduled = false;
    // console.log('moment()', moment());
    // console.log('shop.preparationTime', scuverOrder.shop.preparationTime);
    // const arrival = moment().add(scuverOrder.shop.preparationTime.split(':')[1], 'minutes');
    // console.log('arrival', arrival);
    // const arrivalTime = MyTime.parse(arrival.format('HH:mm'));
    // scuverOrder.arrivalExpectedAt = MyMoment.todayAt(arrivalTime).toString();
    // scuverOrder.arrivalEstimatedAt = MyMoment.todayAt(arrivalTime).toString();
  }
  let arrival = scuverOrder.shop.preparationTime
    ? moment().add(scuverOrder.shop.preparationTime.split(":")[1], "minutes")
    : moment();
  if (
    orderData.deliveries &&
    orderData.deliveries.length &&
    orderData.deliveries[0].estimatedDropOffTime
  ) {
    arrival = moment(new Date(orderData.deliveries[0].estimatedDropOffTime));
  }
  const arrivalTime = MyTime.parse(arrival.format("HH:mm"));
  scuverOrder.arrivalExpectedAt = MyMoment.todayAt(arrivalTime).toString();
  scuverOrder.arrivalEstimatedAt = MyMoment.todayAt(arrivalTime).toString();

  scuverOrder.notes = `${scuverOrder.notes} ${orderData.storeInstructions || orderData.dmcOrderInfo ? " Instruções: " + orderData.storeInstructions || orderData.dmcOrderInfo : ""}`;
  scuverOrder.orderItems = [];
  if (orderData.cartInfo?.cartItems && orderData.cartInfo?.cartItems.length) {
    for (const orderItem of orderData.cartInfo?.cartItems) {
      const newOrderItem = {
        uid: orderItem.itemID,
        name: orderItem.name,
        quantity: orderItem.quantity?.amount || 1,
        price: Number.parseFloat((amountE5ToPrice(orderItem.price.currencyAmount.amountE5) / (orderItem.quantity?.amount || 1)).toFixed(2)),
        optionsSelected:
          orderItem.modifiers && orderItem.modifiers.length
            ? orderItem.modifiers
                .filter((m) => m.quantity && m.quantity.amount)
                .map((o) => {
                  return {
                    name: `${o.name} ${o.modifiers ? " - " + o.modifiers?.map((opt) => opt.name).join("; ") : ""}`,
                    price: 0,
                    quantity:
                      o.quantity && o.quantity.amount ? o.quantity.amount : 1,
                  };
                })
            : [],
      };
      if (orderItem.specialInstructions) {
        newOrderItem.optionsSelected.push({
          name: orderItem.specialInstructions,
          price: 0,
          quantity: 1,
        });
      }
      if (orderItem.notes) {
        newOrderItem.optionsSelected.push({
          name: orderItem.notes
            .map((n) =>
              n.title?.content?.richTextElements
                ?.map((r) => r.text.text)
                .join(" "),
            )
            .join(" "),
          price: 0,
          quantity: 1,
        });
      }
      scuverOrder.orderItems.push(newOrderItem);
    }
  }
  scuverOrder.user = {};
  if (orderData.nif) {
    scuverOrder.user.fiscalNumber = orderData.nif;
  } else if (
    orderData.storeInstructions &&
    orderData.storeInstructions.indexOf("NIF") !== -1
  ) {
    scuverOrder.user.fiscalNumber = orderData.storeInstructions.substring(
      orderData.storeInstructions.indexOf("NIF") + 5,
    );
  }

  scuverOrder.user.name = `${orderData.customers[0].name}`;
  scuverOrder.user.phoneNumber = orderData.customers[0].phone?.phoneNumber;
  scuverOrder.notes = `${scuverOrder.notes} ${orderData.customers[0].phone?.pinCode ? "Pin: " + orderData.customers[0].phone?.pinCode : ""}`;
  scuverOrder.paid = true;
  scuverOrder.subTotal = Number.parseFloat(amountE5ToPrice(orderData.payment.orderSubTotal.amountE5).toFixed(2))
  scuverOrder.total = Number.parseFloat(amountE5ToPrice(orderData.payment.orderTotal.amountE5).toFixed(2));
  if (
    orderData.deliveryLocation?.addressOne ||
    orderData.deliveryLocation?.postalCode
  ) {
    scuverOrder.type = "delivery";
  } else {
    scuverOrder.type = "take-away";
  }

  scuverOrder.paymentMethod = "card";
  scuverOrder.platform = "uber";
  scuverOrder.platformRef = orderData.displayID;
  scuverOrder.platformTracking = orderData.orderTrackingMetadata?.url;
  scuverOrder.platformUID = orderData.id;
  scuverOrder.platformStatus = orderData.state;

  if (orderData.banners && orderData.banners.length) {
    for (const banner of orderData.banners) {
      if (banner.message?.richTextElements?.length) {
        for (const element of banner.message.richTextElements) {
          if (element.text?.text) {
            if (element.text?.text.indexOf("NIF") !== -1) {
              scuverOrder.user.fiscalNumber = element.text?.text
                .replace('\\"  | NIPC / NIF: 244243670\\"', "")
                .replace("NIPC / NIF: ", "")
                .replace("NIF: ", "")
                .replace("NIF ", "")
                .replace("NIF:", "")
                .replace(" | ", "");
            } else {
              scuverOrder.notes = `${scuverOrder.notes || ""} ${element.text?.text || ""}`;
            }
          }
        }
      }
    }
  }

  return scuverOrder;
};

const scrappingSetStatus = async (buttonId, uid) => {
  console.log("scrappingSetStatus", buttonId, uid);
  try {
    await clickPage.goto(
      `https://merchants-beta.ubereats.com/orders/overview/${uid}`,
    );
    await setTimeout(5000);
    if (buttonId !== "bringing" && buttonId !== "accept_order_cta") {
      await clickPage.click(`button[data-testid="${buttonId}"]`);
    } else {
      const path = "xpath/.//button[contains(text(), 'Start delivery')]";
      const result = await clickPage.$$(path);
      const div = result[result.length - 1];
      if (div) {
        await div.click();
      }
    }
    if (buttonId === "accept_order_cta") {
      await setTimeout(2000);
      const path = "xpath/.//button[contains(text(), 'Accept')]";
      const result = await clickPage.$$(path);
      const div = result[result.length - 1];
      if (div) {
        await div.click();
      }
    }
    // await clickPage.click(`button[data-testid="${buttonId}"]`);
  } catch (e) {
    console.error("Erro ao mudar estado da encomenda", e);
    // sendEmail('scuverpt@gmail.com', 'Erro ao aceitar encomenda Uber', e.toString());
  }
};

async function dismissNotification(targetPage) {
  const tPage = targetPage || page;
  console.log("In dismissNotification");
  await tPage.waitForTimeout((Math.floor(Math.random() * 12) + 5) * 1000);
  // await page.click('button[data-baseweb="button"]')
  // button[data-baseweb="button"]
  let result = await tPage.$$("xpath/.//button[contains(text(), 'Do it later ->')]");
  let div = result[result.length - 1];
  if (div) {
    await div.click();
  } else {
    await tPage.click('button[data-baseweb="button"]');
  }
  console.log("dismissNotification done");
  return true;
}

async function click(xpath) {
  let result = await clickPage.$$('xpath/.' + xpath);
  let div = result[result.length - 1];
  if (div) {
    console.log('Clicking on', xpath);
    await div.click();
  } else {
    console.warn("No element found for", xpath);
  }
}
