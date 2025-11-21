import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import axios from 'axios'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'

// const BASE_URL = "http://192.168.1.18:8080/api";
// const BASE_URL = "http://192.168.43.3:8080/api";

// const BASE_IMAGE_URL = "http://192.168.1.4:8080/uploads/";
// const BASE_URL = "http://192.168.1.4:8080/api";

const BASE_URL = "http://192.168.1.4:8080/api";

const api = axios.create({
  baseURL: BASE_URL,
}); 

const Login = () => {
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    user_name: "",
    password: ""
  })

  

  const [errorData, setErrorData] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
    
    if (errorData[name]) {
      setErrorData({
        ...errorData,
        [name]: ""
      })
    }
  };

  // Token aur User Data Store karne ka function
 const storeUserData = async (token, user) => {
    try {
         await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("user", JSON.stringify(user));
    await AsyncStorage.setItem("user_name", user.user_name);
    await AsyncStorage.setItem("role_id", user.role_id.toString());
    await AsyncStorage.setItem("role_name", user.role_name);
      console.log('Data stored successfully!')
    } catch (error) {
      console.log('Error storing data:', error)
    }
  }


  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const res = await api.post("/login", formData)
      console.log("Data", res.data)
      
      // Token aur User ko AsyncStorage mein save karo
      if (res.data.success) {
        // await storeUserData(res.data.token, res.data.user.user_name, res.data.user.role_id, res.data.user.role_name)
        await storeUserData(res.data.token, res.data.user);

        // Form clear karo
        setFormData({
          user_name: "",
          password: ""
        })
        setErrorData({})
        
        // Navigate to Home

        const roleId = res.data.user.role_id

        if(roleId == 1){
          navigation.navigate("AdminHome")
        }
        else if(roleId == 2){
          navigation.navigate("HomeSeller")
        }
        else if(roleId == 3){
          navigation.navigate("UsersHome")
        }
        
      }
      
    } catch (error) {
      console.log("Error", error)
      if (error.response?.data?.errors) {
        setErrorData(error.response.data.errors)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View className="flex-1 bg-gray-50 mt-28">
      <ScrollView 
        className="flex-1"
        contentContainerClassName="min-h-full justify-center px-6 py-8"
        showsVerticalScrollIndicator={false}
      >
  
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-blue-500 rounded-full items-center justify-center mb-6 shadow-lg">
            <Text className="text-5xl">🔐</Text>
          </View>
          
          <Text className="text-3xl font-bold text-gray-800 mb-2">
            Welcome Back
          </Text>
          <Text className="text-gray-500 text-center">
            Sign in to continue to your account
          </Text>
        </View>

        <View className="bg-white rounded-3xl shadow-xl p-6 mx-4">
       
          {/* Username Input */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Username
            </Text>
            <View className={`flex-row items-center border-2 ${
              errorData.user_name ? 'border-red-400' : 'border-gray-200'
            } rounded-xl px-4 bg-gray-50`}>
              <Text className="text-xl mr-2">👤</Text>
              <TextInput 
                className="flex-1 py-3 text-gray-800"
                placeholder="Enter your username"
                placeholderTextColor="#9CA3AF"
                value={formData.user_name}
                onChangeText={(value) => handleChange("user_name", value)}
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>
            {errorData.user_name && (
              <Text className="text-red-500 text-xs mt-1 ml-1">
               {errorData.user_name}
              </Text>
            )}
          </View>

          {/* Password Input */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Password
            </Text>
            <View className={`flex-row items-center border-2 ${
              errorData.password ? 'border-red-400' : 'border-gray-200'
            } rounded-xl px-4 bg-gray-50`}>
              <Text className="text-xl mr-2">🔒</Text>
              <TextInput 
                className="flex-1 py-3 text-gray-800"
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={formData.password}
                onChangeText={(value) => handleChange("password", value)}
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>
            {errorData.password && (
              <Text className="text-red-500 text-xs mt-1 ml-1">
               {errorData.password}
              </Text>
            )}
          </View>

          {/* Forgot Password */}
          <TouchableOpacity className="mb-5" disabled={isLoading}>
            <Text className="text-blue-600 text-sm text-right font-semibold">
              Forgot Password?
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity 
            onPress={handleSubmit}
            disabled={isLoading}
            className={`${isLoading ? 'bg-blue-400' : 'bg-blue-600'} rounded-xl py-4 shadow-lg mb-4 flex-row justify-center items-center`}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text className="text-white text-center font-bold text-lg ml-2">
                  Logging in...
                </Text>
              </>
            ) : (
              <Text className="text-white text-center font-bold text-lg">
                Login
              </Text>
            )}
          </TouchableOpacity>

        </View>

        {/* Sign Up Link */}
        <View className="flex-row justify-center items-center mt-6 mb-8">
          <Text className="text-gray-600">
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity disabled={isLoading}>
            <Text className="text-blue-600 font-bold">
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  )
}

export default Login




