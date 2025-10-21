import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function DashboardPage() {
  const stats = [
    { label: 'Tổng số người dùng', value: 1245, icon: 'person' },
    { label: 'Tổng số xe đăng bán', value: 342, icon: 'car-sport' },
    { label: 'Tổng số đơn hàng', value: 58, icon: 'receipt' },
    { label: 'Đánh giá mới hôm nay', value: 23, icon: 'star' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thống kê tổng quan</Text>
      <View style={styles.grid}>
        {stats.map((item, index) => (
          <View key={index} style={styles.card}>
            <Ionicons name={item.icon as any} size={32} color="#00B0FF" />
            <Text style={styles.value}>{item.value}</Text>
            <Text style={styles.label}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 3,
  },
  value: { fontSize: 20, fontWeight: 'bold', color: '#00B0FF', marginTop: 5 },
  label: { color: '#555', marginTop: 3, textAlign: 'center' },
});
