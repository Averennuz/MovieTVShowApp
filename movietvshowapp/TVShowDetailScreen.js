import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { FlatList, ScrollView } from 'react-native';

const TVShowDetailScreen = ({ route }) => {
  const { tvShow, genres } = route.params;
  const [cast, setCast] = useState([]);
  const [directors, setDirectors] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [expandedReviews, setExpandedReviews] = useState({});

  const toggleExpand = (reviewId) => {
    setExpandedReviews((prevState) => ({
      ...prevState,
      [reviewId]: !prevState[reviewId],
    }));
  };

  const API_KEY = '2a82a5e3e147c095274810065fb56a8d';

  useEffect(() => {
    fetchTVShowDetails(tvShow.id);
  }, [tvShow.id]);

  const fetchTVShowDetails = async (tvShowId) => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/${tvShowId}/credits?api_key=${API_KEY}`
      );
      const data = await response.json();
      const tvShowCast = data.cast.slice(0, 5);
      const tvShowCrew = data.crew.filter((member) => member.job === 'Director');
      setCast(tvShowCast);
      setDirectors(tvShowCrew);

      const reviewsResponse = await fetch(
        `https://api.themoviedb.org/3/tv/${tvShowId}/reviews?api_key=${API_KEY}`
      );
      const reviewsData = await reviewsResponse.json();
      setReviews(reviewsData.results);
    } catch (error) {
      console.error('Error fetching TV show details:', error);
    }
  };

  // Function to convert rating to star icons
  const renderStars = (rating) => {
    const filledStars = Math.floor(rating / 2);
    const halfStar = rating % 2 === 1;
    const emptyStars = 5 - filledStars - (halfStar ? 1 : 0);
    const stars =
      '★'.repeat(filledStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
    return stars;
  };

  const renderReviewContent = (content, reviewId) => {
    const maxLength = 150;
    const shouldTruncate = content.length > maxLength;

    return (
      <View style={styles.reviewContentContainer}>
        <Text style={styles.reviewContentText}>
          {shouldTruncate && !expandedReviews[reviewId]
            ? `${content.slice(0, maxLength)}...`
            : content}
        </Text>
        {shouldTruncate && (
          <TouchableOpacity
            onPress={() => toggleExpand(reviewId)}
            style={styles.readMore}
          >
            <Text style={styles.readMoreText}>
              {expandedReviews[reviewId] ? 'Read Less' : 'Read More'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const maxLength = 1000;

  return (
    <ScrollView style={styles.container}>
      // Logo
      <View style={styles.logoContainer}>
        <Image 
        source={require('./assets/logo_MovieTVShow.png')}
        style={styles.logo}
        resizeMode="contain"
        />
    </View>
    <Text style={styles.pageTitle}>TV Show</Text>
    <Image
      source={{ uri: `https://image.tmdb.org/t/p/w500${tvShow.poster_path}` }}
      style={styles.TVPoster}
      resizeMode="contain"
    />
    <Text style={styles.tvTitle}>{tvShow.name}</Text>
    <Text style={styles.description}>{tvShow.overview}</Text>
    {tvShow.genre_ids && tvShow.genre_ids.length > 0 && (
      <Text style={styles.genres}>
        Genres: {tvShow.genre_ids.map((genreId) => genres[genreId]).join(', ')}
      </Text>
    )}
    <View style={styles.castContainer}>
      <Text style={styles.castTitle}>Cast:</Text>
      <Text style={styles.castNames}>
        {cast.map((actor) => actor.name).join(', ')}
      </Text>
    </View>
    {directors.length > 0 && (
      <View style={styles.directorContainer}>
        <Text style={styles.directorTitle}>
          Director{directors.length > 1 ? 's' : ''}:
        </Text>
        <Text style={styles.directorNames}>
          {directors.map((director) => director.name).join(', ')}
        </Text>
      </View>
    )}
    <View style={styles.ratingContainer}>
      <Text style={styles.ratingText}>Rating:</Text>
      <Text style={styles.ratingStars}>{renderStars(tvShow.vote_average)}</Text>
    </View>
    {reviews.length > 0 && (
      <View style={styles.reviewsContainer}>
        <Text style={styles.reviewsTitle}>Reviews:</Text>
        <FlatList
          horizontal
          data={reviews}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewAuthor}>{item.author}</Text>
                <View style={styles.reviewRating}>
                  <Text style={styles.reviewRatingText}>
                    {item.author_details.rating}
                  </Text>
                </View>
              </View>
              <View style={styles.reviewContentContainer}>
                <Text style={styles.reviewContentText}>
                  {item.content.length > maxLength && !expandedReviews[item.id]
                    ? `${item.content.slice(0, maxLength)}...`
                    : item.content}
                </Text>
                {item.content.length > maxLength && (
                  <TouchableOpacity
                    onPress={() => toggleExpand(item.id)}
                    style={styles.readMore}
                  >
                    <Text style={styles.readMoreText}>
                      {expandedReviews[item.id] ? 'Read Less' : 'Read More'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          contentContainerStyle={styles.reviewList}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    )}
  </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#281C4B',
    padding: 20,
  },
  TVPoster: {
    width: '100%',
    height: 300,
    borderRadius: 10,
  },
  pageTitle:{
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  tvTitle: {
    fontSize: 25,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
  },
  description: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  ratingText: {
    fontSize: 16,
    color: '#FFD700',
    marginRight: 5,
  },
  ratingStars: {
    fontSize: 16,
    color: '#FFD700',
  },
  genres: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
  },
  castContainer: {
    marginTop: 10,
  },
  castTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
  },
  castNames: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 5,
  },
  directorContainer: {
    marginTop: 10,
  },
  directorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
  },
  directorNames: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 5,
  },
  reviewsContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  reviewList: {
    paddingVertical: 10,
  },
  reviewItem: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    width: 280,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  reviewAuthor: {
    fontSize: 14,
    color: '#FFD700',
  },
  reviewRating: {
    backgroundColor: '#FFD700',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  reviewRatingText: {
    fontSize: 12,
    color: '#000000',
    fontWeight: 'bold',
  },
  reviewContentContainer: {
    marginTop: 5,
  },
  reviewContentText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  readMore: {
    marginTop: 1,
  },
  readMoreText: {
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    flex: 1,
  },
  logo: {
    width: 150, 
    height: 100,
  }
});

export default TVShowDetailScreen;