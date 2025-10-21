import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { JSX } from 'react/jsx-runtime';

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const navigation = useNavigation();

  const BASE_URL =
    Platform.OS === 'web'
      ? 'http://localhost:5000'
      : 'http://172.20.10.7:5000';

  const getUserId = async () => {
    try {
      let userId: string | null = null;
      if (Platform.OS === 'web') {
        userId = localStorage.getItem('userId');
      } else {
        userId = await AsyncStorage.getItem('userId');
      }

      if (userId) {
        setTimeout(() => fetchUserData(userId!), 200);
      }
    } catch (error) {
      console.log('❌ Lỗi khi lấy userId:', error);
    }
  };

  const fetchUserData = async (id: string) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/users/${id}`);
      setUser(res.data);
    } catch (error) {
      console.log('❌ Lỗi khi lấy thông tin người dùng:', error);
    }
  };

  useEffect(() => {
    getUserId();
  }, []);

  const renderSectionTitle = (title: string) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  );

  // ✅ Component item menu
  const renderMenuItem = (
    icon: JSX.Element,
    label: string,
    badge?: string,
    onPress?: () => void
  ) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuLeft}>
        {icon}
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 🔹 Header */}
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatarCircle}>
            {user?.avatar_url ? (
              <Image
                source={{ uri: user.avatar_url }}
                style={{ width: 55, height: 55, borderRadius: 30 }}
              />
            ) : (
              <Ionicons name="person-outline" size={40} color="#00B0FF" />
            )}
          </View>
          <View>
            <Text style={styles.loginText}>
              {user ? user.name : 'Đăng nhập'}
            </Text>
            {user && (
              <Text style={{ color: '#fff', fontSize: 12 }}>
                {user.email}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.headerIcons}>
          <Ionicons name="settings-outline" size={24} color="#fff" style={styles.iconRight} />
          <Ionicons name="notifications-outline" size={24} color="#fff" />
        </View>
      </View>

      {/* 🔹 Danh mục */}
      <ScrollView style={styles.scroll}>
        {renderSectionTitle('QUẢN LÝ MUA BÁN XE')}
        {renderMenuItem(
          <Entypo name="shop" size={20} color="#00B0FF" />,
          'Gian hàng của tôi',
          undefined,
          () => navigation.navigate('Mystore' as never)
        )}
        {renderMenuItem(
          <MaterialIcons name="shopping-cart" size={20} color="#00B0FF" />,
          'Xe đã mua',
          undefined,
          () => navigation.navigate('Purchased' as never)
        )}

        {renderMenuItem(<Ionicons name="megaphone-outline" size={20} color="#00B0FF" />, 'Tài khoản quảng cáo', 'MỚI')}
        {renderMenuItem(<Ionicons name="calendar-outline" size={20} color="#00B0FF" />, 'Quản lý lịch hẹn')}
        {renderMenuItem(<Ionicons name="heart-outline" size={20} color="#00B0FF" />, 'Cửa hàng yêu thích')}
        {renderMenuItem(<Ionicons name="heart-half-outline" size={20} color="#00B0FF" />, 'Sản phẩm yêu thích')}

        {renderSectionTitle('HOẠT ĐỘNG CÁ NHÂN')}
        {renderMenuItem(<Ionicons name="documents-outline" size={20} color="#00B0FF" />, 'Quản lý dịch vụ')}
        {renderMenuItem(<Ionicons name="time-outline" size={20} color="#00B0FF" />, 'Đã xem gần đây')}
        {renderMenuItem(<Ionicons name="chatbubble-ellipses-outline" size={20} color="#00B0FF" />, 'Nhận xét tôi đã viết')}

        {renderSectionTitle('THÔNG TIN HỖ TRỢ')}
        {renderMenuItem(<Ionicons name="gift-outline" size={20} color="#00B0FF" />, 'Sự kiện/ Khuyến mãi')}
        {renderMenuItem(<Ionicons name="help-circle-outline" size={20} color="#00B0FF" />, 'Trung tâm trợ giúp')}
        {renderMenuItem(<Ionicons name="share-social-outline" size={20} color="#00B0FF" />, 'Chia sẻ phản hồi')}
        {renderMenuItem(<Ionicons name="information-circle-outline" size={20} color="#00B0FF" />, 'Phiên bản')}
      </ScrollView>
    </View>
  );
};

/* --- Styles --- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#00B0FF',
    height: 120,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 30,
  },
  profileInfo: { flexDirection: 'row', alignItems: 'center' },
  avatarCircle: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  loginText: { fontSize: 16, color: '#fff', fontWeight: 'bold' },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  iconRight: { marginRight: 16 },
  scroll: { paddingHorizontal: 16, paddingVertical: 10 },
  sectionTitle: {
    marginTop: 15,
    marginBottom: 8,
    color: '#999',
    fontWeight: 'bold',
    fontSize: 13,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomColor: '#f0f0f0',
    borderBottomWidth: 1,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuLabel: { fontSize: 15, marginLeft: 10, color: '#333' },
  badge: {
    backgroundColor: '#FFD600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  badgeText: { fontSize: 10, color: '#000', fontWeight: 'bold' },
});

export default ProfilePage;
