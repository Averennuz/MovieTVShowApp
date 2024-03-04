import { View, Text, StyleSheet, Image } from 'react-native';

const ProfileScreen = ({ route }) => {
  const { username } = route.params;

  return (
    <View style={styles.container}>
      //Profile Picture
      <Image
        source={require('./assets/blankprofilepic.png')}
        style={styles.profilePic}
      />
      //Welcome Message
      <Text style={styles.welcomeText}>'Welcome', {username}'!'</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#281C4B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePic: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff'
  },
});

export default ProfileScreen;
