import { auth, database } from "../../config/firebase";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  where,
  query,
  orderBy,
  setDoc,
} from "firebase/firestore";
import { parse, differenceInMonths, format, differenceInWeeks } from "date-fns";

import * as Notifications from "expo-notifications";

let trigger = null;
let SAR = 0;
let MAR = 0;
let totalAwaketime = 0;
let napsPerDay = 0;

export const threeDayFunc = ({ editedOn, date, setNapText, type, setWake }) => {
  Notifications.cancelAllScheduledNotificationsAsync();
  getInfo(editedOn, date, setNapText, type, setWake);
};

const getInfo = async (editedOn, date, setNapText, type, setWake) => {
  const user = auth.currentUser.email;

  const docRefBabies = doc(database, "babies", user);
  const docSnapBabies = await getDoc(docRefBabies);
  const dob = docSnapBabies.data().dob;
  if (dob) {
    const birth = parse(dob, "MM/dd/yyyy", new Date());
    const month = differenceInMonths(new Date(), birth);
    const week = differenceInWeeks(new Date(), birth);

    threeDayDataFunc({
      month,
      editedOn,
      date,
      setNapText,
      user,
      week,
      type,
      setWake,
    });
  }
};

const wakeUpFunc = async ({ month, setNapText, setWake }) => {
  const newDate = new Date().getHours();

  if (newDate >= 10 && newDate <= 20) {
    if (
      (month >= 5 && napsPerDay >= 3 && SAR - totalAwaketime < MAR - 1500000) ||
      (month >= 10 && napsPerDay >= 2 && SAR - totalAwaketime < MAR - 1500000)
    ) {
      trigger = 1200000 + Date.now();
    } else if (month <= 3) {
      trigger = 9000000 + Date.now();
    } else if (month > 3) {
      trigger = 7200000 + Date.now();
    }
    const text = "Wake Up Soon!";
    sendPushNotification(trigger - 300000, text);
    const formattedtimeToNext = format(trigger, "h:mm aaaaa'm'");
    setNapText("Wake up at " + formattedtimeToNext);
    setWake(trigger);
  } else {
    setNapText("");
    setWake(1);
  }
};

const threeDayDataFunc = async ({
  month,
  editedOn,
  date,
  setNapText,
  user,
  week,
  type,
  setWake,
}) => {
  const tempOne = [];
  const tempTwo = [];
  const tempThree = [];
  const totalSleepDay = [];
  const totalSleep = [];

  const sameDay = Date.now();
  const oneDate = Date.now() - 86400000;
  const twoDate = Date.now() - 172800000;
  const threeDate = Date.now() - 259200000;
  const fourDate = Date.now() - 345600000;

  const formattedDateSameDay = format(sameDay, "yyyy-MM-dd");
  const formattedDateOne = format(oneDate, "yyyy-MM-dd");
  const formattedDateTwo = format(twoDate, "yyyy-MM-dd");
  const formattedDateThree = format(threeDate, "yyyy-MM-dd");
  const formattedDateFour = format(fourDate, "yyyy-MM-dd");

  const docRef = collection(database, "SleepingTimer");
  const q = query(
    docRef,
    where("user", "==", user),
    orderBy("dateEnd", "desc")
  );
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const start = format(data.dateStart, "yyyy-MM-dd");
    const end = format(data.dateEnd, "yyyy-MM-dd");
    const newDate = new Date(data.dateEnd).getHours();
    totalSleep.push(data);

    if (
      (formattedDateOne === start && formattedDateOne !== end) ||
      (formattedDateSameDay === start && formattedDateSameDay === end)
    ) {
      totalSleepDay.push(data);
    }
    if (
      (formattedDateTwo === start && formattedDateTwo !== end) ||
      (formattedDateOne === start && formattedDateOne === end) ||
      (formattedDateSameDay !== start && formattedDateSameDay === end)
    ) {
      tempOne.push(data);
    }
    if (
      (formattedDateThree === start && formattedDateThree !== end) ||
      (formattedDateTwo === start && formattedDateTwo === end) ||
      (formattedDateOne !== start && formattedDateOne === end)
    ) {
      tempTwo.push(data);
    }
    if (
      (formattedDateFour === start && formattedDateFour !== end) ||
      (formattedDateThree === start && formattedDateThree === end) ||
      (formattedDateTwo !== start && formattedDateTwo === end)
    ) {
      tempThree.push(data);
    }
    if (
      formattedDateSameDay === start &&
      formattedDateSameDay === end &&
      newDate >= 10 &&
      newDate < 20
    ) {
      napsPerDay += 1;
    }
  });

  getSAR({
    tempOne,
    tempTwo,
    tempThree,
    month,
  });

  getMAR({
    tempOne,
    tempTwo,
    tempThree,
    month,
  });

  getTotalAwake({ totalSleepDay });

  if (type === "wake") {
    wakeUpFunc({ month, setNapText, setWake });
  } else {
    if (week >= 6) {
      defineBedtime({
        totalSleep,
        month,
        setNapText,
        date,
        editedOn,
        user,
      });
    } else {
      threeDayNextNap({ month, setNapText, date, editedOn, user });
    }
  }
};

