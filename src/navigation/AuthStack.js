// Navigation for un authenticated users
import React from "react";
import { Platform } from "react-native";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";

import { ChooseLoginScreen } from "../screens/AuthScreens/ChooseLoginScreen";
import { SigninScreen } from "../screens/AuthScreens/SigninScreen";
import { SignupScreen } from "../screens/AuthScreens/SignupScreen";
import { CreateBabyScreen } from "../screens/AuthScreens/CreateBabyScreen";
import { AccountCreatedScreen } from "../screens/AuthScreens/AccountCreatedScreen";

const Stack = createStackNavigator();

const screenOptionsIos = () => {
  return {
    headerShown: false,
    ...TransitionPresets.ModalPresentationIOS,
    gestureResponseDistance: 150,
  };
};

const screenOptionsAndroid = () => {
  return {
    headerShown: false,
  };
};

export const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={
        Platform.OS === "ios" ? screenOptionsIos : screenOptionsAndroid
      }
      initialRouteName="Welcome"
    >
      <Stack.Screen name="Welcome" component={ChooseLoginScreen} />
      <Stack.Screen name="SignInScreen" component={SigninScreen} />
      <Stack.Screen name="SignUpScreen" component={SignupScreen} />
      <Stack.Screen name="CreateBabyScreen" component={CreateBabyScreen} />
      <Stack.Screen
        name="AccountCreatedScreen"
        component={AccountCreatedScreen}
      />
    </Stack.Navigator>
  );
};
