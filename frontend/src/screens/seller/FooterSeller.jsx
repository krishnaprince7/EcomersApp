import React, { useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const FooterSeller = ({ onTabChange }) => {
  const [selectedTab, setSelectedTab] = useState("post");

  const handleTabPress = (tab) => {
    setSelectedTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  return (
    <View className="flex-row justify-around bg-white border-t border-gray-300 py-3 rounded-t-3xl shadow-md">
      {/* POST TAB */}
      <TouchableOpacity
        onPress={() => handleTabPress("post")}
        className="items-center flex-1"
        activeOpacity={0.8}
      >
        
        <View
          className="items-center justify-center"
          style={{
            paddingBottom: 6,
            borderBottomWidth: selectedTab === "post" ? 3 : 0,
            borderBottomColor: "#3b82f6",
          }}
        >
          <AntDesign
            name="appstore-add"
            size={selectedTab === "post" ? 32 : 28}
            color={selectedTab === "post" ? "#3b82f6" : "#6b7280"}
          />
          <Text
            className={`mt-1 font-semibold ${
              selectedTab === "post" ? "text-blue-600" : "text-gray-500"
            }`}
          >
            Post
          </Text>
        </View>
      </TouchableOpacity>
      {/* VIEW TAB */}
      <TouchableOpacity
        onPress={() => handleTabPress("view")}
        className="items-center flex-1"
        activeOpacity={0.8}
      >
        <View
          className="items-center justify-center"
          style={{
            paddingBottom: 6,
            borderBottomWidth: selectedTab === "view" ? 3 : 0,
            borderBottomColor: "#3b82f6",
          }}
        >
          <MaterialIcons
            name="view-list"
            size={selectedTab === "view" ? 32 : 28}
            color={selectedTab === "view" ? "#3b82f6" : "#6b7280"}
          />
          <Text
            className={`mt-1 font-semibold ${
              selectedTab === "view" ? "text-blue-600" : "text-gray-500"
            }`}
          >
            View
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default FooterSeller;
