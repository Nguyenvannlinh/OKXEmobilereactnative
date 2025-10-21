import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const BASE_URL =
  Platform.OS === "web"
    ? "http://localhost:5000"
    : "http://172.20.10.7:5000";

interface Listing {
  listing_id: number;
  title: string;
  price: number;
  status: string;
  main_image?: string;
}

interface UserData {
  user_id: number;
  username: string;
  email: string;
  phone_number: string;
}

const ShopScreen = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        let userData: UserData | null = null;

        // ✅ Đọc user data theo nền tảng
        if (Platform.OS === "web") {
          const storedUser = localStorage.getItem("user");
          userData = storedUser ? JSON.parse(storedUser) : null;
        } else {
          const storedUser = await AsyncStorage.getItem("user");
          userData = storedUser ? JSON.parse(storedUser) : null;
        }

        if (userData?.user_id) {
          setUser(userData);

          // ✅ Lấy danh sách xe người này đăng
          const res = await axios.get(
            `${BASE_URL}/api/listings/user/${userData.user_id}`
          );
          setListings(res.data || []);
        }
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu:", err);
      }
    };

    fetchData();
  }, []);

  // 🗑️ Xoá sản phẩm
  const handleDelete = async (listingId: number) => {
    const confirmDelete =
      Platform.OS === "web"
        ? window.confirm("Bạn có chắc muốn xoá sản phẩm này không?")
        : true;

    if (!confirmDelete) return;

    try {
      await axios.delete(`${BASE_URL}/api/listings/${listingId}`);
      if (Platform.OS === "web") {
        alert("✅ Sản phẩm đã được xoá thành công!");
      } else {
        Alert.alert("Thành công", "Sản phẩm đã được xoá!");
      }
      setListings((prev) => prev.filter((l) => l.listing_id !== listingId));
    } catch (err) {
      console.error("❌ Lỗi xoá sản phẩm:", err);
      if (Platform.OS === "web") {
        alert("❌ Lỗi khi xoá sản phẩm!");
      } else {
        Alert.alert("Lỗi", "Không thể xoá sản phẩm!");
      }
    }
  };

  // 🔙 Nút back
  const handleBack = () => {
    if (Platform.OS === "web") window.history.back();
    else navigation.goBack();
  };

  // 🖼️ Hàm xử lý ảnh đầy đủ đường dẫn
  const getImageUrl = (main_image?: string) => {
    if (!main_image) return "https://via.placeholder.com/100";
    if (main_image.startsWith("http")) return main_image;
    return `${BASE_URL}${main_image.startsWith("/uploads") ? main_image : `/uploads/${main_image}`}`;
  };

  return (
    <View style={styles.container}>
      {/* 🔹 Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gian hàng của tôi</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* 🔹 Thông tin shop */}
        <View style={styles.shopInfo}>
          <Text style={styles.shopName}>{user?.username || "Người dùng"}</Text>
          <Text style={styles.shopAddress}>Địa chỉ cửa hàng</Text>
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {[1, 2, 3, 4].map((i) => (
                <Ionicons key={i} name="star" size={16} color="#FFD700" />
              ))}
              <Ionicons name="star-outline" size={16} color="#FFD700" />
            </View>
            <Text style={styles.ratingValue}>4.0</Text>
            <Text style={styles.verified}>(✔)</Text>
          </View>
        </View>

        {/* 🔹 Thống kê */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{listings.length}</Text>
            <Text style={styles.statLabel}>Đang bán</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Đã bán</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>+585</Text>
            <Text style={styles.statLabel}>Ngày hoạt động</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Yêu thích</Text>
          </View>
        </View>

        {/* 🔹 Danh sách xe */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đang bán</Text>
          {listings.length > 0 ? (
            listings.map((item) => (
              <View key={item.listing_id} style={styles.listingItem}>
                <Image
                  source={{ uri: getImageUrl(item.main_image) }}
                  style={styles.listingImage}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.listingTitle}>{item.title}</Text>
                  <Text style={styles.listingPrice}>
                    {item.price?.toLocaleString("vi-VN")} đ
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item.listing_id)}>
                  <Ionicons name="trash-outline" size={22} color="red" />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={50} color="#ccc" />
              <Text style={styles.emptyText}>Không có sản phẩm nào</Text>
            </View>
          )}
        </View>

        {/* 🔹 Liên hệ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
          <View style={styles.contactItem}>
            <Ionicons name="call-outline" size={20} color="#00C6CF" />
            <Text style={styles.contactText}>
              {user?.phone_number || "Chưa có số điện thoại"}
            </Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="mail-outline" size={20} color="#00C6CF" />
            <Text style={styles.contactText}>
              {user?.email || "Chưa có email"}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// 🎨 STYLE
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#00C6CF",
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: { padding: 4 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  content: { flex: 1 },
  shopInfo: { backgroundColor: "#fff", padding: 16, alignItems: "center" },
  shopName: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  shopAddress: { fontSize: 14, color: "#666", marginBottom: 8 },
  ratingContainer: { flexDirection: "row", alignItems: "center" },
  stars: { flexDirection: "row", marginRight: 5 },
  ratingValue: { fontWeight: "bold", marginRight: 5 },
  verified: { color: "#4CAF50" },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginTop: 8,
    paddingVertical: 16,
  },
  statItem: { flex: 1, alignItems: "center" },
  statNumber: { fontSize: 18, fontWeight: "bold", color: "#00C6CF" },
  statLabel: { fontSize: 12, color: "#666", marginTop: 4 },
  section: { backgroundColor: "#fff", marginTop: 8, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 12 },
  emptyState: { alignItems: "center", paddingVertical: 30 },
  emptyText: { marginTop: 10, color: "#999" },
  contactItem: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  contactText: { marginLeft: 10, fontSize: 14 },
  listingItem: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "space-between",
  },
  listingImage: { width: 100, height: 70, marginRight: 10, borderRadius: 8 },
  listingTitle: { fontWeight: "bold", fontSize: 14 },
  listingPrice: { color: "#00C6CF", fontSize: 13, marginTop: 4 },
});

export default ShopScreen;
