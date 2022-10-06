import React, { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  TouchableOpacity,
} from "react-native";
import styled from "styled-components/native";

import { BackgroundGradient } from "../../components/reusable/BackgroundGradient";
import { CustomTextInput } from "../../components/reusable/CustomTextInput";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebase";

import { Ionicons } from "@expo/vector-icons";

export const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");

  const [error, setError] = useState("");

  const passwordChecker = () => {
    if (password === passwordCheck) {
      onHandleSignUp();
    } else {
      setError("Passwords Do Not Match");
    }
  };

  const onHandleSignUp = async () => {
    if (email !== "" && password !== "") {
      createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
          navigation.navigate("AccountCreatedScreen");
        })
        .catch((err) => {
          setError(err.code.substr(5));
        });
    }
  };

  return (
    <BackgroundGradient>
      <KeyboardArea behavior="position">
        <HeaderContainer>
          <HeaderText>Create Account!</HeaderText>
        </HeaderContainer>
        <TextFieldContainer>
          <CustomTextInput
            placeholder="Enter email"
            placeholderTextColor="#1EA1C4"
            keyboardType="email-address"
            textContentType="emailAddress"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <CustomTextInput
            placeholder="Enter password"
            placeholderTextColor="#1EA1C4"
            autoCapitalize="none"
            textContentType="password"
            secureTextEntry={true}
            autoCorrect={false}
            value={password}
            onChangeText={setPassword}
          />
          <CustomTextInput
            placeholder="Renter password"
            placeholderTextColor="#1EA1C4"
            autoCapitalize="none"
            textContentType="password"
            secureTextEntry={true}
            autoCorrect={false}
            value={passwordCheck}
            onChangeText={setPasswordCheck}
          />
          <ErrorContainer>
            {error !== "" ? <ErrorText>{error}</ErrorText> : null}
          </ErrorContainer>
        </TextFieldContainer>

        <ButtonContainer>
          <TouchableOpacity onPress={passwordChecker}>
            <Ionicons name="arrow-forward-circle" size={74} color="#1EA1C4" />
          </TouchableOpacity>
        </ButtonContainer>
      </KeyboardArea>
    </BackgroundGradient>
  );
};

const KeyboardArea = styled(KeyboardAvoidingView)`
  height: 80%;
`;

const HeaderContainer = styled(View)`
  width: 90%;
  margin-top: 50%;
  margin-left: 5%;
`;

const HeaderText = styled(Text)`
  font-weight: 800;
  font-size: 30px;
  color: #1ea1c4;
  shadow-color: #171717;
  shadow-offset: 0px 3px;
  shadow-opacity: 0.1875;
  shadow-radius: 2.7px;
`;

const TextFieldContainer = styled(View)`
  width: 90%;
  margin-left: 5%;
  margin-top: 5%;
`;

const ErrorContainer = styled(View)`
  align-items: center;
  margin-top: 10px;
`;

const ErrorText = styled(Text)`
  color: red;
`;

const ButtonContainer = styled(View)`
  width: 95%;
  align-items: flex-end;
  margin-top: 12px;
  shadow-color: #171717;
  shadow-offset: 0px 3px;
  shadow-opacity: 0.1875;
  shadow-radius: 2.7px;
`;
