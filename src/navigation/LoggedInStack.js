// Navigation for logged in users
import React, { useState, useEffect, useRef } from "react";
import { createStackNavigator } from "@react-navigation/stack";

import { HomeScreen } from "../screens/AppScreens/HomeScreen";
import { FeedingScreen } from "../screens/AppScreens/FeedingScreen";
import { SleepScreen } from "../screens/AppScreens/SleepScreen";

import { requestTrackingPermission } from "react-native-tracking-transparency";

import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import { TimerProvider } from "../components/TimerListComponent/TimerProvider";

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

  const notificationListener = useRef();
  const responseListener = useRef();

  const onHandleTracking = async () => {
    const trackingStatus = await requestTrackingPermission();
    if (trackingStatus === "authorized" || trackingStatus === "unavailable") {
      // enable tracking features
    }
  };

  useEffect(() => {
    onHandleTracking();
  }, []);

  useEffect(() => {
    // This listener is fired whenever a notification is received while the app is foregrounded
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
    }
  };

  return (
    <TimerProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="Feeding" component={FeedingScreen} />
        <Stack.Screen name="Sleep" component={SleepScreen} />
      </Stack.Navigator>
    </TimerProvider>
  );
};
