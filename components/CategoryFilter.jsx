import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { homeStyles } from "../assets/styles/home.styles";

export default function CategoryFilter({ categories, selectedCategory, onSelectCategory }) {
  return (
    <View style={homeStyles.categoryFilterContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={homeStyles.categoryFilterScrollContent}
        decelerationRate="fast"
        snapToInterval={120}
        snapToAlignment="center"
      >
        {categories.map((category, index) => {
          const isSelected = selectedCategory === category.name;
          return (
            <CategoryButton
              key={category.id}
              category={category}
              isSelected={isSelected}
              onPress={() => onSelectCategory(category.name)}
              index={index}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

function CategoryButton({ category, isSelected, onPress, index }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de entrada con retraso escalonado
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        style={[
          homeStyles.categoryButton,
          isSelected && homeStyles.selectedCategory,
          {
            elevation: isSelected ? 8 : 3,
            shadowColor: isSelected ? "#6366f1" : "#000",
            shadowOffset: { width: 0, height: isSelected ? 6 : 2 },
            shadowOpacity: isSelected ? 0.3 : 0.1,
            shadowRadius: isSelected ? 8 : 4,
            borderWidth: isSelected ? 2 : 0,
            borderColor: isSelected ? "#6366f1" : "transparent",
          }
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {isSelected && (
          <LinearGradient
            colors={["#6366f1", "#8b5cf6", "#ec4899"]}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 16,
              opacity: 0.1,
            }}
          />
        )}
        
        <View style={{
          position: "relative",
          marginBottom: 8,
        }}>
          <Image
            source={{ uri: category.image }}
            style={[
              homeStyles.categoryImage,
              isSelected && homeStyles.selectedCategoryImage,
              {
                borderRadius: 12,
                borderWidth: isSelected ? 3 : 0,
                borderColor: "#fff",
              }
            ]}
            contentFit="cover"
            transition={300}
          />
          
          {isSelected && (
            <View style={{
              position: "absolute",
              top: -2,
              right: -2,
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: "#10b981",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 2,
              borderColor: "#fff",
            }}>
              <Text style={{ color: "#fff", fontSize: 10, fontWeight: "bold" }}>✓</Text>
            </View>
          )}
        </View>

        <Text
          style={[
            homeStyles.categoryText,
            isSelected && homeStyles.selectedCategoryText,
            {
              fontWeight: isSelected ? "700" : "500",
              fontSize: isSelected ? 13 : 12,
              textAlign: "center",
            }
          ]}
        >
          {category.name}
        </Text>

        {isSelected && (
          <View style={{
            position: "absolute",
            bottom: -2,
            left: "50%",
            marginLeft: -6,
            width: 12,
            height: 3,
            borderRadius: 2,
            backgroundColor: "#6366f1",
          }} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}