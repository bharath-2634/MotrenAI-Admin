import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, PermissionsAndroid, Platform, Button } from 'react-native';

const Home = () => {

  const navigation = useNavigation();

  const scanner = () => {
    navigation.replace('Scanner');
  }

  const addProducts = () => {
    navigation.replace('AddProduct');
  }
  return(
    <View>
      <View style={StyleSheet.container}>
        <Button title="Scan" onPress={scanner} style={styles.button} />
        <Button title="Add Products" onPress={addProducts} style={styles.Addbutton} />
      </View>
        
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding : 20,
    display : 'flex',
    flexDirection : 'column',
    justifyContent : 'center',
    alignItems : 'center',
    gap : 30,
    height : 'screen'
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
  button : {
    marginBottom : 30
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
  Addbutton : {
    marginTop : 20
  }
});

export default Home;
