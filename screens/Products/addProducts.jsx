import React, { useState } from "react";
import { View, Text, TextInput, Button, Image, TouchableOpacity, Alert, StyleSheet } from "react-native";
import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";
import * as ImagePicker from "react-native-image-picker";
import { useNavigation } from "@react-navigation/native";

const AddProduct = () => {
  const navigation = useNavigation();
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productImage, setProductImage] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [productLocation, setProductLocation] = useState(["", ""]);

  // 📸 Image Picker Function
  const pickImage = async () => {
    ImagePicker.launchImageLibrary({ mediaType: "photo" }, (response) => {
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.error) {
        console.log("ImagePicker Error: ", response.error);
      } else if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri);
      }
    });
  };
  

  // 🔼 Upload Image to Firebase Storage
  const uploadImage = async () => {
    if (!imageUri) return null;
    console.log("Image URI:", imageUri);
    try {
      const fileName = `products/${Date.now()}.jpg`; // Unique file name
      console.log("Uploading to:", fileName);
      const reference = storage().ref(fileName);
  
      // Upload file
      await reference.putFile(imageUri.replace("file://", ""));
  
      // Ensure file is uploaded before getting URL
      await new Promise(resolve => setTimeout(resolve, 3000)); 
  
      // Fetch URL
      const downloadURL = await reference.getDownloadURL();
      console.log("Download URL:", downloadURL);
      return downloadURL;
  
    } catch (error) {
      console.error("Image upload error:", error.message);
      return null;
    }
  };
  
  

  // ➕ Add Product to Firestore
  const addProduct = async () => {
    if (!productName || !productPrice) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      const imageUrl = await uploadImage(); // Upload image and get URL
        
      const newProduct = {
        ProductId: Date.now(),
        ProductName: productName,
        ProductPrice: parseFloat(productPrice),
        ProductImage: imageUrl || "",
        ProductLocation: productLocation,
      };

      await firestore().collection("products").add(newProduct);

      Alert.alert("Success", "Product added successfully!");
      navigation.goBack(); // Go back to previous screen
    } catch (error) {
      console.error("Error adding product:", error);
      Alert.alert("Error", "Could not add product");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Product</Text>

      {/* Product Name */}
      <TextInput
        style={styles.input}
        placeholder="Product Name"
        value={productName}
        onChangeText={setProductName}
      />

      {/* Product Price */}
      <TextInput
        style={styles.input}
        placeholder="Product Price"
        value={productPrice}
        keyboardType="numeric"
        onChangeText={setProductPrice}
      />

      {/* Product Image Picker */}
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <Text>Pick an Image</Text>
        )}
      </TouchableOpacity>

      {/* Product Location Inputs */}
      <TextInput
        style={styles.input}
        placeholder="Location 1"
        value={productLocation[0]}
        onChangeText={(text) => setProductLocation([text, productLocation[1]])}
      />
      <TextInput
        style={styles.input}
        placeholder="Location 2"
        value={productLocation[1]}
        onChangeText={(text) => setProductLocation([productLocation[0], text])}
      />

      {/* Add Product Button */}
      <Button title="Add Product" onPress={addProduct} />
    </View>
  );
};

// 🎨 Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  imagePicker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  image: {
    width: 100,
    height: 100,
  },
});

export default AddProduct;
