import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Order = {
  order_id: number;
  listing_id: number;
  buyer_id: number;
  total_amount: number;
  payment_status: string;
  delivery_status: string;
  created_at: string;

  buyer_name: string;
  buyer_fullname?: string;
  buyer_email: string;
  buyer_phone: string;
  buyer_avatar?: string;

  listing_title: string;
  listing_price: number;
  listing_province: string;
  listing_color?: string;
  listing_year?: number;
  listing_image?: string;

  manufacturer_name?: string;
  model_name?: string;
  transmission_name?: string;
  bodytype_name?: string;
};

// ✅ Thêm BASE_URL động để chạy được cả trên web và mobile
const BASE_URL =
  Platform.OS === "web"
    ? "http://localhost:5000"
    : "http://192.168.1.12:5000"; // ⚠️ Thay IP này bằng IP LAN của máy bạn

export default function OrderManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "paid" | "delivered">(
    "all"
  );
  const [updateModal, setUpdateModal] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  // ✅ Lấy danh sách đơn hàng
  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/orders`);
      setOrders(res.data);
    } catch (err) {
      console.error("❌ Lỗi tải đơn hàng:", err);
      Alert.alert("Lỗi", "Không thể tải danh sách đơn hàng!");
    }
  };

  // ✅ Xóa đơn hàng
  const handleDelete = (id: number) => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn xóa đơn hàng này không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(`${BASE_URL}/api/orders/${id}`);
            setOrders((prev) => prev.filter((o) => o.order_id !== id));
            Alert.alert("✅ Thành công", "Đã xóa đơn hàng!");
          } catch (error) {
            console.error(error);
            Alert.alert("Lỗi", "Không thể xóa đơn hàng!");
          }
        },
      },
    ]);
  };

  // ✅ Cập nhật trạng thái đơn
  const handleUpdateStatus = async (
    id: number,
    newDelivery: string,
    newPayment: string
  ) => {
    try {
      const order = orders.find((o) => o.order_id === id);
      if (!order) return;

      await axios.put(`${BASE_URL}/api/orders/${id}`, {
        listing_id: order.listing_id,
        buyer_id: order.buyer_id,
        total_amount: order.total_amount,
        delivery_status: newDelivery,
        payment_status: newPayment,
      });

      setOrders((prev) =>
        prev.map((o) =>
          o.order_id === id
            ? { ...o, delivery_status: newDelivery, payment_status: newPayment }
            : o
        )
      );
      setUpdateModal(null);
      Alert.alert("✅ Thành công", "Cập nhật trạng thái đơn hàng thành công!");
    } catch (error) {
      console.error("❌ Lỗi cập nhật:", error);
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái đơn hàng!");
    }
  };

  // ✅ Bộ lọc
  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((o) => o.payment_status === filter);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📦 Quản lý Đơn hàng</Text>
        <TouchableOpacity onPress={fetchOrders} style={styles.reloadBtn}>
          <Ionicons name="refresh" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Bộ lọc */}
      <View style={styles.filterRow}>
        {["all", "pending", "paid", "delivered"].map((key) => (
          <TouchableOpacity
            key={key}
            style={[styles.filterBtn, filter === key && styles.filterActive]}
            onPress={() => setFilter(key as any)}
          >
            <Text
              style={[
                styles.filterText,
                filter === key && styles.filterTextActive,
              ]}
            >
              {key === "all"
                ? "Tất cả"
                : key === "pending"
                ? "Chờ xử lý"
                : key === "paid"
                ? "Đã thanh toán"
                : "Đã giao"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Danh sách đơn hàng */}
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {filteredOrders.length === 0 ? (
          <Text style={styles.emptyText}>Không có đơn hàng nào.</Text>
        ) : (
          filteredOrders.map((item) => (
            <View key={item.order_id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Đơn #{item.order_id}</Text>
                <Text
                  style={[
                    styles.status,
                    item.delivery_status === "delivered"
                      ? styles.delivered
                      : styles.pending,
                  ]}
                >
                  {item.delivery_status === "delivered"
                    ? "Đã giao"
                    : "Đang xử lý"}
                </Text>
              </View>

              {/* Ảnh & thông tin xe */}
              <View style={styles.row}>
                <Image
                  source={{
                    uri: item.listing_image
                      ? item.listing_image.startsWith("http")
                        ? item.listing_image
                        : `${BASE_URL}${item.listing_image}`
                      : "https://via.placeholder.com/80x80?text=No+Image",
                  }}
                  style={styles.image}
                />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.listingTitle}>{item.listing_title}</Text>
                  <Text style={styles.listingDetail}>
                    💰 {item.total_amount.toLocaleString()}₫
                  </Text>
                  <Text style={styles.listingDetail}>
                    🎨 {item.listing_color || "Không rõ"} -{" "}
                    {item.listing_year || "N/A"}
                  </Text>
                  <Text style={styles.listingDetail}>
                    📍 {item.listing_province}
                  </Text>
                </View>
              </View>

              {/* Người mua */}
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  👤 {item.buyer_fullname || item.buyer_name}
                </Text>
                <Text style={styles.infoText}>📧 {item.buyer_email}</Text>
                <Text style={styles.infoText}>📞 {item.buyer_phone}</Text>
              </View>

              {/* Trạng thái */}
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  💳 Thanh toán:{" "}
                  <Text
                    style={{
                      color:
                        item.payment_status === "paid" ? "#2e7d32" : "#f57c00",
                      fontWeight: "bold",
                    }}
                  >
                    {item.payment_status === "paid"
                      ? "Đã thanh toán"
                      : "Chờ thanh toán"}
                  </Text>
                </Text>
                <Text style={styles.infoText}>
                  🚚 Giao hàng:{" "}
                  <Text
                    style={{
                      color:
                        item.delivery_status === "delivered"
                          ? "#2e7d32"
                          : "#0277bd",
                      fontWeight: "bold",
                    }}
                  >
                    {item.delivery_status === "delivered"
                      ? "Đã giao"
                      : "Đang vận chuyển"}
                  </Text>
                </Text>
                <Text style={styles.infoText}>
                  🕒 Ngày tạo:{" "}
                  {new Date(item.created_at).toLocaleString("vi-VN")}
                </Text>
              </View>

              {/* Nút hành động */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#e8f5e9" }]}
                  onPress={() => setUpdateModal(item)}
                >
                  <Ionicons name="create-outline" size={18} color="#4caf50" />
                  <Text style={[styles.actionText, { color: "#4caf50" }]}>
                    Cập nhật
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#fdecea" }]}
                  onPress={() => handleDelete(item.order_id)}
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

      {/* Modal cập nhật */}
      <Modal visible={!!updateModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {updateModal && (
              <>
                <Text style={styles.modalTitle}>
                  Cập nhật đơn #{updateModal.order_id}
                </Text>

                <TouchableOpacity
                  style={styles.updateBtn}
                  onPress={() =>
                    handleUpdateStatus(
                      updateModal.order_id,
                      "processing",
                      "pending"
                    )
                  }
                >
                  <Text>🔄 Đang xử lý</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.updateBtn}
                  onPress={() =>
                    handleUpdateStatus(
                      updateModal.order_id,
                      "delivered",
                      "paid"
                    )
                  }
                >
                  <Text>✅ Đã giao & Thanh toán</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setUpdateModal(null)}
                  style={styles.closeBtn}
                >
                  <Text style={styles.closeBtnText}>Đóng</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  reloadBtn: { backgroundColor: "#00C6CF", padding: 8, borderRadius: 8 },
  filterRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  filterBtn: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  filterActive: { backgroundColor: "#00C6CF", borderColor: "#00C6CF" },
  filterText: { fontSize: 13, color: "#333" },
  filterTextActive: { color: "#fff", fontWeight: "600" },
  emptyText: { textAlign: "center", color: "#999", marginTop: 40 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#333" },
  status: { fontSize: 12, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  delivered: { backgroundColor: "#e8f5e9", color: "#2e7d32" },
  pending: { backgroundColor: "#fff8e1", color: "#f57c00" },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  image: { width: 80, height: 80, borderRadius: 8, backgroundColor: "#eee" },
  listingTitle: { fontSize: 15, fontWeight: "600", color: "#333" },
  listingDetail: { fontSize: 13, color: "#555" },
  infoBox: { marginTop: 5 },
  infoText: { fontSize: 13, color: "#444", marginVertical: 1 },
  actions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 8, gap: 10 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  actionText: { marginLeft: 4, fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  updateBtn: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginVertical: 4,
    alignItems: "center",
  },
  closeBtn: {
    backgroundColor: "#00C6CF",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 10,
  },
  closeBtnText: { color: "#fff", fontWeight: "bold" },
});
