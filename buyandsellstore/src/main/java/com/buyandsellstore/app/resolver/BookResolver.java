package com.buyandsellstore.app.resolver;
import com.buyandsellstore.app.dto.UploadBookResponse;
import com.buyandsellstore.app.model.Book;
import com.buyandsellstore.app.repository.BookRepository;
import com.buyandsellstore.app.model.Review;
import com.buyandsellstore.app.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.List;

@Controller
public class BookResolver {

    @Autowired
    private BookService bookService;

    // Queries
    @QueryMapping
    public List<Book> books() {
        return bookService.getAllBooks();
    }

    @QueryMapping
    public Book book(@Argument String id) {
        return bookService.getBookById(id);
    }

    @QueryMapping
    public List<Book> getBooksBySellerId(@Argument String sellerId) {
        return bookService.getBooksBySellerID(sellerId);
    }

    // Review Mutations
    @MutationMapping
    public Book addReview(@Argument String bookId, @Argument Review review) {
        return bookService.addReview(bookId, review);
    }

    @MutationMapping
    public Book updateReview(@Argument String bookId, @Argument String reviewer, @Argument Review updatedReview) {
        return bookService.updateReview(bookId, reviewer, updatedReview);
    }

    @MutationMapping
    public Book deleteReview(@Argument String bookId, @Argument String reviewer) {
        return bookService.deleteReview(bookId, reviewer);
    }

    // Upload Book Mutation (for sellers)
    @MutationMapping
    public UploadBookResponse uploadBook(
            @Argument String title,
            @Argument String author,
            @Argument int totalQuantity,
            @Argument double price,
            @Argument String imageUrl,
            @Argument String description,
            @Argument String sellerId) {

        Book existingBook = bookService.findByTitleAndSellerId(title, sellerId);
        if (existingBook != null) {
            return new UploadBookResponse(false, "This book already exists for the seller. Duplicate uploads are not allowed.", null);
        }

        Book book = new Book(title, author, price, imageUrl, description, sellerId, totalQuantity);
        book.setReviews(new ArrayList<>());

        return new UploadBookResponse(true, "Upload successful!", bookService.save(book));
    }

    @MutationMapping
    public UploadBookResponse updateBook(
            @Argument String id,
            @Argument String title,
            @Argument String author,
            @Argument int totalQuantity,
            @Argument double price,
            @Argument String imageUrl,
            @Argument String description,
            @Argument String sellerId) {

        // Find existing book by ID
        Book existingBook = bookService.getBookById(id);
        if (existingBook == null) {
            return new UploadBookResponse(false, "Book not found.", null);
        }

        // Update fields
        existingBook.setTitle(title);
        existingBook.setAuthor(author);
        existingBook.setTotalQuantity(totalQuantity);
        existingBook.setPrice(price);
        existingBook.setImageUrl(imageUrl);
        existingBook.setDescription(description);
        existingBook.setSellerId(sellerId);

        Book updatedBook = bookService.save(existingBook);
        return new UploadBookResponse(true, "Book updated successfully.", updatedBook);
    }
}
