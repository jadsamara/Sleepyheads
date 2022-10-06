import React, { useEffect, useState } from "react";
import { Platform } from "react-native";

import { AdMobBanner } from "expo-ads-admob";

export const AdsComponent = ({ size }) => {
  const [adState, setAdState] = useState();

  useEffect(() => {
    if (Platform.OS === "android") {
      setAdState("ca-app-pub-5241901605191458/2025728345");
    } else {
      setAdState("ca-app-pub-5241901605191458/2967501896");
    }
  }, []);

  return <AdMobBanner bannerSize={size} adUnitID={adState} />;
};
