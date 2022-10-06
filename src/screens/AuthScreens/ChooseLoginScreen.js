import React, { useContext } from "react";
import { View, Text } from "react-native";

import styled from "styled-components/native";
import { Button } from "react-native-paper";
import { BackgroundGradient } from "../../components/reusable/BackgroundGradient";

import { AuthenticatedUserContext } from "../../config/useAuthentication";

import { auth, database } from "../../config/firebase";
import { doc, getDoc } from "firebase/firestore";

import {
  GoogleSignin,
  GoogleSigninButton,
} from "@react-native-google-signin/google-signin";
import {
  appleAuth,
  AppleButton,
} from "@invertase/react-native-apple-authentication";

import {
  GoogleAuthProvider,
  signInWithCredential,
  OAuthProvider,
} from "@firebase/auth";

export const ChooseLoginScreen = ({ navigation }) => {
  const { setBaby } = useContext(AuthenticatedUserContext);

  const navigateSignIn = () => {
    navigation.navigate("SignInScreen");
  };

  const navigateSignUp = () => {
    navigation.navigate("SignUpScreen");
  };

  async function onGoogleButtonPress() {
    const { idToken } = await GoogleSignin.signIn();
    const googleCredential = GoogleAuthProvider.credential(idToken);
    const userGoogle = signInWithCredential(auth, googleCredential);

    userGoogle.then(async () => {
      const user = auth.currentUser.email;
      if (user) {
        const docRef = doc(database, "babies", user);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          navigation.navigate("AccountCreatedScreen");
        } else {
          setBaby(true);
        }
      }
    });
  }

  async function onAppleButtonPress() {
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });
    const { identityToken, nonce } = appleAuthRequestResponse;
    const provider = new OAuthProvider("apple.com");
    const credential = provider.credential({
      idToken: identityToken,
      rawNonce: nonce,
    });

    const appleUser = signInWithCredential(auth, credential);

    appleUser.then(async () => {
      const user = auth.currentUser.email;
      if (user) {
        const docRef = doc(database, "babies", user);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          navigation.navigate("AccountCreatedScreen");
        } else {
          setBaby(true);
        }
      }
    });
  }

  return (
    <BackgroundGradient>
      <HeaderContainer>
        <HeaderText>Welcome</HeaderText>
      </HeaderContainer>

      <ButtonContainer>
        <ButtonDesign mode="contained" color="#1EA1C4" onPress={navigateSignIn}>
          Log In
        </ButtonDesign>
        <ButtonDesign mode="contained" color="#1EA1C4" onPress={navigateSignUp}>
          Sign Up
        </ButtonDesign>
        <SocialButtonContainer>
          <GoogleSigninButton
            onPress={onGoogleButtonPress}
            size={GoogleSigninButton.Size.Standard}
            color={GoogleSigninButton.Color.Dark}
          />
          {appleAuth.isSupported && (
            <StyledAppleButton
              cornerRadius={5}
              buttonStyle={AppleButton.Style.WHITE}
              buttonType={AppleButton.Type.CONTINUE}
              onPress={onAppleButtonPress}
            />
          )}
        </SocialButtonContainer>
      </ButtonContainer>
    </BackgroundGradient>
  );
};

const HeaderContainer = styled(View)`
  justify-content: center;
  align-items: center;
`;

const HeaderText = styled(Text)`
  margin-top: 20%;
  color: #1ea1c4;
  font-size: 24px;
  font-weight: bold;
`;

const ButtonContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const ButtonDesign = styled(Button)`
  width: 65%;
  margin-top: 10px;
`;

const SocialButtonContainer = styled(View)`
  width: 100%;
  margin-top: 10px;
  align-items: center;
`;

const StyledAppleButton = styled(AppleButton)`
  margin-top: 5px;
  width: 57%;
  height: 20%;
`;
