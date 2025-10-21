import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Transmission {
  transmission_id: number;
  name: string;
}

export default function TransmissionPage() {
    const API_URL =
    Platform.OS === 'web'
      ? 'http://localhost:5000/api/transmissions'
      : 'http://172.20.10.7:5000/api/transmissions';

  const [transmissions, setTransmissions] = useState<Transmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Transmission | null>(null);
  const [form, setForm] = useState({ name: "" });
  const [sortType, setSortType] = useState<"id" | "name">("id");

  // Fetch dữ liệu
  const fetchTransmissions = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const data = await res.json();
      setTransmissions(data);
    } catch (err) {
      Alert.alert("Lỗi", "Không thể tải danh sách hộp số");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransmissions();
  }, []);

  // Sắp xếp
  const sortTransmissions = (type: "id" | "name") => {
    const sorted = [...transmissions].sort((a, b) => {
      if (type === "id") return a.transmission_id - b.transmission_id;
      return a.name.localeCompare(b.name, "vi", { sensitivity: "base" });
    });
    setTransmissions(sorted);
    setSortType(type);
  };

  // Mở modal
  const openModal = (item?: Transmission) => {
    if (item) {
      setEditingItem(item);
      setForm({ name: item.name });
    } else {
      setEditingItem(null);
      setForm({ name: "" });
    }
    setModalVisible(true);
  };

  // Lưu
  const handleSave = async () => {
    const method = editingItem ? "PUT" : "POST";
    const url = editingItem
      ? `${API_URL}/${editingItem.transmission_id}`
      : API_URL;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Lỗi khi lưu");

      Platform.OS === "web"
        ? window.alert("✅ Lưu thành công")
        : Alert.alert("Thành công", "Đã lưu hộp số");

      setModalVisible(false);
      fetchTransmissions();
    } catch {
      Alert.alert("Lỗi", "Không thể lưu hộp số");
    }
  };

  // Xóa
  const handleDelete = async (id: number) => {
    const confirmDelete = async () => {
      try {
        const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error();

        Platform.OS === "web"
          ? window.alert("✅ Đã xóa hộp số")
          : Alert.alert("Thành công", "Đã xóa hộp số");

        fetchTransmissions();
      } catch {
        Alert.alert("Lỗi", "Không thể xóa hộp số");
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm("Bạn có chắc muốn xóa hộp số này không?"))
        confirmDelete();
    } else {
      Alert.alert("Xác nhận", "Bạn có chắc muốn xóa hộp số này?", [
        { text: "Hủy", style: "cancel" },
        { text: "Xóa", onPress: confirmDelete },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Tiêu đề */}
      <Text style={styles.title}>⚙️ Quản lý Hộp số</Text>

      {/* Thanh công cụ */}
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.addBtn} onPress={() => openModal()}>
          <Text style={styles.addText}>+ Thêm</Text>
        </TouchableOpacity>

        <View style={styles.sortGroup}>
          <TouchableOpacity
            style={[styles.sortBtn, sortType === "id" && styles.activeBtn]}
            onPress={() => sortTransmissions("id")}
          >
            <Text
              style={[styles.sortText, sortType === "id" && styles.activeText]}
            >
              Theo ID
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortBtn, sortType === "name" && styles.activeBtn]}
            onPress={() => sortTransmissions("name")}
          >
            <Text
              style={[styles.sortText, sortType === "name" && styles.activeText]}
            >
              Theo Tên
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Danh sách hộp số */}
      {loading ? (
        <ActivityIndicator size="large" color="#00C6CF" />
      ) : (
        <FlatList
          data={transmissions}
          keyExtractor={(item) => item.transmission_id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardLine}>ID: {item.transmission_id}</Text>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#e6f2ff" }]}
                  onPress={() => openModal(item)}
                >
                  <Text>Sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#ffe6e6" }]}
                  onPress={() => handleDelete(item.transmission_id)}
                >
                  <Text style={{ color: "red" }}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Modal thêm/sửa */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              {editingItem ? "✏️ Sửa hộp số" : "➕ Thêm hộp số"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Tên hộp số"
              value={form.name}
              onChangeText={(t) => setForm({ ...form, name: t })}
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
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12, textAlign: "center" },

  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 10,
    gap: 10,
  },
  sortGroup: {
    flexDirection: "row",
    gap: 6,
  },
  sortBtn: {
    backgroundColor: "#ddd",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  sortText: { color: "#000" },
  activeBtn: { backgroundColor: "#00C6CF" },
  activeText: { color: "#fff" },
  addBtn: { backgroundColor: "#00C6CF", padding: 8, borderRadius: 6 },
  addText: { color: "#fff", fontWeight: "bold" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 6 },
  cardLine: { color: "#444" },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    gap: 10,
  },
  actionBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: { backgroundColor: "#fff", width: "90%", borderRadius: 10, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
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
