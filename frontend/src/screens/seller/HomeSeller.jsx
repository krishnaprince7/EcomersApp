import {
  View, Text, Image, TextInput, TouchableOpacity, ScrollView,
  ToastAndroid, ActivityIndicator, FlatList, Platform, Alert
} from 'react-native';
import React, { useState, useCallback } from 'react';
import AntDesign from '@expo/vector-icons/AntDesign';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from "expo-image-picker";
import { Feather } from '@expo/vector-icons';
import FooterSeller from './FooterSeller';
import { useQuery } from '@tanstack/react-query';
import Loader from '../Loader/Loader';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useFocusEffect, useNavigation } from '@react-navigation/native';



// const BASE_URL = "http://192.168.1.18:8080/api";
// const BASE_IMAGE_URL = "http://192.168.1.18:8080/uploads/"; 
// const BASE_URL = "http://192.168.43.3:8080/api";
// const BASE_IMAGE_URL = "http://192.168.43.3:8080/uploads/"; 

const BASE_URL = "http://192.168.1.4:8080/api";
const BASE_IMAGE_URL = "http://192.168.1.4:8080/uploads/";


export const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


const HomeSeller = () => {
  const [selectedTab, setSelectedTab] = useState("post");

  const [popupProductId, setPopupProductId] = useState(null)


  // Product form state
  const [products, setProducts] = useState({
    image: null,
    productName: "",
    price: "",
    discription: "",
  });
  const [errorData, setErrorData] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (name, value) => {
    setProducts((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Image picker
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      
      quality: 1,
    });
    if (!result.canceled) {
      setProducts((prev) => ({
        ...prev,
        image: result.assets[0],
      }));
    }
  };


  const showToast = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('', message);
    }
  };

  // Submit new product
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setErrorData({});
      const formData = new FormData();

      if (products.image) {
        formData.append("image", {
          uri: products.image.uri,
          name: `product_${Date.now()}.png`,
          type: "image/png",
        });
      }

      formData.append("productName", products.productName.trim());
      formData.append("price", products.price.trim());
      formData.append("discription", products.discription.trim());

      await api.post("/addProduct", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await refetch();


      showToast("Product Added Successfully!");

      setProducts({
        image: null,
        productName: "",
        price: "",
        discription: "",
      });
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrorData(error.response.data.errors);
      } else {
        showToast("Something went wrong!");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch all products
  const getProduct = async () => {
    const res = await api.get("/getAllProduct");
    return res.data.data;
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: getProduct,
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );
  const navigate = useNavigation()


  //  Delete Product

  const handelDelete = async (product_id) => {
    try {
      const res = await api.delete("/deleteProduct", {
        data: { product_id: product_id.toString() }
      });
      showToast("Product deleted successfully!");
      refetch();
    } catch (error) {
      console.log("Delete error:", error);
      showToast(error.response?.data?.message || "Failed to delete!");

    }
  }
  // Render product card
  const renderProductCard = ({ item }) => (
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 18,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
        padding: 15,
      }}
    >
      <Image
        source={{ uri: item.image?.startsWith('http') ? item.image : BASE_IMAGE_URL + item.image }}
        style={{
          width: '100%',
          height: 170,
          borderRadius: 16,
          backgroundColor: '#f1f5f9',
        }}
        resizeMode="cover"
      />
      <View className="flex flex-row justify-between" style={{ marginTop: 12 }}>

        <View >



          <Text style={{ fontSize: 19, fontWeight: '700', color: '#334155' }}>
            {item.productName}
          </Text>
          <Text style={{ fontSize: 17, color: '#2563eb', marginTop: 2 }}>
            ₹{item.price}
          </Text>
          <Text style={{ color: '#64748b', marginTop: 4 }}>
            {item.discription}
          </Text>
          <Text style={{ color: '#64748b', marginTop: 4 }}>
          <Text
  style={{
    color:
      item.status == "1"
        ? "green"
        : item.status == "0"
        ? "red"
        : "orange",
  }}
>
  {item.status == "1"
    ? "Accepted"
    : item.status == "0"
    ? "Rejected"
    : "Pending"}
