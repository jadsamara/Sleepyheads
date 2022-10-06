import React from "react";
import { View, Text } from "react-native";
import styled from "styled-components/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export const Card = ({ card = {} }) => {
  const { title = "Feeding", icon = "baby-face" } = card;
  return (
    <View style={{ flex: 1 }}>
      <Container>
        <IconContainer>
          <MaterialCommunityIcons name={icon} size={40} color="white" />
        </IconContainer>
        <CardText>{title}</CardText>
      </Container>
    </View>
  );
};

const Container = styled(View)`
  height: 150px;
  width: 150px;
  justify-content: flex-end;
  align-items: center;
  margin-horizontal: 10px;
  background-color: rgba(51, 113, 255, 0.7);
  border-radius: 16.6px;
  shadow-color: #171717;
  shadow-offset: 0px 6px;
  shadow-opacity: 0.1875;
  shadow-radius: 2.7px;
`;

const IconContainer = styled(View)`
  margin-bottom: 30px;
`;

const CardText = styled(Text)`
  color: #fff;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
`;
