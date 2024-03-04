import { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const SearchResultsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { searchResults, genres } = route.params;
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

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
    await searchResults(currentPage);
    } catch (error) {
      console.error('Error fetching TV shows', error);
  }

  setRefreshing(false);
  };

  const scrollViewRef = useRef(null);

 return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Search Results</Text>
        <View style={styles.resultList}>
          {searchResults.map((item, index) => (
            <View key={index} style={styles.resultContainer}>
              <TouchableOpacity
                onPress={() => {
                  if (item.media_type === 'movie') {
                    navigation.navigate('MovieDetails', { movie: item, genres });
                  } else if (item.media_type === 'tv') {
                    navigation.navigate('TVShowDetails', { tvShow: item, genres });
                  }
                }}
              >
                <Image
                  source={
                    item.poster_path
                      ? { uri: `https://image.tmdb.org/t/p/w200${item.poster_path}` }
                      : require('./assets/default-image.png')
                  }
                  style={[
                    styles.resultThumbnail,
                    !item.poster_path && styles.defaultThumbnail,
                  ]}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <View style={styles.resultDetails}>
                <TouchableOpacity
                  onPress={() => {
                    if (item.media_type === 'movie') {
                      navigation.navigate('MovieDetails', { movie: item, genres });
                    } else if (item.media_type === 'tv') {
                      navigation.navigate('TVShowDetails', { tvShow: item, genres });
                    }
                  }}
                >
                  <Text style={styles.resultTitle}>{item.title || item.name}</Text>
                </TouchableOpacity>
                {item.genre_ids && (
                  <Text style={styles.resultGenre}>
                    {item.genre_ids.map(genreId => genres[genreId]).join(', ')}
                  </Text>
                )}
                <Text style={styles.resultRatings}>
                  {item.vote_average && renderStars(item.vote_average)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  resultList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  resultContainer: {
    width: '48%',
    marginBottom: 20,
    flexDirection: 'column',
    alignItems: 'center',
  },
  resultThumbnail: {
    width: '100%',
    aspectRatio: 3 / 4,
  },
  resultDetails: {
    width: '100%',
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 5,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  resultGenre: {
    fontSize: 14,
    color: '#FFD700',
    marginBottom: 5,
    textAlign: 'center',
  },
  resultRatings: {
    fontSize: 14,
    color: '#FFD700',
  },
  defaultThumbnail: {
    aspectRatio: 3 / 4,
    backgroundColor: '#666',
  },
});

export default SearchResultsScreen;