const defineBedtime = async ({
  totalSleep,
  month,
  setNapText,
  date,
  editedOn,
  user,
}) => {
  let bedTime = 0;
  const newSAR = SAR - totalAwaketime;
  const valInHours = newSAR / 60000 / 60;
  const marInHours = MAR / 60000 / 60;

  if (napsPerDay <= 4) {
    if (valInHours <= marInHours * 1.15) {
      bedTime = newSAR + totalSleep[0].dateEnd;
    }
  } else if (napsPerDay <= 2) {
    if (valInHours <= marInHours * 1.3) {
      bedTime = newSAR + totalSleep[0].dateEnd;
    }
  } else if (valInHours <= marInHours * 1.05) {
    bedTime = newSAR + totalSleep[0].dateEnd;
  }

  if (bedTime !== 0) {
    trigger = bedTime;
    const text = "Bedtime soon!";
    sendPushNotification(trigger - 900000, text);
    const formattedtimeToNext = format(bedTime, "h:mm aaaaa'm'");
    setNapText("Bedtime At " + formattedtimeToNext);
    await setDoc(doc(database, "CurrentSleep", user), {
      bedTime: bedTime,
    });
  } else {
    threeDayNextNap({ month, setNapText, date, editedOn, user });
  }
};

const threeDayNextNap = async ({ month, date, setNapText, editedOn, user }) => {
  let min = 0;
  let max = 0;
  let napAt = 0;

  if (!editedOn) {
    if (month === 0) {
      min = 1200000;
      max = 3600000;
      if (min <= MAR && MAR <= max) {
        napAt = MAR + Date.now();
      } else if (MAR < min) {
        napAt = min + Date.now();
      } else if (MAR > max) {
        napAt = max + Date.now();
      }
    } else if (month === 1) {
      min = 3000000;
      max = 3600000;
      if (min <= MAR && MAR <= max) {
        napAt = MAR + Date.now();
      } else if (MAR < min) {
        napAt = min + Date.now();
      } else if (MAR > max) {
        napAt = max + Date.now();
      }
    } else if (month === 2) {
      min = 3600000;
      max = 6000000;
      if (min <= MAR && MAR <= max) {
        napAt = MAR + Date.now();
      } else if (MAR < min) {
        napAt = min + Date.now();
      } else if (MAR > max) {
        napAt = max + Date.now();
      }
    } else if (month === 3) {
      min = 4200000;
      max = 7200000;
      if (min <= MAR && MAR <= max) {
        napAt = MAR + Date.now();
      } else if (MAR < min) {
        napAt = min + Date.now();
      } else if (MAR > max) {
        napAt = max + Date.now();
      }
    } else if (month === 4) {
      min = 4800000;
      max = 8100000;
      if (min <= MAR && MAR <= max) {
        napAt = MAR + Date.now();
      } else if (MAR < min) {
        napAt = min + Date.now();
      } else if (MAR > max) {
        napAt = max + Date.now();
      }
    } else if (month === 5) {
      min = 5400000;
      max = 9000000;
      if (min <= MAR && MAR <= max) {
        napAt = MAR + Date.now();
      } else if (MAR < min) {
        napAt = min + Date.now();
      } else if (MAR > max) {
        napAt = max + Date.now();
      }
    } else if (month === 6) {
      min = 8100000;
      max = 12600000;
      if (min <= MAR && MAR <= max) {
        napAt = MAR + Date.now();
      } else if (MAR < min) {
        napAt = min + Date.now();
      } else if (MAR > max) {
        napAt = max + Date.now();
      }
    } else if (month === 7) {
      min = 9000000;
      max = 14400000;
      if (min <= MAR && MAR <= max) {
        napAt = MAR + Date.now();
      } else if (MAR < min) {
        napAt = min + Date.now();
      } else if (MAR > max) {
        napAt = max + Date.now();
      }
    } else if (month === 8) {
      min = 10800000;
      max = 15600000;
      if (min <= MAR && MAR <= max) {
        napAt = MAR + Date.now();
      } else if (MAR < min) {
        napAt = min + Date.now();
      } else if (MAR > max) {
        napAt = max + Date.now();
      }
    } else if (month === 9) {
      min = 10800000;
      max = 16800000;
      if (min <= MAR && MAR <= max) {
        napAt = MAR + Date.now();
      } else if (MAR < min) {
        napAt = min + Date.now();
      } else if (MAR > max) {
        napAt = max + Date.now();
      }
    } else if (month === 10) {
      min = 12600000;
      max = 18000000;
      if (min <= MAR && MAR <= max) {
        napAt = MAR + Date.now();
      } else if (MAR < min) {
        napAt = min + Date.now();
      } else if (MAR > max) {
        napAt = max + Date.now();
      }
    } else if (month === 11) {
      min = 12600000;
      max = 19800000;
      if (min <= MAR && MAR <= max) {
        napAt = MAR + Date.now();
      } else if (MAR < min) {
        napAt = min + Date.now();
      } else if (MAR > max) {
        napAt = max + Date.now();
      }
    } else if (month === 12) {
      min = 12600000;
      max = 21600000;
      if (min <= MAR && MAR <= max) {
        napAt = MAR + Date.now();
      } else if (MAR < min) {
        napAt = min + Date.now();
      } else if (MAR > max) {
        napAt = max + Date.now();
      }
    } else if (month >= 13 && month < 18) {
      min = 14400000;
      max = 23400000;
      if (min <= MAR && MAR <= max) {
        napAt = MAR + Date.now();
      } else if (MAR < min) {
        napAt = min + Date.now();
      } else if (MAR > max) {
        napAt = max + Date.now();
      }
    } else if (month >= 18 && month < 37) {
      min = 18000000;
      max = 23400000;
      if (min <= MAR && MAR <= max) {
        napAt = MAR + Date.now();
      } else if (MAR < min) {
        napAt = min + Date.now();
      } else if (MAR > max) {
        napAt = max + Date.now();
      }
    }
  } else {
    if (month === 0) {
      min = 1200000;
      max = 3600000;
      if (min <= MAR && MAR <= max) {
        napAt = MAR + date.getTime();
      } else if (MAR < min) {
        napAt = min + date.getTime();
      } else if (MAR > max) {
        napAt = max + date.getTime();
      }
    } else if (month === 1) {
      min = 3000000;
      max = 3600000;
      if (min <= MAR && MAR <= max) {
        napAt = MAR + date.getTime();
      } else if (MAR < min) {
        napAt = min + date.getTime();
      } else if (MAR > max) {
        napAt = max + date.getTime();
      }
    } else if (month === 2) {
      min = 3600000;
      max = 6000000;
      if (min <= MAR && MAR <= max) {
        napAt = MAR + date.getTime();
      } else if (MAR < min) {
        napAt = min + date.getTime();
      } else if (MAR > max) {
        napAt = max + date.getTime();
      }
    } else if (month === 3) {
      min = 4200000;
      max = 7200000;
      if (min <= MAR && MAR <= max) {
        napAt = MAR + date.getTime();
      } else if (MAR < min) {
        napAt = min + date.getTime();
      } else if (MAR > max) {
        napAt = max + date.getTime();
      }
    } else if (month === 4) {
      min = 4800000;
      max = 8100000;
      if (min <= MAR && MAR <= max) {
        napAt = MAR + date.getTime();
      } else if (MAR < min) {
        napAt = min + date.getTime();
      } else if (MAR > max) {
        napAt = max + date.getTime();
      }
    } else if (month === 5) {
      min = 5400000;
      max = 9000000;
      if (min <= MAR && MAR <= max) {
        napAt = MAR + date.getTime();
      } else if (MAR < min) {
        napAt = min + date.getTime();
      } else if (MAR > max) {
        napAt = max + date.getTime();
      }
    } else if (month === 6) {
      min = 8100000;
      max = 12600000;
      if (min <= MAR && MAR <= max) {
        napAt = MAR + date.getTime();
      } else if (MAR < min) {
        napAt = min + date.getTime();
      } else if (MAR > max) {
        napAt = max + date.getTime();
      }
    } else if (month === 7) {
      min = 9000000;
      max = 14400000;
      if (min <= MAR && MAR <= max) {
        napAt = MAR + date.getTime();
      } else if (MAR < min) {
        napAt = min + date.getTime();
      } else if (MAR > max) {
        napAt = max + date.getTime();
      }
    } else if (month === 8) {
      min = 10800000;
      max = 15600000;
      if (min <= MAR && MAR <= max) {
        napAt = MAR + date.getTime();
      } else if (MAR < min) {
        napAt = min + date.getTime();
      } else if (MAR > max) {
        napAt = max + date.getTime();
      }
    } else if (month === 9) {
      min = 10800000;
      max = 16800000;
      if (min <= MAR && MAR <= max) {
        napAt = MAR + date.getTime();
      } else if (MAR < min) {
        napAt = min + date.getTime();
      } else if (MAR > max) {
        napAt = max + date.getTime();
      }
    } else if (month === 10) {
      min = 12600000;
      max = 18000000;
      if (min <= MAR && MAR <= max) {
        napAt = MAR + date.getTime();
      } else if (MAR < min) {
        napAt = min + date.getTime();
      } else if (MAR > max) {
        napAt = max + date.getTime();
      }
    } else if (month === 11) {
      min = 12600000;
      max = 19800000;
      if (min <= MAR && MAR <= max) {
        napAt = MAR + date.getTime();
      } else if (MAR < min) {
        napAt = min + date.getTime();
      } else if (MAR > max) {
        napAt = max + date.getTime();
      }
    } else if (month === 12) {
      min = 12600000;
      max = 21600000;
      if (min <= MAR && MAR <= max) {
        napAt = MAR + date.getTime();
      } else if (MAR < min) {
        napAt = min + date.getTime();
      } else if (MAR > max) {
        napAt = max + date.getTime();
      }
    } else if (month >= 13 && month < 18) {
      min = 14400000;
      max = 23400000;
      if (min <= MAR && MAR <= max) {
        napAt = MAR + date.getTime();
      } else if (MAR < min) {
        napAt = min + date.getTime();
      } else if (MAR > max) {
        napAt = max + date.getTime();
      }
    } else if (month >= 18 && month < 37) {
      min = 18000000;
      max = 23400000;
      if (min <= MAR && MAR <= max) {
        napAt = MAR + date.getTime();
      } else if (MAR < min) {
        napAt = min + date.getTime();
      } else if (MAR > max) {
        napAt = max + date.getTime();
      }
    }
  }
  const text = "Time To Sleep Soon!";
  trigger = napAt - 900000;
  sendPushNotification(trigger, text);
  const formattedtimeToNext = format(napAt, "h:mm aaaaa'm'");
  setNapText("Time to sleep " + formattedtimeToNext);
  await setDoc(doc(database, "CurrentSleep", user), {
    newNap: napAt,
  });
};

