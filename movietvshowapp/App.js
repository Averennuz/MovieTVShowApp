import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics'; // Import Haptic module
import LoginScreen from './LoginScreen';
import HomeScreen from './HomeScreen';
import MovieScreen from './MovieScreen';
import TVShowScreen from './TVShowScreen';
import MovieDetailScreen from './MovieDetailScreen';
import TVShowDetailScreen from './TVShowDetailScreen';
import SearchResultsScreen from './SearchResultsScreen';
import ProfileScreen from './ProfileScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MovieDetails" component={MovieDetailScreen} />
        <Stack.Screen name="TVShowDetails" component={TVShowDetailScreen} />
        <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Movies" component={MovieScreen} />
        <Stack.Screen name="TVShows" component={TVShowScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
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

function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Image
        source={require('./assets/logo_MovieTVShow.png')}
        style={styles.logo}
      />
      <Text style={styles.textTitle}>Movie and TV show</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          impactAsync('heavy');
          navigation.navigate('Login');
        }}>
        <Text style={styles.buttonText}>SIGN IN</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#281C4B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#E44032',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textTitle: {
    color: '#FFFFFF',
    fontFamily: 'League Spartan',
    fontSize: 24,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  logo: {
    width: 300, // Adjust the width as needed
    height: 100, // Adjust the height as needed
    resizeMode: 'contain', // Adjust the resizeMode as needed
    marginBottom: 0,
  },
});
