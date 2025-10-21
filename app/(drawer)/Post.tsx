import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const BASE_URL =
  Platform.OS === "web"
    ? "http://localhost:5000"
    : "http://192.168.1.12:5000";

const Post = () => {
  // --- State ---
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [odometer, setOdometer] = useState("");
  const [yearManufacture, setYearManufacture] = useState("");
  const [yearRegistration, setYearRegistration] = useState("");
  const [color, setColor] = useState("");
  const [province, setProvince] = useState("");
  const [numberOfSeats, setNumberOfSeats] = useState("");
  const [status, setStatus] = useState("pending");

  const [manufacturers, setManufacturers] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [bodyTypes, setBodyTypes] = useState<any[]>([]);
  const [fuelTypes, setFuelTypes] = useState<any[]>([]);
  const [transmissions, setTransmissions] = useState<any[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);

  const [selectedManufacturer, setSelectedManufacturer] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<number | null>(null);
  const [selectedBodyType, setSelectedBodyType] = useState<number | null>(null);
  const [selectedFuelType, setSelectedFuelType] = useState<number | null>(null);
  const [selectedTransmission, setSelectedTransmission] = useState<number | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<number[]>([]);

  const [image, setImage] = useState<string | null>(null);

  // --- Fetch dropdowns ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [manu, model, body, fuel, trans, feat, prov] = await Promise.all([
          axios.get(`${BASE_URL}/api/manufacturers`),
          axios.get(`${BASE_URL}/api/models`),
          axios.get(`${BASE_URL}/api/body-types`),
          axios.get(`${BASE_URL}/api/fuel-types`),
          axios.get(`${BASE_URL}/api/transmissions`),
          axios.get(`${BASE_URL}/api/features`),
          axios.get(`${BASE_URL}/api/provinces`),
        ]);
        setManufacturers(manu.data);
        setModels(model.data);
        setBodyTypes(body.data);
        setFuelTypes(fuel.data);
        setTransmissions(trans.data);
        setFeatures(feat.data);
        setProvinces(prov.data);
      } catch (e) {
        console.error("❌ Lỗi tải dữ liệu dropdown:", e);
      }
    };
    fetchData();
  }, []);

  // --- Pick Image ---
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Cần quyền truy cập ảnh để tiếp tục!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  // --- Toggle chọn nhiều tính năng ---
  const toggleFeature = (id: number) => {
    setSelectedFeatures((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  // --- Submit ---
  const handleSubmit = async () => {
    if (!title || !price || !selectedManufacturer || !selectedModel) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập đủ thông tin bắt buộc!");
      return;
    }

    try {
      // 1️⃣ Gửi dữ liệu bài đăng
      const listingData = {
        user_id: 1,
        title,
        description,
        price: Number(price),
        odometer: Number(odometer),
        manufacturer_id: Number(selectedManufacturer),
        model_id: Number(selectedModel),
        body_type_id: Number(selectedBodyType),
        fuel_type_id: Number(selectedFuelType),
        transmission_id: Number(selectedTransmission),
        year_of_manufacture: yearManufacture,
        year_of_registration: yearRegistration,
        province_city: province,
        color,
        number_of_seats: Number(numberOfSeats) || 5,
        status,
      };

      const res = await axios.post(`${BASE_URL}/api/listings`, listingData);
      const listingId = res.data?.listing_id;
      console.log("✅ Listing created:", res.data);

      // 2️⃣ Upload ảnh
      if (image && listingId) {
        const formData = new FormData();
        formData.append("listing_id", String(listingId));
        formData.append("is_primary", "true");

        if (Platform.OS === "web") {
          const blob = await fetch(image).then((r) => r.blob());
          const file = new File([blob], `listing_${listingId}.jpg`, {
            type: blob.type,
          });
          formData.append("image", file);
        } else {
          const ext = image.split(".").pop();
          formData.append("image", {
            uri: image,
            name: `listing_${listingId}.${ext}`,
            type: `image/${ext}`,
          } as any);
        }

        await axios.post(`${BASE_URL}/api/images/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // 3️⃣ Gán nhiều tính năng
      if (selectedFeatures.length > 0 && listingId) {
        await Promise.all(
          selectedFeatures.map((fid) =>
            axios.post(`${BASE_URL}/api/listing-features`, {
              listing_id: listingId,
              feature_id: fid,
            })
          )
        );
      }

      Alert.alert("✅ Thành công", "Đăng bài thành công!");
      resetForm();
    } catch (e: any) {
      console.error("❌ Lỗi đăng bài:", e.response?.data || e.message);
      Alert.alert("Lỗi", "Không thể đăng bài. Vui lòng thử lại.");
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPrice("");
    setOdometer("");
    setYearManufacture("");
    setYearRegistration("");
    setColor("");
    setProvince("");
    setNumberOfSeats("");
    setImage(null);
    setSelectedManufacturer(null);
    setSelectedModel(null);
    setSelectedBodyType(null);
    setSelectedFuelType(null);
    setSelectedTransmission(null);
    setSelectedFeatures([]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Đăng tin bán xe</Text>

      <TextInput style={styles.input} placeholder="Tiêu đề" value={title} onChangeText={setTitle} />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Mô tả chi tiết"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Giá bán (VNĐ)"
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
      />
      <TextInput
        style={styles.input}
        placeholder="Số km đã đi"
        keyboardType="numeric"
        value={odometer}
        onChangeText={setOdometer}
      />

      {/* Hãng xe */}
      <Text style={styles.label}>Hãng xe</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {manufacturers.map((v) => (
          <TouchableOpacity
            key={v.manufacturer_id}
            style={[
              styles.selectBtn,
              selectedManufacturer === v.manufacturer_id && styles.selectedBtn,
            ]}
            onPress={() => {
              setSelectedManufacturer(Number(v.manufacturer_id));
              setSelectedModel(null);
            }}
          >
            <Text
              style={[
                styles.selectText,
                selectedManufacturer === v.manufacturer_id && styles.selectedText,
              ]}
            >
              {v.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Dòng xe */}
      <Text style={styles.label}>Dòng xe</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {models
          .filter((m) => Number(m.manufacturer_id) === Number(selectedManufacturer))
          .map((v) => (
            <TouchableOpacity
              key={v.model_id}
              style={[
                styles.selectBtn,
                selectedModel === v.model_id && styles.selectedBtn,
              ]}
              onPress={() => setSelectedModel(Number(v.model_id))}
            >
              <Text
                style={[
                  styles.selectText,
                  selectedModel === v.model_id && styles.selectedText,
                ]}
              >
                {v.name}
              </Text>
            </TouchableOpacity>
          ))}
      </ScrollView>

      {/* Kiểu dáng */}
      <Text style={styles.label}>Kiểu dáng</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {bodyTypes.map((v) => (
          <TouchableOpacity
            key={v.body_type_id}
            style={[
              styles.selectBtn,
              selectedBodyType === v.body_type_id && styles.selectedBtn,
            ]}
            onPress={() => setSelectedBodyType(Number(v.body_type_id))}
          >
            <Text
              style={[
                styles.selectText,
                selectedBodyType === v.body_type_id && styles.selectedText,
              ]}
            >
              {v.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Nhiên liệu */}
      <Text style={styles.label}>Nhiên liệu</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {fuelTypes.map((v) => (
          <TouchableOpacity
            key={v.fuel_type_id}
            style={[
              styles.selectBtn,
              selectedFuelType === v.fuel_type_id && styles.selectedBtn,
            ]}
            onPress={() => setSelectedFuelType(Number(v.fuel_type_id))}
          >
            <Text
              style={[
                styles.selectText,
                selectedFuelType === v.fuel_type_id && styles.selectedText,
              ]}
            >
              {v.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Hộp số */}
      <Text style={styles.label}>Hộp số</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {transmissions.map((v) => (
          <TouchableOpacity
            key={v.transmission_id}
            style={[
              styles.selectBtn,
              selectedTransmission === v.transmission_id && styles.selectedBtn,
            ]}
            onPress={() => setSelectedTransmission(Number(v.transmission_id))}
          >
            <Text
              style={[
                styles.selectText,
                selectedTransmission === v.transmission_id && styles.selectedText,
              ]}
            >
              {v.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Chọn nhiều tính năng */}
      <Text style={styles.label}>Tính năng / Phụ kiện</Text>
      <View style={styles.featuresContainer}>
        {features.map((f) => (
          <TouchableOpacity
            key={f.feature_id}
            style={[
              styles.featureBtn,
              selectedFeatures.includes(f.feature_id) && styles.featureSelected,
            ]}
            onPress={() => toggleFeature(f.feature_id)}
          >
            <Text
              style={[
                styles.featureText,
                selectedFeatures.includes(f.feature_id) && styles.featureTextSelected,
              ]}
            >
              {f.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Thông tin thêm */}
      <TextInput style={styles.input} placeholder="Tỉnh/Thành phố" value={province} onChangeText={setProvince} />
      <TextInput style={styles.input} placeholder="Màu xe" value={color} onChangeText={setColor} />
      <TextInput style={styles.input} placeholder="Số ghế" keyboardType="numeric" value={numberOfSeats} onChangeText={setNumberOfSeats} />
      <TextInput style={styles.input} placeholder="Năm sản xuất" keyboardType="numeric" value={yearManufacture} onChangeText={setYearManufacture} />
      <TextInput style={styles.input} placeholder="Năm đăng ký" keyboardType="numeric" value={yearRegistration} onChangeText={setYearRegistration} />

      {/* Ảnh */}
      <Text style={styles.label}>Ảnh xe</Text>
      {image ? (
        <Image source={{ uri: image }} style={styles.image} />
      ) : (
        <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
          <Text style={styles.imagePickerText}>+ Chọn ảnh</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>Đăng bài</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Post;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f7", padding: 12 },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#333", marginBottom: 12 },
  label: { fontWeight: "600", color: "#444", marginTop: 10, marginBottom: 6 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
  },
  textArea: { height: 100, textAlignVertical: "top" },
  selectBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 8,
  },
  selectedBtn: { backgroundColor: "#00C6CF", borderColor: "#00C6CF" },
  selectText: { color: "#333" },
  selectedText: { color: "#fff", fontWeight: "600" },
  featuresContainer: { flexWrap: "wrap", flexDirection: "row", marginBottom: 8 },
  featureBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    margin: 4,
  },
  featureSelected: { backgroundColor: "#00C6CF", borderColor: "#00C6CF" },
  featureText: { color: "#333", fontSize: 13 },
  featureTextSelected: { color: "#fff", fontWeight: "600" },
  imagePicker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderStyle: "dashed",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  imagePickerText: { color: "#00C6CF", fontWeight: "600" },
  image: { width: "100%", height: 200, borderRadius: 10, marginBottom: 10 },
  submitBtn: {
    backgroundColor: "#00C6CF",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  submitText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
