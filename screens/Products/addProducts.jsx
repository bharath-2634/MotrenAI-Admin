import React, { useState, useEffect } from "react";
import { 
  View, Text, TextInput, Button, Image, TouchableOpacity, Alert, 
  StyleSheet, ScrollView, Platform 
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";
import * as ImagePicker from "react-native-image-picker";
import { useNavigation } from "@react-navigation/native";

const AddProduct = () => {
  const navigation = useNavigation();
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [productLocation, setProductLocation] = useState(["", ""]);
  const [productImages, setProductImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    ImagePicker.launchImageLibrary({ 
      mediaType: "photo",
      quality: 0.8,
      includeBase64: false
    }, (response) => {
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.error) {
        console.log("ImagePicker Error: ", response.error);
        Alert.alert("Error", "Failed to pick image: " + response.error);
      } else if (response.assets && response.assets.length > 0) {
        const uri = response.assets[0].uri;
        // Fix Android file URI
        const fixedUri = Platform.OS === 'android' ? uri : uri.replace('file://', '');
        setImageUri(fixedUri);
      }
    });
  };

  const uploadImage = async () => {
    if (!imageUri) {
      Alert.alert("Error", "No image selected!");
      return null;
    }
  
    setUploading(true);
  
    try {
      const fileName = `products/${Date.now()}.jpg`;
      const reference = storage().ref(fileName);
  
      // Ensure correct format of file URI
      const fileUri = Platform.OS === 'android' ? imageUri : imageUri.replace('file://', '');
      Alert.alert("FileUri",fileUri);
      console.log("Uploading file from:", fileUri); // Debugging output
  
      // Start the upload
      await reference.putFile(fileUri);
      Alert.alert("Success");
      console.log("Upload successful, fetching URL..."); // Debugging output
  
      // Get download URL
      const downloadURL = await reference.getDownloadURL();
      Alert.alert("download",downloadURL);
      console.log("File URL:", downloadURL); // Debugging output
  
      setUploading(false);
      return downloadURL;
    } catch (error) {
      console.error("Upload failed:", error);
      setUploading(false);
      Alert.alert("Error", "Image upload failed: " + error.message);
      return null;
    }
  };
  

  const addProduct = async () => {
    if (!productName || !productPrice) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (uploading) {
      Alert.alert("Please wait", "Image is currently uploading");
      return;
    }

    try {
      const imageUrl = await uploadImage();
      if (!imageUrl) return;

      const newProduct = {
        ProductId: Date.now(),
        ProductName: productName,
        ProductPrice: parseFloat(productPrice),
        ProductImage: imageUrl,
        ProductLocation: productLocation,
        createdAt: firestore.FieldValue.serverTimestamp()
      };

      await firestore().collection("products").add(newProduct);
      
      Alert.alert("Success", "Product added successfully!");
      resetForm();
      fetchProductImages();
    } catch (error) {
      console.error("Add product error:", error);
      Alert.alert("Error", "Could not add product: " + error.message);
    }
  };

  const resetForm = () => {
    setProductName("");
    setProductPrice("");
    setImageUri(null);
    setProductLocation(["", ""]);
  };

  const fetchProductImages = async () => {
    try {
      const snapshot = await firestore()
        .collection("products")
        .orderBy("createdAt", "desc")
        .limit(10)
        .get();
      
      const images = snapshot.docs.map(doc => doc.data().ProductImage);
      setProductImages(images);
    } catch (error) {
      console.error("Error fetching images:", error);
      Alert.alert("Error", "Failed to load product images");
    }
  };

  useEffect(() => {
    fetchProductImages();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add New Product</Text>

      <TextInput
        style={styles.input}
        placeholder="Product Name"
        value={productName}
        onChangeText={setProductName}
      />

      <TextInput
        style={styles.input}
        placeholder="Product Price"
        value={productPrice}
        keyboardType="numeric"
        onChangeText={setProductPrice}
      />

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <Text>Pick an Image</Text>
        )}
      </TouchableOpacity>

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

      <Button 
        title={uploading ? "Uploading..." : "Add Product"} 
        onPress={addProduct} 
        disabled={uploading}
      />

      <Text style={styles.title}>Recent Product Images</Text>
      <ScrollView horizontal>
        {productImages.map((url, index) => (
          <Image key={index} source={{ uri: url }} style={styles.fetchedImage} />
        ))}
      </ScrollView>
    </ScrollView>
  );
};

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
    marginTop: 10,
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
    justifyContent: "center",
    height: 150,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  fetchedImage: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 8,
  },
});

export default AddProduct;