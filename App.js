import React, { useEffect, useReducer, useState } from "react";
import Constants from "expo-constants";
import firebase from "firebase";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "./src/Login";
import Cena from "./src/Cena";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Splash from "./src/Splash";

if (!firebase.apps.length) {
  firebase.initializeApp(Constants.manifest.extra);
} else {
  firebase.app();
}

const HandTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#f46f0a",
    text: "#fff",
  },
};

const Stack = createNativeStackNavigator();

export default function App() {
  async function getLoggedStatus() {
    setIsFetching(true);
    const token = await AsyncStorage.getItem("uid");
    if (token) {
      setIsLogged(true);
    } else setIsLogged(false);
    setIsFetching(false);
  }

  const [isLogged, setIsLogged] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  useEffect(() => {
    getLoggedStatus();
  }, []);
  return (
    <NavigationContainer theme={HandTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {(!isFetching && !isLogged && (
          <>
            <Stack.Screen name={"Login"} component={Login}></Stack.Screen>
            <Stack.Screen name={"Cena"} component={Cena}></Stack.Screen>
          </>
        )) ||
          (!isFetching && (
            <>
              <Stack.Screen name={"Cena"} component={Cena}></Stack.Screen>
              <Stack.Screen name={"Login"} component={Login}></Stack.Screen>
            </>
          )) || (
            <Stack.Screen name={"Splash"} component={Splash}></Stack.Screen>
          )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
