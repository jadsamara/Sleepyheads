import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import styled from "styled-components/native";

import { StopwatchFeed } from "../../components/TimerListComponent/StopwatchFeed";

import { MaterialIcons } from "@expo/vector-icons";
import AdsComponent from "../../components/reusable/Ads";

import { BackgroundGradient } from "../../components/reusable/BackgroundGradient";
import { SafeArea } from "../../components/utils/SafeArea";

export const FeedingScreen = ({ navigation: { goBack } }) => {
  return (
    <BackgroundGradient>
      <SafeArea>
        <BackButtonContainer>
          <TouchableOpacity onPress={() => goBack()}>
            <MaterialIcons name="keyboard-arrow-left" size={40} color="black" />
          </TouchableOpacity>
        </BackButtonContainer>
        <Container>
          <HeaderContainer>
            <HeaderText>Feeding</HeaderText>
          </HeaderContainer>
          <StopwatchFeed />
          <AdsContainer>
            <AdsComponent />
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

const HeaderContainer = styled(View)`
  margin-bottom: 5%;
  margin-left: 5%;
  margin-top: 10%;
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
  margin-bottom: 10%;
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
