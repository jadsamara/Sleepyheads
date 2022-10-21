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
import { parse, differenceInMonths, format } from "date-fns";

import * as Notifications from "expo-notifications";

let trigger = null;

export const HandleNotification = async ({
  flag,
  editedOn,
  date,
  setNapText,
}) => {
  onHandleSleep(flag, editedOn, date, setNapText);
};

const onHandleSleep = async (flag, editedOn, date, setNapText) => {
  const user = auth.currentUser.email;

  const docRefBabies = doc(database, "babies", user);
  const docSnapBabies = await getDoc(docRefBabies);
  const dob = docSnapBabies.data().dob;
  if (dob) {
    const birth = parse(dob, "MM/dd/yyyy", new Date());
    const month = differenceInMonths(new Date(), birth);
    if (flag) {
      console.log("hi");
      threeDayDataFunc({ month, editedOn, date, setNapText });
    } else {
      handleNextNap({ month, setNapText, date, editedOn });
    }
  }
};

const handleNextNap = async ({ month, setNapText, date, editedOn }) => {
  const user = auth.currentUser.email;
  if (!editedOn) {
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
    } else if (month > 18 && month <= 36) {
      trigger = Date.now() + 19800000;
    }
  } else {
    if (month === 0) {
      trigger = date.getTime() + 1500000;
      // trigger = Date.now() + 10000;
    } else if (month > 0 && month <= 1) {
      trigger = date.getTime() + 2400000;
    } else if (month > 1 && month <= 2) {
      trigger = date.getTime() + 3900000;
    } else if (month > 2 && month <= 3) {
      trigger = date.getTime() + 4800000;
    } else if (month > 3 && month <= 4) {
      trigger = date.getTime() + 5550000;
    } else if (month > 4 && month <= 5) {
      trigger = date.getTime() + 6300000;
    } else if (month > 5 && month <= 6) {
      trigger = date.getTime() + 9450000;
    } else if (month > 6 && month <= 7) {
      trigger = date.getTime() + 10800000;
    } else if (month > 7 && month <= 8) {
      trigger = date.getTime() + 12300000;
    } else if (month > 8 && month <= 9) {
      trigger = date.getTime() + 12900000;
    } else if (month > 9 && month <= 10) {
      trigger = date.getTime() + 14400000;
    } else if (month > 10 && month <= 11) {
      trigger = date.getTime() + 15300000;
    } else if (month > 11 && month <= 12) {
      trigger = date.getTime() + 16200000;
    } else if (month > 12 && month <= 17) {
      trigger = date.getTime() + 18000000;
    } else if (month > 17 && month <= 18) {
      trigger = date.getTime() + 19800000;
    } else if (month > 18 && month <= 30) {
      trigger = date.getTime() + 19800000;
    }
  }
  sendPushNotification(trigger);
  const newNap = trigger + 900000;
  const formattedtimeToNext = format(newNap, "h:mm aaaaa'm'");
  setNapText("Time to sleep " + formattedtimeToNext);
  await setDoc(doc(database, "CurrentSleep", user), {
    newNap,
  });
};

const threeDayDataFunc = async ({ month, editedOn, date, setNapText }) => {
  const user = auth.currentUser.email;

  const tempOne = [];
  const tempTwo = [];
  const tempThree = [];
  const oneDate = Date.now() - 86400000;
  const twoDate = Date.now() - 172800000;
  const threeDate = Date.now() - 259200000;
  const formattedDateOne = format(oneDate, "yyyy-MM-dd");
  const formattedDateTwo = format(twoDate, "yyyy-MM-dd");
  const formattedDateThree = format(threeDate, "yyyy-MM-dd");

  const docRef = collection(database, "SleepingTimer");
  const q = query(
    docRef,
    where("user", "==", user),
    orderBy("dateEnd", "desc")
  );
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const formatted = format(data.dateEnd, "yyyy-MM-dd");

    if (formattedDateOne === formatted) {
      tempOne.push(data);
    }
    if (formattedDateTwo === formatted) {
      tempTwo.push(data);
    }
    if (formattedDateThree === formatted) {
      tempThree.push(data);
    }
  });

  // dayNightSleep(temp);
  // totalAwakeTime(temp);
  medianAwakeTime({
    tempOne,
    tempTwo,
    tempThree,
    month,
    editedOn,
    date,
    setNapText,
  });
};

