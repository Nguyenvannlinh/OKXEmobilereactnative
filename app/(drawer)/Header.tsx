import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// Nếu dùng icon, có thể import từ một thư viện như 'react-native-vector-icons'
// import Icon from 'react-native-vector-icons/MaterialIcons';

const Header: React.FC = () => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.searchBar}>
        {/* <Icon name="search" size={20} color="#888" style={styles.searchIcon} /> */}
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm ngay trên OKXE 🛵"
          placeholderTextColor="#888"
        />
        <TouchableOpacity>
          <View >
             <Text style={styles.searchButtonText}>🔍</Text> {/* Placeholder icon */}
          </View>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.notificationIcon}>
        <View >
            <Text style={styles.notificationText}>🔔</Text> {/* Placeholder icon */}
          </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingTop: 40, // Để tránh tai thỏ (notch) trên iPhone
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    paddingHorizontal: 10,
    marginRight: 10,
    height: 45,
  },
  searchIcon: {
    marginRight: 5,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  searchButtonText: {
    fontSize: 20,
  },
  notificationIcon: {
    padding: 5,
  },
  notificationText: {
    fontSize: 24,
    color: '#00B0FF',
  }
});

export default Header;