// App wide navigation
import React, { useContext, useState, useEffect } from "react";
import { View } from "react-native";
import styled from "styled-components/native";
import { NavigationContainer } from "@react-navigation/native";

import { LoggedInStack } from "./LoggedInStack";
import { AuthStack } from "./AuthStack";

import { AuthenticatedUserContext } from "../config/useAuthentication";
import { onAuthStateChanged } from "firebase/auth";
import { auth, database } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";

import LottieView from "lottie-react-native";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

export const RootNavigator = () => {
  const { user, setUser, baby, setBaby } = useContext(AuthenticatedUserContext);
  const [isLoading, setIsLoading] = useState(false);

  GoogleSignin.configure({
    webClientId:
      "398899297073-0qo1rp82jirhe4pomovfcik2ksv4mj59.apps.googleusercontent.com",
  });

  useEffect(() => {
    setIsLoading(
      setInterval(() => {
        setIsLoading(false);
      }, 3300)
    );
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(
      auth,
      async (authenticatedUser) => {
        if (authenticatedUser) {
          setUser(authenticatedUser);
          const userEmail = auth.currentUser.email;
          const docRef = doc(database, "babies", userEmail);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setBaby(true);
          } else {
            setBaby(false);
          }
        } else {
          setUser(false);
        }
      }
    );
    return unsubscribeAuth;
  }, [setUser, setBaby]);

  if (isLoading) {
    return (
      <Container>
        <LottieContainer>
          <LottieView source={require("../../baby.json")} autoPlay />
        </LottieContainer>
      </Container>
    );
  }

  return (
    <NavigationContainer>
      {user && baby ? <LoggedInStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

const Container = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const LottieContainer = styled(View)`
  height: 30%;
  width: 100%;
`;
