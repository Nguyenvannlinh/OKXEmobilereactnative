import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BlogPage from "@/app/(drawer)/Blog";
import BottomNavBar from "@/app/(drawer)/BottomNavBar";
import Header from "@/app/(drawer)/Header";
import PostPage from "@/app/(drawer)/Post";
import ProductPage from "@/app/(drawer)/Product";
import ProductCard from "@/app/(drawer)/ProductCard";
import ProfilePage from "@/app/(drawer)/Profile";
import PromotionBanner from "@/app/(drawer)/PromotionBanner";
import { RootStackParamList } from "@/app/(Types)/navigation";

type ProductNavProp = StackNavigationProp<RootStackParamList, "ProductDetail">;

const BASE_URL =
  Platform.OS === "web"
    ? "http://localhost:5000"
    : "http://192.168.1.12:5000";

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<ProductNavProp>();
  const [activeTab, setActiveTab] = useState<
    "home" | "store" | "post" | "blog" | "profile"
  >("home");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    fetch(`${BASE_URL}/api/listings`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Lỗi tải dữ liệu:", err);
        setLoading(false);
      });
  }, []);

  const handleSeeMore = () => setVisibleCount((prev) => prev + 3);

  const renderProducts = () => {
    if (loading)
      return (
        <ActivityIndicator
          size="large"
          color="#00B0FF"
          style={{ marginTop: 30 }}
        />
      );

    if (Platform.OS === "web") {
      return (
        <FlatList
          data={products.slice(0, visibleCount)}
          keyExtractor={(item) => item.listing_id.toString()}
          numColumns={5} // ✅ hiển thị 5 sản phẩm mỗi hàng
          columnWrapperStyle={{
            justifyContent: "flex-start",
            gap: 16, // ✅ khoảng cách đều nhau giữa các sản phẩm
            marginBottom: 12,
          }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 20,
            justifyContent: "center",
          }}
          renderItem={({ item }) => (
            <ProductCard
              id={String(item.listing_id)}
              title={item.title}
              year={String(item.year_of_manufacture || "")}
              price={item.price}
              location={item.province_city}
              images={item.images}
              main_image={item.main_image}
              onPress={() =>
                navigation.navigate("ProductDetail", { product: item })
              }
            />
          )}
        />
      );
    }

    // 📱 Mobile: vuốt ngang, 2 sản phẩm hiển thị cạnh nhau
    return (
      <FlatList
        data={products.slice(0, visibleCount)}
        keyExtractor={(item) => item.listing_id.toString()}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 12 }}
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }}
        renderItem={({ item }) => (
          <ProductCard
            id={String(item.listing_id)}
            title={item.title}
            year={String(item.year_of_manufacture || "")}
            price={item.price}
            location={item.province_city}
            images={item.images}
            main_image={item.main_image}
            onPress={() =>
              navigation.navigate("ProductDetail", { product: item })
            }
          />
        )}
      />
    )};

  const renderPage = () => {
    switch (activeTab) {
      case "home":
        return (
          <>
            <Header />
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <PromotionBanner />

              <Text style={styles.sectionTitle}>🚗 Sản phẩm nổi bật</Text>

              {renderProducts()}

              {visibleCount < products.length && (
                <TouchableOpacity
                  style={styles.seeMoreButton}
                  onPress={handleSeeMore}
                >
                  <Text style={styles.seeMoreButtonText}>Xem thêm</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </>
        );

      case "store":
        return <ProductPage />;
      case "post":
        return <PostPage />;
      case "blog":
        return <BlogPage />;
      case "profile":
        return <ProfilePage />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>{renderPage()}</View>
      <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8" },
  content: { flex: 1 },
  scrollContent: { paddingBottom: 70 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 12,
    marginBottom: 8,
    marginTop: 10,
  },
  productGrid: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  seeMoreButton: {
    backgroundColor: "#00B0FF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  seeMoreButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default HomeScreen;
