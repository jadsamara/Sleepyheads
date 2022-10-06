import React, { useState, useContext } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";

import { auth, database } from "../../config/firebase";
import { setDoc, doc } from "firebase/firestore";

import { BackgroundGradient } from "../../components/reusable/BackgroundGradient";
import { SafeArea } from "../../components/utils/SafeArea";
import { GenderButtons } from "../../components/CreateBabyScreenComponents/GenderButtons";
import { AuthenticatedUserContext } from "../../config/useAuthentication";

import DatePicker from "react-native-date-picker";
import { format } from "date-fns";

export const CreateBabyScreen = () => {
  const { setBaby } = useContext(AuthenticatedUserContext);

  const [gender, setGender] = useState(null);
  const [babyName, setBabyName] = useState(null);
  const [dob, setDob] = useState(null);

  const [date, setDate] = useState("Date of Birth");
  const [open, setOpen] = useState(false);

  const onHandleGenderMale = () => {
    setGender("Male");
  };

  const onHandleGenderFemale = () => {
    setGender("Female");
  };

  const onHandleOpenDate = () => {
    setOpen(true);
  };

  const confirmDate = (date) => {
    setOpen(false);
    const formattedDate = format(date, "MM/dd/yyyy");
    setDate(formattedDate);
    if (date > new Date()) {
      Alert.alert("Invalid Date");
    } else {
      setDob(formattedDate);
    }
  };

  const cancelDate = () => {
    setOpen(false);
  };

  const onHandleBaby = async () => {
    if (gender && babyName && babyName.match(/^ *$/) === null && dob) {
      const user = auth.currentUser.email;
      await setDoc(doc(database, "babies", user), {
        user,
        gender,
        babyName,
        dob,
      });
      setBaby(true);
    } else {
      Alert.alert("Incomplete Fields");
    }
  };

  return (
    <BackgroundGradient>
      <SafeArea>
        <HeaderContainer>
          <HeaderText>Let's put in some baby info.</HeaderText>
        </HeaderContainer>
        <BabyInputContainer>
          <GenderButtons
            onPressMale={onHandleGenderMale}
            onPressFemale={onHandleGenderFemale}
            gender={gender}
          />
          <TextInputContainer>
            <CustomTextInput
              placeholder="Baby Name"
              placeholderTextColor="white"
              color="white"
              onChangeText={setBabyName}
            />
            <DateButton onPress={onHandleOpenDate}>
              <DateText>{date}</DateText>
            </DateButton>
            <DatePicker
              modal
              open={open}
              date={new Date()}
              mode="date"
              onConfirm={confirmDate}
              onCancel={cancelDate}
            />
          </TextInputContainer>
          <ImageContainer>
            <StyledImage source={require("../../../Iconpic.png")} />
          </ImageContainer>
          <SubmitButton onPress={onHandleBaby}>
            <Ionicons name="arrow-forward-circle" size={74} color="#1EA1C4" />
          </SubmitButton>
        </BabyInputContainer>
      </SafeArea>
    </BackgroundGradient>
  );
};

const HeaderContainer = styled(View)`
  width: 100%;
  align-items: center;
  margin-top: 5%;
`;

const HeaderText = styled(Text)`
  font-size: 24px;
  font-weight: bold;
`;

const BabyInputContainer = styled(View)`
  width: 80%;
  height: 80%;
  align-self: center;
  margin-top: 5%;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
`;

const TextInputContainer = styled(View)`
  width: 100%;
  height: 30%;
  align-items: center;
`;

const CustomTextInput = styled(TextInput)`
  width: 80%;
  height: 25%;
  margin-top: 10%;
  padding-horizontal: 16px;
  font-weight: 600;
  background-color: red;
  border-radius: 10px;
  opacity: 0.5;
`;

const DateButton = styled(TouchableOpacity)`
  width: 80%;
  height: 25%;
  justify-content: center;
  margin-top: 5%;
  padding-horizontal: 16px;
  font-weight: 600;
  background-color: red;
  border-radius: 10px;
  opacity: 0.5;
`;

const DateText = styled(Text)`
  color: white;
  font-weight: bold;
`;

const ImageContainer = styled(View)`
  position: absolute;
  bottom: 5%;
  opacity: 0.4;
`;

const SubmitButton = styled(TouchableOpacity)`
  width: 95%;
  height: 100%;
  align-items: flex-end;
`;

const StyledImage = styled(Image)`
  width: 200px;
  height: 200px;
`;
