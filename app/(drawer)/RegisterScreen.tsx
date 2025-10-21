import axios from "axios";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const API_URL = "http://localhost:3000/api/auth/register"; // đổi thành API backend của bạn

export default function RegisterScreen({ navigation }: any) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [full_name, setFullName] = useState("");
  const [phone_number, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đủ thông tin");
      return;
    }

    try {
      const res = await axios.post(API_URL, {
        username,
        email,
        password,
        full_name,
        phone_number,
      });

      Alert.alert("Thành công", "Tạo tài khoản thành công!");
      navigation.replace("Login");
    } catch (err: any) {
      Alert.alert("Thất bại", err.response?.data?.message || "Đăng ký thất bại");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng ký tài khoản</Text>

      <TextInput placeholder="Tên đăng nhập" style={styles.input} value={username} onChangeText={setUsername} />
      <TextInput placeholder="Email" style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput placeholder="Họ tên" style={styles.input} value={full_name} onChangeText={setFullName} />
      <TextInput placeholder="Số điện thoại" style={styles.input} value={phone_number} onChangeText={setPhoneNumber} />
      <TextInput placeholder="Mật khẩu" style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Đăng ký</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Đã có tài khoản? Đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#28A745",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  link: { marginTop: 12, textAlign: "center", color: "#007BFF" },
});
