import { RootStackParamList } from '@/app/(Types)/navigation';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
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

// ✅ BASE_URL dùng chung cho cả ảnh & API
const BASE_URL =
  Platform.OS === "web"
    ? "http://localhost:5000"
    : "http://192.168.1.12:5000";

type PaymentInfoRouteProp = RouteProp<RootStackParamList, 'PaymentInfo'>;

export default function PaymentInfoPage() {
  const navigation = useNavigation();
  const route = useRoute<PaymentInfoRouteProp>();
  const { product } = route.params;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  // ✅ Hàm xử lý đường dẫn ảnh (tự thêm BASE_URL nếu thiếu)
  const getFullImageUrl = (path?: string) => {
    if (!path) return "https://via.placeholder.com/350x200?text=No+Image";
    if (path.startsWith("http")) return path;
    return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  };

  // ✅ Lấy userId từ AsyncStorage hoặc localStorage
  useEffect(() => {
    const loadUserId = async () => {
      try {
        let id: string | null = null;
        if (Platform.OS === 'web') {
          id = localStorage.getItem('userId');
        } else {
          id = await AsyncStorage.getItem('userId');
        }
        if (id) setUserId(Number(id));
      } catch (error) {
        console.error('❌ Lỗi khi lấy userId:', error);
      }
    };
    loadUserId();
  }, []);

  // 🔹 Lấy thông tin người dùng
  useEffect(() => {
    if (!userId) return;
    const fetchUserData = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/users/${userId}`);
        if (!res.ok) throw new Error("Không thể tải thông tin người dùng");
        const data = await res.json();
        setUser(data);
      } catch (error) {
        console.error("❌ Lỗi tải user:", error);
        Alert.alert("Lỗi", "Không thể tải thông tin người dùng!");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [userId]);

  // 🔹 Xử lý thanh toán
  const handlePayment = async () => {
    try {
      const showAlert = (title: string, message: string) => {
        if (Platform.OS === 'web') {
          window.alert(`${title}\n\n${message}`);
        } else {
          Alert.alert(title, message);
        }
      };

      showAlert("Đang xử lý", "Hệ thống đang tạo đơn hàng, vui lòng chờ...");

      const response = await fetch(`${BASE_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id: product.listing_id,
          buyer_id: userId,
          total_amount: product.price,
          payment_status: "pending",
          delivery_status: "pending",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Server error:", errorText);
        showAlert("Lỗi", "Không thể tạo đơn hàng! Vui lòng thử lại.");
        return;
      }

      const result = await response.json();
      console.log("✅ Đơn hàng tạo thành công:", result);

      showAlert(
        "🎉 Thành công!",
        `Đơn hàng #${result.order_id || "mới"} đã được khởi tạo thành công.`
      );

    } catch (error) {
      console.error("Lỗi tạo đơn hàng:", error);
      if (Platform.OS === 'web') {
        window.alert("❌ Lỗi\nKhông thể kết nối đến máy chủ!");
      } else {
        Alert.alert("❌ Lỗi", "Không thể kết nối đến máy chủ!");
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin thanh toán</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Cảnh báo */}
        <View style={styles.alertBox}>
          <Ionicons name="warning-outline" size={18} color="#f57c00" style={{ marginRight: 8 }} />
          <Text style={styles.alertText}>
            Để đảm bảo việc giao nhận xe, người mua cần đến trực tiếp cửa hàng để kiểm tra và nhận xe.
          </Text>
        </View>

        {/* Thông tin đơn hàng */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>

          <View style={styles.productCard}>
            <Image
              source={{
                uri: getFullImageUrl(product?.main_image || product?.image || ""),
              }}
              style={styles.productImage}
            />

            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product?.title || 'Tên sản phẩm'}</Text>
              <Text style={styles.infoText}>Loại xe: {product?.body_type || 'Đang cập nhật'}</Text>
              <Text style={styles.infoText}>Năm: {product?.year_of_manufacture || 'Không rõ'}</Text>
              <Text style={styles.infoText}>Động cơ: {product?.engine || 'Không rõ'}</Text>
              <View style={styles.colorRow}>
                <Text style={styles.infoText}>Màu:</Text>
                <View
                  style={[
                    styles.colorDot,
                    { backgroundColor: product?.color?.toLowerCase() || 'gray' },
                  ]}
                />
              </View>
            </View>

            <View style={styles.productIdBox}>
              <Text style={styles.productId}>ID {product?.listing_id || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.priceBox}>
            <Text style={styles.priceLabel}>Giá sản phẩm</Text>
            <Text style={styles.price}>
              {product?.price
                ? `${Number(product.price).toLocaleString('vi-VN')} đ`
                : 'Liên hệ'}
            </Text>
          </View>
        </View>

        {/* Thông tin người mua */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin người mua</Text>

          <View style={styles.buyerCard}>
            <View style={styles.buyerRow}>
              <Image
                source={{
                  uri: getFullImageUrl(user?.avatar),
                }}
                style={styles.avatar}
              />
              <View>
                <Text style={styles.phone}>{user?.username || 'Khách hàng'}</Text>
                <Text style={styles.infoText}>SĐT: {user?.phone_number || 'Chưa có'}</Text>
                <View style={styles.addressRow}>
                  <Ionicons name="location-outline" size={16} color="#00B0FF" />
                  <Text style={styles.address}>{user?.address || 'Chưa cập nhật địa chỉ'}</Text>
                </View>
              </View>
            </View>

            <View style={styles.verifyBox}>
              <Text style={styles.verifyText}>
                Vui lòng định danh tài khoản để hoàn tất thủ tục mua bán xe
              </Text>
              <TouchableOpacity style={styles.verifyButton}>
                <Text style={styles.verifyButtonText}>Định danh</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Nút tiếp tục */}
      <TouchableOpacity style={styles.continueButton} onPress={handlePayment}>
        <Text style={styles.continueText}>Tiếp tục</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  scroll: { padding: 15 },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff4e5',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  alertText: { color: '#f57c00', flex: 1, fontSize: 13 },
  section: { backgroundColor: '#fafafa', borderRadius: 8, padding: 10, marginBottom: 20 },
  sectionTitle: { fontWeight: 'bold', color: '#444', marginBottom: 10 },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    elevation: 2,
    marginBottom: 10,
  },
  productImage: { width: 80, height: 60, borderRadius: 6 },
  productInfo: { flex: 1, marginLeft: 10 },
  productName: { fontWeight: 'bold', marginBottom: 4 },
  infoText: { fontSize: 13, color: '#555' },
  colorRow: { flexDirection: 'row', alignItems: 'center' },
  colorDot: { width: 10, height: 10, borderRadius: 5, marginLeft: 5 },
  productIdBox: { position: 'absolute', top: 8, right: 10 },
  productId: { fontSize: 11, color: '#777' },
  priceBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    marginTop: 5,
  },
  priceLabel: { color: '#777', fontSize: 13 },
  price: { fontWeight: 'bold', color: '#000' },
  buyerCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    elevation: 2,
  },
  buyerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ddd',
    marginRight: 10,
  },
  phone: { fontWeight: 'bold', color: '#333' },
  addressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  address: { color: '#555', fontSize: 12, marginLeft: 4 },
  verifyBox: {
    backgroundColor: '#e0f7fa',
    borderRadius: 10,
    padding: 10,
    marginTop: 5,
  },
  verifyText: { color: '#00796b', fontSize: 13, marginBottom: 8 },
  verifyButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#00B0FF',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  verifyButtonText: { color: '#fff', fontWeight: 'bold' },
  continueButton: {
    backgroundColor: '#00B0FF',
    padding: 15,
    alignItems: 'center',
  },
  continueText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
