import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

const PromotionBanner: React.FC = () => {
  return (
    <View style={styles.bannerContainer}>
      <Image
        source={require('@/uploads/954888piCgh6.jpg')} 
        style={styles.bannerContainer}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    width: '90%',
    aspectRatio: 16 / 9, // Tỷ lệ khung hình của banner
    marginHorizontal: '5%',
    marginVertical: 20,
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  bannerPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default PromotionBanner;