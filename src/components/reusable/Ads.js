import React, { useContext, memo } from "react";

import { GeneralContext } from "../utils/GeneralProvider";

import { AdMobBanner } from "expo-ads-admob";

const AdsComponent = () => {
  const { adState } = useContext(GeneralContext);

  return <AdMobBanner bannerSize="largeBanner" adUnitID={adState} />;
};

export default memo(AdsComponent);
