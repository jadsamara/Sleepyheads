import React, { useEffect, useState, useContext } from "react";
import { View, FlatList, Alert, Dimensions } from "react-native";
import styled from "styled-components/native";

import * as Notifications from "expo-notifications";

import { TimerContext } from "./TimerProvider";
import { TimerCard } from "./TimerCard";
import { HandleNotification } from "../reusable/HandleNotification";

import DatePicker from "react-native-date-picker";
import { format } from "date-fns";

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
      Notifications.cancelAllScheduledNotificationsAsync();
      if (type === "SleepingTimer") {
        HandleNotification({ setNapText, flag, editedOn, date });
      }
    } else {
      Alert.alert("Cannot have end time less than start time");
    }
    setEditedOn(false);
  };

  const editItem = () => {
    setOpenDatePicker(true);
    setEditedOn(true);
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
