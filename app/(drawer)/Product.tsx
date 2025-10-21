import Header from "@/app/(drawer)/Header";
import ProductCard from "@/app/(drawer)/ProductCard";
import { RootStackParamList } from "@/app/(Types)/navigation";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

type ProductNavProp = StackNavigationProp<RootStackParamList, "Product">;

interface ProductType {
  listing_id: string;
  title: string;
  year_of_manufacture: number;
  price: string;
  province_city: string;
  images?: { image_url: string }[];
  main_image?: string;
  body_type?: string;
}

const categories = [
  { id: "all", name: "Tất cả" },
  { id: "car", name: "Ô tô" },
  { id: "motorbike", name: "Xe máy" },
  { id: "electric-car", name: "Xe điện" },
  { id: "electric-motorbike", name: "Xe máy điện" },
];

const BASE_URL =
  Platform.OS === "web"
    ? "http://localhost:5000"
    : "http://192.168.1.12:5000";

const Product: React.FC = () => {
  const navigation = useNavigation<ProductNavProp>();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/api/listings`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Lỗi tải sản phẩm:", err);
        setLoading(false);
      });
  }, []);

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.body_type === selectedCategory);

  // 📱 Mobile layout (2 cột)
  const renderMobileLayout = () => (
    <FlatList
      data={filteredProducts}
      keyExtractor={(item) => item.listing_id.toString()}
      numColumns={2}
      columnWrapperStyle={{ justifyContent: "space-between" }}
      contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <ProductCard
          id={item.listing_id.toString()}
          title={item.title}
          year={item.year_of_manufacture.toString()}
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

  // 💻 Web layout (5 cột)
  const renderWebLayout = () => (
    <FlatList
      data={filteredProducts}
      keyExtractor={(item) => item.listing_id.toString()}
      numColumns={5}
      columnWrapperStyle={{ justifyContent: "flex-start", gap: 16 }}
      contentContainerStyle={{
        paddingHorizontal: 24,
        paddingBottom: 30,
        justifyContent: "center",
        gap: 16,
      }}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <ProductCard
          id={item.listing_id.toString()}
          title={item.title}
          year={item.year_of_manufacture.toString()}
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

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <Text style={styles.header}>Danh sách xe</Text>

      <View style={styles.categoryContainer}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryButton,
              selectedCategory === cat.id && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === cat.id && styles.categoryTextActive,
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <Text style={{ textAlign: "center", marginTop: 20 }}>
          Đang tải dữ liệu...
        </Text>
      ) : Platform.OS === "web" ? (
        renderWebLayout()
      ) : (
        renderMobileLayout()
      )}
    </SafeAreaView>
  );
};

export default Product;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 16,
    color: "#333",
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 10,
  },
  categoryButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 4,
    marginVertical: 4,
  },
  categoryButtonActive: { backgroundColor: "#00B0FF" },
  categoryText: { color: "#333", fontSize: 14 },
  categoryTextActive: { color: "#fff", fontWeight: "bold" },
});
