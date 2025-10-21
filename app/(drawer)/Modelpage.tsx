import React, { useEffect, useState } from 'react';
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
} from 'react-native';

interface Model {
  model_id: number;
  manufacturer_id: number;
  name: string;
  year_introduced?: number | null;
}

export default function ModelPage() {
  const API_URL = 'http://localhost:5000/api/models';
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [sortType, setSortType] = useState<'id' | 'name'>('id');

  const [form, setForm] = useState({
    manufacturer_id: '',
    name: '',
    year_introduced: '',
  });

  // Lấy danh sách
  const fetchModels = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const data = await res.json();
      setModels(data);
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể tải danh sách mẫu xe');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  // Sắp xếp
  const sortModels = (type: 'id' | 'name') => {
    const sorted = [...models].sort((a, b) => {
      if (type === 'id') return a.model_id - b.model_id;
      return a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' });
    });
    setModels(sorted);
    setSortType(type);
  };

  // Mở modal
  const openModal = (model?: Model) => {
    if (model) {
      setEditingModel(model);
      setForm({
        manufacturer_id: String(model.manufacturer_id),
        name: model.name,
        year_introduced: model.year_introduced
          ? String(model.year_introduced)
          : '',
      });
    } else {
      setEditingModel(null);
      setForm({ manufacturer_id: '', name: '', year_introduced: '' });
    }
    setModalVisible(true);
  };

  // Lưu
  const handleSave = async () => {
    const method = editingModel ? 'PUT' : 'POST';
    const url = editingModel
      ? `${API_URL}/${editingModel.model_id}`
      : API_URL;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manufacturer_id: Number(form.manufacturer_id),
          name: form.name,
          year_introduced: form.year_introduced
            ? Number(form.year_introduced)
            : null,
        }),
      });

      if (!res.ok) throw new Error('Không thể lưu dữ liệu');

      Platform.OS === 'web'
        ? window.alert('✅ Lưu thành công')
        : Alert.alert('Thành công', 'Đã lưu mẫu xe');

      setModalVisible(false);
      fetchModels();
    } catch {
      Alert.alert('Lỗi', 'Không thể lưu mẫu xe');
    }
  };

  // Xóa
  const handleDelete = async (id: number) => {
    const confirmDelete = async () => {
      try {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error();
        Platform.OS === 'web'
          ? window.alert('✅ Đã xóa mẫu xe')
          : Alert.alert('Thành công', 'Đã xóa mẫu xe');
        fetchModels();
      } catch {
        Alert.alert('Lỗi', 'Không thể xóa mẫu xe');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Bạn có chắc muốn xóa mẫu xe này không?'))
        confirmDelete();
    } else {
      Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa mẫu xe này?', [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', onPress: confirmDelete },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>🚗 Quản lý Mẫu xe</Text>

      {/* Thanh công cụ */}
      <View style={styles.toolbar}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => openModal()}
        >
          <Text style={styles.addText}>+ Thêm</Text>
        </TouchableOpacity>

        <View style={styles.sortGroup}>
          <TouchableOpacity
            style={[styles.sortBtn, sortType === 'id' && styles.activeBtn]}
            onPress={() => sortModels('id')}
          >
            <Text
              style={[
                styles.sortText,
                sortType === 'id' && styles.activeText,
              ]}
            >
              Theo ID
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortBtn, sortType === 'name' && styles.activeBtn]}
            onPress={() => sortModels('name')}
          >
            <Text
              style={[
                styles.sortText,
                sortType === 'name' && styles.activeText,
              ]}
            >
              Theo Tên
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Danh sách */}
      {loading ? (
        <ActivityIndicator size="large" color="#00C6CF" />
      ) : (
        <FlatList
          data={models}
          keyExtractor={(item) => item.model_id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardLine}>🏢 Hãng: {item.manufacturer_id}</Text>
              <Text style={styles.cardLine}>📅 Năm: {item.year_introduced || '-'}</Text>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#e6f2ff' }]}
                  onPress={() => openModal(item)}
                >
                  <Text>Sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#ffe6e6' }]}
                  onPress={() => handleDelete(item.model_id)}
                >
                  <Text style={{ color: 'red' }}>Xóa</Text>
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
              {editingModel ? '✏️ Sửa mẫu xe' : '➕ Thêm mẫu xe'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="ID hãng"
              keyboardType="numeric"
              value={form.manufacturer_id}
              onChangeText={(t) => setForm({ ...form, manufacturer_id: t })}
            />
            <TextInput
              style={styles.input}
              placeholder="Tên mẫu xe"
              value={form.name}
              onChangeText={(t) => setForm({ ...form, name: t })}
            />
            <TextInput
              style={styles.input}
              placeholder="Năm ra mắt"
              keyboardType="numeric"
              value={form.year_introduced}
              onChangeText={(t) => setForm({ ...form, year_introduced: t })}
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
    </View>
  );
}

/* --- Styles --- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },

  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 10,
    gap: 10,
  },
  sortGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  sortBtn: {
    backgroundColor: '#ddd',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  sortText: { color: '#000' },
  activeBtn: { backgroundColor: '#00C6CF' },
  activeText: { color: '#fff' },
  addBtn: { backgroundColor: '#00C6CF', padding: 8, borderRadius: 6 },
  addText: { color: '#fff', fontWeight: 'bold' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  cardLine: { color: '#444' },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: { backgroundColor: '#fff', width: '90%', borderRadius: 10, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
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
