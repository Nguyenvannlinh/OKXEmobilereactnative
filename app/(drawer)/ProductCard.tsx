import React from 'react';
import { Dimensions, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProductCardProps {
  id: string;
  title: string;
  year: string;
  price: string;
  location: string;
  images?: { image_url: string }[];
  main_image?: string;
  status?: string; // ✅ thêm để hiển thị "Đã bán"
  onPress?: () => void;
}

const screenWidth = Dimensions.get('window').width;

const ProductCard: React.FC<ProductCardProps> = ({
  title,
  year,
  price,
  location,
  images,
  main_image,
  status,
  onPress,
}) => {
  const BASE_URL =
    Platform.OS === 'web'
      ? 'http://localhost:5000'
      : 'http://192.168.1.12:5000';

  const imagePath = images?.[0]?.image_url || main_image || '';
  const getFullImageUrl = (path: string) => {
    if (!path) return 'https://via.placeholder.com/400x300?text=No+Image';
    if (path.startsWith('http')) return path;
    return `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  };

  const imageUrl = getFullImageUrl(imagePath);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
      disabled={status === 'sold'} // ✅ không bấm được nếu đã bán
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.productImage} resizeMode="cover" />

        {/* ✅ Hiển thị nhãn ĐÃ BÁN nếu status = 'sold' */}
        {status === 'sold' && (
          <View style={styles.soldOverlay}>
            <Text style={styles.soldText}>ĐÃ BÁN</Text>
          </View>
        )}
      </View>

      <View style={styles.partnerLabelContainer}>
        <Text style={styles.partnerLabel}>Đối tác</Text>
      </View>

      <View style={styles.textContainer}>
        <Text numberOfLines={1} style={styles.title}>{title}</Text>
        <Text style={styles.year}>Mới {year}</Text>
        <Text style={styles.price}>
          {price ? `${Number(price).toLocaleString()} đ` : 'Liên hệ'}
        </Text>
        <Text numberOfLines={1} style={styles.location}>{location}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width:
      Platform.OS === 'web'
        ? screenWidth > 1400
          ? '18%'
          : screenWidth > 1000
          ? '22%'
          : '28%'
        : '47%',
    marginHorizontal: Platform.OS === 'web' ? '1%' : '1.5%',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: Platform.OS === 'web' ? 180 : 150,
    backgroundColor: '#000',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  soldOverlay: {
    // ✅ thêm lớp phủ "Đã bán"
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  soldText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  partnerLabelContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#00B0FF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    zIndex: 4,
  },
  partnerLabel: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  textContainer: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  year: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  price: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#E44D26',
    marginTop: 6,
  },
  location: {
    fontSize: 11,
    color: '#aaa',
    marginTop: 2,
  },
});

export default ProductCard;