const medianAwakeTime = ({
  tempOne,
  tempTwo,
  tempThree,
  month,
  editedOn,
  date,
  setNapText,
}) => {
  let maiOne = 0;
  let maiTwo = 0;
  let maiThree = 0;
  let mar = 0;
  for (var i = 0; i < tempOne.length - 1; i++) {
    maiOne += tempOne[i].dateStart - tempOne[i + 1].dateEnd;
  }
  for (var i = 0; i < tempTwo.length - 1; i++) {
    maiTwo += tempTwo[i].dateStart - tempTwo[i + 1].dateEnd;
  }
  for (var i = 0; i < tempThree.length - 1; i++) {
    maiThree += tempThree[i].dateStart - tempThree[i + 1].dateEnd;
  }
  maiOne = maiOne / tempOne.length;
  maiTwo = maiTwo / tempTwo.length;
  maiThree = maiThree / tempThree.length;
  const totalMai = maiOne + maiTwo + maiThree;
  mar = totalMai / 3;

  threeDayNextNap({ month, mar, date, setNapText, editedOn });
};

const threeDayNextNap = async ({ month, mar, date, setNapText, editedOn }) => {
  let min = 0;
  let max = 0;
  let napAt = 0;
  const user = auth.currentUser.email;

  if (!editedOn) {
    if (month === 0) {
      min = 1200000;
      max = 3600000;
      if (min <= mar && mar <= max) {
        napAt = mar + Date.now();
      } else if (mar < min) {
        napAt = min + Date.now();
      } else if (mar > max) {
        napAt = max + Date.now();
      }
    } else if (month > 0 && month <= 1) {
      min = 3000000;
      max = 3600000;
      if (min <= mar && mar <= max) {
        napAt = mar + Date.now();
      } else if (mar < min) {
        napAt = min + Date.now();
      } else if (mar > max) {
        napAt = max + Date.now();
      }
    } else if (month > 1 && month <= 2) {
      min = 3600000;
      max = 6000000;
      if (min <= mar && mar <= max) {
        napAt = mar + Date.now();
      } else if (mar < min) {
        napAt = min + Date.now();
      } else if (mar > max) {
        napAt = max + Date.now();
      }
    } else if (month > 2 && month <= 3) {
      min = 4200000;
      max = 7200000;
      if (min <= mar && mar <= max) {
        napAt = mar + Date.now();
      } else if (mar < min) {
        napAt = min + Date.now();
      } else if (mar > max) {
        napAt = max + Date.now();
      }
    } else if (month > 3 && month <= 4) {
      min = 4800000;
      max = 8100000;
      if (min <= mar && mar <= max) {
        napAt = mar + Date.now();
      } else if (mar < min) {
        napAt = min + Date.now();
      } else if (mar > max) {
        napAt = max + Date.now();
      }
    } else if (month > 4 && month <= 5) {
      min = 5400000;
      max = 9000000;
      if (min <= mar && mar <= max) {
        napAt = mar + Date.now();
      } else if (mar < min) {
        napAt = min + Date.now();
      } else if (mar > max) {
        napAt = max + Date.now();
      }
    } else if (month > 5 && month <= 6) {
      min = 8100000;
      max = 12600000;
      if (min <= mar && mar <= max) {
        napAt = mar + Date.now();
      } else if (mar < min) {
        napAt = min + Date.now();
      } else if (mar > max) {
        napAt = max + Date.now();
      }
    } else if (month > 6 && month <= 7) {
      min = 9000000;
      max = 14400000;
      if (min <= mar && mar <= max) {
        napAt = mar + Date.now();
      } else if (mar < min) {
        napAt = min + Date.now();
      } else if (mar > max) {
        napAt = max + Date.now();
      }
    } else if (month > 7 && month <= 8) {
      min = 10800000;
      max = 15600000;
      if (min <= mar && mar <= max) {
        napAt = mar + Date.now();
      } else if (mar < min) {
        napAt = min + Date.now();
      } else if (mar > max) {
        napAt = max + Date.now();
      }
    } else if (month > 8 && month <= 9) {
      min = 10800000;
      max = 16800000;
      if (min <= mar && mar <= max) {
        napAt = mar + Date.now();
      } else if (mar < min) {
        napAt = min + Date.now();
      } else if (mar > max) {
        napAt = max + Date.now();
      }
    } else if (month > 9 && month <= 10) {
      min = 12600000;
      max = 18000000;
      if (min <= mar && mar <= max) {
        napAt = mar + Date.now();
      } else if (mar < min) {
        napAt = min + Date.now();
      } else if (mar > max) {
        napAt = max + Date.now();
      }
    } else if (month > 10 && month <= 11) {
      min = 12600000;
      max = 19800000;
      if (min <= mar && mar <= max) {
        napAt = mar + Date.now();
      } else if (mar < min) {
        napAt = min + Date.now();
      } else if (mar > max) {
        napAt = max + Date.now();
      }
    } else if (month > 11 && month <= 12) {
      min = 12600000;
      max = 21600000;
      if (min <= mar && mar <= max) {
        napAt = mar + Date.now();
      } else if (mar < min) {
        napAt = min + Date.now();
      } else if (mar > max) {
        napAt = max + Date.now();
      }
    } else if (month > 12 && month <= 17) {
      min = 14400000;
      max = 23400000;
      if (min <= mar && mar <= max) {
        napAt = mar + Date.now();
      } else if (mar < min) {
        napAt = min + Date.now();
      } else if (mar > max) {
        napAt = max + Date.now();
      }
    } else if (month > 17 && month <= 18) {
      min = 18000000;
      max = 23400000;
      if (min <= mar && mar <= max) {
        napAt = mar + Date.now();
      } else if (mar < min) {
        napAt = min + Date.now();
      } else if (mar > max) {
        napAt = max + Date.now();
      }
    } else if (month > 18 && month <= 36) {
      min = 18000000;
      max = 23400000;
      if (min <= mar && mar <= max) {
        napAt = mar + Date.now();
      } else if (mar < min) {
        napAt = min + Date.now();
      } else if (mar > max) {
        napAt = max + Date.now();
      }
    }
  } else {
    if (month === 0) {
      min = 1200000;
      max = 3600000;
      if (min <= mar && mar <= max) {
        napAt = mar + date.getTime();
      } else if (mar < min) {
        napAt = min + date.getTime();
      } else if (mar > max) {
        napAt = max + date.getTime();
      }
    } else if (month > 0 && month <= 1) {
      min = 3000000;
      max = 3600000;
      if (min <= mar && mar <= max) {
        napAt = mar + date.getTime();
      } else if (mar < min) {
        napAt = min + date.getTime();
      } else if (mar > max) {
        napAt = max + date.getTime();
      }
    } else if (month > 1 && month <= 2) {
      min = 3600000;
      max = 6000000;
      if (min <= mar && mar <= max) {
        napAt = mar + date.getTime();
      } else if (mar < min) {
        napAt = min + date.getTime();
      } else if (mar > max) {
        napAt = max + date.getTime();
      }
    } else if (month > 2 && month <= 3) {
      min = 4200000;
      max = 7200000;
      if (min <= mar && mar <= max) {
        napAt = mar + date.getTime();
      } else if (mar < min) {
        napAt = min + date.getTime();
      } else if (mar > max) {
        napAt = max + date.getTime();
      }
    } else if (month > 3 && month <= 4) {
      min = 4800000;
      max = 8100000;
      if (min <= mar && mar <= max) {
        napAt = mar + date.getTime();
      } else if (mar < min) {
        napAt = min + date.getTime();
      } else if (mar > max) {
        napAt = max + date.getTime();
      }
    } else if (month > 4 && month <= 5) {
      min = 5400000;
      max = 9000000;
      if (min <= mar && mar <= max) {
        napAt = mar + date.getTime();
      } else if (mar < min) {
        napAt = min + date.getTime();
      } else if (mar > max) {
        napAt = max + date.getTime();
      }
    } else if (month > 5 && month <= 6) {
      min = 8100000;
      max = 12600000;
      if (min <= mar && mar <= max) {
        napAt = mar + date.getTime();
      } else if (mar < min) {
        napAt = min + date.getTime();
      } else if (mar > max) {
        napAt = max + date.getTime();
      }
    } else if (month > 6 && month <= 7) {
      min = 9000000;
      max = 14400000;
      if (min <= mar && mar <= max) {
        napAt = mar + date.getTime();
      } else if (mar < min) {
        napAt = min + date.getTime();
      } else if (mar > max) {
        napAt = max + date.getTime();
      }
    } else if (month > 7 && month <= 8) {
      min = 10800000;
      max = 15600000;
      if (min <= mar && mar <= max) {
        napAt = mar + date.getTime();
      } else if (mar < min) {
        napAt = min + date.getTime();
      } else if (mar > max) {
        napAt = max + date.getTime();
      }
    } else if (month > 8 && month <= 9) {
      min = 10800000;
      max = 16800000;
      if (min <= mar && mar <= max) {
        napAt = mar + date.getTime();
      } else if (mar < min) {
        napAt = min + date.getTime();
      } else if (mar > max) {
        napAt = max + date.getTime();
      }
    } else if (month > 9 && month <= 10) {
      min = 12600000;
      max = 18000000;
      if (min <= mar && mar <= max) {
        napAt = mar + date.getTime();
      } else if (mar < min) {
        napAt = min + date.getTime();
      } else if (mar > max) {
        napAt = max + date.getTime();
      }
    } else if (month > 10 && month <= 11) {
      min = 12600000;
      max = 19800000;
      if (min <= mar && mar <= max) {
        napAt = mar + date.getTime();
      } else if (mar < min) {
        napAt = min + date.getTime();
      } else if (mar > max) {
        napAt = max + date.getTime();
      }
    } else if (month > 11 && month <= 12) {
      min = 12600000;
      max = 21600000;
      if (min <= mar && mar <= max) {
        napAt = mar + date.getTime();
      } else if (mar < min) {
        napAt = min + date.getTime();
      } else if (mar > max) {
        napAt = max + date.getTime();
      }
    } else if (month > 12 && month <= 17) {
      min = 14400000;
      max = 23400000;
      if (min <= mar && mar <= max) {
        napAt = mar + date.getTime();
      } else if (mar < min) {
        napAt = min + date.getTime();
      } else if (mar > max) {
        napAt = max + date.getTime();
      }
    } else if (month > 17 && month <= 18) {
      min = 18000000;
      max = 23400000;
      if (min <= mar && mar <= max) {
        napAt = mar + date.getTime();
      } else if (mar < min) {
        napAt = min + date.getTime();
      } else if (mar > max) {
        napAt = max + date.getTime();
      }
    } else if (month > 18 && month <= 36) {
      min = 18000000;
      max = 23400000;
      if (min <= mar && mar <= max) {
        napAt = mar + date.getTime();
      } else if (mar < min) {
        napAt = min + date.getTime();
      } else if (mar > max) {
        napAt = max + date.getTime();
      }
    }
  }
  trigger = napAt - 900000;
  sendPushNotification(trigger);

  const formattedtimeToNext = format(napAt, "h:mm aaaaa'm'");
  setNapText("Time to sleep " + formattedtimeToNext);
  await setDoc(doc(database, "CurrentSleep", user), {
    newNap: napAt,
  });
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