const getSAR = ({ tempOne, tempTwo, tempThree, month }) => {
  let totalAwakeOne = 0;
  let totalAwakeTwo = 0;
  let totalAwakeThree = 0;

  for (var i = 0; i < tempOne.length - 1; i++) {
    const val = tempOne[i].dateStart - tempOne[i + 1].dateEnd;
    totalAwakeOne += val;
  }
  for (var i = 0; i < tempTwo.length - 1; i++) {
    const val = tempTwo[i].dateStart - tempTwo[i + 1].dateEnd;
    totalAwakeTwo += val;
  }
  for (var i = 0; i < tempThree.length - 1; i++) {
    const val = tempThree[i].dateStart - tempThree[i + 1].dateEnd;
    totalAwakeThree += val;
  }
  const total = totalAwakeOne + totalAwakeTwo + totalAwakeThree;
  SAR = total / 3;
  let min = 0;
  let max = 0;

  if (month >= 0 && month < 3) {
    min = 21600000;
    max = 32400000;

    if (SAR > max) {
      SAR = max;
    } else if (SAR < min) {
      SAR = min;
    }
  } else if (month === 3) {
    min = 25200000;
    max = 36000000;

    if (SAR > max) {
      SAR = max;
    } else if (SAR < min) {
      SAR = min;
    }
  } else if (month >= 4 && month < 6) {
    min = 28800000;
    max = 36000000;

    if (SAR > max) {
      SAR = max;
    } else if (SAR < min) {
      SAR = min;
    }
  } else if (month === 6) {
    min = 28800000;
    max = 39600000;

    if (SAR > max) {
      SAR = max;
    } else if (SAR < min) {
      SAR = min;
    }
  } else if (month >= 7 && month < 14) {
    min = 32400000;
    max = 43200000;

    if (SAR > max) {
      SAR = max;
    } else if (SAR < min) {
      SAR = min;
    }
  } else if (month >= 14 && month < 37) {
    min = 32400000;
    max = 46800000;
    if (SAR > max) {
      SAR = max;
    } else if (SAR < min) {
      SAR = min;
    }
  }
  return SAR;
};

