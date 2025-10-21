import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";
import axios from "axios";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const API_URL =
  Platform.OS === "web"
    ? "http://localhost:5000/api/auth/login"
    : "http://172.20.10.7:5000/api/auth/login";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Hàm đăng nhập
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);

      // 🔹 Xóa toàn bộ storage cũ trước khi lưu mới
      if (Platform.OS === "web") {
        localStorage.clear();
      } else {
        await AsyncStorage.clear();
      }

      // 🔹 Gửi yêu cầu đăng nhập
      const res = await axios.post(API_URL, { email, password });
      const { token, user } = res.data;

      // 🔹 Lưu lại dữ liệu mới
      await AsyncStorage.setItem("user", JSON.stringify(user));
      await AsyncStorage.setItem("token", token);

      // 🔹 Lưu userId cho cả 2 nền tảng
      if (Platform.OS === "web") {
        localStorage.setItem("userId", user.user_id.toString());
      } else {
        await AsyncStorage.setItem("userId", user.user_id.toString());
      }

      // 🔹 Thông báo & chuyển trang
      Alert.alert("Thành công", "Đăng nhập thành công!");

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Homescreen" }],
        })
      );
    } catch (err: any) {
      console.error("❌ Lỗi đăng nhập:", err.response?.data || err.message);
      Alert.alert(
        "Thất bại",
        err.response?.data?.message || "Sai thông tin đăng nhập"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng nhập</Text>

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Mật khẩu"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("RegisterScreen")}
        disabled={loading}
      >
        <Text style={styles.link}>Chưa có tài khoản? Đăng ký</Text>
      </TouchableOpacity>
    </View>
  );
}

/* --- Styles --- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 15,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  link: { marginTop: 12, textAlign: "center", color: "#007BFF" },
});
