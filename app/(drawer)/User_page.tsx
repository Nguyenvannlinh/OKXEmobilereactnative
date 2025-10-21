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

export default function UserPage() {
  const API_URL = 'http://localhost:5000/api/users';

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  const [form, setForm] = useState({
    username: '',
    email: '',
    phone_number: '',
    password_hash: '',
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const data = await res.json();
      setUsers(data);
    } catch {
      Alert.alert('Lỗi', 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openModal = (user?: any) => {
    if (user) {
      setEditingUser(user);
      setForm({
        username: user.username,
        email: user.email,
        phone_number: user.phone_number,
        password_hash: '',
      });
    } else {
      setEditingUser(null);
      setForm({ username: '', email: '', phone_number: '', password_hash: '' });
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    const method = editingUser ? 'PUT' : 'POST';
    const url = editingUser ? `${API_URL}/${editingUser.user_id}` : API_URL;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      Alert.alert('✅ Thành công', editingUser ? 'Đã cập nhật người dùng' : 'Đã thêm người dùng');
      setModalVisible(false);
      fetchUsers();
    } catch {
      Alert.alert('❌ Lỗi', 'Không thể lưu thông tin người dùng');
    }
  };

  const handleDelete = async (id: number) => {
    if (Platform.OS === 'web') {
      if (!window.confirm('Xóa người dùng này?')) return;
    } else {
      const confirmed = await new Promise<boolean>((resolve) => {
        Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa người dùng này?', [
          { text: 'Hủy', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Xóa', onPress: () => resolve(true) },
        ]);
      });
      if (!confirmed) return;
    }

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      fetchUsers();
    } catch {
      Alert.alert('❌ Lỗi', 'Không thể xóa người dùng');
    }
  };

  const handleVerify = async (user: any) => {
    try {
      const updated = { ...user, is_verified: true };
      const res = await fetch(`${API_URL}/${user.user_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error();
      fetchUsers();
    } catch {
      Alert.alert('❌ Lỗi', 'Không thể xác minh người dùng');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>👤 Quản lý Người dùng</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => openModal()}>
          <Text style={styles.addBtnText}>+ Thêm</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#00C6CF" style={{ marginTop: 20 }} />
      ) : (
        users.map((u) => (
          <View key={u.user_id} style={styles.card}>
            <Text style={styles.userName}>{u.username}</Text>
            <Text style={styles.info}>📧 {u.email}</Text>
            <Text style={styles.info}>📞 {u.phone_number}</Text>
            <Text
              style={[
                styles.status,
                { color: u.is_verified ? '#28a745' : '#d9534f' },
              ]}
            >
              {u.is_verified ? '✔️ Đã xác minh' : '❌ Chưa xác minh'}
            </Text>

            <View style={styles.actionRow}>
              {!u.is_verified && (
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: '#28a745' }]}
                  onPress={() => handleVerify(u)}
                >
                  <Text style={styles.btnText}>Verify</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: '#00C6CF' }]}
                onPress={() => openModal(u)}
              >
                <Text style={styles.btnText}>Sửa</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: '#dc3545' }]}
                onPress={() => handleDelete(u.user_id)}
              >
                <Text style={styles.btnText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      {/* Modal thêm/sửa */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingUser ? 'Sửa người dùng' : 'Thêm người dùng'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Tên đăng nhập"
              value={form.username}
              onChangeText={(t) => setForm({ ...form, username: t })}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={form.email}
              onChangeText={(t) => setForm({ ...form, email: t })}
            />
            <TextInput
              style={styles.input}
              placeholder="Số điện thoại"
              value={form.phone_number}
              onChangeText={(t) => setForm({ ...form, phone_number: t })}
            />
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu"
              secureTextEntry
              value={form.password_hash}
              onChangeText={(t) => setForm({ ...form, password_hash: t })}
            />

            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#ccc' }]}
                onPress={() => setModalVisible(false)}
              >
                <Text>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#00C6CF' }]}
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

/* --- Giao diện rõ ràng, dễ đọc --- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700', color: '#333' },
  addBtn: { backgroundColor: '#00C6CF', padding: 8, borderRadius: 6 },
  addBtnText: { color: '#fff', fontWeight: '600' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userName: { fontSize: 18, fontWeight: '600', marginBottom: 6 },
  info: { color: '#555', marginBottom: 3 },
  status: { marginTop: 4, fontWeight: '600' },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, gap: 8 },
  btn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  btnText: { color: '#fff', fontWeight: '600' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: { backgroundColor: '#fff', borderRadius: 8, padding: 16, width: '90%' },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  modalBtns: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalBtn: { padding: 10, borderRadius: 6, minWidth: 80, alignItems: 'center' },
});