const getMAR = ({ tempOne, tempTwo, tempThree }) => {
  const arrOne = [];
  const arrTwo = [];
  const arrThree = [];
  for (var i = 0; i < tempOne.length - 1; i++) {
    const val = tempOne[i].dateStart - tempOne[i + 1].dateEnd;

    arrOne.push(val);
  }
  for (var i = 0; i < tempTwo.length - 1; i++) {
    const val = tempTwo[i].dateStart - tempTwo[i + 1].dateEnd;
    arrTwo.push(val);
  }
  for (var i = 0; i < tempThree.length - 1; i++) {
    const val = tempThree[i].dateStart - tempThree[i + 1].dateEnd;

    arrThree.push(val);
  }
  const midOne = Math.floor(arrOne.length / 2);
  const numsOne = [...arrOne].sort((a, b) => a - b);
  const maiOne =
    arrOne.length % 2 !== 0
      ? numsOne[midOne]
      : (numsOne[midOne - 1] + numsOne[midOne]) / 2;

  const midTwo = Math.floor(arrTwo.length / 2);
  const numsTwo = [...arrTwo].sort((a, b) => a - b);
  const maiTwo =
    arrTwo.length % 2 !== 0
      ? numsTwo[midTwo]
      : (numsTwo[midTwo - 1] + numsTwo[midTwo]) / 2;

  const midThree = Math.floor(arrThree.length / 2);
  const numsThree = [...arrThree].sort((a, b) => a - b);
  const maiThree =
    arrThree.length % 2 !== 0
      ? numsThree[midThree]
      : (numsThree[midThree - 1] + numsThree[midThree]) / 2;

  const totalMai = maiOne + maiTwo + maiThree;
  MAR = totalMai / 3;
};

const getTotalAwake = ({ totalSleepDay }) => {
  for (var i = 0; i < totalSleepDay.length - 1; i++) {
    const val = totalSleepDay[i].dateStart - totalSleepDay[i + 1].dateEnd;
    totalAwaketime += val;
  }
};

async function sendPushNotification(trigger, text) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Sleepyheads",
      body: text,
      sound: true,
    },
    trigger,
  });

  totalAwaketime = 0;
  napsPerDay = 0;
}
