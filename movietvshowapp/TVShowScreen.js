import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation,useRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';


const API_KEY = '2a82a5e3e147c095274810065fb56a8d';

export default function TVShowScreen() {
  const navigation = useNavigation();
  const [tvShows, setTVShows] = useState([]);
  const [genres, setGenres] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const route = useRoute();
  const { username } = route.params;

  useEffect(() => {
    fetchTVShows(currentPage);
    fetchGenres();
  }, [currentPage]);

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

  const fetchTVShows = async (page) => {
    try {
      const response = await fetch(`https://api.themoviedb.org/3/tv/popular?api_key=${API_KEY}&page=${page}`);
      const data = await response.json();

      const combinedResults = [...data.results];
      const sortedTVShows = combinedResults.sort((a, b) => a.name.localeCompare(b.name));
      setTVShows(sortedTVShows);
    } catch (error) {
      console.error('Error fetching TV shows', error);
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await fetch(`https://api.themoviedb.org/3/genre/tv/list?api_key=${API_KEY}`);
      const data = await response.json();
      const genreMap = {};
      data.genres.forEach(genre => {
        genreMap[genre.id] = genre.name;
      });
      setGenres(genreMap);
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const renderStars = (rating) => {
    const filledStars = Math.floor(rating / 2);
    const halfStar = rating % 2 === 1;
    const emptyStars = 5 - filledStars - (halfStar ? 1 : 0);
    const stars = '★'.repeat(filledStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
    return stars;
  };

  const handleRefresh = async () => {
  setRefreshing(true);

  try {
    await fetchTVShows(currentPage);
  } catch (error) {
    console.error('Error fetching TV shows', error);
  }

  setRefreshing(false);
};

  
const scrollViewRef = useRef(null);

const handlePageChange = (page) => {
  setCurrentPage(page);
  scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
};

  return (
  <View style={styles.mainContainer}>
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 60 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
    {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('./assets/logo_MovieTVShow.png')}
          style={styles.logo}
          resizeMode="contain"
        />
    </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All TV Shows</Text>
        <View style={styles.tvList}>
          {tvShows.map((item, index) => (
            <View key={index} style={styles.tvContainer}>
              <TouchableOpacity onPress={() => navigation.navigate('TVShowDetails', { tvShow: item, genres })}>
                <Image
                  source={
                    item.poster_path
                      ? { uri: `https://image.tmdb.org/t/p/w200${item.poster_path}` }
                      : require('./assets/default-image.png')
                  }
                  style={[
                    styles.tvThumbnail,
                    !item.poster_path && styles.defaultThumbnail,
                  ]}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <View style={styles.tvDetails}>
                <TouchableOpacity onPress={() => navigation.navigate('TVShowDetails', { tvShow: item, genres })}>
                  <Text style={styles.tvTitle}>{item.name}</Text>
                </TouchableOpacity>

                <Text style={styles.tvGenre}>
                  {item.genre_ids.map(genreId => genres[genreId]).join(', ')}
                </Text>

                <Text style={styles.tvRatings}>{renderStars(item.vote_average)}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.pagination}>
          {Array.from({ length: Math.ceil(tvShows.length / 10) }, (_, index) => (
            <TouchableOpacity key={index} style={[styles.pageNumber, currentPage === index + 1 && 
            styles.currentPageNumber,]} onPress={() => handlePageChange(index + 1)}>
              <Text style={styles.pageNumberText}>{index + 1}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
    <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={() => {navigation.navigate('Home', { username }), impactAsync('heavy');}} style={styles.button}>
          <Image source={require('./assets/homeicon.png')} style={styles.homeIcon}/>
          <Text style={styles.buttonText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {navigation.navigate('Movies', { username }), impactAsync('heavy');}} style={styles.button}>
          <Image source={require('./assets/movieicon.png')} style={styles.movieIcon}/>
          <Text style={styles.buttonText}>Movies</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {navigation.navigate('Profile', { username }), impactAsync('heavy');}} style={styles.button}>
          <Image source={require('./assets/blankprofilepic.png')} style={styles.profileIcon}/>
          <Text style={styles.buttonText}>Profile</Text>
        </TouchableOpacity>

    </View>
  </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#281C4B',
  },
  section: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 20,
    color: '#FFFFFF',
  },
  tvList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tvContainer: {
    width: '48%',
    marginBottom: 20,
    flexDirection: 'column',
    alignItems: 'center',
  },
  tvThumbnail: {
    width: '100%',
    aspectRatio: 3 / 4,
  },
  tvDetails: {
    width: '100%',
    alignItems: 'center',
  },
  tvTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 5,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  tvGenre: {
    fontSize: 14,
    color: '#FFD700',
    marginBottom: 5,
    textAlign: 'center',
  },
  tvRatings: {
    fontSize: 14,
    color: '#FFD700',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  pageNumber: {
    marginHorizontal: 5,
    padding: 5,
    borderRadius: 20,
    backgroundColor: '#E44032',
  },
  currentPageNumber: {
    backgroundColor: '#FF6B5E',
  },
  pageNumberText: {
    color: 'white',
    fontWeight: 'bold',
  },
  defaultThumbnail: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: '#666',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  logo: {
    width: 150,
    height: 75,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#281C4B',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  button: {
    alignItems: 'center',
  },

  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 5,
  },
  homeIcon: {
    alignItems: 'center',
    width: 30,
    height: 30,
  },
  profileIcon: {
    alignItems: 'center',
    width: 30,
    height: 30,
  },
  movieIcon: {
    alignItems: 'center',
    width: 30,
    height: 30,
  },
});
