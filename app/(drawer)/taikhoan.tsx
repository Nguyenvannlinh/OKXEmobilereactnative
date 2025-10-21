import Header from '@/app/(drawer)/Header';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';

const productsData = [
  { id: '1', partnerLabel: 'Đối tác', title: 'EVO200', year: '2024', price: '25.900.000 đ', location: '1 tháng trước - Tp. Hồ Chí Minh' },
  { id: '2', partnerLabel: 'Đối tác', title: 'Vinfast Dragonfly', year: '2024', price: '29.690.000 đ', location: '1 tháng trước - Tp. Hồ Chí Minh' },
  { id: '3', partnerLabel: 'Đối tác', title: 'EVO200', year: '2024', price: '25.900.000 đ', location: '1 tháng trước - Tp. Hồ Chí Minh' },
  // Thêm nhiều sản phẩm khác nếu cần
];

const HomeScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollContent: {
    paddingBottom: 70, // Đảm bảo cuộn không bị che bởi BottomNavBar
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start', // Bắt đầu từ bên trái
    paddingHorizontal: '1.6%', // Để tạo khoảng cách tổng thể
    paddingVertical: 10,
  },
  seeMoreButton: {
    backgroundColor: '#00B0FF', // Màu xanh dương
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'center', // Canh giữa
    marginTop: 10,
    marginBottom: 20,
  },
  seeMoreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backToTopButton: {
    position: 'absolute', // Đặt ở vị trí cố định
    bottom: 90, // Khoảng cách từ BottomNavBar
    right: 20,
    backgroundColor: '#00B0FF',
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backToTopText: {
    fontSize: 24,
    color: '#fff',
  }
});

export default HomeScreen;