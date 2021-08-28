import React, { useState } from "react";

import firebase from "firebase";
import { Text, View, Image } from "react-native";
import { Input, Button } from "react-native-elements";
import { useTheme } from "@react-navigation/native";
import { StatusBar } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login({ navigation }) {
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");
    try {
      const response = await firebase
        .auth()
        .signInWithEmailAndPassword(email, password);
      await AsyncStorage.setItem("uid", JSON.stringify(response.user.uid));
      navigation.navigate("Cena");
    } catch (err) {
      setError("Senha ou e-mail inválido, por favor tente novamente");
    }
  }
  return (
    <View
      style={{
        position: "relative",
        backgroundColor: colors.primary,
        flex: 1,

        marginTop: StatusBar.currentHeight,
      }}
    >
      <Image
        source={require("./assets/bg-site-handtalk-v2.png")}
        style={{ position: "absolute", width: "100%", height: "100%" }}
      ></Image>
      <View style={{ paddingHorizontal: 16 }}>
        <Text
          style={{
            textAlign: "center",
            fontSize: 48,
            marginVertical: 30,
            color: colors.text,
            fontWeight: "bold",
          }}
        >
          Desafio HandTalk
        </Text>
        <View
          style={{
            backgroundColor: colors.text,
            alignItems: "center",
            borderRadius: 8,
            elevation: 2,
            padding: 16,
          }}
        >
          <Input
            autoCapitalize="none"
            autoCompleteType="email"
            keyboardType="email-address"
            labelStyle={{ color: colors.primary }}
            inputStyle={{ color: colors.primary, borderColor: colors.text }}
            onChangeText={(text) => setEmail(text)}
            label="E-mail"
          />
          <Input
            autoCompleteType="password"
            label="Senha"
            labelStyle={{ color: colors.primary }}
            inputStyle={{ color: colors.primary, borderColor: colors.text }}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry={true}
          />
          {error.length > 0 && (
            <Text style={{ color: "red", marginBottom: 16 }}>{error}</Text>
          )}
          <Button
            disabled={!email || !password}
            onPress={() => handleSubmit()}
            title="Login"
            type="outline"
            containerStyle={{ width: "50%", borderColor: colors.primary }}
            buttonStyle={{ borderColor: colors.primary }}
            titleStyle={{ color: colors.primary }}
          ></Button>
        </View>
      </View>
    </View>
  );
}
