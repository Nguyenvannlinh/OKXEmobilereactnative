import { Ionicons } from "@expo/vector-icons";
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

// ✅ BASE_URL phù hợp Web/Mobile
const BASE_URL =
  Platform.OS === "web"
    ? "http://localhost:5000"
    : "http://192.168.1.12:5000";

type Listing = {
  listing_id: number;
  user_name: string;
  username: string;
  title: string;
  price: number;
  province_city: string;
  status: string;
  view_count: number;
  created_at: string;
  manufacturer_name?: string;
  model_name?: string;
  fuel_type?: string;
  transmission?: string;
  color?: string;
  year_of_manufacture?: number;
  number_of_seats?: number;
  main_image?: string;
};

export default function ListingPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [sortBy, setSortBy] = useState<"date" | "price" | "views">("date");

  useEffect(() => {
    fetchListings();
  }, [sortBy]);

  const fetchListings = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/listings`);
      let data = res.data as Listing[];

      if (sortBy === "date") {
        data.sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );
      } else if (sortBy === "price") {
        data.sort((a, b) => Number(b.price) - Number(a.price));
      } else if (sortBy === "views") {
        data.sort((a, b) => b.view_count - a.view_count);
      }

      setListings(data);
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách:", err);
    }
  };

  // ✅ Hàm xoá bài đăng
  const handleDelete = async (listingId: number) => {
    try {
      const confirmDelete =
        Platform.OS === "web"
          ? window.confirm("Bạn có chắc muốn xoá bài đăng này không?")
          : true;

      if (!confirmDelete) return;

      await axios.delete(`${BASE_URL}/api/listings/${listingId}`);

      if (Platform.OS === "web") {
        alert("✅ Bài đăng đã được xoá thành công!");
      } else {
        Alert.alert("Thành công", "Bài đăng đã được xoá!");
      }

      setListings((prev) =>
        prev.filter((item) => item.listing_id !== listingId)
      );
    } catch (err) {
      console.error("❌ Lỗi khi xoá bài đăng:", err);
      if (Platform.OS === "web") {
        alert("❌ Lỗi khi xoá bài đăng!");
      } else {
        Alert.alert("Lỗi", "Không thể xoá bài đăng, vui lòng thử lại!");
      }
    }
  };

  // ✅ Xử lý ảnh (đảm bảo load đúng link)
  const getImageUrl = (url?: string) => {
    if (!url) return "https://via.placeholder.com/300x200?text=No+Image";
    if (url.startsWith("http")) return url;
    return `${BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý Bài đăng (Listing)</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => Alert.alert("Đi tới thêm bài đăng")}
        >
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Thêm bài đăng</Text>
        </TouchableOpacity>
      </View>

      {/* Bộ lọc */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterBtn, sortBy === "date" && styles.filterActive]}
          onPress={() => setSortBy("date")}
        >
          <Ionicons
            name="time-outline"
            size={16}
            color={sortBy === "date" ? "#fff" : "#555"}
          />
          <Text
            style={[
              styles.filterText,
              sortBy === "date" && styles.filterTextActive,
            ]}
          >
            Thời gian
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, sortBy === "price" && styles.filterActive]}
          onPress={() => setSortBy("price")}
        >
          <Ionicons
            name="cash-outline"
            size={16}
            color={sortBy === "price" ? "#fff" : "#555"}
          />
          <Text
            style={[
              styles.filterText,
              sortBy === "price" && styles.filterTextActive,
            ]}
          >
            Giá
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, sortBy === "views" && styles.filterActive]}
          onPress={() => setSortBy("views")}
        >
          <Ionicons
            name="eye-outline"
            size={16}
            color={sortBy === "views" ? "#fff" : "#555"}
          />
          <Text
            style={[
              styles.filterText,
              sortBy === "views" && styles.filterTextActive,
            ]}
          >
            Lượt xem
          </Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách */}
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {listings.length === 0 ? (
          <Text style={styles.emptyText}>Không có bài đăng nào.</Text>
        ) : (
          listings.map((item) => (
            <View key={item.listing_id} style={styles.card}>
              {/* Ảnh sản phẩm */}
              <Image
                source={{ uri: getImageUrl(item.main_image) }}
                style={styles.image}
                resizeMode="cover"
              />

              {/* Tiêu đề + trạng thái */}
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.title || "Không có tiêu đề"}
                </Text>
                <Text
                  style={[
                    styles.status,
                    item.status === "approved"
                      ? styles.approved
                      : styles.pending,
                  ]}
                >
                  {item.status}
                </Text>
              </View>

              {/* Thông tin chi tiết */}
              <Text style={styles.cardText}>👤 {item.username || "Ẩn danh"}</Text>
              <Text style={styles.cardText}>
                🏷 {item.manufacturer_name || "Hãng"}{" "}
                {item.model_name ? `- ${item.model_name}` : ""}
              </Text>
              <Text style={styles.cardText}>
                ⚙️ {item.transmission || "Không rõ"} | {item.fuel_type || "Nhiên liệu?"}
              </Text>
              <Text style={styles.cardText}>
                🎨 Màu: {item.color || "Không rõ"} | 🚘 {item.number_of_seats || "?"} chỗ
              </Text>
              <Text style={styles.cardText}>
                📅 SX {item.year_of_manufacture || "?"} | 📍{" "}
                {item.province_city || "Không rõ"}
              </Text>
              <Text style={styles.cardText}>
                💰 {Number(item.price).toLocaleString("vi-VN")} ₫
              </Text>
              <Text style={styles.cardText}>
                👁 {item.view_count} lượt xem
              </Text>
              <Text style={styles.cardDate}>
                🕒{" "}
                {new Date(item.created_at).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </Text>

              {/* Nút hành động */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#e3f2fd" }]}
                  onPress={() =>
                    Alert.alert("Sửa bài", `ID: ${item.listing_id}`)
                  }
                >
                  <Ionicons name="create-outline" size={18} color="#2196f3" />
                  <Text style={[styles.actionText, { color: "#2196f3" }]}>
                    Sửa
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#fdecea" }]}
                  onPress={() => handleDelete(item.listing_id)}
                >
                  <Ionicons name="trash-outline" size={18} color="#f44336" />
                  <Text style={[styles.actionText, { color: "#f44336" }]}>
                    Xóa
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f7", padding: 12 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#333" },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00C6CF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  addButtonText: { color: "#fff", marginLeft: 6, fontWeight: "600" },
  filterRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  filterActive: {
    backgroundColor: "#00C6CF",
    borderColor: "#00C6CF",
  },
  filterText: { marginLeft: 4, fontSize: 13, color: "#333" },
  filterTextActive: { color: "#fff", fontWeight: "600" },
  emptyText: { textAlign: "center", color: "#999", marginTop: 40 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#333", flex: 1 },
  status: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  approved: { backgroundColor: "#e8f5e9", color: "#2e7d32" },
  pending: { backgroundColor: "#fff8e1", color: "#f57c00" },
  cardText: { fontSize: 14, color: "#555", marginVertical: 1 },
  cardDate: { fontSize: 12, color: "#888", marginTop: 4 },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    gap: 10,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  actionText: { marginLeft: 4, fontWeight: "600" },
});
