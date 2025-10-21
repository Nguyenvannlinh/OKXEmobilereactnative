import { RootStackParamList } from '@/app/(Types)/navigation';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const screenWidth = Dimensions.get('window').width;

const isWeb = Platform.OS === 'web';
const LOCAL_IP = '172.20.10.7:8081';

const API_BASE = isWeb
  ? 'http://localhost:5000/api'
  : `http://${LOCAL_IP}:5000/api`;

const BASE_URL = isWeb
  ? 'http://localhost:5000'
  : `http://${LOCAL_IP}:5000`;

// Định nghĩa kiểu route và navigation
type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;
type ProductDetailNavProp = StackNavigationProp<RootStackParamList, 'ProductDetail'>;

const ProductDetail: React.FC = () => {
  const route = useRoute<ProductDetailRouteProp>();
  const navigation = useNavigation<ProductDetailNavProp>();
  const { product } = route.params;
  const [favorite, setFavorite] = useState(false);

  // ⭐ State đánh giá & bình luận
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(5);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${API_BASE}/reviews?listing_id=${product.listing_id}`);
      setReviews(res.data || []);
    } catch (err) {
      console.error('Lỗi tải đánh giá:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleAddReview = async () => {
    if (!newComment.trim()) return Alert.alert('Vui lòng nhập bình luận!');
    try {
      const res = await axios.post(`${API_BASE}/reviews`, {
        listing_id: product.listing_id,
        reviewer_id: 1,
        reviewed_user_id: product.user_id || 2,
        rating,
        comment: newComment,
      });
      setReviews([res.data, ...reviews]);
      setNewComment('');
      setRating(5);
      Alert.alert('✅ Gửi đánh giá thành công!');
    } catch (err) {
      console.error(err);
      Alert.alert('❌ Không thể gửi đánh giá');
    }
  };

  const contactSeller = () => {
    if (product?.phone_number) {
      Linking.openURL(`tel:${product.phone_number}`);
    } else {
      Alert.alert('Không có số điện thoại của người bán');
    }
  };

  const scheduleAppointment = () => {
    navigation.navigate('PaymentInfo', { product });
  };

  // ✅ Xử lý đường dẫn ảnh chuẩn web/mobile
  const getFullImageUrl = (path: string) => {
    if (!path) return 'https://via.placeholder.com/350x200?text=No+Image';
    if (path.startsWith('http')) return path;
    return `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-social" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* 🖼️ Ảnh sản phẩm */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.imageContainer}
        >
          {(product.images && product.images.length > 0
            ? product.images
            : [{ image_url: product.main_image }]
          ).map((img: { image_url: string }, index: number) => {
            const imageUrl = getFullImageUrl(img.image_url);
            return (
              <View key={index} style={styles.imageWrapper}>
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.mainImage}
                  resizeMode="cover"
                />
              </View>
            );
          })}
        </ScrollView>

        {/* Thông tin cơ bản */}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product?.title || 'Tên sản phẩm'}</Text>
          <Text style={styles.productPrice}>
            {product?.price ? `${Number(product.price).toLocaleString()} đ` : 'Liên hệ'}
          </Text>
          <View style={styles.productMeta}>
            <Text style={styles.metaText}>Mã: {product?.listing_id}</Text>
            <View style={styles.viewCount}>
              <Ionicons name="eye" size={14} color="#666" />
              <Text style={styles.metaText}> {product?.view_count || 0}</Text>
            </View>
          </View>
        </View>

        {/* Thông số */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông số cơ bản</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Hãng xe</Text>
              <Text style={styles.infoValue}>{product?.manufacturer_name || 'Đang cập nhật'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Năm sản xuất</Text>
              <Text style={styles.infoValue}>{product?.year_of_manufacture || 'Không rõ'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Loại xe</Text>
              <Text style={styles.infoValue}>{product?.body_type || 'Không rõ'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Khu vực</Text>
              <Text style={styles.infoValue}>{product?.province_city || 'Toàn quốc'}</Text>
            </View>
          </View>
        </View>

        {/* Mô tả */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả chi tiết</Text>
          <Text style={styles.descriptionText}>
            {product?.description || 'Không có mô tả chi tiết cho sản phẩm này.'}
          </Text>
        </View>

        {/* Người bán */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin người bán</Text>
          <View style={styles.sellerInfo}>
            <Image
              source={{
                uri: product?.partner_avatar || 'https://via.placeholder.com/60x60?text=User',
              }}
              style={styles.sellerAvatar}
            />
            <View>
              <Text style={styles.sellerName}>{product?.username || 'Đối tác OKXE'}</Text>
              <Text style={styles.sellerStat}>
                Số điện thoại: {product?.phone_number || 'Không có'}
              </Text>
            </View>
          </View>
        </View>

        {/* Cam kết */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cam kết từ cửa hàng</Text>
          <View style={styles.commitmentList}>
            {[
              'Xe chính hãng, rõ nguồn gốc',
              'Giá bán minh bạch, không phát sinh',
              'Hỗ trợ trả góp linh hoạt',
            ].map((text, idx) => (
              <View key={idx} style={styles.commitmentItem}>
                <Ionicons name="checkmark-circle" size={20} color="#00C6CF" />
                <Text style={styles.commitmentText}>{text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ⭐ Đánh giá & bình luận */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đánh giá & Bình luận</Text>

          {loadingReviews ? (
            <ActivityIndicator color="#00C6CF" />
          ) : reviews.length === 0 ? (
            <Text style={{ color: '#777' }}>Chưa có đánh giá nào.</Text>
          ) : (
            reviews.map((r) => (
              <View key={r.review_id} style={styles.reviewBox}>
                <Text style={styles.reviewer}>
                  ⭐ {r.rating} – {r.reviewer_name || 'Người dùng'}
                </Text>
                <Text style={styles.comment}>{r.comment}</Text>
                <Text style={styles.date}>{new Date(r.created_at).toLocaleDateString('vi-VN')}</Text>
              </View>
            ))
          )}

          {/* Form bình luận */}
          <View style={styles.commentBox}>
            <Text style={styles.commentLabel}>Đánh giá của bạn:</Text>
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <FontAwesome
                    name={star <= rating ? 'star' : 'star-o'}
                    size={24}
                    color="#FFD700"
                    style={{ marginRight: 4 }}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.input}
              placeholder="Viết bình luận của bạn..."
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleAddReview}>
              <Text style={styles.sendButtonText}>Gửi đánh giá</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Thanh dưới */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.favoriteButton} onPress={() => setFavorite(!favorite)}>
          <FontAwesome
            name={favorite ? 'heart' : 'heart-o'}
            size={24}
            color={favorite ? '#ff4444' : '#666'}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.contactButton} onPress={contactSeller}>
          <Text style={styles.contactButtonText}>Liên hệ ngay</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyButton} onPress={scheduleAppointment}>
          <Text style={styles.buyButtonText}>Mua ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProductDetail;

// --- STYLE ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00C6CF',
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: { padding: 4 },
  shareButton: { padding: 4 },
  content: { flex: 1, marginTop: 80, marginBottom: 70 },
  imageContainer: { height: 300, backgroundColor: '#fff' },
  imageWrapper: {
    width: screenWidth,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    maxWidth: 800,
  },
  productInfo: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  productName: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  productPrice: { fontSize: 20, fontWeight: 'bold', color: '#00C6CF', marginBottom: 8 },
  productMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaText: { color: '#666', fontSize: 14 },
  viewCount: { flexDirection: 'row', alignItems: 'center' },
  section: { backgroundColor: '#fff', padding: 16, marginTop: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  infoItem: { width: '48%', marginBottom: 16 },
  infoLabel: { fontSize: 14, color: '#666', marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: '500' },
  descriptionText: { fontSize: 15, lineHeight: 22, color: '#555' },
  sellerInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sellerAvatar: { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
  sellerName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  sellerStat: { fontSize: 14, color: '#666' },
  commitmentList: { marginTop: 8 },
  commitmentItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  commitmentText: { marginLeft: 8, fontSize: 14 },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  favoriteButton: { padding: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  contactButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#00C6CF',
    borderRadius: 6,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactButtonText: { color: '#00C6CF', fontWeight: 'bold' },
  buyButton: { flex: 1, backgroundColor: '#00C6CF', borderRadius: 6, padding: 12, justifyContent: 'center', alignItems: 'center' },
  buyButtonText: { color: '#fff', fontWeight: 'bold' },
  reviewBox: { backgroundColor: '#f9f9f9', borderRadius: 8, padding: 10, marginTop: 10 },
  reviewer: { fontWeight: 'bold', color: '#333' },
  comment: { color: '#444', marginTop: 4 },
  date: { fontSize: 12, color: '#999', marginTop: 2 },
  commentBox: { marginTop: 16 },
  commentLabel: { fontWeight: 'bold', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 10, minHeight: 60, textAlignVertical: 'top' },
  sendButton: { backgroundColor: '#00C6CF', padding: 10, borderRadius: 6, marginTop: 8 },
  sendButtonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
});
