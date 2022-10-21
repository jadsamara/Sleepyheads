import React, { useContext } from "react";
import { View, Alert } from "react-native";
import styled from "styled-components/native";

import { BackgroundGradient } from "../../components/reusable/BackgroundGradient";
import { Button } from "react-native-paper";
import { SafeArea } from "../../components/utils/SafeArea";
import { CardList } from "../../components/HomeScreenComponents/CardList";

import { deleteUser } from "@firebase/auth";

import { auth, database } from "../../config/firebase";
import { AuthenticatedUserContext } from "../../config/useAuthentication";
import {
  deleteDoc,
  doc,
  getDocs,
  collection,
  where,
  query,
} from "firebase/firestore";

import * as Notifications from "expo-notifications";
import AdsComponent from "../../components/reusable/Ads";

import { GoogleSignin } from "@react-native-google-signin/google-signin";

export const HomeScreen = ({ navigation }) => {
  const { setBaby } = useContext(AuthenticatedUserContext);

  const userEmail = auth.currentUser.email;
  const user = auth.currentUser;

  const onHandleSignOut = async () => {
    auth.signOut().then(() => {
      Notifications.cancelAllScheduledNotificationsAsync();
      GoogleSignin.signOut();
      setBaby(false);
      navigation.navigate("Welcome");
    });
  };

  const userDeleteAlert = () => {
    Alert.alert("Would you like to delete account?", "", [
      {
        text: "Cancel",
        style: "cancel",
      },
      { text: "OK", onPress: onHandleDeleteUser },
    ]);
  };

  const onHandleDeleteUser = async () => {
    await deleteDoc(doc(database, "babies", userEmail));
    await deleteDoc(doc(database, "CurrentSleep", userEmail));
    await deleteDoc(doc(database, "CurrentFeed", userEmail));
    const docRefFeed = collection(database, "FeedingTimer");
    const qFeed = query(docRefFeed, where("user", "==", userEmail));
    const querySnapshotFeed = await getDocs(qFeed);
    querySnapshotFeed.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
    const docRef = collection(database, "SleepingTimer");
    const q = query(docRef, where("user", "==", userEmail));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
    deleteUser(user).then(() => {
      Notifications.cancelAllScheduledNotificationsAsync();
      GoogleSignin.signOut();
      setBaby(false);
    });
  };

  return (
    <BackgroundGradient>
      <SafeArea>
        <CardListContainer>
          <CardList goToPage={navigation.navigate} />
          <Button onPress={onHandleSignOut}>Log Out</Button>
          <Button onPress={userDeleteAlert}>Delete Account</Button>
          <AdsComponent />
        </CardListContainer>
      </SafeArea>
    </BackgroundGradient>
  );
};

const CardListContainer = styled(View)`
  flex: 1;
  align-items: center;
`;
