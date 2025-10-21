import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons, FontAwesome, AntDesign } from "@expo/vector-icons";

const user = {
  name: "Nguyễn Văn Linh",
  id: "1662530",
  phone: "0969321542",
  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  email: "linh.nguyen321542@gmail.com",
};

export default function QuanLyTaiKhoan() {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý tài khoản</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>48. {user.name}</Text>
          <Text style={styles.userSub}>
            ID {user.id}  |  Tài khoản {user.phone}
          </Text>
        </View>
        <TouchableOpacity style={styles.detailBtn}>
          <Text style={{ color: "#00C6CF", fontWeight: "bold" }}>Xem chi tiết</Text>
        </TouchableOpacity>
      </View>

      {/* Liên kết tài khoản */}
      <Text style={styles.sectionTitle}>Liên kết tài khoản</Text>
      <View style={styles.linkRow}>
        <FontAwesome name="facebook-square" size={24} color="#1877F3" />
        <Text style={styles.linkText}>Tài khoản Facebook</Text>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.linkBtn}>
          <Text style={styles.linkBtnText}>Liên kết</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.linkRow}>
        <AntDesign name="google" size={24} color="#EA4335" />
        <View style={{ flex: 1 }}>
          <Text style={styles.linkText}>Tài khoản Google</Text>
          <Text style={styles.linkSub}>{user.email}</Text>
        </View>
        <TouchableOpacity style={[styles.linkBtn, { backgroundColor: "#eee" }]}>
          <Text style={[styles.linkBtnText, { color: "#888" }]}>Hủy liên kết</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.linkRow}>
        <AntDesign name="apple1" size={24} color="#000" />
        <Text style={styles.linkText}>Tài khoản Apple</Text>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.linkBtn}>
          <Text style={styles.linkBtnText}>Liên kết</Text>
        </TouchableOpacity>
      </View>

      {/* Thông tin liên hệ */}
      <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
      <View style={styles.contactRow}>
        <Text style={styles.contactPhone}>+84{user.phone}</Text>
        <TouchableOpacity>
          <Text style={{ color: "#00C6CF", fontWeight: "bold" }}>+ Thêm mới</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.defaultRow}>
        <Text style={styles.defaultText}>✓ Mặc định</Text>
      </View>

      {/* Đăng xuất & Xóa tài khoản */}
      <TouchableOpacity style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
      <TouchableOpacity>
        <Text style={styles.deleteText}>Xóa tài khoản</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerTitle}>Công ty TNHH OKXE Việt Nam</Text>
        <Text style={styles.footerSub}>TRỤ SỞ CHÍNH</Text>
        <Text style={styles.footerText}>92 Phố Khâm Thiên, Phường Khâm Thiên, Quận Đống Đa, TP Hà Nội</Text>
        <Text style={styles.footerSub}>HỖ TRỢ KHÁCH HÀNG</Text>
        <Text style={[styles.footerText, { color: "#00C6CF" }]}>Hotline: 1900 636 135 (9:00 - 21:00)</Text>
        <Text style={styles.footerSub}>VỀ CHÚNG TÔI</Text>
        <Text style={styles.footerText}>Giới thiệu | Điều khoản sử dụng</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00C6CF",
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  headerTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 8,
    borderBottomColor: "#f2f2f2",
  },
  avatar: { width: 56, height: 56, borderRadius: 28, marginRight: 12 },
  userName: { fontWeight: "bold", fontSize: 16 },
  userSub: { color: "#888", fontSize: 13, marginTop: 2 },
  detailBtn: {
    backgroundColor: "#E6F8F9",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  sectionTitle: {
    backgroundColor: "#f2f2f2",
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontWeight: "bold",
    color: "#555",
    fontSize: 15,
    marginTop: 10,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
    backgroundColor: "#fff",
  },
  linkText: { marginLeft: 10, fontSize: 15, fontWeight: "500" },
  linkSub: { marginLeft: 10, fontSize: 13, color: "#888" },
  linkBtn: {
    backgroundColor: "#00C6CF",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  linkBtnText: { color: "#fff", fontWeight: "bold" },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
  },
  contactPhone: { fontSize: 15, fontWeight: "500", flex: 1 },
  defaultRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 8,
    borderBottomColor: "#f2f2f2",
  },
  defaultText: { color: "#00C6CF", fontWeight: "bold", fontSize: 13 },
  logoutBtn: {
    backgroundColor: "#000",
    margin: 16,
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: "center",
  },
  logoutText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  deleteText: {
    color: "#E44D26",
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 24,
    fontSize: 15,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    padding: 16,
    backgroundColor: "#fff",
  },
  footerTitle: { fontWeight: "bold", fontSize: 15, marginBottom: 4 },
  footerSub: { fontWeight: "bold", fontSize: 13, marginTop: 8 },
  footerText: { fontSize: 13, color: "#444", marginTop: 2 },
});