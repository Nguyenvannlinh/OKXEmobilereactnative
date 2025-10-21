import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ReviewPage() {
    const API_URL =
    Platform.OS === 'web'
      ? 'http://localhost:5000/api/reviews'
      : 'http://192.168.1.12:5000/api/reviews';

  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [form, setForm] = useState({
    reviewer_id: "",
    reviewed_user_id: "",
    listing_id: "",
    rating: "",
    comment: "",
  });
  const [sortType, setSortType] = useState<"id" | "rating">("id");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      Alert.alert("Lỗi", "Không thể tải danh sách đánh giá");
    } finally {
      setLoading(false);
    }
  };

  const sortReviews = (type: "id" | "rating") => {
    const sorted = [...reviews].sort((a, b) =>
      type === "id" ? a.review_id - b.review_id : b.rating - a.rating
    );
    setReviews(sorted);
    setSortType(type);
  };

  const openModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setForm({
        reviewer_id: String(item.reviewer_id),
        reviewed_user_id: String(item.reviewed_user_id),
        listing_id: String(item.listing_id),
        rating: String(item.rating),
        comment: item.comment,
      });
    } else {
      setEditingItem(null);
      setForm({
        reviewer_id: "",
        reviewed_user_id: "",
        listing_id: "",
        rating: "",
        comment: "",
      });
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    const method = editingItem ? "PUT" : "POST";
    const url = editingItem ? `${API_URL}/${editingItem.review_id}` : API_URL;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewer_id: Number(form.reviewer_id),
          reviewed_user_id: Number(form.reviewed_user_id),
          listing_id: Number(form.listing_id),
          rating: Number(form.rating),
          comment: form.comment,
        }),
      });
      if (!res.ok) throw new Error("Lưu thất bại");

      if (Platform.OS === "web")
        window.alert(editingItem ? "✅ Đã cập nhật đánh giá" : "✅ Đã thêm đánh giá");
      else
        Alert.alert("Thành công", editingItem ? "Đã cập nhật đánh giá" : "Đã thêm đánh giá");

      setModalVisible(false);
      fetchReviews();
    } catch {
      Alert.alert("Lỗi", "Không thể lưu thông tin đánh giá");
    }
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = async () => {
      try {
        const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Xóa thất bại");
        if (Platform.OS === "web") window.alert("✅ Đã xóa đánh giá");
        else Alert.alert("✅ Thành công", "Đã xóa đánh giá");
        fetchReviews();
      } catch {
        Alert.alert("Lỗi", "Không thể xóa đánh giá");
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm("Bạn có chắc muốn xóa đánh giá này không?")) confirmDelete();
    } else {
      Alert.alert("Xác nhận", "Bạn có chắc muốn xóa đánh giá này?", [
        { text: "Hủy", style: "cancel" },
        { text: "Xóa", onPress: confirmDelete },
      ]);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📋 Quản lý Đánh giá</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.sortBtn, sortType === "id" && styles.sortBtnActive]}
            onPress={() => sortReviews("id")}
          >
            <Text style={styles.sortBtnText}>Theo ID</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortBtn, sortType === "rating" && styles.sortBtnActive]}
            onPress={() => sortReviews("rating")}
          >
            <Text style={styles.sortBtnText}>Theo Rating</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn} onPress={() => openModal()}>
            <Text style={styles.addBtnText}>+ Thêm</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Danh sách Review */}
      {loading ? (
        <ActivityIndicator size="large" color="#00C6CF" style={{ marginTop: 30 }} />
      ) : (
        reviews.map((r) => (
          <View key={r.review_id} style={styles.card}>
            <Text style={styles.cardTitle}>#{r.review_id}</Text>
            <Text>👤 Reviewer ID: {r.reviewer_id}</Text>
            <Text>🎯 Reviewed User: {r.reviewed_user_id}</Text>
            <Text>🚘 Listing ID: {r.listing_id}</Text>
            <Text>⭐ Rating: {r.rating}</Text>
            <Text>💬 {r.comment}</Text>
            <Text style={styles.dateText}>
              🕓 {r.created_at ? new Date(r.created_at).toLocaleDateString() : "-"}
            </Text>
            <View style={styles.actionGroup}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#e0f7fa" }]}
                onPress={() => openModal(r)}
              >
                <Text>Sửa</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#ffe6e6" }]}
                onPress={() => handleDelete(r.review_id)}
              >
                <Text style={{ color: "red" }}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingItem ? "✏️ Sửa đánh giá" : "➕ Thêm đánh giá"}
            </Text>

            <ScrollView>
              {[
                { key: "reviewer_id", label: "Reviewer ID" },
                { key: "reviewed_user_id", label: "Reviewed User ID" },
                { key: "listing_id", label: "Listing ID" },
                { key: "rating", label: "Rating (1-5)" },
              ].map((f) => (
                <TextInput
                  key={f.key}
                  style={styles.input}
                  placeholder={f.label}
                  keyboardType="numeric"
                  value={(form as any)[f.key]}
                  onChangeText={(t) => setForm({ ...form, [f.key]: t })}
                />
              ))}

              <TextInput
                style={[styles.input, { height: 90 }]}
                placeholder="Bình luận"
                value={form.comment}
                onChangeText={(t) => setForm({ ...form, comment: t })}
                multiline
              />
            </ScrollView>

            <View style={styles.btnRow}>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: "#ccc" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: "#00C6CF" }]}
                onPress={handleSave}
              >
                <Text style={{ color: "#fff" }}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

/* --- UI Styles --- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa", padding: 12 },
  header: { marginBottom: 10 },
  title: { fontSize: 20, fontWeight: "bold", color: "#333" },
  headerActions: { flexDirection: "row", gap: 8, marginTop: 6 },
  sortBtn: {
    backgroundColor: "#e0e0e0",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  sortBtnActive: { backgroundColor: "#00C6CF" },
  sortBtnText: { color: "#000" },
  addBtn: {
    backgroundColor: "#00C6CF",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  addBtnText: { color: "#fff", fontWeight: "bold" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
  },
  cardTitle: { fontWeight: "bold", marginBottom: 6 },
  dateText: { color: "#777", fontSize: 12, marginTop: 4 },
  actionGroup: { flexDirection: "row", marginTop: 8, gap: 10 },
  actionBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 6,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "95%",
    borderRadius: 10,
    padding: 16,
    maxHeight: "90%",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 15,
  },
  btnRow: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  btn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
});
