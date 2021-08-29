import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import React, { useEffect, useRef, useState } from "react";
import {
  AmbientLight,
  BoxBufferGeometry,
  Fog,
  Mesh,
  PerspectiveCamera,
  PointLight,
  Scene,
  SpotLight,
  MeshBasicMaterial,
  ConeBufferGeometry,
  DodecahedronBufferGeometry,
} from "three";

import { Text, View } from "react-native";
import { useIsFocused, useTheme } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";
import { StatusBar } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ColorPicker, fromHsv } from "react-native-color-picker";
import firebase from "firebase";

export default function Cena({ navigation }) {
  let timeout;
  const { colors } = useTheme();
  const isFocused = useIsFocused();
  const database = firebase.database().ref("colors/");

  const [selected, setSelected] = useState("");
  const [load, setLoad] = useState(false);

  const primary = parseInt(colors.primary.replace("#", ""), 16);

  let cube = useRef(new CubeObj());
  let cone = useRef(new ConeObj());
  let dode = useRef(new DodeObj());

  useEffect(() => {
    getColors();
    return () => clearTimeout(timeout);
  }, [isFocused]);
  async function getColors() {
    setLoad(true);
    setSelected("Carregando as cores...");

    try {
      const userId = await AsyncStorage.getItem("uid");
      const response = await database.get(userId);
      for (let geo in response.toJSON()[userId]) {
        setGeoColor(geo, response.toJSON()[userId][geo]);
      }
      setSelected("Selecione um objeto");
    } catch (err) {
      setSelected("Aplique as cores");
      setLoad(false);
    }
  }
  async function handleSubmitColors() {
    setSelected("Atribuindo ao usuário...");
    const data = {};
    const userId = await AsyncStorage.getItem("uid");

    data[userId] = {
      Cubo: cube.current.material.color,
      Cone: cone.current.material.color,
      Dodecaedro: dode.current.material.color,
    };
    const exists = await database.get("colors/" + userId);
    if (!exists) {
      await database.push(data);
    } else await database.update(data);

    return setSelected("Cores aplicadas!");
  }

  function setGeoColor(index, color = 0xfff) {
    const newMaterial = new MeshBasicMaterial({
      color: color,
    });
    switch (index) {
      case "Cubo":
        cube.current.material = newMaterial;
        break;
      case "Cone":
        cone.current.material = newMaterial;
        break;
      case "Dodecaedro":
        dode.current.material = newMaterial;
        break;
      default:
        break;
    }
  }

  function update(obj1, obj2, obj3, camera) {
    obj1.material = obj1.material;
    obj2.material = obj2.material;
    obj3.material = obj3.material;

    obj1.rotation.x += 0.025;
    obj2.rotation.z += 0.01;
    obj2.rotation.x += 0.01;
    obj3.rotation.y += 0.025;
    camera.position.set(0, 0, 4);
    camera.rotation.set(0, 0, 0);
    // camera.rotateX(-0.001);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.primary }}>
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          onPress={async () => {
            await AsyncStorage.clear();
            navigation.navigate("Login");
          }}
          style={{
            backgroundColor: colors.primary,
            marginTop: StatusBar.currentHeight,
            padding: 16,
          }}
        >
          <Text style={{ color: colors.text, fontSize: 24 }}>Sair</Text>
        </TouchableOpacity>
        <Text
          style={{
            position: "absolute",
            top: 45,
            fontSize: 24,
            color: colors.text,
            alignSelf: "center",
          }}
        >
          {selected}
        </Text>
        <ColorPicker
          style={{ flex: 1 }}
          onColorChange={(color) =>
            setGeoColor(selected, parseInt(fromHsv(color).replace("#", ""), 16))
          }
        ></ColorPicker>

        {(!load && (
          <GLView
            style={{ flex: 2 }}
            onContextCreate={async (gl) => {
              cube.current.rotation.x = 0;
              cone.current.rotation.z = 0;
              cone.current.rotation.x = 0;
              dode.current.rotation.y = 0;
              const { drawingBufferWidth: width, drawingBufferHeight: height } =
                gl;

              const sceneColor = primary;
              const renderer = new Renderer({ gl });
              renderer.setSize(width, height);
              renderer.setClearColor(sceneColor);

              const camera = new PerspectiveCamera(
                90,
                width / height,
                0.01,
                1000
              );
              camera.position.set(2, 3, 5);

              const scene = new Scene();
              scene.fog = new Fog(sceneColor, 1, 10000);

              const ambientLight = new AmbientLight(0x101010);
              scene.add(ambientLight);

              const pointLight = new PointLight(0xffffff, 2, 1000, 1);
              pointLight.position.set(0, 200, 200);
              scene.add(pointLight);

              const spotLight = new SpotLight(0xffffff, 0.5);
              spotLight.position.set(0, 500, 100);
              spotLight.lookAt(scene.position);
              scene.add(spotLight);

              cube.current.position.set(0, 2.5, 0);
              cone.current.position.set(0, 0.25, 0);
              dode.current.position.set(0, -2.5, 0);

              scene.add(cube.current, cone.current, dode.current);
              camera.lookAt(cube.current.position);

              // Setup an animation loop
              const render = () => {
                timeout = requestAnimationFrame(render);

                update(cube.current, cone.current, dode.current, camera);
                renderer.render(scene, camera);
                gl.endFrameEXP();
              };
              render();
            }}
          ></GLView>
        )) || (
          <View
            style={{ flex: 2, alignItems: "center", justifyContent: "center" }}
          >
            <Text style={{ color: colors.text, fontSize: 24 }}>CARREGANDO</Text>
          </View>
        )}
        <View
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 8,
          }}
        >
          <View
            style={{
              elevation: 2,
              marginTop: 10,
              borderRadius: 6,
              marginBottom: 10,
              backgroundColor: "#fa9504",
            }}
          >
            <View
              style={{
                width: "100%",
                flexDirection: "row",
                justifyContent: "space-around",
              }}
            >
              <TouchableOpacity
                style={{
                  justifyContent: "center",
                  paddingVertical: 16,
                  borderRightWidth: 0.25,
                  borderRightColor: "lightgrey",
                  width: "33%",
                }}
                onPress={() => setSelected("Cubo")}
              >
                <Text style={{ color: colors.text, textAlign: "center" }}>
                  Cubo
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  justifyContent: "center",
                  paddingVertical: 16,
                  width: "33%",
                  borderRightWidth: 0.25,
                  borderRightColor: "lightgrey",
                }}
                onPress={() => setSelected("Cone")}
              >
                <Text style={{ color: colors.text, textAlign: "center" }}>
                  Cone
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  justifyContent: "center",
                  paddingVertical: 16,
                  width: "33%",
                }}
                onPress={() => setSelected("Dodecaedro")}
              >
                <Text style={{ color: colors.text, textAlign: "center" }}>
                  Dodecaedro
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={{
                paddingVertical: 16,
                borderTopColor: "lightgrey",
                borderTopWidth: 0.25,
              }}
              onPress={() => {
                handleSubmitColors();
              }}
            >
              <Text style={{ color: colors.text, textAlign: "center" }}>
                Aplicar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

class CubeObj extends Mesh {
  constructor() {
    super(new BoxBufferGeometry(1.0, 1.0, 1.0));
  }
}
class ConeObj extends Mesh {
  constructor() {
    super(new ConeBufferGeometry(1, 2, 32));
  }
}
class DodeObj extends Mesh {
  constructor() {
    super(new DodecahedronBufferGeometry(1));
  }
}
