import { View, Text, FlatList, Image, TouchableOpacity, Modal, ScrollView, Pressable, TextInput, Platform, Alert, ToastAndroid } from 'react-native'
import React, { useState } from 'react'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useQuery } from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/Ionicons';
import Loader from '../Loader/Loader';
import AdminFooter from './AdminFooter';

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


const roleOptions = [
  { label: 'Admin', value: '1' },
  { label: 'Seller', value: '2' },
  { label: 'User', value: '3' },
  { label: 'Delivery', value: '4' },
];

const AdminHome = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  const [formData, setFormData] = useState({
    user_name: "",
    password: "",
    role_id: "3", 
  });

  const [formDataErrors, setFormDataErrors] = useState({});
  const [roleModalVisible, setRoleModalVisible] = useState(false);

  const showToast = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT)
    } else {
      Alert.alert("", message)
    }
  };

  const getAllProductData = async () => {
    const res = await api.get("/getAllProductData");
    return res.data.data;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["allProductData"],
    queryFn: getAllProductData
  });

  const handleCardPress = (item) => {
    setSelectedProduct(item);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedProduct(null);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleCreateUser = async () => {
    try {
      const res = await api.post("/register", formData);
      if (res.data.success) {
        showToast("User Created Successfully");
        setFormData({
          user_name: "",
          password: "",
          role_id: "3"
        });
        setFormDataErrors({});
      } else {
        setFormDataErrors(res.data.errors || {});
      }
    } catch (error) {
      setFormDataErrors(error.response?.data?.errors || {});
    }
  };

  if (isLoading) return <Loader />;
  if (error) return <Text className="text-center text-red-500 mt-10">Error fetching data</Text>;

  const ProductCard = ({ item, onPress }) => (
    <TouchableOpacity
      onPress={() => onPress(item)}
      className="bg-white mx-4 mb-4 rounded-2xl shadow-lg overflow-hidden"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
      }}
    >
      <Image
        source={{ uri: `${BASE_IMAGE_URL}${item.image}` }}
        className="w-full h-48"
        resizeMode="cover"
      />
      <View className="p-4">
        <Text className="text-xl font-bold text-gray-800 mb-2" numberOfLines={2}>
          {item.productName}
        </Text>
        <Text className="text-gray-600 mb-3" numberOfLines={2}>
          {item.discription}
        </Text>
        <View className="flex-row items-center justify-between">
          <View className="bg-blue-500 px-4 py-2 rounded-full">
            <Text className="text-white font-bold text-lg">
              ₹{item.price}
            </Text>
          </View>
          <Icon name="arrow-forward-circle" size={28} color="#3b82f6" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-500 pt-12 pb-6 px-4 shadow-md">
        <Text className="text-white text-3xl font-bold">Admin Dashboard</Text>
        <Text className="text-blue-100 text-base mt-1">Manage your products</Text>
      </View>

      {/* Product List Tab */}
      {activeTab === 'home' && (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ProductCard item={item} onPress={handleCardPress} />
          )}
          contentContainerStyle={{ paddingVertical: 16, paddingBottom: 90 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <Icon name="cube-outline" size={80} color="#d1d5db" />
              <Text className="text-gray-400 text-lg mt-4">No products available</Text>
            </View>
          }
        />
      )}

      {/* Create User Tab */}
      {activeTab === 'create' && (
        <View className="flex-1 items-center justify-center px-4 py-6">
          <View className="w-full max-w-md px-4 py-8 bg-white rounded-2xl shadow-lg">
            <Text className="text-2xl font-bold text-center mb-6 text-blue-700">
              Create New User
            </Text>

            {/* Username */}
            <Text className="mb-1 font-medium text-gray-700">Username</Text>
            <TextInput
              placeholder="Enter your username"
              value={formData.user_name}
              onChangeText={(value) =>
                setFormData({ ...formData, user_name: value })
              }
              className="border border-gray-300 p-3 mb-2 rounded-lg bg-gray-50"
            />
            {!!formDataErrors.user_name && (
              <Text className="text-red-500 mb-2">{formDataErrors.user_name}</Text>
            )}

            {/* Password */}
            <Text className="mb-1 font-medium text-gray-700">Password</Text>
            <TextInput
              placeholder="Enter your password"
              value={formData.password}
              onChangeText={(value) =>
                setFormData({ ...formData, password: value })
              }
              className="border border-gray-300 p-3 mb-2 rounded-lg bg-gray-50"
              secureTextEntry
            />
            {!!formDataErrors.password && (
              <Text className="text-red-500 mb-2">{formDataErrors.password}</Text>
            )}

            {/* Custom Modal Dropdown for Role */}
            <Text className="mb-1 font-medium text-gray-700">Role</Text>
            <TouchableOpacity
              className="border border-gray-300 rounded-lg bg-gray-50 px-3 py-3 mb-4 flex-row items-center justify-between w-full"
              onPress={() => setRoleModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 16 }}>
                {roleOptions.find(r => r.value === formData.role_id)?.label || 'Select Role'}
              </Text>
              <Icon name="chevron-down" size={22} color="#999" />
            </TouchableOpacity>
            <Modal
              visible={roleModalVisible}
              animationType="fade"
              transparent={true}
              onRequestClose={() => setRoleModalVisible(false)}
            >
              <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' }} onPress={() => setRoleModalVisible(false)}>
                <View style={{
                  position: 'absolute',
                  left: 24,
                  right: 24,
                  top: '35%',
                  backgroundColor: 'white',
                  borderRadius: 16,
                  elevation: 6,
                  paddingBottom: 12,
                  paddingTop: 12,
                }}>
                  {roleOptions.map(option => (
                    <TouchableOpacity
                      key={option.value}
                      style={{ paddingVertical: 16, paddingHorizontal: 18, borderBottomWidth: 1, borderColor: '#eee' }}
                      onPress={() => {
                        setFormData({ ...formData, role_id: option.value });
                        setRoleModalVisible(false);
                      }}
                    >
                      <Text style={{ fontSize: 17, color: "#222" }}>{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Pressable>
            </Modal>

            {/* Submit Button */}
            <TouchableOpacity
              className="bg-blue-600 py-3 rounded-lg items-center mb-2"
              onPress={handleCreateUser}
            >
              <Text className="text-white text-lg font-bold">Create User</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Modal Popup */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <Pressable
            className="flex-1"
            onPress={handleCloseModal}
          />

          <View className="bg-white rounded-t-3xl max-h-[85%]">
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <Text className="text-2xl font-bold text-gray-800">Product Details</Text>
              <TouchableOpacity onPress={handleCloseModal} className="bg-gray-100 p-2 rounded-full">
                <Icon name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {selectedProduct && (
                <View className="p-4">
                  <View className="rounded-2xl overflow-hidden mb-4">
                    <Image
                      source={{ uri: `${BASE_IMAGE_URL}${selectedProduct.image}` }}
                      className="w-full h-80"
                      resizeMode="cover"
                    />
                  </View>
                  <Text className="text-3xl font-bold text-gray-800 mb-3">{selectedProduct.productName}</Text>
                  <View className="bg-gradient-to-r from-blue-500 to-blue-600 self-start px-6 py-3 rounded-full mb-4">
                    <Text className="text-white font-bold text-2xl">₹{selectedProduct.price}</Text>
                  </View>
                  <View className="bg-gray-50 p-4 rounded-2xl mb-4">
                    <Text className="text-lg font-semibold text-gray-800 mb-2">Description</Text>
                    <Text className="text-gray-600 text-base leading-6">{selectedProduct.discription}</Text>
                  </View>
                  <View className="bg-blue-50 p-4 rounded-2xl mb-4">
                    <View className="flex-row items-center mb-2">
                      <Icon name="information-circle" size={24} color="#3b82f6" />
                      <Text className="text-lg font-semibold text-gray-800 ml-2">Product ID</Text>
                    </View>
                    <Text className="text-gray-600 text-base ml-8">#{selectedProduct.id}</Text>
                  </View>
                  <View className="flex-row gap-3 mt-4 mb-6">
                    <TouchableOpacity className="flex-1 bg-blue-500 py-4 rounded-xl items-center">
                      <Icon name="create-outline" size={20} color="#fff" />
                      <Text className="text-white font-bold mt-1">Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 bg-red-500 py-4 rounded-xl items-center">
                      <Icon name="trash-outline" size={20} color="#fff" />
                      <Text className="text-white font-bold mt-1">Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Footer */}
      <View className="absolute bottom-5 left-0 right-0">
        <AdminFooter onTabPress={handleTabChange} />
      </View>
    </View>
  )
}

export default AdminHome
