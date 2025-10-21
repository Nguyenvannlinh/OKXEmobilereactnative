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
  View
} from 'react-native';

export default function BodyTypePage() {
  const API_URL =
    Platform.OS === 'web'
      ? 'http://localhost:5000/api/body-types'
      : 'http://172.20.10.7:5000/api/body-types';

  const [bodyTypes, setBodyTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });

  const fetchBodyTypes = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const data = await res.json();
      setBodyTypes(data);
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể tải danh sách kiểu thân xe');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBodyTypes();
  }, []);

  const openModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setForm({ name: item.name, description: item.description || '' });
    } else {
      setEditingItem(null);
      setForm({ name: '', description: '' });
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    const method = editingItem ? 'PUT' : 'POST';
    const url = editingItem ? `${API_URL}/${editingItem.body_type_id}` : API_URL;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Lỗi khi lưu');

      Alert.alert('Thành công', editingItem ? 'Đã cập nhật kiểu thân xe' : 'Đã thêm kiểu thân xe');
      setModalVisible(false);
      fetchBodyTypes();
    } catch {
      Alert.alert('Lỗi', 'Không thể lưu kiểu thân xe');
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa kiểu thân xe này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        onPress: async () => {
          try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error();
            Alert.alert('✅ Thành công', 'Đã xóa kiểu thân xe');
            fetchBodyTypes();
          } catch {
            Alert.alert('Lỗi', 'Không thể xóa kiểu thân xe');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Kiểu thân xe</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => openModal()}>
          <Text style={styles.addBtnText}>+ Thêm</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#00C6CF" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {bodyTypes.length === 0 ? (
            <Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>
              Chưa có dữ liệu
            </Text>
          ) : (
            bodyTypes.map((item) => (
              <View key={item.body_type_id} style={styles.card}>
                <Text style={styles.cardTitle}>
                  {item.name} <Text style={styles.idText}>#{item.body_type_id}</Text>
                </Text>
                <Text style={styles.cardDesc}>{item.description || 'Không có mô tả'}</Text>

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#eee' }]}
                    onPress={() => openModal(item)}
                  >
                    <Text>Sửa</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#ffe6e6' }]}
                    onPress={() => handleDelete(item.body_type_id)}
                  >
                    <Text style={{ color: 'red' }}>Xóa</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingItem ? 'Sửa kiểu thân xe' : 'Thêm kiểu thân xe'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Tên kiểu thân xe"
              value={form.name}
              onChangeText={(t) => setForm({ ...form, name: t })}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#222' },
  addBtn: { backgroundColor: '#00C6CF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  addBtnText: { color: '#fff', fontWeight: '600' },

  list: { paddingBottom: 80 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  idText: { color: '#999', fontSize: 13 },
  cardDesc: { marginTop: 4, color: '#555', fontSize: 14 },

  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  actionBtn: {
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
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
    borderRadius: 10,
    padding: 16,
  },
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
