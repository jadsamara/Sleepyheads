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

export const nextNapFunc = ({
  editedOn,
  date,
  setNapText,
  type,
  setWake,
  dateStart,
}) => {
  Notifications.cancelAllScheduledNotificationsAsync();
  getInfo(editedOn, date, setNapText, type, setWake, dateStart);
};

const getInfo = async (
  editedOn,
  date,
  setNapText,
  type,
  setWake,
  dateStart
) => {
  const user = auth.currentUser.email;

  const docRefBabies = doc(database, "babies", user);
  const docSnapBabies = await getDoc(docRefBabies);
  const dob = docSnapBabies.data().dob;
  if (dob) {
    const birth = parse(dob, "MM/dd/yyyy", new Date());
    const month = differenceInMonths(new Date(), birth);
    const week = differenceInWeeks(new Date(), birth);

    generalFunc(
      month,
      setNapText,
      date,
      editedOn,
      user,
      week,
      type,
      setWake,
      dateStart
    );
  }
};

const generalFunc = async (
  month,
  setNapText,
  date,
  editedOn,
  user,
  week,
  type,
  setWake,
  dateStart
) => {
  const totalSleepDay = [];
  const totalSleep = [];

  const sameDay = Date.now();
  const oneDate = Date.now() - 86400000;

  const formattedDateSameDay = format(sameDay, "yyyy-MM-dd");
  const formattedDateOne = format(oneDate, "yyyy-MM-dd");

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
      formattedDateSameDay === start &&
      formattedDateSameDay === end &&
      newDate >= 10 &&
      newDate < 20
    ) {
      napsPerDay += 1;
    }
  });

  getSAR(month);
  getMAR(month);
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
      handleNextNap({ month, setNapText, date, editedOn, user });
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
    const text = "Bedtime soon!";
    trigger = bedTime;
    sendPushNotification(trigger - 900000, text);
    const formattedtimeToNext = format(bedTime, "h:mm aaaaa'm'");
    setNapText("Bedtime At " + formattedtimeToNext);
    await setDoc(doc(database, "CurrentSleep", user), {
      bedTime: bedTime,
    });
  } else {
    handleNextNap({ month, setNapText, date, editedOn, user });
  }
};

const wakeUpFunc = async ({ month, setNapText, setWake }) => {
  const newDate = new Date().getHours();

  if (newDate >= 10 && newDate <= 20) {
    if (
      (month >= 5 &&
        napsPerDay === 3 &&
        SAR - totalAwaketime < MAR - 1500000) ||
      (month >= 10 && napsPerDay === 2 && SAR - totalAwaketime < MAR - 1500000)
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

const handleNextNap = async ({ month, setNapText, date, editedOn, user }) => {
  if (!editedOn) {
    if (month === 0) {
      trigger = Date.now() + 2400000;
      // trigger = Date.now() + 10000;
    } else if (month === 1) {
      trigger = Date.now() + 3300000;
    } else if (month === 2) {
      trigger = Date.now() + 4800000;
    } else if (month === 3) {
      trigger = Date.now() + 5700000;
    } else if (month === 4) {
      trigger = Date.now() + 6450000;
    } else if (month === 5) {
      trigger = Date.now() + 7200000;
    } else if (month === 6) {
      trigger = Date.now() + 10350000;
    } else if (month === 7) {
      trigger = Date.now() + 11700000;
    } else if (month === 8) {
      trigger = Date.now() + 13200000;
    } else if (month === 9) {
      trigger = Date.now() + 13800000;
    } else if (month === 10) {
      trigger = Date.now() + 15300000;
    } else if (month === 11) {
      trigger = Date.now() + 16200000;
    } else if (month === 12) {
      trigger = Date.now() + 17100000;
    } else if (month >= 13 && month < 18) {
      trigger = Date.now() + 18900000;
    } else if (month >= 18 && month < 37) {
      trigger = Date.now() + 20700000;
    }
  } else {
    if (month === 0) {
      trigger = date.getTime() + 2400000;
      // trigger = Date.now() + 10000;
    } else if (month === 1) {
      trigger = date.getTime() + 3300000;
    } else if (month === 2) {
      trigger = date.getTime() + 4800000;
    } else if (month === 3) {
      trigger = date.getTime() + 5700000;
    } else if (month === 4) {
      trigger = date.getTime() + 6450000;
    } else if (month === 5) {
      trigger = date.getTime() + 7200000;
    } else if (month === 6) {
      trigger = date.getTime() + 10350000;
    } else if (month === 7) {
      trigger = date.getTime() + 11700000;
    } else if (month === 8) {
      trigger = date.getTime() + 13200000;
    } else if (month === 9) {
      trigger = date.getTime() + 13800000;
    } else if (month === 10) {
      trigger = date.getTime() + 15300000;
    } else if (month === 11) {
      trigger = date.getTime() + 16200000;
    } else if (month === 12) {
      trigger = date.getTime() + 17100000;
    } else if (month >= 13 && month < 18) {
      trigger = date.getTime() + 18900000;
    } else if (month >= 18 && month < 37) {
      trigger = date.getTime() + 20700000;
    }
  }

  const text = "Time To Sleep Soon!";
  sendPushNotification(trigger - 900000, text);
  const formattedtimeToNext = format(trigger, "h:mm aaaaa'm'");
  setNapText("Time to sleep " + formattedtimeToNext);
  await setDoc(doc(database, "CurrentSleep", user), {
    newNap: trigger,
  });
};

const getSAR = (month) => {
  if (month >= 0 && month < 3) {
    SAR = 27000000;
  } else if (month === 3) {
    SAR = 30600000;
  } else if (month >= 4 && month < 6) {
    SAR = 32400000;
  } else if (month === 6) {
    SAR = 34200000;
  } else if (month >= 7 && month < 14) {
    SAR = 37800000;
  } else if (month >= 14 && month < 37) {
    SAR = 39600000;
  }
};

const getMAR = (month) => {
  if (month === 0) {
    MAR = 2400000;
  } else if (month === 1) {
    MAR = 3300000;
  } else if (month === 2) {
    MAR = 4800000;
  } else if (month === 3) {
    MAR = 5700000;
  } else if (month === 4) {
    MAR = 6450000;
  } else if (month === 5) {
    MAR = 7200000;
  } else if (month === 6) {
    MAR = 10350000;
  } else if (month === 7) {
    MAR = 11700000;
  } else if (month === 8) {
    MAR = 13200000;
  } else if (month === 9) {
    MAR = 13800000;
  } else if (month === 10) {
    MAR = 15300000;
  } else if (month === 11) {
    MAR = 16200000;
  } else if (month === 12) {
    MAR = 17100000;
  } else if (month >= 13 && month < 18) {
    MAR = 18900000;
  } else if (month >= 18 && month < 37) {
    MAR = 20700000;
  }
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
