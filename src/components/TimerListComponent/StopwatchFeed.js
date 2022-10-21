// Stopwatch front end for sleeping screen
import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";
import styled from "styled-components/native";

import { TimerCardList } from "./TimerCardList";

import { auth, database } from "../../config/firebase";
import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";

import { format } from "date-fns";
import DatePicker from "react-native-date-picker";
import uuid from "react-native-uuid";

export const StopwatchFeed = ({ type, val }) => {
  const user = auth.currentUser.email;
  const formatted = format(new Date(), "h:mm aaaaa'm'");

  let interval = null;

  const formattedDate = useRef();

  const [buttonState, setButtonState] = useState("Start");
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [timer, setTimer] = useState(0);
  const [dateStart, setDateStart] = useState();
  const [time, setTime] = useState(formatted);
  const [timerOn, setTimerOn] = useState();
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    // Stopwatch Function
    const updateElapsedTime = () => {
      setTimer(Date.now() - dateStart + timer);
    };

    if (timerOn) {
      interval = setInterval(updateElapsedTime, 1000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [dateStart, timerOn]);

  useEffect(() => {
    if (refresh) {
      fireSetData();
    }
  }, [refresh]);

  useEffect(() => {
    // gets db data on startup
    getData();
  }, []);

  useEffect(() => {
    // Sends data to db when timer starts
    if (buttonState === "Stop") {
      fireSetData();
    }
    return () => {
      fireSetData();
    };
  }, [buttonState]);

  const onHandleTimer = () => {
    if (timerOn) {
      setRefresh(true);

      setTimerOn(false);
      setTimer(0);
      setTime(formatted);
      setDateStart(null);
      setButtonState("Start");
      onHandleSendData();
    } else {
      setTimerOn(true);
      setTimer(0);
      setButtonState("Stop");
      if (!dateStart) {
        setDateStart(Date.now());
      }

      setRefresh(false);

      const newForm = format(new Date(), "h:mm aaaaa'm'");
      if (time !== formattedDate.current) {
        setTime(newForm);
      }
    }
  };

  const fireSetData = async () => {
    if (timerOn) {
      await setDoc(doc(database, "CurrentFeed", user), {
        dateStart,
        time,
      });
    } else if (refresh) {
      if (doc(database, "CurrentFeed", user)) {
        await deleteDoc(doc(database, "CurrentFeed", user));
      }
    }
  };

  const getData = async () => {
    const docRef = doc(database, "CurrentFeed", user);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().dateStart !== undefined) {
      const data = docSnap.data();
      setDateStart(data.dateStart);
      setTime(data.time);
      setTimerOn(true);
      setButtonState("Stop");
    } else {
      setTimerOn(false);
      setDateStart(null);
    }
  };

  const onHandleSendData = async () => {
    const dateEnd = Date.now();
    const randomID = uuid.v4();
    await addDoc(collection(database, "FeedingTimer"), {
      user,
      timerData,
      time,
      dateStart,
      dateEnd,
      randomID,
    });
  };

  const confirmDate = (date) => {
    setOpenDatePicker(false);
    if (date < Date.now()) {
      setDateStart(date.getTime());
    } else {
      Alert.alert("Time refers to previous day");
      setDateStart(date.getTime() - 86400000);
    }
    formattedDate.current = format(date, "h:mm aaaaa'm'");
    setTime(formattedDate.current);
    // setTimerOn(false);
    // setButtonState("Start");
    // setTimer(0);
  };

  const onHandleOpenDate = () => {
    setOpenDatePicker(true);
  };

  const cancelDate = () => {
    setOpenDatePicker(false);
  };

  const hours = Math.floor(timer / 1000 / 60 / 60);
  const mins = Math.floor((timer / 1000 / 60) % 60);
  const seconds = Math.floor((timer / 1000) % 60);
  const displayHours = hours < 10 ? `0${hours}` : hours;
  const displayMins = mins < 10 ? `0${mins}` : mins;
  const displaySecs = seconds < 10 ? `0${seconds}` : seconds;
  let timerData = displayHours + ": " + displayMins + ": " + displaySecs;

  return (
    <Container>
      <TimerContainer>
        <TimerBoxContainer>
          <TimerBoxText>Start Time</TimerBoxText>
          <StartTimer onPress={onHandleOpenDate}>
            <TimerText>{time}</TimerText>
          </StartTimer>
        </TimerBoxContainer>
        <TimerBoxContainer>
          <TimerBoxText>Counter</TimerBoxText>
          <EndTimerContainer>
            <TimerText>{timerData}</TimerText>
          </EndTimerContainer>
        </TimerBoxContainer>
      </TimerContainer>

      <ScrollContainer>
        <SleepListScroll
          horizontal
          decelerationRate="fast"
          snapToInterval={Dimensions.get("window").width}
          snapToAlignment={"center"}
          showsHorizontalScrollIndicator={false}
        >
          <ButtonContainer>
            <StartStopButton onPress={onHandleTimer}>
              <TimerText>{buttonState}</TimerText>
            </StartStopButton>
          </ButtonContainer>
          <TimerCardList buttonState={buttonState} type="FeedingTimer" />
        </SleepListScroll>
      </ScrollContainer>
      <DatePicker
        modal
        open={openDatePicker}
        date={new Date()}
        mode="time"
        onConfirm={confirmDate}
        onCancel={cancelDate}
      />
    </Container>
  );
};

const Container = styled(View)`
  flex: 1;
  justify-content: space-evenly;
`;

const TimerContainer = styled(View)`
  width: 100%;
  flex-direction: row;
  justify-content: space-evenly;
`;

const TimerBoxContainer = styled(View)`
  align-items: center;
`;

const TimerBoxText = styled(Text)`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10%;
  color: black;
`;

const StartTimer = styled(TouchableOpacity)`
  width: 125px;
  height: 75px;
  background-color: rgba(255, 255, 255, 0.6);
  flex-direction: row;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
`;

const EndTimerContainer = styled(View)`
  width: 125px;
  height: 75px;
  background-color: rgba(255, 255, 255, 0.6);
  flex-direction: row;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
`;

const TimerText = styled(Text)`
  color: black;
`;

const ScrollContainer = styled(View)`
  height: 70%;
`;

const SleepListScroll = styled(ScrollView)`
  height: 70%;
`;

const ButtonContainer = styled(View)`
  ${Dimensions.get("window").width &&
  `width: ${Dimensions.get("window").width}px`};
  align-items: center;
  justify-content: center;
`;

const StartStopButton = styled(TouchableOpacity)`
  width: 175px;
  height: 175px;
  background-color: white;
  justify-content: center;
  align-items: center;
  border-radius: 90px;
  shadow-color: #171717;
  shadow-offset: 0px 3px;
  shadow-opacity: 0.1875;
  shadow-radius: 2.7px;
  elevation: 3;
`;
