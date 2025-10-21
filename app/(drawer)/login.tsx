import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";
import axios from "axios";
import React, { useState } from "react";
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const API_URL = "http://localhost:5000/api/auth/login";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      const res = await axios.post(API_URL, { email, password });
      const { token, user } = res.data;

      await AsyncStorage.setItem("user", JSON.stringify(user));
      await AsyncStorage.setItem("token", token);

      // ✅ Lưu userId cho cả web & mobile
      if (Platform.OS === "web") {
        localStorage.setItem("userId", user.user_id.toString());
      } else {
        await AsyncStorage.setItem("userId", user.user_id.toString());
      }

      Alert.alert("Thành công", "Đăng nhập thành công!");

      // 🔥 Chuyển sang trang Home & reset stack
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Homescreen" }],
        })
      );

    } catch (err: any) {
      Alert.alert("Thất bại", err.response?.data?.message || "Sai thông tin đăng nhập");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng nhập</Text>
      <TextInput placeholder="Email" style={styles.input} value={email} onChangeText={setEmail} />
      <TextInput
        placeholder="Mật khẩu"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Đăng nhập</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("RegisterScreen")}>
        <Text style={styles.link}>Chưa có tài khoản? Đăng ký</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: 12 },
  button: { backgroundColor: "#007BFF", padding: 14, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  link: { marginTop: 12, textAlign: "center", color: "#007BFF" },
});
