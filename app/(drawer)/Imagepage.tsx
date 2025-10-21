import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Image as RNImage,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ImagePage() {
  const API_URL = "http://localhost:5000/api/images";
  const BASE_URL = "http://localhost:5000";

  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const [form, setForm] = useState<{
    listing_id: string;
    image_url: string;
    is_primary: boolean;
    imageFile?: any;
  }>({
    listing_id: "",
    image_url: "",
    is_primary: false,
    imageFile: undefined,
  });

  const [selectedImage, setSelectedImage] = useState<any>(null);

  // ✅ Sửa hàm này — load ảnh từ /uploads
  const getFullImageUrl = (path: string) => {
    if (!path) return "https://via.placeholder.com/400x300?text=No+Image";

    // Nếu ảnh là URL đầy đủ
    if (path.startsWith("http")) return path;

    // Nếu ảnh nằm trong /uploads → nối đúng BASE_URL
    if (path.startsWith("/uploads")) return `${BASE_URL}${path}`;

    // Nếu DB chỉ lưu tên file → tự thêm /uploads/
    return `${BASE_URL}/uploads/${path}`;
  };

  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const data = await res.json();
      setImages(data.sort((a: any, b: any) => b.image_id - a.image_id));
    } catch (err) {
      Alert.alert("Lỗi", "Không thể tải danh sách ảnh");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const openModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setForm({
        listing_id: item.listing_id.toString(),
        image_url: item.image_url,
        is_primary: item.is_primary,
        imageFile: undefined,
      });
    } else {
      setEditingItem(null);
      setForm({
        listing_id: "",
        image_url: "",
        is_primary: false,
        imageFile: undefined,
      });
    }
    setSelectedImage(null);
    setModalVisible(true);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const picked = result.assets[0];
      setSelectedImage(picked);
      setForm({
        ...form,
        imageFile: {
          uri: picked.uri,
          name: picked.fileName || `photo_${Date.now()}.jpg`,
          type: picked.mimeType || "image/jpeg",
        },
        image_url: picked.uri,
      });
    }
  };

  // ✅ Lưu ảnh (thêm / sửa)
  const handleSave = async () => {
    try {
      const listingId = form.listing_id || (editingItem?.listing_id ?? "");

      const formData = new FormData();
      formData.append("listing_id", listingId);
      formData.append("is_primary", form.is_primary ? "1" : "0");

      if (form.imageFile) {
        formData.append("image", {
          uri: form.imageFile.uri,
          name: form.imageFile.name,
          type: form.imageFile.type,
        } as any);
      } else if (form.image_url) {
        formData.append("image_url", form.image_url);
      }

      const url = editingItem
        ? `${API_URL}/${editingItem.image_id}`
        : API_URL;

      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      Alert.alert("✅ Thành công", "Lưu ảnh thành công!");
      setModalVisible(false);
      fetchImages();
    } catch (error) {
      console.error("Lỗi lưu ảnh:", error);
      Alert.alert("❌ Lỗi", "Lưu ảnh thất bại");
    }
  };

  // ✅ Xóa ảnh (chỉ gọi API, không xóa file)
  const handleDeleteImage = async (image: any) => {
    if (Platform.OS === "web") {
      const confirmDelete = window.confirm(
        `🗑 Bạn có chắc muốn xóa ảnh #${image.image_id} không?`
      );
      if (!confirmDelete) return;

      try {
        await axios.delete(`${API_URL}/${image.image_id}`);
        alert("✅ Ảnh đã được xóa thành công.");
        fetchImages();
      } catch (error) {
        console.error("❌ Lỗi khi xóa ảnh:", error);
        alert("❌ Không thể xóa ảnh, vui lòng thử lại.");
      }
    } else {
      // 📱 Mobile
      Alert.alert(
        "Xác nhận xóa",
        `Bạn có chắc muốn xóa ảnh #${image.image_id} không?`,
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Xóa",
            style: "destructive",
            onPress: async () => {
              try {
                await axios.delete(`${API_URL}/${image.image_id}`);
                Alert.alert("✅ Thành công", "Ảnh đã được xóa.");
                fetchImages();
              } catch (error) {
                console.error("❌ Lỗi khi xóa ảnh:", error);
                Alert.alert("❌ Lỗi", "Không thể xóa ảnh, vui lòng thử lại.");
              }
            },
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Quản lý Ảnh</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => openModal()}>
          <Text style={styles.addBtnText}>+ Thêm ảnh</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#00C6CF" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {images.length === 0 ? (
            <Text style={{ textAlign: "center", color: "#666", marginTop: 20 }}>
              Chưa có ảnh nào
            </Text>
          ) : (
            images.map((img) => (
              <View key={img.image_id} style={styles.card}>
                <View style={styles.imageWrap}>
                  <RNImage
                    source={{ uri: getFullImageUrl(img.image_url) }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                  {img.is_primary && (
                    <View style={styles.primaryTag}>
                      <Text style={styles.primaryText}>⭐ Ảnh chính</Text>
                    </View>
                  )}
                </View>

                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>
                    ID: #{img.image_id} — Listing: {img.listing_id}
                  </Text>
                  <Text style={styles.cardUrl}>{img.image_url}</Text>

                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: "#eee" }]}
                      onPress={() => openModal(img)}
                    >
                      <Text>Sửa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: "#fdecea" }]}
                      onPress={() => handleDeleteImage(img)}
                    >
                      <Text style={{ color: "#f44336" }}>Xóa</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Modal thêm/sửa ảnh */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingItem ? "Sửa ảnh" : "Thêm ảnh mới"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Listing ID"
              keyboardType="numeric"
              value={form.listing_id}
              onChangeText={(t) => setForm({ ...form, listing_id: t })}
            />

            <TouchableOpacity
              style={[styles.btn, { backgroundColor: "#00C6CF", marginBottom: 10 }]}
              onPress={pickImage}
            >
              <Text style={{ color: "#fff" }}>📷 Chọn ảnh</Text>
            </TouchableOpacity>

            {selectedImage ? (
              <RNImage
                source={{ uri: selectedImage.uri }}
                style={{ width: "100%", height: 180, borderRadius: 8, marginBottom: 10 }}
              />
            ) : form.image_url ? (
              <RNImage
                source={{ uri: getFullImageUrl(form.image_url) }}
                style={{ width: "100%", height: 180, borderRadius: 8, marginBottom: 10 }}
              />
            ) : null}

            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
              <TouchableOpacity
                style={[styles.checkbox, form.is_primary && { backgroundColor: "#00C6CF" }]}
                onPress={() => setForm({ ...form, is_primary: !form.is_primary })}
              />
              <Text style={{ marginLeft: 8 }}>Ảnh chính (is_primary)</Text>
            </View>

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

/* --- Giữ nguyên style --- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9", padding: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "bold", color: "#222" },
  addBtn: { backgroundColor: "#00C6CF", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  addBtnText: { color: "#fff", fontWeight: "600" },
  list: { paddingBottom: 80 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  imageWrap: { position: "relative", width: "100%", height: 160, borderRadius: 8, overflow: "hidden" },
  image: { width: "100%", height: "100%" },
  primaryTag: { position: "absolute", bottom: 8, right: 8, backgroundColor: "#00C6CF", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  primaryText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  cardInfo: { marginTop: 8 },
  cardTitle: { fontSize: 15, fontWeight: "bold", color: "#333" },
  cardUrl: { color: "#666", fontSize: 13, marginTop: 2 },
  cardActions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 10 },
  actionBtn: { marginLeft: 8, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#fff", width: "90%", borderRadius: 10, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 6, padding: 8, marginBottom: 10 },
  btnRow: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  btn: { padding: 10, borderRadius: 6, minWidth: 80, alignItems: "center" },
  checkbox: { width: 22, height: 22, borderRadius: 4, borderWidth: 1, borderColor: "#888" },
});
