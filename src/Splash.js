import React from "react";
import { Image, View } from "react-native";

export default function Splash() {
  return (
    <View style={{ flex: 1 }}>
      <Image
        source={require("./assets/bg-site-handtalk-v2.png")}
        style={{ position: "absolute", width: "100%", height: "100%" }}
      ></Image>
    </View>
  );
}
