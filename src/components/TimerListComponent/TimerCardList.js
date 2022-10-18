import React, { useEffect, useState, useContext } from "react";
import { View, FlatList, Alert, Dimensions } from "react-native";
import styled from "styled-components/native";

import * as Notifications from "expo-notifications";

import { TimerContext } from "./TimerProvider";
import { TimerCard } from "./TimerCard";
import { HandleNotification } from "../reusable/HandleNotification";

import DatePicker from "react-native-date-picker";
import { parse, differenceInMonths, format } from "date-fns";

import { auth, database } from "../../config/firebase";
import {
  getDocs,
  collection,
  where,
  query,
  orderBy,
  deleteDoc,
  updateDoc,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

export const TimerCardList = ({ buttonState, type }) => {
  const user = auth.currentUser.email;

  const { setNapText, flag } = useContext(TimerContext);
  const [arr, setArr] = useState([]);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [editedOn, setEditedOn] = useState(false);

  useEffect(() => {
    const getData = async () => {
      let temp = [];
      const docRef = collection(database, type);
      const q = query(
        docRef,
        where("user", "==", user),
        orderBy("dateEnd", "desc")
      );
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const newDateStart = new Date(doc.data().dateStart);
        const newDateEnd = new Date(doc.data().dateEnd);
        const formattedDateStart = format(newDateStart, "LLLL dd, ");
        const formattedDateEnd = format(newDateEnd, "LLLL dd, h:mm aaaaa'm'");
        data.dateStartFormat = formattedDateStart + data.time;
        data.dateEndFormat = formattedDateEnd;

        temp.push(data);
      });
      setArr(temp);
    };
    setRefresh(false);
    getData();
  }, [buttonState, type, refresh]);

  const deleteItem = async (randomID, index) => {
    const docRef = collection(database, type);
    const q = query(docRef, where("randomID", "==", randomID));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      deleteDoc(doc.ref);
    });

    if (index === 0 && type === "SleepingTimer") {
      if (doc(database, "CurrentSleep", user)) {
        await deleteDoc(doc(database, "CurrentSleep", user));
        setNapText("");
      }
    }

    let _arr = arr.filter((_item, _index) => _index !== index);
    setArr(_arr);
  };

  const confirmDate = async (date) => {
    setOpenDatePicker(false);
    setEditedOn(true);
    if (date > arr[0].dateStart) {
      const docRef = collection(database, type);
      const q = query(docRef, where("randomID", "==", arr[0].randomID));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach(async (doc) => {
        const data = doc.data();
        data.dateEnd = date.getTime();

        const timer = date.getTime() - data.dateStart;

        const hours = Math.floor(timer / 1000 / 60 / 60);
        const mins = Math.floor((timer / 1000 / 60) % 60);
        const seconds = Math.floor((timer / 1000) % 60);
        const displayHours = hours < 10 ? `0${hours}` : hours;
        const displayMins = mins < 10 ? `0${mins}` : mins;
        const displaySecs = seconds < 10 ? `0${seconds}` : seconds;
        let timerData = displayHours + ": " + displayMins + ": " + displaySecs;

        data.timerData = timerData;
        await updateDoc(doc.ref, data);
        setRefresh(true);
      });

      // HandleNotification({})

      const docRefBabies = doc(database, "babies", user);
      const docSnapBabies = await getDoc(docRefBabies);
      const dob = docSnapBabies.data().dob;

      if (dob) {
        const birth = parse(dob, "MM/dd/yyyy", new Date());
        const month = differenceInMonths(new Date(), birth);
        switchFunc(month, date);
      }
    } else {
      Alert.alert("Cannot have end time less than start time");
    }
  };
  const switchFunc = async (month, date) => {
    let trigger;
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

    if (type === "SleepingTimer") {
      sendPushNotification(trigger);
      const newNap = trigger + 900000;
      const formattedtimeToNext = format(newNap, "h:mm aaaaa'm'");
      setNapText(formattedtimeToNext);
      await setDoc(doc(database, "CurrentSleep", user), {
        newNap,
      });
    }
  };

  async function sendPushNotification(trigger) {
    Notifications.cancelAllScheduledNotificationsAsync();
    Notifications.scheduleNotificationAsync({
      content: {
        title: "Sleepyheads",
        body: "Time to sleep soon.",
        sound: true,
      },
      trigger,
    });
  }

  const editItem = () => {
    setOpenDatePicker(true);
  };

  const cancelDate = () => {
    setOpenDatePicker(false);
  };

  return (
    <Container>
      <ListContainer>
        <FlatList
          data={arr.slice(0, 20)}
          showsVerticalScrollIndicator={false}
          maxToRenderPerBatch={4}
          initialNumToRender={4}
          renderItem={({ item, index }) => {
            if (index === 0) {
              return (
                <>
                  <TimerCard
                    dateStart={item.dateStartFormat}
                    dateEnd={item.dateEndFormat}
                    timerData={item.timerData}
                    deleteItem={() => deleteItem(item.randomID, index)}
                    editItem={editItem}
                  />
                  <DatePicker
                    modal
                    open={openDatePicker}
                    date={new Date()}
                    mode="time"
                    onConfirm={confirmDate}
                    onCancel={cancelDate}
                    title="Edit end time"
                  />
                </>
              );
            } else {
              return (
                <TimerCard
                  dateStart={item.dateStartFormat}
                  dateEnd={item.dateEndFormat}
                  timerData={item.timerData}
                  deleteItem={() => deleteItem(item.randomID, index)}
                />
              );
            }
          }}
          keyExtractor={(item, index) => index}
        />
      </ListContainer>
    </Container>
  );
};

const Container = styled(View)`
  ${Dimensions.get("window").width &&
  `width: ${Dimensions.get("window").width}px`};
  align-items: center;
`;

const ListContainer = styled(View)`
  width: 80%;
`;
