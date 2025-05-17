package com.buyandsellstore.app.service;

import com.buyandsellstore.app.model.Book;
import com.buyandsellstore.app.model.Review;
import com.buyandsellstore.app.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public Book getBookById(String id) {
        return bookRepository.findById(id).orElse(null);
    }

    public Book findByTitleAndSellerId(String title, String sellerId) {
        return bookRepository.findByTitleAndSellerId(title,  sellerId);
    }

    public List<Book> getBooksBySellerID(String sellerId) {
        return bookRepository.findBySellerId(sellerId);
    }

    public Book save(Book book){
        return bookRepository.save(book);
    }


    // Add a review to a book
    public Book addReview(String bookId, Review newReview) {
        Book book = bookRepository.findById(bookId).orElse(null);
        if (book != null) {
            List<Review> reviews = book.getReviews();
            if (reviews == null) reviews = new ArrayList<>();
            reviews.add(newReview);
            book.setReviews(reviews);
            updateAverageRating(book);
            bookRepository.save(book);
        }
        return book;
    }

    // Update a review by reviewer name
    public Book updateReview(String bookId, String reviewer, Review updatedReview) {
        Book book = bookRepository.findById(bookId).orElse(null);
        if (book != null && book.getReviews() != null) {
            for (Review review : book.getReviews()) {
                if (review.getReviewer().equalsIgnoreCase(reviewer)) {
                    review.setComment(updatedReview.getComment());
                    review.setRating(updatedReview.getRating());
                    review.setUserId(updatedReview.getUserId());
                    break;
                }
            }
            updateAverageRating(book);
            bookRepository.save(book);
        }
        return book;
    }

    // Delete a review by reviewer name
    public Book deleteReview(String bookId, String reviewer) {
        Book book = bookRepository.findById(bookId).orElse(null);
        if (book != null && book.getReviews() != null) {
            book.getReviews().removeIf(review -> review.getReviewer().equalsIgnoreCase(reviewer));
            updateAverageRating(book);
            bookRepository.save(book);
        }
        return book;
    }

    // Recalculate average rating after add/update/delete
    private void updateAverageRating(Book book) {
        List<Review> reviews = book.getReviews();
        if (reviews == null || reviews.isEmpty()) {
            book.setRatings(0);
        } else {
            double sum = reviews.stream().mapToDouble(Review::getRating).sum();
            book.setRatings(sum / reviews.size());
        }
    }
}
