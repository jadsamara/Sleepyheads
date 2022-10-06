import React from "react";
import { View, Text } from "react-native";

import styled from "styled-components/native";
import { Button } from "react-native-paper";

import { BackgroundGradient } from "../../components/reusable/BackgroundGradient";
import { SafeArea } from "../../components/utils/SafeArea";

export const AccountCreatedScreen = ({ navigation }) => {
  const nextPage = () => {
    navigation.navigate("CreateBabyScreen");
  };

  return (
    <BackgroundGradient>
      <SafeArea>
        <HeaderContainer>
          <HeaderText>Account Created</HeaderText>
          <ButtonContainer>
            <Button onPress={nextPage} color="#1EA1C4" mode="contained">
              Next
            </Button>
          </ButtonContainer>
        </HeaderContainer>
      </SafeArea>
    </BackgroundGradient>
  );
};

const HeaderContainer = styled(View)`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const HeaderText = styled(Text)`
  font-size: 24px;
  font-weight: bold;
`;

const ButtonContainer = styled(View)`
  margin-top: 20px;
`;
