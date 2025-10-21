import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DashboardPage from './DashboardPage';
import ImagePage from './Imagepage';
import MessagePage from './Messagepage';
import ModelPage from './Modelpage';
import OrderManagementPage from './OrderManagementPage';
import ProvincePage from './Provincepage';
import TransmissionPage from './TransmissionPage';
import UserPage from './User_page';
import BodyTypePage from './bodytype_page';
import ListingPage from './listingpage';
import ManufacturerPage from './manufacturers';
import ReviewPage from './reviewpage';

const modules = [
  { key: 'dashboard', label: 'Tổng quan', icon: 'grid' },
  { key: 'Order', label: 'Đơn hàng', icon: 'cart' },
  { key: 'users', label: 'Người dùng', icon: 'person' },
  { key: 'body-types', label: 'Loại khung', icon: 'body' },
  { key: 'images', label: 'Hình ảnh', icon: 'image' },
  { key: 'listings', label: 'Tin đăng', icon: 'car-sport' },
  { key: 'manufacturers', label: 'Hãng xe', icon: 'business' },
  { key: 'models', label: 'Mẫu xe', icon: 'layers' },
  { key: 'transmissions', label: 'Hộp số', icon: 'swap-horizontal' },
  { key: 'provinces', label: 'Tỉnh/Thành', icon: 'location' },
  { key: 'reviews', label: 'Đánh giá', icon: 'star' },
  { key: 'messages', label: 'Tin nhắn', icon: 'chatbubble' },
];

export default function AdminDashboard() {
  const [active, setActive] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);

  const renderContent = () => {
    switch (active) {
      case 'dashboard': return <DashboardPage />;
      case 'Order' : return <OrderManagementPage/>;
      case 'users': return <UserPage />;
      case 'body-types': return <BodyTypePage />;
      case 'manufacturers': return <ManufacturerPage />;
      case 'models': return <ModelPage />;
      case 'transmissions': return <TransmissionPage />;
      case 'provinces': return <ProvincePage />;
      case 'reviews': return <ReviewPage />;
      case 'messages': return <MessagePage />;
      case 'listings': return <ListingPage />;
      case 'images': return <ImagePage />;
      default: return <Text>Chọn mục cần quản lý</Text>;
    }
  };

  return (
    <View style={styles.container}>
      {/* Nút menu thu gọn */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)}>
          <Ionicons name="menu" size={26} color="#00C6CF" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Bảng Quản Trị</Text>
      </View>

      {/* Sidebar */}
      {menuOpen && (
        <View style={styles.sidebar}>
          {modules.map((m) => (
            <TouchableOpacity
              key={m.key}
              style={[styles.menuItem, active === m.key && styles.menuItemActive]}
              onPress={() => { setActive(m.key); setMenuOpen(false); }}
            >
              <Ionicons name={m.icon as any} size={20} color="#fff" />
              <Text style={styles.menuText}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Nội dung */}
      <ScrollView style={styles.main}>{renderContent()}</ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    elevation: 3,
  },
  topTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  sidebar: {
    position: 'absolute',
    top: 50,
    left: 0,
    width: 220,
    backgroundColor: '#2c3e50',
    paddingVertical: 15,
    zIndex: 999,
    height: '100%',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  menuItemActive: { backgroundColor: '#34495e' },
  menuText: { color: '#fff', marginLeft: 10 },
  main: { flex: 1, padding: 16 },
});
