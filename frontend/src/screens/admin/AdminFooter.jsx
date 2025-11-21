import { View, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import AntDesign from '@expo/vector-icons/AntDesign';


const AdminFooter = ({ onTabPress }) => {
  const [activeTab, setActiveTab] = useState('home')

  const handlePress = (tab) => {
    setActiveTab(tab)
    if (onTabPress) {
      onTabPress(tab)
    }
  }

  return (
    <View className="flex-row bg-white border-t border-gray-300 h-16 justify-around items-center px-8">

      <TouchableOpacity 
        className="items-center"
        onPress={() => handlePress('home')}
      >
        <AntDesign 
          name={activeTab === 'home' ? 'home' : 'home'} 
          size={24} 
          color={activeTab === 'home' ? '#3b82f6' : '#999'} 
        />
      </TouchableOpacity>


      <TouchableOpacity 
        className="items-center"
        onPress={() => handlePress('create')}
      >
        <AntDesign
          name="user-add" 
          size={24} 
          color={activeTab === 'create' ? '#3b82f6' : '#999'} 
        />

        {/* <AntDesign name="user-add" size={24} color="black" /> */}
      </TouchableOpacity>
    </View>
  )
}

export default AdminFooter