</Text>

          </Text>
        </View>

        <View className="mt-5">
          <FontAwesome6
            onPress={() => {
              navigate.navigate("EditSeller", { id: item.id })
            }}
            name="edit" size={24} color="black" />

          <AntDesign
            name="delete" size={24} color="red"
            onPress={() => setPopupProductId(item.id)}
          />


        </View>
      </View>
    </View>
  );



  return (
    <View className="flex-1 bg-white">


      {selectedTab === "post" ? (
        <ScrollView className="flex-1 p-7 pt-11">
          <Text className="text-3xl font-extrabold text-center text-indigo-700 mb-10 tracking-wide">
            Add New Product
          </Text>

          <Text className="text-gray-800 font-semibold mb-3">Product Image</Text>
          <TouchableOpacity
            onPress={pickImage}
            className="w-full h-48 border-2 border-dashed border-indigo-400 rounded-2xl justify-center items-center mb-3 bg-indigo-50"
            activeOpacity={0.7}
          >
            {products.image ? (
              <Image
                source={{ uri: products.image.uri }}
                className="w-full h-full rounded-2xl"
                resizeMode="cover"
              />
            ) : (
              <View className="flex-row items-center space-x-2">
                <Feather name="image" size={30} color="#4f46e5" />
                <Text className="text-indigo-600 font-medium text-lg">
                  Tap to post product
                </Text>
              </View>
            )}
          </TouchableOpacity>
          {errorData.image && <Text className="text-red-600 mb-4">{errorData.image}</Text>}

          <View className="mb-6">
            <Text className="text-gray-900 font-semibold mb-1">Product Name</Text>
            <TextInput
              value={products.productName}
              onChangeText={(v) => handleChange("productName", v)}
              placeholder="Enter Product Name"
              className="border border-gray-300 rounded-xl bg-white px-4 py-3 text-base shadow-sm"
              placeholderTextColor="#9ca3af"
            />
            {errorData.productName && <Text className="text-red-600 mt-1">{errorData.productName}</Text>}
          </View>

          <View className="mb-6">
            <Text className="text-gray-900 font-semibold mb-1">Price</Text>
            <TextInput
              value={products.price}
              onChangeText={(v) => handleChange("price", v.replace(/[^0-9]/g, ""))}
              placeholder="Enter Price"
              keyboardType="numeric"
              className="border border-gray-300 rounded-xl bg-white px-4 py-3 text-base shadow-sm"
              placeholderTextColor="#9ca3af"
            />
            {errorData.price && <Text className="text-red-600 mt-1">{errorData.price}</Text>}
          </View>

          <View className="mb-8">
            <Text className="text-gray-900 font-semibold mb-1">Description</Text>
            <TextInput
              value={products.discription}
              onChangeText={(v) => handleChange("discription", v)}
              placeholder="Enter Description"
              className="border border-gray-300 rounded-xl bg-white px-4 py-3 text-base shadow-sm"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            {errorData.discription && <Text className="text-red-600 mt-1">{errorData.discription}</Text>}
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className={`rounded-2xl py-4 ${loading ? 'bg-indigo-300' : 'bg-indigo-700'}`}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="large" color="white" />
            ) : (
              <Text className="text-white text-center text-xl font-bold tracking-wide">
                Add Product
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View className="flex-1 p-6 bg-gray-50">
          <Text style={{
            fontSize: 22, fontWeight: '600',
            color: '#3730a3', textAlign: 'center', marginTop: 18
          }}>
            Products List
          </Text>
          {isLoading ? (
            <Loader />
          ) : error ? (
            <Text className="text-red-500 text-center">Failed to load products</Text>
          ) : (
            <FlatList
              data={data}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ paddingBottom: 80 }}
              ListEmptyComponent={<Text style={{ textAlign: "center" }}>No products found.</Text>}
              renderItem={renderProductCard}
            />
          )}
        </View>
      )}


      {popupProductId && (() => {
        const curr = data?.find(p => p.id === popupProductId); // yahan se current item le lo
        if (!curr) return null;
        return (
          <View
            style={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: "rgba(0,0,0,0.4)",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 99
            }}
          >
            <View style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 24,
              width: '80%',
              maxWidth: 320,
              alignItems: "center",
              shadowColor: "#000",
              shadowOpacity: 0.15,
              shadowOffset: { width: 0, height: 4 },
              shadowRadius: 12,
              elevation: 8,
            }}>
              <Text style={{ fontWeight: '700', fontSize: 20, marginBottom: 12 }}>Delete Product</Text>
              <Text style={{ color: "#1e293b", marginBottom: 20, textAlign: "center" }}>
                Are you sure you want to delete this product?
              </Text>
              <Text style={{ color: "#f87171", fontSize: 15, marginBottom: 12, textAlign: "center" }}>
                {curr.productName}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  handelDelete(curr.id);
                  setPopupProductId(null);
                }}
                style={{
                  backgroundColor: "#ef4444", padding: 12, width: "90%", marginBottom: 12, borderRadius: 8
                }}
              >
                <Text style={{ color: "white", textAlign: "center", fontWeight: "600" }}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPopupProductId(null)}
                style={{
                  backgroundColor: "#cbd5e1", padding: 12, width: "90%", borderRadius: 8
                }}
              >
                <Text style={{ color: "#1e293b", textAlign: "center", fontWeight: "500" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )
      })()}


      <FooterSeller onTabChange={setSelectedTab} />
    </View>
  );
};

export default HomeSeller;
