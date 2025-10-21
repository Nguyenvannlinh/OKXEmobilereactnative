import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const BASE_URL =
  Platform.OS === 'web'
    ? 'http://localhost:5000'
    : 'http://172.20.10.7:5000';

const PurchasedCarsScreen = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const tabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'pending', label: 'Đang chờ' },
    { id: 'processing', label: 'Đang giao' },
    { id: 'delivered', label: 'Đã giao' },
  ];

  const getUserId = async () => {
    try {
      if (Platform.OS === 'web') return localStorage.getItem('userId');
      return await AsyncStorage.getItem('userId');
    } catch (error) {
      console.log('Lỗi lấy userId:', error);
      return null;
    }
  };

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      const userId = await getUserId();
      if (!userId) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const res = await axios.get(`${BASE_URL}/api/orders/buyer/${userId}`);
      setOrders(res.data || []);
    } catch (error) {
      console.error('❌ Lỗi khi lấy đơn hàng:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (order: any) => {
    if (order.delivery_status === 'delivered') {
      const msg = '🚫 Đơn hàng đã giao không thể bị xóa.';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Không thể xóa', msg);
      return;
    }

    if (Platform.OS === 'web') {
      const confirmDelete = window.confirm(
        `Bạn có chắc muốn xóa đơn hàng "${order.listing_title}" không?`
      );
      if (!confirmDelete) return;
    }

    try {
      await axios.delete(`${BASE_URL}/api/orders/${order.order_id}`);
      Platform.OS === 'web'
        ? alert('✅ Đã xóa đơn hàng.')
        : Alert.alert('Thành công', 'Đơn hàng đã được xóa.');
      fetchUserOrders();
    } catch (error) {
      console.error('Lỗi khi xóa đơn hàng:', error);
      Platform.OS === 'web'
        ? alert('❌ Không thể xóa đơn hàng.')
        : Alert.alert('Lỗi', 'Không thể xóa đơn hàng.');
    }
  };

  const handlePayment = async (order: any) => {
    const total = Number(order.total_amount).toLocaleString('vi-VN');
    const confirmPayment = async () => {
      try {
        await axios.put(`${BASE_URL}/api/orders/${order.order_id}/pay`);
        Alert.alert('Thành công', 'Đã thanh toán đơn hàng!');
        fetchUserOrders();
      } catch (error) {
        console.error('Lỗi khi thanh toán:', error);
        Alert.alert('Lỗi', 'Không thể thanh toán đơn hàng.');
      }
    };

    if (Platform.OS === 'web') {
      const ok = window.confirm(
        `Bạn có muốn thanh toán ${total} đ cho đơn #${order.order_id}?`
      );
      if (ok) confirmPayment();
    } else {
      Alert.alert(
        'Thanh toán đơn hàng',
        `Bạn có muốn thanh toán ${total} đ cho đơn #${order.order_id} không?`,
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Thanh toán', onPress: confirmPayment },
        ]
      );
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Đang chờ xác nhận';
      case 'processing':
        return 'Đang giao hàng';
      case 'delivered':
        return 'Đã giao thành công';
      default:
        return 'Không xác định';
    }
  };

  const getFullImageUrl = (path?: string) => {
    if (!path) return 'https://via.placeholder.com/100';
    if (path.startsWith('http')) return path;
    return `${BASE_URL}${path.startsWith('/uploads') ? path : `/uploads/${path}`}`;
  };

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const filteredOrders = orders.filter((order) =>
    activeTab === 'all' ? true : order.delivery_status === activeTab
  );

  return (
    <View style={styles.container}>
      {/* 🔹 Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xe đã mua</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 🔹 Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text
              style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 🔹 Nội dung */}
      <ScrollView style={styles.scroll}>
        {loading && (
          <View style={styles.empty}>
            <Text>Đang tải dữ liệu...</Text>
          </View>
        )}

        {!loading && filteredOrders.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="car-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Không có đơn hàng nào.</Text>
          </View>
        )}

        {!loading && filteredOrders.length > 0 && (
          <View style={styles.orderList}>
            {filteredOrders.map((order) => (
              <View key={order.order_id} style={styles.card}>
                {/* Ảnh xe */}
                <Image
                  source={{ uri: getFullImageUrl(order.listing_image) }}
                  style={styles.image}
                />

                {/* Thông tin */}
                <View style={styles.info}>
                  <Text style={styles.title}>{order.listing_title}</Text>
                  <Text style={styles.text}>
                    <Text style={styles.label}>Mã đơn:</Text> #{order.order_id}
                  </Text>
                  <Text style={styles.text}>
                    <Text style={styles.label}>Ngày đặt:</Text>{' '}
                    {new Date(order.created_at).toLocaleString('vi-VN')}
                  </Text>
                  <Text style={styles.text}>
                    <Text style={styles.label}>Trạng thái:</Text>{' '}
                    {getStatusLabel(order.delivery_status)}
                  </Text>
                  <Text style={styles.text}>
                    <Text style={styles.label}>Thanh toán:</Text>{' '}
                    {order.payment_status === 'paid'
                      ? 'Đã thanh toán'
                      : 'Chưa thanh toán'}
                  </Text>
                  <Text
                    style={[
                      styles.text,
                      { marginTop: 4, fontSize: 15, fontWeight: 'bold' },
                    ]}
                  >
                    Tổng tiền: {Number(order.total_amount).toLocaleString('vi-VN')} đ
                  </Text>

                  {/* Nút Thanh toán */}
                  {order.payment_status === 'pending' && (
                    <TouchableOpacity
                      style={styles.payButton}
                      onPress={() => handlePayment(order)}
                    >
                      <Ionicons name="card-outline" size={18} color="#fff" />
                      <Text style={styles.payText}>Thanh toán</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Nút xoá */}
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteOrder(order)}
                >
                  <Ionicons name="trash-outline" size={22} color="#ff4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#00C6CF',
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  tabsContainer: { flexDirection: 'row', backgroundColor: '#fff' },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: { borderBottomColor: '#00C6CF' },
  tabText: { color: '#777', fontSize: 14 },
  activeTabText: { color: '#00C6CF', fontWeight: 'bold' },
  scroll: { flex: 1 },
  empty: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 10, color: '#777' },
  orderList: { backgroundColor: '#fff' },
  card: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    alignItems: 'flex-start',
  },
  image: { width: 100, height: 80, borderRadius: 8, marginRight: 10 },
  info: { flex: 1 },
  title: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  text: { fontSize: 13, color: '#555', marginVertical: 1 },
  label: { fontWeight: '600', color: '#333' },
  payButton: {
    marginTop: 8,
    backgroundColor: '#00C6CF',
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  payText: { color: '#fff', marginLeft: 6, fontWeight: '600' },
  deleteBtn: { padding: 6, alignSelf: 'center' },
});

export default PurchasedCarsScreen;
