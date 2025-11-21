import { View, Text, Image, TouchableOpacity, ToastAndroid, Platform, StyleSheet, ScrollView, TextInput, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useRoute, useNavigation } from '@react-navigation/native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as ImagePicker from 'expo-image-picker'
import Loader from '../Loader/Loader'


// Ip
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

//  Helper function - Har platform ke liye
const showToast = (message) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT)
  } else {
    Alert.alert("", message)
  }
}

const EditSeller = () => {
  const route = useRoute()
  const navigation = useNavigation()
  const queryClient = useQueryClient()
  const { id } = route.params

  const [productName, setProductName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)

  const getDataById = async () => {
    const res = await api.get(`/getSingleProduct/${id}`) 
    console.log("Fetched Product Data:", res.data.product)
    return res.data.product
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ["productById", id],
    queryFn: getDataById,   
  })

  useEffect(() => {
    if (data) {
      setProductName(data.productName || '')
      setPrice(data.price?.toString() || '')
      setDescription(data.discription || '')
    }
  }, [data]) 

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
    
    if (permissionResult.granted === false) {
      showToast("Please allow access to photos!") 
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    })

    if (!result.canceled) {
      setSelectedImage(result.assets[0])
    }
  }

  const updateProductMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await api.put(`/editProduct/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      console.log("Update Response:", response.data)
      return response.data
    },
    onSuccess: (data) => {
      showToast("Product updated successfully!") 
      queryClient.invalidateQueries(["productById", id])
      navigation.goBack()
    },
    onError: (error) => {
      console.error("Error updating product:", error)
      showToast(error.response?.data?.message || "Failed to update product") 
    }
  })

  const handleUpdateProduct = async () => {
    if (!productName || !price || !description) {
      showToast("Please fill all fields")   
      return
    }

    const formData = new FormData()
    formData.append('productName', productName)
    formData.append('price', price)
    formData.append('discription', description)

    if (selectedImage) {
      const imageUri = selectedImage.uri
      const filename = imageUri.split('/').pop()
      const match = /\.(\w+)$/.exec(filename)
      const type = match ? `image/${match[1]}` : `image/jpeg`

      formData.append('image', {
        uri: imageUri,
        name: filename,
        type: type,
      })
    }

    updateProductMutation.mutate(formData)
  }

  if (isLoading) {
    return <Loader />
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error fetching product data</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => queryClient.invalidateQueries(["productById", id])}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Edit Product</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Product Name</Text>
        <TextInput
          style={styles.input}
          value={productName}
          onChangeText={setProductName}
          placeholder="Enter product name"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Price (₹)</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          placeholder="Enter price"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter description"
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.imageContainer}>
        <Text style={styles.label}>Product Image</Text>
        
        <Image
          source={{
            uri: selectedImage 
              ? selectedImage.uri 
              : `${BASE_IMAGE_URL}${data?.image}`   
          }}
          style={styles.image}
          resizeMode="cover"
        />

        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <Text style={styles.imageButtonText}>
            {selectedImage ? 'Change Image' : 'Pick New Image'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[
          styles.updateButton, 
          updateProductMutation.isLoading && styles.updateButtonDisabled
        ]} 
        onPress={handleUpdateProduct}
        disabled={updateProductMutation.isLoading}
      >
        <Text style={styles.updateButtonText}>
          {updateProductMutation.isLoading ? 'Updating...' : 'Update Product'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.cancelButton} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imageContainer: {
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#f0f0f0',
  },
  imageButton: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  imageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  updateButton: {
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  updateButtonDisabled: {
    backgroundColor: '#ccc',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
})

export default EditSeller
