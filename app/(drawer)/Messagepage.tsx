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

export default function MessagePage() {
  // ✅ Dùng IP LAN cho mobile
  const API_URL =
    Platform.OS === "web"
      ? "http://localhost:5000/api/messages"
      : "http://172.20.10.7:5000/api/messages";

  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortNewest, setSortNewest] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [form, setForm] = useState({
    sender_id: "",
    receiver_id: "",
    listing_id: "",
    content: "",
    is_read: false,
  });

  // 🔹 Fetch danh sách tin nhắn
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const data = await res.json();

      const sorted = data.sort((a: any, b: any) => {
        const t1 = new Date(a.sent_at || a.created_at).getTime();
        const t2 = new Date(b.sent_at || b.created_at).getTime();
        return sortNewest ? t2 - t1 : t1 - t2;
      });

      setMessages(sorted);
    } catch (err) {
      console.error("❌ Lỗi tải tin nhắn:", err);
      Alert.alert("Lỗi", "Không thể tải danh sách tin nhắn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [sortNewest]);

  // 🔹 Mở modal thêm/sửa
  const openModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setForm({
        sender_id: item.sender_id?.toString() || "",
        receiver_id: item.receiver_id?.toString() || "",
        listing_id: item.listing_id?.toString() || "",
        content: item.content || "",
        is_read: item.is_read || false,
      });
    } else {
      setEditingItem(null);
      setForm({
        sender_id: "",
        receiver_id: "",
        listing_id: "",
        content: "",
        is_read: false,
      });
    }
    setModalVisible(true);
  };

  // 🔹 Lưu tin nhắn
  const handleSave = async () => {
    if (!form.sender_id || !form.receiver_id || !form.content.trim()) {
      Alert.alert("Cảnh báo", "Vui lòng nhập đầy đủ thông tin bắt buộc!");
      return;
    }

    const method = editingItem ? "PUT" : "POST";
    const url = editingItem ? `${API_URL}/${editingItem.message_id}` : API_URL;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_id: Number(form.sender_id),
          receiver_id: Number(form.receiver_id),
          listing_id: form.listing_id ? Number(form.listing_id) : null,
          content: form.content,
          is_read: Boolean(form.is_read),
        }),
      });

      if (!res.ok) throw new Error("Không thể lưu dữ liệu");

      Alert.alert(
        "✅ Thành công",
        editingItem ? "Đã cập nhật tin nhắn" : "Đã thêm tin nhắn"
      );

      setModalVisible(false);
      fetchMessages();
    } catch (err) {
      console.error("❌ Save error:", err);
      Alert.alert("Lỗi", "Không thể lưu tin nhắn");
    }
  };

  // 🔹 Xóa tin nhắn
  const handleDelete = async (id: number) => {
    const confirmDelete = async () => {
      try {
        const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error();

        Alert.alert("✅ Thành công", "Đã xóa tin nhắn");
        fetchMessages();
      } catch (err) {
        console.error("❌ Delete error:", err);
        Alert.alert("Lỗi", "Không thể xóa tin nhắn");
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm("Bạn có chắc muốn xóa tin nhắn này không?"))
        confirmDelete();
    } else {
      Alert.alert("Xác nhận", "Bạn có chắc muốn xóa tin nhắn này?", [
        { text: "Hủy", style: "cancel" },
        { text: "Xóa", onPress: confirmDelete },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>💬 Quản lý Tin nhắn</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            style={styles.sortBtn}
            onPress={() => setSortNewest(!sortNewest)}
          >
            <Text style={styles.sortText}>
              {sortNewest ? "🔽 Mới nhất trước" : "🔼 Cũ nhất trước"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => openModal()}
          >
            <Text style={styles.addBtnText}>+ Thêm tin nhắn</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Danh sách tin nhắn */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#00C6CF"
          style={{ marginTop: 20 }}
        />
      ) : (
        <ScrollView style={styles.chatContainer}>
          {messages.map((m) => {
            const isSender = m.sender_id < m.receiver_id;
            return (
              <View
                key={m.message_id}
                style={[
                  styles.messageBubble,
                  isSender ? styles.bubbleLeft : styles.bubbleRight,
                ]}
              >
                <Text style={styles.senderName}>
                  {isSender
                    ? `👤 Người gửi #${m.sender_id}`
                    : `📩 Người nhận #${m.receiver_id}`}
                </Text>
                <Text style={styles.messageText}>{m.content}</Text>
                {m.listing_title && (
                  <Text style={styles.listingText}>
                    🧾 {m.listing_title}
                  </Text>
                )}
                <Text style={styles.timeText}>
                  {new Date(m.sent_at || m.created_at).toLocaleString("vi-VN")}
                </Text>
                <View style={styles.bubbleActions}>
                  <TouchableOpacity onPress={() => openModal(m)}>
                    <Text style={styles.actionEdit}>Sửa</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(m.message_id)}>
                    <Text style={styles.actionDelete}>Xóa</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Modal thêm/sửa */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingItem ? "✏️ Sửa tin nhắn" : "➕ Thêm tin nhắn"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Người gửi ID"
              keyboardType="numeric"
              value={form.sender_id}
              onChangeText={(t) => setForm({ ...form, sender_id: t })}
            />

            <TextInput
              style={styles.input}
              placeholder="Người nhận ID"
              keyboardType="numeric"
              value={form.receiver_id}
              onChangeText={(t) => setForm({ ...form, receiver_id: t })}
            />

            <TextInput
              style={styles.input}
              placeholder="Listing ID (nếu có)"
              keyboardType="numeric"
              value={form.listing_id}
              onChangeText={(t) => setForm({ ...form, listing_id: t })}
            />

            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Nội dung tin nhắn"
              value={form.content}
              onChangeText={(t) => setForm({ ...form, content: t })}
              multiline
            />

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
    </View>
  );
}

/* --- Styles --- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 10 },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  title: { fontSize: 20, fontWeight: "bold" },
  addBtn: { backgroundColor: "#00C6CF", padding: 8, borderRadius: 6 },
  addBtnText: { color: "#fff" },
  sortBtn: { backgroundColor: "#eee", padding: 8, borderRadius: 6 },
  sortText: { color: "#333", fontSize: 14 },

  chatContainer: { backgroundColor: "#fff", borderRadius: 10, padding: 10, maxHeight: "85%" },
  messageBubble: {
    marginVertical: 6,
    padding: 12,
    borderRadius: 16,
    maxWidth: "90%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bubbleLeft: {
    alignSelf: "flex-start",
    backgroundColor: "#d9faff",
    marginLeft: 5,
  },
  bubbleRight: {
    alignSelf: "flex-end",
    backgroundColor: "#b9f6ca",
    marginRight: 5,
  },
  senderName: { fontSize: 13, color: "#444", marginBottom: 4 },
  messageText: { fontSize: 16, color: "#222", lineHeight: 22 },
  listingText: { fontSize: 13, color: "#555", marginTop: 4 },
  timeText: { fontSize: 12, color: "#777", marginTop: 6, alignSelf: "flex-end" },
  bubbleActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 4,
  },
  actionEdit: { color: "#007bff", fontSize: 13 },
  actionDelete: { color: "red", fontSize: 13 },

  // 🔹 Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "100%",
    maxWidth: 400,
    borderRadius: 10,
    padding: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
  },
  btnRow: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  btn: { padding: 10, borderRadius: 6, minWidth: 80, alignItems: "center" },
});
