import React, { useEffect, useContext } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import styled from "styled-components/native";

import { NewStopwatch } from "../../components/TimerListComponent/NewStopwatch";
import { BackgroundGradient } from "../../components/reusable/BackgroundGradient";
import { SafeArea } from "../../components/utils/SafeArea";
import { AdsComponent } from "../../components/reusable/Ads";

import { MaterialIcons } from "@expo/vector-icons";

import { auth, database } from "../../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { format } from "date-fns";

import { TimerContext } from "../../components/TimerListComponent/TimerProvider";

export const SleepScreen = ({ navigation: { goBack } }) => {
  const user = auth.currentUser.email;
  const { napText, setNapText } = useContext(TimerContext);

  const getData = async () => {
    const docRef = doc(database, "CurrentSleep", user);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      if (data.newNap && data.newNap > Date.now() - 86400000) {
        const formattedtimeToNext = format(data.newNap, "h:mm aaaaa'm'");
        setNapText(formattedtimeToNext);
      } else {
        setNapText("");
      }
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <BackgroundGradient>
      <SafeArea>
        <BackButtonContainer>
          <TouchableOpacity onPress={() => goBack()}>
            <MaterialIcons name="keyboard-arrow-left" size={40} color="black" />
          </TouchableOpacity>
        </BackButtonContainer>
        <Container>
          <NextNapContainer>
            <Text>{napText ? "Time to sleep " + napText : " "}</Text>
          </NextNapContainer>
          <HeaderContainer>
            <HeaderText>Sleep</HeaderText>
          </HeaderContainer>
          <NewStopwatch type="SleepingTimer" val="CurrentSleep" />
          <AdsContainer>
            <AdsComponent size="largeBanner" />
          </AdsContainer>
        </Container>
      </SafeArea>
    </BackgroundGradient>
  );
};

const Container = styled(View)`
  height: 100%;
  width: 100%;
`;

const NextNapContainer = styled(View)`
  align-items: flex-end;
  margin-top: 5%;
  margin-right: 5%;
`;

const HeaderContainer = styled(View)`
  margin-bottom: 5%;
  margin-left: 5%;
`;

const HeaderText = styled(Text)`
  font-size: 24px;
  font-weight: bold;
  color: #000;
  shadow-color: #171717;
  shadow-offset: 0px 3px;
  shadow-opacity: 0.1875;
  shadow-radius: 2.7px;
`;

const AdsContainer = styled(View)`
  justify-content: center;
  align-items: center;
`;

const BackButtonContainer = styled(View)`
  width: 100%;
  align-items: flex-start;
  margin-left: 12px;
  margin-top: 5px;
  shadow-color: #171717;
  shadow-offset: 0px 3px;
  shadow-opacity: 0.1875;
  shadow-radius: 2.7px;
`;
