import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import { DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer';
import { LinearGradient } from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const wp = (percent:number) => (width * percent) / 100;
const hp = (percent:number) => (height * percent) / 100;

const CustomDrawerContent :React.FC<DrawerContentComponentProps>= (props) => {
  const { navigation } = props;
  
  const menuItems = [
    { name: 'Login', route: 'LoginPage', icon: '🔑' },
    { name: 'Sign Up', route: 'SignupPage', icon: '✨' },
    { name: 'Premium', route: 'Premium', icon: '⭐' },
    { name: 'Profile', route: 'Profile', icon: '👤' },
  ];

  return (
    <LinearGradient
      colors={['#333333', '#222222', '#111111', '#000000']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.gradient}
    >
      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBackground}>
              <Text style={styles.logoText}>A</Text>
            </View>
          </View>
          <Text style={styles.appName}>Movie Explorer</Text>
          <Text style={styles.tagline}>Deep-Dive into Movies</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.route)}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>{item.icon}</Text>
              </View>
              <Text style={styles.menuText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.footerButton}
            onPress={() => navigation.navigate('Settings')}

          >
            <Text style={styles.footerButtonText}>Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.footerButton}
            onPress={() => navigation.navigate('Help')}
          >
            <Text style={styles.footerButtonText}>Help & Support</Text>
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>
    </LinearGradient>
  );
};

export default CustomDrawerContent;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingTop: hp(4),
  },
  header: {
    alignItems: 'center',
    paddingBottom: hp(3),
  },
  logoContainer: {
    marginBottom: hp(1),
  },
  logoBackground: {
    width: wp(15),
    height: wp(15),
    borderRadius: wp(7.5),
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoText: {
    fontSize: wp(8),
    color: 'white',
    fontWeight: 'bold',
  },
  appName: {
    fontSize: wp(5.5),
    fontWeight: 'bold',
    color: 'white',
    marginBottom: hp(0.5),
  },
  tagline: {
    fontSize: wp(3.5),
    color: '#ccc',
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: wp(5),
    marginBottom: hp(3),
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: wp(5),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1.8),
    marginBottom: hp(1.5),
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: wp(4),
  },
  iconContainer: {
    width: wp(8),
    height: wp(8),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: wp(4),
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginRight: wp(3),
  },
  icon: {
    fontSize: wp(4),
  },
  menuText: {
    color: 'white',
    fontSize: wp(4.2),
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: wp(5),
    paddingBottom: hp(3),
  },
  footerButton: {
    paddingVertical: hp(1.5),
    marginTop: hp(1),
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  footerButtonText: {
    color: '#ccc',
    fontSize: wp(3.8),
  },
});