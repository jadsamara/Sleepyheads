import React, { useState, createContext, useEffect } from "react";
import { auth, database } from "../../config/firebase";
import { collection, getDocs, where, query, orderBy } from "firebase/firestore";

import { format } from "date-fns";

export const TimerContext = createContext({});

export const TimerProvider = ({ children }) => {
  const [napText, setNapText] = useState();
  const [flag, setFlag] = useState(false);

  const user = auth.currentUser.email;

  const checkThreeDay = async (date) => {
    const temp = [];
    const docRef = collection(database, "SleepingTimer");
    const q = query(
      docRef,
      where("user", "==", user),
      orderBy("dateEnd", "desc")
    );
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const formattedDate = format(date, "yyyy-MM-dd");
      const formattedStart = format(data.dateStart, "yyyy-MM-dd");
      if (formattedDate === formattedStart) {
        temp.push(data);
      }
    });
    if (temp.length === 0) {
      setFlag(false);
    } else {
      setFlag(true);
    }
  };

  useEffect(() => {
    // const oneDate = Date.now();
    const oneDate = Date.now() - 86400000;
    const twoDate = Date.now() - 172800000;
    const threeDate = Date.now() - 259200000;
    checkThreeDay(oneDate);
    checkThreeDay(twoDate);
    checkThreeDay(threeDate);
  }, [napText]);

  return (
    <TimerContext.Provider
      value={{
        napText,
        setNapText,
        flag,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};
