import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import colours from '../config/colours';
import TextInputEffectLabel from '../components/TextInputEffectLabel';
import { storeData } from '../utils/AsyncStorage';
import { signUpInstitute, updateOTP } from '../api/institutes';
import { SendEmailSignUp } from '../api/mailer';
import CustomAnimatedLoader from '../components/CustomAnimatedLoader';

const CreateAccountScreen = () => {
  const navigation = useNavigation();
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));

    let error = '';
    if (field === 'name' && !value) {
      error = 'Name is required.';
    } else if (field === 'name' && value.trim().length < 6) {
      error = 'Name must be at least 6 characters.';
    } else if (field === 'email' && !isValidEmail(value)) {
      error = 'Invalid email address.';
    } else if (field === 'password' && value.trim().length < 8) {
      error = 'Password must be at least 8 characters.';
    } else if (field === 'confirmPassword' && value !== formData.password) {
      error = 'Passwords do not match.';
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: error,
    }));
  };

  const validateNullFormData = (formData) => {
    let isValid = false;
    const newErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    };

    if (formData.name.trim() === '') {
      newErrors.name = 'Name is required';
      isValid = true;
    }

    if (formData.email.trim() === '') {
      newErrors.email = 'Email is required';
      isValid = true;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Invalid email address';
        isValid = true;
      }
    }

    if (formData.password.trim() === '') {
      newErrors.password = 'Password is required';
      isValid = true;
    }

    if (formData.confirmPassword.trim() === '') {
      newErrors.confirmPassword = 'Confirm Password is required';
      isValid = true;
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = true;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    const { name, email, password } = formData;

    const isValid = validateNullFormData(formData);

    if (isValid) {
      alert('Data is valid, submitting...');
      return;
    }

    if (errors.name || errors.email || errors.password) {
      alert('Please fix the validation errors.');
      return;
    }

    try {
      setIsLoading(true);
      const institutesNew = await signUpInstitute(name, email, password);
      const { code, message, data } = institutesNew;

      if (code == 200) {
        await storeData('userInfo', JSON.stringify(data.institute));
        const CodeOTP =
          Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
        const response = await updateOTP(email, CodeOTP);
        await storeData('tokenVerifyAccount', response.data);
        await SendEmailSignUp(email, CodeOTP);
        navigation.navigate('VerifyOTPScreen', {
          token: data.token,
          email: email,
          navigationToScreenName: 'ListenerProfileMain',
        });
      } else if (code == 400) {
        alert(message);
      } else if (code == 409) {
        setErrors({
          ...errors,
          email: message,
        });
      } else {
        alert(message);
      }
    } catch (error) {
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  useEffect(() => {
    const isFormValid =
      Object.values(formData).every((value) => value !== '') &&
      Object.values(errors).every((error) => error === '');
    if (isFormValid) {
      setIsChecked(true);
    } else {
      setIsChecked(false);
    }
  }, [formData, errors]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomAnimatedLoader visible={isLoading} />
      <View style={styles.brand}>
        <Text style={styles.brandText}>FUXI</Text>
      </View>
      <View style={styles.signUp}>
        <Text style={styles.headerFormText}>Create new account</Text>
        <TextInputEffectLabel
          label="Name"
          onChangeText={(text) => handleInputChange('name', text)}
          value={formData.name}
          error={errors.name}
        />
        <TextInputEffectLabel
          label="Email"
          onChangeText={(text) => handleInputChange('email', text)}
          value={formData.email}
          error={errors.email}
        />
        <TextInputEffectLabel
          label="Password"
          type="password"
          onChangeText={(text) => handleInputChange('password', text)}
          value={formData.password}
          error={errors.password}
        />
        <TextInputEffectLabel
          label="Re-enter password"
          type="password"
          onChangeText={(text) => handleInputChange('confirmPassword', text)}
          value={formData.confirmPassword}
          error={errors.confirmPassword}
        />
        <View style={styles.toggle}>
          <TouchableOpacity
            style={[
              styles.toggleActive,
              {
                backgroundColor: !isChecked ? '#EFEFF1' : '#315F64',
              },
            ]}
            onPress={handleSubmit}
            disabled={!isChecked}
          >
            <Text
              style={[
                styles.activeText,
                {
                  color: !isChecked ? '#CACECE' : '#fff',
                },
              ]}
            >
              Create account
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toggleInactive}
            onPress={() => navigation.navigate('SignInScreen')}
          >
            <Text style={styles.inactiveText}>I already have an account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CreateAccountScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  brand: {},
  brandText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colours.deepTurquoise,
    letterSpacing: 8,
    textAlign: 'center',
    paddingVertical: 40,
  },
  signUp: {
    paddingHorizontal: 25,
  },
  headerFormText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  formSignIn: {},
  input: {
    marginBottom: 20,
  },
  policy: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
  },
  policyText: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  primaryText: {
    color: '#539ca4',
    fontWeight: '500',
  },
  checkbox: {
    marginTop: 2,
  },
  toggle: {},
  toggleActive: {
    borderRadius: 100,
    marginTop: 32,
  },
  activeText: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  toggleInactive: {
    borderRadius: 100,
    marginTop: 16,
  },
  inactiveText: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#222C2D',
    textAlign: 'center',
  },
});
