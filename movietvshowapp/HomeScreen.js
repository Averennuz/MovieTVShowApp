import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  Platform,
  RefreshControl,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute } from '@react-navigation/native';

const API_KEY = '2a82a5e3e147c095274810065fb56a8d';

export default function HomeScreen() {
  const [randomMovies, setRandomMovies] = useState([]);
  const [randomTVShows, setRandomTVShows] = useState([]);
  const [genres, setGenres] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const { username } = route.params;

  useEffect(() => {
    fetchGenres();
    fetchMovies();
    fetchTVShows();
  }, []);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const fetchTVShows = async () => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}`
      );
      const data = await response.json();
      const randomTvShowResults = shuffleArray(data.results);
      setRandomTVShows(randomTvShowResults);
    } catch (error) {
      console.error('Error fetching TV shows:', error);
    }
  };

  const fetchMovies = async () => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}`
      );
      const data = await response.json();
      const randomMovieResults = shuffleArray(data.results);
      setRandomMovies(randomMovieResults);
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  // Fetch genre
  const fetchGenres = async () => {
    try {
      const movieResponse = await fetch(
        `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`
      );
      const movieData = await movieResponse.json();

      const tvShowResponse = await fetch(
        `https://api.themoviedb.org/3/genre/tv/list?api_key=${API_KEY}`
      );
      const tvShowData = await tvShowResponse.json();

      const genreMap = {};

      movieData.genres.forEach((genre) => {
        genreMap[genre.id] = genre.name;
      });

      tvShowData.genres.forEach((genre) => {
        genreMap[genre.id] = genre.name;
      });

      setGenres(genreMap);
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  // Handle search bar
  const handleSearch = async () => {
    try {
      if (searchQuery.trim() === '') {
        setSearchResults([]);
        return;
      }

      const response = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(
          searchQuery
        )}`
      );
      const data = await response.json();

      // Filter out results without genre_ids
      const filteredResults = data.results.filter((result) => result.genre_ids);

      // Update the genres based on the genre mapping you fetched
      const updatedResults = filteredResults.map((result) => {
        const genresArray = result.genre_ids.map((genreId) => genres[genreId]);
        return {
          ...result,
          genres: genresArray.join(', '),
        };
      });

      setSearchResults(updatedResults);
      navigation.navigate('SearchResults', {
        searchResults: updatedResults,
        genres,
      });
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const renderStars = (rating) => {
    const filledStars = Math.floor(rating / 2);
    const halfStar = rating % 2 === 1;
    const emptyStars = 5 - filledStars - (halfStar ? 1 : 0);
    const stars =
      '★'.repeat(filledStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
    return stars;
  };

  // For the button when it pressed
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

  // To refresh the search
  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await fetchMovies();
      await fetchTVShows();
    } catch (error) {
      console.error('Error fetching data:', error);
    }

    setRefreshing(false); // Set refreshing state back to false when done
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        <View style={styles.logoContainer}>
          <Image
            source={require('./assets/logo_MovieTVShow.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.searchBarContainer}>
          <View style={styles.searchInputContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for movies and TV shows"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity
              style={styles.searchbutton}
              onPress={() => {
                impactAsync('heavy');
                handleSearch();
              }}>
              <Text style={styles.searchbuttonText}>SEARCH</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Most Popular Movies</Text>
          <View style={styles.movieList}>
            {randomMovies.map((item, index) => (
              <View key={index} style={styles.movieContainer}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('MovieDetails', { movie: item, genres })
                  }>
                  <Image
                    source={
                      item.poster_path
                        ? {
                            uri: `https://image.tmdb.org/t/p/w200${item.poster_path}`,
                          }
                        : require('./assets/default-image.png')
                    }
                    style={[
                      styles.movieThumbnail,
                      !item.poster_path && styles.defaultThumbnail,
                    ]}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                <View style={styles.movieDetails}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('MovieDetails', {
                        movie: item,
                        genres,
                      })
                    }>
                    <Text style={styles.movieTitle}>
                      {item.title || item.name}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.movieGenre}>
                    {item.genre_ids
                      .map((genreId) => genres[genreId])
                      .join(', ')}
                  </Text>
                  <Text style={styles.movieRatings}>
                    {renderStars(item.vote_average)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Most Popular TV Shows</Text>
          <View style={styles.movieList}>
            {randomTVShows.map((item, index) => (
              <View key={index} style={styles.movieContainer}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('TVShowDetails', {
                      tvShow: item,
                      genres,
                    })
                  }>
                  <Image
                    source={
                      item.poster_path
                        ? {
                            uri: `https://image.tmdb.org/t/p/w200${item.poster_path}`,
                          }
                        : require('./assets/default-image.png')
                    }
                    style={[
                      styles.movieThumbnail,
                      !item.poster_path && styles.defaultThumbnail,
                    ]}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                <View style={styles.movieDetails}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('TVShowDetails', {
                        tvShow: item,
                        genres,
                      })
                    }>
                    <Text style={styles.movieTitle}>
                      {item.title || item.name}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.movieGenre}>
                    {item.genre_ids
                      .map((genreId) => genres[genreId])
                      .join(', ')}
                  </Text>
                  <Text style={styles.movieRatings}>
                    {renderStars(item.vote_average)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Movies', { username }), impactAsync('heavy');
          }}
          style={styles.button}>
          <Image
            source={require('./assets/movieicon.png')}
            style={styles.movieIcon}
          />
          <Text style={styles.buttonText}>Movies</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            navigation.navigate('TVShows', { username }), impactAsync('heavy');
          }}
          style={styles.button}>
          <Image
            source={require('./assets/tvicon.png')}
            style={styles.tvIcon}
          />
          <Text style={styles.buttonText}>TV Shows</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Profile', { username }), impactAsync('heavy');
          }}
          style={styles.button}>
          <Image
            source={require('./assets/blankprofilepic.png')}
            style={styles.profileIcon}
          />
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
  searchBarContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    marginRight: 10,
    padding: 8,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  searchbutton: {
    backgroundColor: '#E44032',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
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

  searchbuttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 15,
    padding: 3,
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
  tvIcon: {
    alignItems: 'center',
    width: 35,
    height: 30,
  },
});
