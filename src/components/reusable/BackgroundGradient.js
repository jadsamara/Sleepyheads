import React from "react";
import styled from "styled-components/native";

import { LinearGradient } from "expo-linear-gradient";

export const BackgroundGradient = ({ children }) => {
  return (
    <BackgroundContainer colors={["#B9F1FF", "#F1F1F1", "#FF9EFD"]}>
      {children}
    </BackgroundContainer>
  );
};

const BackgroundContainer = styled(LinearGradient)`
  height: 100%;
  width: 100%;
`;
