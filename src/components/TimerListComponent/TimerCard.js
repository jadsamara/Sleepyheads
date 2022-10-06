import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import styled from "styled-components/native";

import { Ionicons, Foundation } from "@expo/vector-icons";

export const TimerCard = ({
  dateEnd,
  dateStart,
  timerData,
  deleteItem,
  editItem,
}) => {
  return (
    <CardContainer>
      <TextButtonContainer>
        <StartTimeText>Start Time: {dateStart}</StartTimeText>
      </TextButtonContainer>
      <HeaderTextContainer>
        <StartTimeText>End Time: {dateEnd}</StartTimeText>

        {editItem ? (
          <IconButtonContainer>
            <IconButton onPress={editItem}>
              <Foundation name="pencil" size={22} color="black" />
            </IconButton>
            <IconButton onPress={deleteItem}>
              <Ionicons name="trash" size={20} color="red" />
            </IconButton>
          </IconButtonContainer>
        ) : (
          <IconButton onPress={deleteItem}>
            <Ionicons name="trash" size={20} color="red" />
          </IconButton>
        )}
      </HeaderTextContainer>
      <StartTimeText>Time: {timerData}</StartTimeText>
    </CardContainer>
  );
};

const CardContainer = styled(View)`
  width: 100%;
  height: 100px;
  background-color: rgba(255, 255, 255, 0.2);
`;

const HeaderTextContainer = styled(View)`
  flex-direction: row;
  justify-content: space-between;
`;

const StartTimeText = styled(Text)`
  font-size: 14px;
  font-weight: bold;
  margin-top: 1%;
`;

const TextButtonContainer = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const IconButtonContainer = styled(View)`
  flex-direction: row;
`;

const IconButton = styled(TouchableOpacity)`
  margin-right: 15px;
`;
