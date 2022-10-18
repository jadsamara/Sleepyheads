import { auth, database } from "../../config/firebase";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  where,
  query,
  orderBy,
} from "firebase/firestore";
import { parse, differenceInMonths, format } from "date-fns";

import * as Notifications from "expo-notifications";

let trigger = null;

export const HandleNotification = async ({ setNap, flag }) => {
  const user = auth.currentUser.email;

  const docRefBabies = doc(database, "babies", user);
  const docSnapBabies = await getDoc(docRefBabies);
  const dob = docSnapBabies.data().dob;

  if (dob) {
    const birth = parse(dob, "MM/dd/yyyy", new Date());
    const month = differenceInMonths(new Date(), birth);

    if (flag) {
      threeDayFunc({ setNap, month });
    } else {
      switchFunc({ month, setNap });
    }
  }
};

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
  } else if (month > 18 && month <= 36) {
    trigger = Date.now() + 19800000;
  }

  sendPushNotification(trigger);
  setNap(trigger + 900000);
  // setNap(trigger);
};

const threeDayFunc = async ({ setNap, month }) => {
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
  medianAwakeTime({ temp, setNap, month });
};

const medianAwakeTime = ({ temp, setNap, month }) => {
  let mai = 0;
  let mar = 0;
  for (var i = 0; i < temp.length - 1; i++) {
    const awakeTimeCurrent = temp[i].dateStart - temp[i + 1].dateEnd;
    mai += awakeTimeCurrent;
  }
  mai = mai / temp.length;
  mar += mai / 3;

  threeDayNap({ month, setNap, mar });
};

const threeDayNap = ({ month, setNap, mar }) => {
  let min = 0;
  let max = 0;
  let napAt = 0;
  if (month === 0) {
    min = 1200000;
    max = 3600000;
    if (min <= mar && mar <= max) {
      napAt = mar + Date.now();
    } else if (mar < min) {
      napAt = min + Date.now();
    } else {
      napAt = max + Date.now();
    }
  } else if (month > 0 && month <= 1) {
    min = 3000000;
    max = 3600000;
    if (min <= mar && mar <= max) {
      napAt = mar + Date.now();
    } else if (mar < min) {
      napAt = min + Date.now();
    } else {
      napAt = max + Date.now();
    }
  } else if (month > 1 && month <= 2) {
    min = 3600000;
    max = 6000000;
    if (min <= mar && mar <= max) {
      napAt = mar + Date.now();
    } else if (mar < min) {
      napAt = min + Date.now();
    } else {
      napAt = max + Date.now();
    }
  } else if (month > 2 && month <= 3) {
    min = 4200000;
    max = 7200000;
    if (min <= mar && mar <= max) {
      napAt = mar + Date.now();
    } else if (mar < min) {
      napAt = min + Date.now();
    } else {
      napAt = max + Date.now();
    }
  } else if (month > 3 && month <= 4) {
    min = 4800000;
    max = 8100000;
    if (min <= mar && mar <= max) {
      napAt = mar + Date.now();
    } else if (mar < min) {
      napAt = min + Date.now();
    } else {
      napAt = max + Date.now();
    }
  } else if (month > 4 && month <= 5) {
    min = 5400000;
    max = 9000000;
    if (min <= mar && mar <= max) {
      napAt = mar + Date.now();
    } else if (mar < min) {
      napAt = min + Date.now();
    } else {
      napAt = max + Date.now();
    }
  } else if (month > 5 && month <= 6) {
    min = 8100000;
    max = 12600000;
    if (min <= mar && mar <= max) {
      napAt = mar + Date.now();
    } else if (mar < min) {
      napAt = min + Date.now();
    } else {
      napAt = max + Date.now();
    }
  } else if (month > 6 && month <= 7) {
    min = 9000000;
    max = 14400000;
    if (min <= mar && mar <= max) {
      napAt = mar + Date.now();
    } else if (mar < min) {
      napAt = min + Date.now();
    } else {
      napAt = max + Date.now();
    }
  } else if (month > 7 && month <= 8) {
    min = 10800000;
    max = 15600000;
    if (min <= mar && mar <= max) {
      napAt = mar + Date.now();
    } else if (mar < min) {
      napAt = min + Date.now();
    } else {
      napAt = max + Date.now();
    }
  } else if (month > 8 && month <= 9) {
    min = 10800000;
    max = 16800000;
    if (min <= mar && mar <= max) {
      napAt = mar + Date.now();
    } else if (mar < min) {
      napAt = min + Date.now();
    } else {
      napAt = max + Date.now();
    }
  } else if (month > 9 && month <= 10) {
    min = 12600000;
    max = 18000000;
    if (min <= mar && mar <= max) {
      napAt = mar + Date.now();
    } else if (mar < min) {
      napAt = min + Date.now();
    } else {
      napAt = max + Date.now();
    }
  } else if (month > 10 && month <= 11) {
    min = 12600000;
    max = 19800000;
    if (min <= mar && mar <= max) {
      napAt = mar + Date.now();
    } else if (mar < min) {
      napAt = min + Date.now();
    } else {
      napAt = max + Date.now();
    }
  } else if (month > 11 && month <= 12) {
    min = 12600000;
    max = 21600000;
    if (min <= mar && mar <= max) {
      napAt = mar + Date.now();
    } else if (mar < min) {
      napAt = min + Date.now();
    } else {
      napAt = max + Date.now();
    }
  } else if (month > 12 && month <= 17) {
    min = 14400000;
    max = 23400000;
    if (min <= mar && mar <= max) {
      napAt = mar + Date.now();
    } else if (mar < min) {
      napAt = min + Date.now();
    } else {
      napAt = max + Date.now();
    }
  } else if (month > 17 && month <= 18) {
    min = 18000000;
    max = 23400000;
    if (min <= mar && mar <= max) {
      napAt = mar + Date.now();
    } else if (mar < min) {
      napAt = min + Date.now();
    } else {
      napAt = max + Date.now();
    }
  } else if (month > 18 && month <= 36) {
    min = 18000000;
    max = 23400000;
    if (min <= mar && mar <= max) {
      napAt = mar + Date.now();
    } else if (mar < min) {
      napAt = min + Date.now();
    } else {
      napAt = max + Date.now();
    }
  }
  setNap(napAt);
  trigger = napAt - 900000;
  sendPushNotification(trigger);
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
