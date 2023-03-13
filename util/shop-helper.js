const MyTime = require('./time-helper').MyTime;
const TimeHelper = require('./time-helper').TimeHelper;

exports.ShopHelper = class ShopHelper {

  constructor() {}

  getArrivalTimesOn(shop, day, at) {
    const preparationTime = MyTime.parse(shop.preparationTime);
    const timeStepInMin   = 15;
    const minimunTime     = MyTime.minutesToTime(at.toMinutes() + preparationTime.toMinutes() + 15);
    // @ts-ignore
    const daySchedule     = shop.timetable[day];

    if (daySchedule.isClosed) return [];

    const times = [];
    const time = MyTime.minutesToTime(Math.round(minimunTime.toMinutes() / timeStepInMin) * timeStepInMin);

    daySchedule.workingPeriods.forEach((workingPeriod) => {
      if (workingPeriod.startTime && workingPeriod.endTime) {
        const startTime = MyTime.parse(workingPeriod.startTime);
        const endTime   = MyTime.parse(workingPeriod.endTime);

        const from = MyTime.minutesToTime( startTime.toMinutes() + preparationTime.toMinutes() + 5);
        const to   = MyTime.minutesToTime(   endTime.toMinutes() + preparationTime.toMinutes());

        while (time.toMinutes() < to.toMinutes()) {
          if (time.isWithinTimeSpan(from, to)) times.push(time.copy());
          time.addMinutes(timeStepInMin);
        }
      }
    });

    return times;
  }

  getArrivalTimesOfEarliestDay(shop) {
    const days  = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = MyDate.getCurrentDay();
    const todayIndex = days.findIndex((day) => day === today);
    const daysSofted = days.slice(todayIndex, days.length).concat(days.slice(0, todayIndex));

    for (const day of daysSofted) {
      const at = day === MyDate.getCurrentDay() ? MyTime.getCurrentTime() : MyTime.parse('00:00');
      const arrivalTimes = this.getArrivalTimesOn(shop, day, at);
      if (arrivalTimes.length) return arrivalTimes;
    }

    return [];
  }

  getArrivalTimesOfToday(shop) {
    return this.getArrivalTimesOn(shop, MyDate.getCurrentDay(), MyTime.getCurrentTime());
  }

  getArrivalTimesOfTomorrow(shop) {
    return this.getArrivalTimesOn(shop, MyDate.getNextDay(), MyTime.parse('00:00'));
  }

  earliestArrivalTime(shop) {
    const arrivalTimes = this.getArrivalTimesOfEarliestDay(shop);
    return arrivalTimes[0];
  }

  latestArrivalTime(shop) {
    const arriavalTimes = this.getArrivalTimesOfEarliestDay(shop);
    return arriavalTimes[arriavalTimes.length];
  }

  getTodaySchedule(shop) {
    const today = MyDate.getCurrentDay();
    // @ts-ignore
    return shop.timetable[today];
  }

  getTomorrowSchedule(shop) {
    const tomorrow = MyDate.getNextDay();
    // @ts-ignore
    return shop.timetable[tomorrow];
  }

  getScheduleAsArray(shop) {
    const shopSchedule = [];

    shopSchedule.push({day: 'monday'   , schedule: shop.timetable.monday   });
    shopSchedule.push({day: 'tuesday'  , schedule: shop.timetable.tuesday  });
    shopSchedule.push({day: 'wednesday', schedule: shop.timetable.wednesday});
    shopSchedule.push({day: 'thursday' , schedule: shop.timetable.thursday });
    shopSchedule.push({day: 'friday'   , schedule: shop.timetable.friday   });
    shopSchedule.push({day: 'saturday' , schedule: shop.timetable.saturday });
    shopSchedule.push({day: 'sunday'   , schedule: shop.timetable.sunday   });

    return shopSchedule;
  }

  isOpenOn(shop, day, time) {

    if (shop) {
      // @ts-ignore
      const daySchedule = shop.timetable[day];
      // console.log('daySchedule', daySchedule);

      if (daySchedule.isClosed) return false;

      for (const workingPeriod of daySchedule.workingPeriods) {
        if (workingPeriod.startTime && workingPeriod.endTime) {
          const startTime = TimeHelper.parse(workingPeriod.startTime);
          const endTime = TimeHelper.parse(workingPeriod.endTime);
          if (TimeHelper.isWithinTimeSpan(time, startTime, endTime)) return true;
        }
      }
    }
    console.log('isOpenOn FALSE');
    return false;
  }

  isOpenTodayAt(shop, time) {
    const today = TimeHelper.getCurrentDay();
    // console.log('today', today);
    return !!this.isOpenOn(shop, today, time);
  }

  isOpenToday(shop) {
    const today = TimeHelper.getCurrentDay();
    // @ts-ignore
    return !shop.timetable[today].isClosed;
  }

  isClosedToday(shop) {
    const today = TimeHelper.getCurrentDay();
    // @ts-ignore
    return shop.timetable[today].isClosed;
  }

  getDeliveryFee(shop, distanceInKm) {
    let deliveryFee = shop.deliveryFeeMin;
    if (distanceInKm > 1) {
      deliveryFee = shop.deliveryFeeMin + (shop.deliveryFeePerKm * (distanceInKm - 1));
    }
    deliveryFee = Math.min(deliveryFee, shop.deliveryFeeMax);
    deliveryFee = Math.round((deliveryFee + Number.EPSILON) * 100) / 100;
    return deliveryFee;
  }

}
