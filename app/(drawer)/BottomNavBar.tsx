import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface BottomNavBarProps {
  activeTab: 'home' | 'store' | 'post' | 'blog' | 'profile';
  setActiveTab: React.Dispatch<
    React.SetStateAction<'home' | 'store' | 'post' | 'blog' | 'profile'>
  >;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { key: 'home', label: 'Trang chủ', icon: '🏠' },
    { key: 'store', label: 'Cửa hàng', icon: '🛍️' },
    { key: 'post', label: 'Đăng tin', icon: '➕' },
    { key: 'blog', label: 'Blog', icon: '📄' },
    { key: 'profile', label: 'Tài khoản', icon: '👤' },
  ];

  return (
    <View style={styles.navBar}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={styles.navItem}
          onPress={() => setActiveTab(tab.key as any)}
        >
          <Text style={{ fontSize: 24, color: activeTab === tab.key ? '#00B0FF' : '#888' }}>
            {tab.icon}
          </Text>
          <Text
            style={[
              styles.navText,
              { color: activeTab === tab.key ? '#00B0FF' : '#888' },
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 5 },
  navText: { fontSize: 10, marginTop: 2 },
});

export default BottomNavBar;
