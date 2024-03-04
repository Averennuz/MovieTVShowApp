import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation,useRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

const API_KEY = '2a82a5e3e147c095274810065fb56a8d';

export default function MovieScreen() {
  const navigation = useNavigation();
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const route = useRoute();
  const { username } = route.params;

  useEffect(() => {
    fetchMovies(currentPage);
    fetchGenres();
  }, [currentPage]);

  const fetchMovies = async (page) => {
    try {
      const response = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=${page}`);
      const data = await response.json();

      const combinedResults = [...data.results];
      const sortedMovies = combinedResults.sort((a, b) => a.title.localeCompare(b.title));
      setMovies(sortedMovies);
    } catch (error) {
      console.error('Error fetching movies', error);
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`);
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
    setRefreshing(true); // Set refreshing state to true

    await fetchMovies(currentPage); // Call the function to fetch movies again

    setRefreshing(false); // Set refreshing state back to false when done
  };
  
  const scrollViewRef = useRef(null);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
  };

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
        <Text style={styles.sectionTitle}>All Movies</Text>
        <View style={styles.movieList}>
          {movies.map((item, index) => (
            <View key={index} style={styles.movieContainer}>
              <TouchableOpacity onPress={() => navigation.navigate('MovieDetails', { movie: item, genres })}>
                <Image
                  source={{ uri: `https://image.tmdb.org/t/p/w200${item.poster_path}` }}
                  style={styles.movieThumbnail}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <View style={styles.movieDetails}>
                <TouchableOpacity onPress={() => navigation.navigate('MovieDetails', { movie: item, genres })}>
                  <Text style={styles.movieTitle}>{item.title || item.name}</Text>
                </TouchableOpacity>
                <Text style={styles.movieGenre}>
                  {item.genre_ids.map(genreId => genres[genreId]).join(', ')}
                </Text>
                <Text style={styles.movieRatings}>{renderStars(item.vote_average)}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.pagination}>
          {Array.from({ length: Math.ceil(movies.length / 10) }, (_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.pageNumber,
                currentPage === index + 1 && styles.currentPageNumber,
              ]}
              onPress={() => handlePageChange(index + 1)}
            >
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

        <TouchableOpacity onPress={() => {navigation.navigate('TVShows', { username }), impactAsync('heavy');}} style={styles.button}>
          <Image source={require('./assets/tvicon.png')} style={styles.tvIcon}/>
          <Text style={styles.buttonText}>TV Shows</Text>
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
  movieList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  movieContainer: {
    width: '48%',
    marginBottom: 20,
    flexDirection: 'column',
    alignItems: 'center',
  },
  movieThumbnail: {
    width: '100%',
    aspectRatio: 3 / 4,
  },
  movieDetails: {
    width: '100%',
    alignItems: 'center',
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 5,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  movieGenre: {
    fontSize: 14,
    color: '#FFD700',
    marginBottom: 5,
    textAlign: 'center',
  },
  movieRatings: {
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
    profileIcon: {
    alignItems: 'center',
    width: 30,
    height: 30,
  },
  homeIcon: {
    alignItems: 'center',
    width: 30,
    height: 30,
  },
  tvIcon: {
    alignItems: 'center',
    width: 35,
    height: 30,
  },
});
