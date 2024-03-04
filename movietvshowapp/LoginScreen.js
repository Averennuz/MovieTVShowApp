import { useState, useEffect } from 'react';
import { Image, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';

const API_KEY = '2a82a5e3e147c095274810065fb56a8d';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);

  useEffect(() => {
    const registerPushNotifications = async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        setExpoPushToken(token);

        // Set up notification listeners
        const notificationListener = Notifications.addNotificationReceivedListener(notification => {
          setNotification(notification);
        });

        const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
          console.log(response);
        });

        return () => {
          Notifications.removeNotificationSubscription(notificationListener);
          Notifications.removeNotificationSubscription(responseListener);
        };
      } catch (error) {
        console.error('Error registering push notifications:', error);
      }
    };

    registerPushNotifications();
  }, []);

  const handleLogin = async () => {
    try {
      // Validate input fields
      if (username === '' || password === '') {
        setError('Please input your username and password.');
         Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }

      const response = await fetch(`https://api.themoviedb.org/3/authentication/token/new?api_key=${API_KEY}`);
      
      if (response.ok) {
        await schedulePushNotification(username);
        
        navigation.navigate('Home', { username: `${username}` });
      } else {
        setError('Failed to authenticate');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function schedulePushNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Login  successfull! 📬",
        body: `Welcome, ${username}!`,
        data: { data: 'notification data' },
      },
      trigger: { seconds: 1 },
    });
  }

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    } else if (Platform.OS === 'ios') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      sound: true,
    });
  }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: 'a6fd7ce0-6164-42cc-b9c3-788ff71c7259',
      })).data;
      console.log('Expo Push Token:', token);
    } else {
      alert('Must use physical device for Push Notifications');
    }

    return token;
  }

    function impactAsync(style) {
    switch (style) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      default:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
    }
  }

  return (
    <View style={styles.container}>
      <Image source={require('./assets/logo_MovieTVShow.png')} style={styles.logo} />
      <Text style={styles.textTitle}>Movie and TV show</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        placeholderTextColor="#999"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholderTextColor="#999"
      />

      <TouchableOpacity style={styles.button} onPress={() => {
        impactAsync('heavy');
        handleLogin();
        Haptics.selectionAsync();
        }}>
        <Text style={styles.buttonText}>LOGIN</Text>
      </TouchableOpacity>

    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#281C4B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    marginTop: 10,
    marginBottom: 20,
  },
  input: {
    width: '60%',
    color: '#FFFFFF',
    padding: 10,
    marginBottom: 10,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  button: {
    backgroundColor: '#E44032',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
    width: '60%',
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logo: {
    width: 300,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 0,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});
