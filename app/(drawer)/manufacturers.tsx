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
  View
} from "react-native";

export default function ManufacturersPage() {
   const API_URL =
    Platform.OS === 'web'
      ? 'http://localhost:5000/api/manufacturers'
      : 'http://172.20.10.7:5000/api/manufacturers';

  const [manufacturers, setManufacturers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [sortType, setSortType] = useState<"id" | "name">("id");

  const [form, setForm] = useState({
    name: "",
    country: "",
    description: "",
  });

  const fetchManufacturers = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const data = await res.json();
      setManufacturers(data);
    } catch (err) {
      Alert.alert("Lỗi", "Không thể tải danh sách hãng sản xuất");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManufacturers();
  }, []);

  const sortManufacturers = (type: "id" | "name") => {
    const sorted = [...manufacturers].sort((a, b) => {
      if (type === "id") return a.manufacturer_id - b.manufacturer_id;
      return a.name.localeCompare(b.name, "vi", { sensitivity: "base" });
    });
    setManufacturers(sorted);
    setSortType(type);
  };

  const openModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setForm({
        name: item.name,
        country: item.country || "",
        description: item.description || "",
      });
    } else {
      setEditingItem(null);
      setForm({ name: "", country: "", description: "" });
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert("Lỗi", "Tên hãng không được để trống");
      return;
    }
    const method = editingItem ? "PUT" : "POST";
    const url = editingItem
      ? `${API_URL}/${editingItem.manufacturer_id}`
      : API_URL;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();

      Alert.alert("✅ Thành công", editingItem ? "Đã cập nhật hãng" : "Đã thêm hãng mới");
      setModalVisible(false);
      fetchManufacturers();
    } catch {
      Alert.alert("Lỗi", "Không thể lưu hãng sản xuất");
    }
  };

  const handleDelete = async (id: number) => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn xóa hãng này không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            Alert.alert("✅ Đã xóa thành công");
            fetchManufacturers();
          } catch {
            Alert.alert("Lỗi", "Không thể xóa hãng sản xuất");
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📦 Quản lý Hãng sản xuất</Text>
        <View style={styles.headerBtns}>
          <TouchableOpacity
            style={[
              styles.sortBtn,
              sortType === "id" && styles.sortBtnActive,
            ]}
            onPress={() => sortManufacturers("id")}
          >
            <Text style={styles.sortBtnText}>Theo ID</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortBtn,
              sortType === "name" && styles.sortBtnActive,
            ]}
            onPress={() => sortManufacturers("name")}
          >
            <Text style={styles.sortBtnText}>Theo Tên</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn} onPress={() => openModal()}>
            <Text style={styles.addBtnText}>+ Thêm</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator size="large" color="#00C6CF" style={{ marginTop: 30 }} />
      ) : (
        manufacturers.map((m) => (
          <View key={m.manufacturer_id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{m.name}</Text>
              <Text style={styles.cardSub}>#{m.manufacturer_id}</Text>
            </View>
            <Text style={styles.cardText}>🌍 Quốc gia: {m.country || "—"}</Text>
            <Text style={styles.cardText}>📝 Mô tả: {m.description || "—"}</Text>

            <View style={styles.cardActions}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#eee" }]}
                onPress={() => openModal(m)}
              >
                <Text>✏️ Sửa</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#ffe6e6" }]}
                onPress={() => handleDelete(m.manufacturer_id)}
              >
                <Text style={{ color: "red" }}>🗑️ Xóa</Text>
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
              {editingItem ? "✏️ Sửa hãng sản xuất" : "➕ Thêm hãng sản xuất"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Tên hãng"
              value={form.name}
              onChangeText={(t) => setForm({ ...form, name: t })}
            />
            <TextInput
              style={styles.input}
              placeholder="Quốc gia"
              value={form.country}
              onChangeText={(t) => setForm({ ...form, country: t })}
            />
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Mô tả"
              multiline
              value={form.description}
              onChangeText={(t) => setForm({ ...form, description: t })}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f9fb", padding: 12 },
  header: { marginBottom: 10 },
  title: { fontSize: 20, fontWeight: "bold", color: "#333", marginBottom: 8 },
  headerBtns: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  sortBtn: { backgroundColor: "#ddd", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
  sortBtnActive: { backgroundColor: "#00C6CF" },
  sortBtnText: { color: "#000" },
  addBtn: { backgroundColor: "#00C6CF", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  addBtnText: { color: "#fff" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between" },
  cardTitle: { fontSize: 16, fontWeight: "bold" },
  cardSub: { fontSize: 12, color: "#888" },
  cardText: { marginTop: 4, color: "#444" },
  cardActions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 10, gap: 8 },
  actionBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "90%",
    borderRadius: 8,
    padding: 16,
  },
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
