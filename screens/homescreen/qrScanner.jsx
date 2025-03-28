import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';

const QrScanner = () => {
  const navigation = useNavigation();
  const device = useCameraDevice('back');
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const requestCameraPermission = async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(true);
    };
    requestCameraPermission();
  }, []);

  const updateUserLoggedInStatus = async (uid) => {
    try {
      const userRef = firestore().collection('users').doc(uid);
      const userDoc = await userRef.get();
      if (userDoc.exists) {
        await userRef.update({ loggedIn: true });
        console.log(`User ${uid} logged in successfully.`);
      } else {
        console.warn(`User with UID ${uid} not found.`);
      }
    } catch (error) {
      console.error('Error updating user login status:', error);
    }
  };

  const fetchRecommendations = async (userId) => {
    setLoading(true);
    try {
      const response = await fetch(`https://suggestproducts.onrender.com/get?userId=${userId}`);
      const data = await response.json();

      if (response.ok) {
        Alert.alert('Recommendations', JSON.stringify(data));
        console.log('Recommendations:', data);
      } else {
        Alert.alert('Error', 'Failed to fetch recommendations');
        console.error('Error fetching recommendations:', data);
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Something went wrong while fetching recommendations');
    } finally {
      setLoading(false);
    }
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'code-128'],
    onCodeScanned: async (codes) => {
      const userId = codes[0]?.value;
      if (userId) {
        updateUserLoggedInStatus(userId);
        fetchRecommendations(userId);
      }
    },
  });

  if (!device) return <Text style={styles.errorText}>No camera found</Text>;
  if (!hasPermission) return <Text style={styles.errorText}>No camera permission</Text>;

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.replace('Home')}>
        <Icon name="arrow-back" size={28} color="white" />
      </TouchableOpacity>

      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        codeScanner={codeScanner}
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Fetching recommendations...</Text>
        </View>
      )}

      <View style={styles.overlay}>
        <Text style={styles.scanText}>Scan a QR Code</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  overlay: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 16,
    borderRadius: 10,
  },
  scanText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  errorText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    marginTop: 50,
    color: 'red',
  },
  loadingOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    borderRadius: 10,
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default QrScanner;
