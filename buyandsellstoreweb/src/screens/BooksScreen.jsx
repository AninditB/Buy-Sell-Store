import React, { useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../context/UserContext";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

const GET_BOOKS = gql`
  query GetBooks {
    books {
      id
      title
      author
      price
      imageUrl
      ratings
      sellerId
    }
  }
`;

const GET_RECOMMENDATIONS = gql`
  query RecommendBooks($userId: ID!) {
    recommendBooksForUser(userId: $userId) {
      id
      title
      author
      price
      imageUrl
      ratings
    }
  }
`;

const genreMap = {
  All: null,
  Philosophy: "680164353f557f359a63b20c",
  "Sci-Fi": "6801643b3f557f359a63b20d",
  Horror: "680164413f557f359a63b20e",
  Autobiography: "680164483f557f359a63b20f",
  Kids: "6801644e3f557f359a63b210",
};

const Books = () => {
  const { user } = useUserContext();
  const {
    loading,
    error,
    data,
    refetch,
    networkStatus,
  } = useQuery(GET_BOOKS, {
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    refetch();
  }, [refetch]);

  
  const { data: recommendedData } = useQuery(GET_RECOMMENDATIONS, {
    variables: { userId: user?.id || "guest" },
    skip: !user?.id,
  });

  const [books, setBooks] = useState([]);
  const [genre, setGenre] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (data && data.books && !loading) {
      setBooks(data.books);
    }
  }, [data]);

  const filteredBooks = books.filter((book) => {
    const matchesGenre = !genreMap[genre] || book.sellerId === genreMap[genre];
    const matchesSearch =
      book.title.toLowerCase().includes(searchText.toLowerCase()) ||
      book.author.toLowerCase().includes(searchText.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  const recommendedBooks = recommendedData?.recommendBooksForUser ?? [];

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
    arrows: true,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2, slidesToScroll: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  };

  const theme = darkMode ? darkStyles : lightStyles;

  if (loading || networkStatus === 4) return <p>Loading books...</p>;

  if (error) return <p>Error loading books: {error.message}</p>;

  return (
    <div style={theme.container}>
      <div style={theme.topBar}>
        <h1 style={theme.header}>Books</h1>
        <button onClick={() => setDarkMode(!darkMode)} style={theme.toggleBtn}>
          {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      <div style={theme.controls}>
        <input
          type="text"
          placeholder="Search by title or author"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={theme.searchBar}
        />
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          style={theme.dropdown}
        >
          {Object.keys(genreMap).map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {recommendedBooks.length > 0 && (
  <>
    <h2 style={theme.sectionTitle}>📚 Recommended For You</h2>
    <div style={theme.sliderWrapper}>
      <Slider {...sliderSettings}>
        {recommendedBooks.slice(0, 7).map((book) => (
          <div
            key={book.id}
            style={theme.bookTile}
            onClick={() => navigate(`/book/${book.id}`)}
          >
            <img src={book.imageUrl} alt={book.title} style={theme.bookImage} />
            <h2 style={theme.bookTitle}>{book.title}</h2>
            <p style={theme.bookAuthor}>By {book.author}</p>
            <p style={theme.bookPrice}>${book.price.toFixed(2)}</p>
            <p style={theme.bookRatings}>Ratings: {book.ratings.toFixed(1)} / 5</p>
          </div>
        ))}
      </Slider>
    </div>
  </>
)}

{recommendedBooks.length === 0 && (
  <div style={theme.noRecBox}>
    <p style={theme.noRecText}>
      🧐 No recommendations yet!<br />
      <strong>Rate or buy some books</strong> to get personalized suggestions.
    </p>
  </div>
)}

      <h2 style={theme.sectionTitle}>All Books</h2>
      <div style={theme.booksGrid}>
        {filteredBooks.map((book) => (
          <div
            key={book.id}
            style={theme.bookTile}
            onClick={() => navigate(`/book/${book.id}`)}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <img src={book.imageUrl} alt={book.title} style={theme.bookImage} />
            <h2 style={theme.bookTitle}>{book.title}</h2>
            <p style={theme.bookAuthor}>By {book.author}</p>
            <p style={theme.bookPrice}>${book.price.toFixed(2)}</p>
            <p style={theme.bookRatings}>Ratings: {book.ratings.toFixed(1)} / 5</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const baseStyles = {
  header: {
    margin: 0,
    fontSize: "32px",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  toggleBtn: {
    padding: "10px 20px",
    fontSize: "14px",
    borderRadius: "6px",
    cursor: "pointer",
    border: "1px solid #888",
  },
  controls: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginBottom: "30px",
    flexWrap: "wrap",
  },
  searchBar: {
    padding: "10px",
    fontSize: "16px",
    width: "240px",
    borderRadius: "6px",
  },
  dropdown: {
    padding: "10px",
    fontSize: "16px",
    borderRadius: "6px",
  },
  sectionTitle: {
    textAlign: "left",
    fontSize: "22px",
    margin: "20px 0 10px 10px",
  },
  sliderWrapper: {
    padding: "0 40px",
    marginBottom: "30px",
    maxWidth: "100%",
  },
  booksGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "20px",
    marginTop: "20px",
  },
  bookTile: {
    padding: "15px",
    borderRadius: "8px",
    textAlign: "center",
    transition: "transform 0.3s, box-shadow 0.3s",
    cursor: "pointer",
    maxWidth: "220px",
    margin: "10px auto",
  },
  bookImage: {
    width: "100%",
    height: "220px",
    objectFit: "contain",
    borderRadius: "10px",
    marginBottom: "10px",
  },
  bookTitle: { fontSize: "16px", margin: "8px 0", fontWeight: "bold" },
  bookAuthor: { fontSize: "14px" },
  bookPrice: { fontSize: "15px", fontWeight: "600", margin: "6px 0" },
  bookRatings: { fontSize: "14px", color: "#f5a623" },

  noRecBox: {
    margin: "30px auto",
    padding: "20px",
    maxWidth: "700px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)",
    boxShadow: "0 4px 10px rgba(255,255,255,0.1)",
    textAlign: "center",
  },
  noRecText: {
    fontSize: "18px",
    fontWeight: "500",
    color: "#fff",
    lineHeight: "1.5",
  },
  
};

const lightStyles = {
  ...baseStyles,
  container: {
    ...baseStyles.container,
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    textAlign: "center",
    backgroundColor: "#fff",
    color: "#000",
    minHeight: "100vh",
  },
  toggleBtn: {
    ...baseStyles.toggleBtn,
    backgroundColor: "#000",
    color: "#fff",
  },
  searchBar: {
    ...baseStyles.searchBar,
    backgroundColor: "#fff",
    color: "#000",
    border: "1px solid #ccc",
  },
  dropdown: {
    ...baseStyles.dropdown,
    backgroundColor: "#fff",
    color: "#000",
    border: "1px solid #ccc",
  },
  bookTile: {
    ...baseStyles.bookTile,
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
  },
  bookAuthor: { ...baseStyles.bookAuthor, color: "#555" },
};

const darkStyles = {
  ...baseStyles,
  container: {
    ...baseStyles.container,
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    textAlign: "center",
    backgroundColor: "#121212",
    color: "#fff",
    minHeight: "100vh",
  },
  toggleBtn: {
    ...baseStyles.toggleBtn,
    backgroundColor: "#f5f5f5",
    color: "#121212",
  },
  searchBar: {
    ...baseStyles.searchBar,
    backgroundColor: "#1e1e1e",
    color: "#fff",
    border: "1px solid #444",
  },
  dropdown: {
    ...baseStyles.dropdown,
    backgroundColor: "#1e1e1e",
    color: "#fff",
    border: "1px solid #444",
  },
  bookTile: {
    ...baseStyles.bookTile,
    backgroundColor: "#1f1f1f",
    border: "1px solid #333",
    boxShadow: "0 2px 8px rgba(255, 255, 255, 0.1)",
    color: "#ddd",
  },
  bookAuthor: { ...baseStyles.bookAuthor, color: "#bbb" },
};

export default Books;
