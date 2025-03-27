import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';

const QrScanner = () => {
  const navigation = useNavigation();
  const device = useCameraDevice('back');
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const requestCameraPermission = async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(true);
    };
    requestCameraPermission();
  }, []);

  const updateUserLoggedInStatus = async (uid) => {
    try {
      Alert.alert("User",uid);
      const userRef = firestore().collection('users').doc(uid);
      Alert.alert("userData", JSON.stringify(userRef.path));
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

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'code-128'],
    onCodeScanned: (codes) => {
      const qrData = codes[0]?.value; // User UID
      if (qrData) {
        // Alert.alert("data",qrData);
        updateUserLoggedInStatus(qrData);
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

      <View style={styles.overlay}>
        <Text style={styles.scanText}>Scan a QR Code</Text>
        <TouchableOpacity style={styles.buttonTouchable}>
          <Text style={styles.buttonText}>OK. Got it!</Text>
        </TouchableOpacity>
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
    marginBottom: 10,
    textAlign: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#0af',
  },
  buttonTouchable: {
    padding: 12,
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    marginTop: 50,
    color: 'red',
  },
});

export default QrScanner;
