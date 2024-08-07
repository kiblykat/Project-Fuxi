import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Animated, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TextInputEffectLabel = ({
  type = 'text',
  label,
  onChangeText,
  error,
  style,
  styleInput,
  value,
  defaultValue,
  keyboardType = 'default',
}) => {
  const [text, setText] = useState(defaultValue || '');
  const placeholderAnim = useRef(new Animated.Value(0)).current;
  const isPassword = type === 'password';
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  if (value) {
    Animated.timing(placeholderAnim, {
      toValue: 1,
      duration: 0,
      useNativeDriver: false,
    }).start();
  }

  const handleFocus = () => {
    if (text == '') {
      Animated.timing(placeholderAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleBlur = () => {
    if (text == '') {
      Animated.timing(placeholderAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  useEffect(() => {
    if (text !== undefined && text !== '') {
      Animated.timing(placeholderAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(placeholderAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [text]);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleTextChange = (newText) => {
    setText(newText);
    onChangeText(newText);
  };

  return (
    <View style={[{ marginBottom: 10 }, style]}>
      <Animated.Text
        style={{
          position: 'absolute',
          top: placeholderAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0],
          }),
          fontSize: placeholderAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [16, 12],
          }),
          color: error
            ? '#C31E1E'
            : placeholderAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['#757575', '#539ca4'],
              }),
        }}
      >
        {label}
      </Animated.Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
        <TextInput
          onChangeText={handleTextChange}
          style={[
            {
              height: 40,
              marginTop: 12,
              marginBottom: -2,
              fontSize: 16,
              width: '100%',
              color: '#3C4647',
            },
            styleInput,
          ]}
          secureTextEntry={isPassword && !isPasswordVisible}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType={keyboardType}
          value={text}
        />
        {isPassword && (
          <Ionicons
            name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
            size={24}
            color={'#757575'}
            style={{
              position: 'absolute',
              right: 0,
              padding: 6,
            }}
            onPress={togglePasswordVisibility}
          />
        )}
      </View>
      <Animated.View
        style={{
          borderColor: error
            ? '#C31E1E'
            : placeholderAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['#DFE0E2', '#72aeb4'],
              }),
          borderBottomWidth: 2,
        }}
      ></Animated.View>
      <View style={styles.error}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    </View>
  );
};

export default TextInputEffectLabel;

const styles = StyleSheet.create({
  error: {
    height: 18,
    marginTop: 4,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
  },
});
