import { auth, database } from "../../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { parse, differenceInMonths } from "date-fns";

import * as Notifications from "expo-notifications";

export const HandleNotification = async ({ setNap }) => {
  const user = auth.currentUser.email;

  const docRefBabies = doc(database, "babies", user);
  const docSnapBabies = await getDoc(docRefBabies);
  const dob = docSnapBabies.data().dob;

  if (dob) {
    const birth = parse(dob, "MM/dd/yyyy", new Date());
    const month = differenceInMonths(new Date(), birth);
    switchFunc({ month, setNap });
  }
};

let trigger = null;

const switchFunc = ({ month, setNap }) => {
  if (month === 0) {
    trigger = Date.now() + 1500000;
    // trigger = Date.now() + 10000;
  } else if (month > 0 && month <= 1) {
    trigger = Date.now() + 2400000;
  } else if (month > 1 && month <= 2) {
    trigger = Date.now() + 3900000;
  } else if (month > 2 && month <= 3) {
    trigger = Date.now() + 4800000;
  } else if (month > 3 && month <= 4) {
    trigger = Date.now() + 5550000;
  } else if (month > 4 && month <= 5) {
    trigger = Date.now() + 6300000;
  } else if (month > 5 && month <= 6) {
    trigger = Date.now() + 9450000;
  } else if (month > 6 && month <= 7) {
    trigger = Date.now() + 10800000;
  } else if (month > 7 && month <= 8) {
    trigger = Date.now() + 12300000;
  } else if (month > 8 && month <= 9) {
    trigger = Date.now() + 12900000;
  } else if (month > 9 && month <= 10) {
    trigger = Date.now() + 14400000;
  } else if (month > 10 && month <= 11) {
    trigger = Date.now() + 15300000;
  } else if (month > 11 && month <= 12) {
    trigger = Date.now() + 16200000;
  } else if (month > 12 && month <= 17) {
    trigger = Date.now() + 18000000;
  } else if (month > 17 && month <= 18) {
    trigger = Date.now() + 19800000;
  } else if (month > 18 && month <= 30) {
    trigger = Date.now() + 19800000;
  }

  sendPushNotification(trigger);
  setNap(trigger + 900000);
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
