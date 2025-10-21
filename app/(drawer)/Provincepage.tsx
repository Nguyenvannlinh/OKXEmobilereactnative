import React, { useEffect, useState } from 'react';
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
} from 'react-native';

export default function ProvincePage() {
  const BASE_URL =
    Platform.OS === 'web'
      ? 'http://localhost:5000/api/provinces'
      : 'http://172.20.10.7:5000/api/provinces';

  const [provinces, setProvinces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [sortType, setSortType] = useState<'id' | 'name'>('id');
  const [form, setForm] = useState({ name: '' });

  // ✅ Lấy danh sách
  const fetchProvinces = async () => {
    try {
      setLoading(true);
      const res = await fetch(BASE_URL);
      const data = await res.json();
      setProvinces(data);
    } catch (err) {
      console.error('❌ Fetch error:', err);
      Alert.alert('Lỗi', 'Không thể tải danh sách tỉnh/thành phố');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProvinces();
  }, []);

  // ✅ Sắp xếp
  const sortProvinces = (type: 'id' | 'name') => {
    const sorted = [...provinces].sort((a, b) => {
      if (type === 'id') return a.province_id - b.province_id;
      return a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' });
    });
    setProvinces(sorted);
    setSortType(type);
  };

  // ✅ Mở modal thêm/sửa
  const openModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setForm({ name: item.name });
    } else {
      setEditingItem(null);
      setForm({ name: '' });
    }
    setModalVisible(true);
  };

  // ✅ Lưu dữ liệu (POST / PUT)
  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert('Cảnh báo', 'Vui lòng nhập tên tỉnh/thành');
      return;
    }

    const method = editingItem ? 'PUT' : 'POST';
    const url = editingItem
      ? `${BASE_URL}/${editingItem.province_id}`
      : BASE_URL;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Không thể lưu dữ liệu');

      Alert.alert(
        '✅ Thành công',
        editingItem ? 'Đã cập nhật tỉnh/thành' : 'Đã thêm tỉnh/thành'
      );

      setModalVisible(false);
      fetchProvinces();
    } catch (err) {
      console.error('❌ Save error:', err);
      Alert.alert('Lỗi', 'Không thể lưu tỉnh/thành');
    }
  };

  // ✅ Xóa tỉnh/thành (DELETE)
  const handleDelete = async (id: number) => {
    const confirmDelete = async () => {
      try {
        const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`Xóa thất bại: ${res.status}`);

        Alert.alert('✅ Thành công', 'Đã xóa tỉnh/thành');
        fetchProvinces();
      } catch (err) {
        console.error('❌ Delete error:', err);
        Alert.alert('Lỗi', 'Không thể xóa tỉnh/thành');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Bạn có chắc muốn xóa tỉnh/thành này không?'))
        confirmDelete();
    } else {
      Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa tỉnh/thành này?', [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', onPress: confirmDelete },
      ]);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* 🔹 Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Quản lý Tỉnh / Thành phố</Text>

        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.sortBtn, sortType === 'id' && styles.sortBtnActive]}
            onPress={() => sortProvinces('id')}
          >
            <Text style={styles.sortBtnText}>Sắp theo ID</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sortBtn, sortType === 'name' && styles.sortBtnActive]}
            onPress={() => sortProvinces('name')}
          >
            <Text style={styles.sortBtnText}>Sắp theo Tên</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.addBtn} onPress={() => openModal()}>
            <Text style={styles.addBtnText}>+ Thêm</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 🔹 Danh sách */}
      {loading ? (
        <ActivityIndicator size="large" color="#00C6CF" style={{ marginTop: 20 }} />
      ) : (
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { flex: 0.5 }]}>ID</Text>
            <Text style={[styles.headerCell, { flex: 2 }]}>Tên</Text>
            <Text style={[styles.headerCell, { flex: 1.2, textAlign: 'center' }]}>
              Thao tác
            </Text>
          </View>

          {provinces.map((p) => (
            <View key={p.province_id} style={styles.tableRow}>
              <Text style={[styles.cellText, { flex: 0.5 }]}>{p.province_id}</Text>
              <Text style={[styles.cellText, { flex: 2 }]}>{p.name}</Text>
              <View style={[styles.actionGroup, { flex: 1.2 }]}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#eee' }]}
                  onPress={() => openModal(p)}
                >
                  <Text>Sửa</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#ffe6e6' }]}
                  onPress={() => handleDelete(p.province_id)}
                >
                  <Text style={{ color: 'red' }}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* 🔹 Modal thêm/sửa */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingItem ? 'Sửa Tỉnh / Thành' : 'Thêm Tỉnh / Thành'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Tên tỉnh / thành phố"
              value={form.name}
              onChangeText={(t) => setForm({ ...form, name: t })}
            />

            <View style={styles.btnRow}>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: '#ccc' }]}
                onPress={() => setModalVisible(false)}
              >
                <Text>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, { backgroundColor: '#00C6CF' }]}
                onPress={handleSave}
              >
                <Text style={{ color: '#fff' }}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

/* --- Styles nhất quán web + mobile --- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  headerButtons: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },

  addBtn: { backgroundColor: '#00C6CF', padding: 8, borderRadius: 6 },
  addBtnText: { color: '#fff', fontWeight: 'bold' },
  sortBtn: { backgroundColor: '#ddd', padding: 8, borderRadius: 6 },
  sortBtnActive: { backgroundColor: '#00C6CF' },
  sortBtnText: { color: '#000' },

  table: { backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#00C6CF', padding: 8 },
  headerCell: { color: '#fff', fontWeight: 'bold' },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee',
    padding: 8,
  },
  cellText: { color: '#333' },

  actionGroup: { flexDirection: 'row', justifyContent: 'center' },
  actionBtn: {
    marginHorizontal: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 8,
    padding: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
  },
  btnRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  btn: { padding: 10, borderRadius: 6, minWidth: 80, alignItems: 'center' },
});
