// Navigation for logged in users
import React, { useState, useEffect, useRef } from "react";
import { Alert, Platform, Linking, Modal } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";

import { HomeScreen } from "../screens/AppScreens/HomeScreen";
import { FeedingScreen } from "../screens/AppScreens/FeedingScreen";
import { SleepScreen } from "../screens/AppScreens/SleepScreen";

import { requestTrackingPermission } from "react-native-tracking-transparency";

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import { TimerProvider } from "../components/TimerListComponent/TimerProvider";
import { GeneralProvider } from "../components/utils/GeneralProvider";

const Stack = createStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    priority: "high",
  }),
});

export const LoggedInStack = () => {
  const [notification, setNotification] = useState(null);
  const [response, setResponse] = useState(false);

  const [active, setActive] = useState(true);

  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // This listener is fired whenever a notification is received while the app is foregrounded

    if (Platform.OS === "android") {
      getData();
    }
    onHandleTracking();
    registerForPushNotificationsAsync();

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        setResponse(response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const onHandleTracking = async () => {
    const trackingStatus = await requestTrackingPermission();
    if (trackingStatus === "authorized" || trackingStatus === "unavailable") {
      // enable tracking features
    }
  };

  const registerForPushNotificationsAsync = async () => {
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }
      const token = await Notifications.getExpoPushTokenAsync().data;
    }
  };

  const storeData = async (permissionCheck) => {
    await AsyncStorage.setItem("@permissions", permissionCheck);
  };

  const getData = async () => {
    const value = await AsyncStorage.getItem("@permissions");
    if (value !== "done") {
      CheckPrivacyAndroid();
    }
  };

  const CheckPrivacyAndroid = () => {
    Alert.alert(
      "",
      "Sleepyheads requires to collect and store personal information provided by you. We do not process sensitive information. ",
      [
        {
          text: "Privacy Policy",
          onPress: () => {
            {
              CheckPrivacyAndroid();
              Linking.openURL(
                "https://www.pinkasolutions.net/privacypolicysleepyheads"
              );
            }
          },
        },
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => onHandleDeclined(),
        },
        { text: "OK", onPress: () => onHandleAccepted() },
      ]
    );
  };

  const onHandleAccepted = () => {
    const permissionCheck = "done";
    storeData(permissionCheck);
  };

  const onHandleDeclined = () => {
    const permissionCheck = "nope";
    storeData(permissionCheck);
  };

  return (
    <GeneralProvider>
      <TimerProvider>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
          <Stack.Screen name="Feeding" component={FeedingScreen} />
          <Stack.Screen name="Sleep" component={SleepScreen} />
        </Stack.Navigator>
      </TimerProvider>
    </GeneralProvider>
  );
};
