import React from "react";
import styled from "styled-components/native";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const GenderButtons = ({ onPressMale, onPressFemale, gender }) => {
  if (gender === "Male") {
    return (
      <GenderContainer>
        <SelectedMaleButton onPress={onPressMale}>
          <Ionicons name="ios-male" size={34} color="white" />
        </SelectedMaleButton>
        <FemaleButton onPress={onPressFemale}>
          <Ionicons name="ios-female" size={34} color="white" />
        </FemaleButton>
      </GenderContainer>
    );
  } else if (gender === "Female") {
    return (
      <GenderContainer>
        <MaleButton onPress={onPressMale}>
          <Ionicons name="ios-male" size={34} color="white" />
        </MaleButton>
        <SelectedFemaleButton onPress={onPressFemale}>
          <Ionicons name="ios-female" size={34} color="white" />
        </SelectedFemaleButton>
      </GenderContainer>
    );
  } else {
    return (
      <GenderContainer>
        <MaleButton onPress={onPressMale}>
          <Ionicons name="ios-male" size={34} color="white" />
        </MaleButton>
        <FemaleButton onPress={onPressFemale}>
          <Ionicons name="ios-female" size={34} color="white" />
        </FemaleButton>
      </GenderContainer>
    );
  }
};

const GenderContainer = styled(View)`
  flex-direction: row;
  justify-content: space-evenly;
  margin-top: 20px;
`;

const MaleButton = styled(TouchableOpacity)`
  width: 50px;
  height: 50px;
  background-color: #1ea1c4;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  opacity: 0.5;
`;

const SelectedFemaleButton = styled(TouchableOpacity)`
  width: 50px;
  height: 50px;
  background-color: #ff9efd;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border-color: black;
  border-width: 2px;
  opacity: 1;
`;

const SelectedMaleButton = styled(TouchableOpacity)`
  width: 50px;
  height: 50px;
  background-color: #1ea1c4;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border-color: black;
  border-width: 2px;
  opacity: 1;
`;

const FemaleButton = styled(TouchableOpacity)`
  width: 50px;
  height: 50px;
  background-color: #ff9efd;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  opacity: 0.5;
`;
