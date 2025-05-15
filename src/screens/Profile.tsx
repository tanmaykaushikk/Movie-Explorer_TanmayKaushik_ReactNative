import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const wp = (percent: number) => (width * percent) / 100;
const hp = (percent: number) => (height * percent) / 100;

const Profile = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    premiumSubscribed: false,
  });
  const [loading, setLoading] = useState(true);

  const loadUserData = async () => {
    try {
      const userString = await AsyncStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        setUserData({
          name: user.name || 'User Name',
          email: user.email || 'user@example.com',
          phone: user.phone || '+1 234 567 8900',
          role: user.role || 'user',
          premiumSubscribed: user.premiumSubscribed || false,
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Unable to load user profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserData(); // Refresh user data on focus
    });
    return unsubscribe;
  }, [navigation]);

  const renderField = (label: string, value: string) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="silver" />
        <Text style={styles.loaderText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(28, 28, 28, 0.94)', 'rgb(0, 3, 6)']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Image
                  // source={require('../assets/Images/back.png')} // Add back icon
                  style={styles.backIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>My Profile</Text>
              <View style={styles.placeholder} />
            </View>

            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                <Image
                  source={require('../assets/Images/user.png')}
                  style={styles.avatar}
                  resizeMode="cover"
                />
                <View style={[styles.statusBadge, userData.premiumSubscribed ? styles.premiumStatus : styles.freeStatus]}>
                  <Text style={styles.statusText}>{userData.premiumSubscribed ? 'Premium' : 'Free'}</Text>
                </View>
              </View>

              <Text style={styles.userName}>{userData.name}</Text>
              <Text style={styles.userRole}>{userData.role === 'supervisor' ? 'Admin' : 'User'}</Text>
            </View>

            <View style={styles.infoContainer}>
              {/* Personal Information Section */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                <View style={styles.divider} />
                {renderField('Name', userData.name)}
                {renderField('Email', userData.email)}
                {renderField('Phone', userData.phone)}
                {renderField('Role', userData.role === 'supervisor' ? 'Admin' : 'User')}
              </View>

              {/* Subscription Section */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Subscription</Text>
                <View style={styles.divider} />
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Status</Text>
                  <View
                    style={[
                      styles.subscriptionStatus,
                      userData.premiumSubscribed ? styles.premiumStatus : styles.freeStatus,
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {userData.premiumSubscribed ? 'Premium' : 'Free'}
                    </Text>
                  </View>
                </View>

                {!userData.premiumSubscribed && (
                  <TouchableOpacity
                    style={styles.upgradeButton}
                    onPress={() => navigation.navigate('Premium')}
                  >
                    <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Logout Button */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.logoutButton}
                  onPress={async () => {
                    try {
                      await AsyncStorage.removeItem('user');
                      await AsyncStorage.removeItem('token');
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'Login' }],
                      });
                    } catch (error) {
                      console.error('Error logging out:', error);
                      Alert.alert('Error', 'Failed to log out');
                    }
                  }}
                >
                  <Text style={styles.buttonText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: wp(5),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: hp(8),
    marginBottom: hp(2),
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    width: wp(6),
    height: hp(3),
    tintColor: 'white',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: wp(6),
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: hp(3),
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: hp(2),
  },
  avatar: {
    width: wp(30),
    height: wp(30),
    borderRadius: wp(30) / 2,
    borderWidth: 3,
    borderColor: '#444',
  },
  statusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  premiumStatus: {
    backgroundColor: '#1DB954',
  },
  freeStatus: {
    backgroundColor: '#555',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: 'silver',
    marginBottom: hp(1),
  },
  infoContainer: {
    flex: 1,
    marginTop: hp(2),
  },
  sectionContainer: {
    backgroundColor: 'rgba(40, 40, 40, 0.6)',
    borderRadius: 12,
    padding: wp(5),
    marginBottom: hp(2),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#444',
    marginBottom: hp(2),
  },
  fieldContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  fieldLabel: {
    fontSize: 16,
    color: 'silver',
    flex: 1,
  },
  fieldValue: {
    fontSize: 16,
    color: 'white',
    flex: 2,
    textAlign: 'right',
  },
  subscriptionStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  upgradeButton: {
    backgroundColor: '#1DB954',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: hp(1),
  },
  upgradeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: hp(2),
    marginBottom: hp(4),
  },
  logoutButton: {
    backgroundColor: '#B91D1D',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: 'rgb(0, 3, 6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: hp(2),
    color: 'silver',
    fontSize: 16,
  },
});