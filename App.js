import React from "react";

import { RootNavigator } from "./src/navigation/index";
import { AuthenticatedUserProvider } from "./src/config/useAuthentication";

import { LogBox } from "react-native";

export default function App() {
  LogBox.ignoreAllLogs();
  return (
    <AuthenticatedUserProvider>
      <RootNavigator />
    </AuthenticatedUserProvider>
  );
}
