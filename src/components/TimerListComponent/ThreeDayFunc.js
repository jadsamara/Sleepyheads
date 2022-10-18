import { auth, database } from "../../config/firebase";
import {
  getDocs,
  collection,
  where,
  query,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";

import { format, parse, differenceInMonths } from "date-fns";

import * as Notifications from "expo-notifications";

let awakeTimeTotal = 0;

let totalDaySleep = 0;
let totalNightSleep = 0;

const dayNightSleep = (temp) => {
  for (var i = 0; i < temp.length; i++) {
    const newDateStart = new Date(temp[i].dateStart).toLocaleDateString(
      "en-US"
    );
    const newDateEnd = new Date(temp[i].dateEnd).toLocaleDateString("en-US");

    if (newDateStart !== newDateEnd) {
      const currentNightSleepOne = temp[i].dateEnd - temp[i].dateStart;
      const currentNightSleepTwo = temp[i + 1].dateEnd - temp[i + 1].dateStart;
      totalNightSleep = currentNightSleepOne + currentNightSleepTwo;
      i++;
    } else {
      const currentDaySleep = temp[i].dateEnd - temp[i].dateStart;
      totalDaySleep += currentDaySleep;
    }
  }
};

const totalAwakeTime = (temp) => {
  for (var i = 0; i < temp.length - 1; i++) {
    const awakeTimeCurrent = temp[i].dateStart - temp[i + 1].dateEnd;
    awakeTimeTotal += awakeTimeCurrent;
  }
};

export const ThreeDayFunc = async ({ setNap }) => {
  const temp = [];
  const user = auth.currentUser.email;

  const oneDate = Date.now() - 86400000;
  const twoDate = Date.now() - 172800000;
  const threeDate = Date.now() - 259200000;

  const docRef = collection(database, "SleepingTimer");
  const q = query(
    docRef,
    where("user", "==", user),
    orderBy("dateEnd", "desc")
  );
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const formattedDateOne = format(oneDate, "yyyy-MM-dd");
    const formattedDateTwo = format(twoDate, "yyyy-MM-dd");
    const formattedDateThree = format(threeDate, "yyyy-MM-dd");
    const formattedStart = format(data.dateStart, "yyyy-MM-dd");
    if (
      formattedDateOne === formattedStart ||
      formattedDateTwo === formattedStart ||
      formattedDateThree === formattedStart
    ) {
      temp.push(data);
    }
  });

  // dayNightSleep(temp);
  // totalAwakeTime(temp);
  // medianAwakeTime({ temp, setNap });
};

async function sendPushNotification(trigger) {
  Notifications.scheduleNotificationAsync({
    content: {
      title: "Sleepyheads",
      body: "Time to sleep soon.",
      sound: true,
    },
    trigger,
  });
}
