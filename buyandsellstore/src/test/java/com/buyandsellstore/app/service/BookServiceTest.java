package com.buyandsellstore.app.service;

import com.buyandsellstore.app.dto.UploadBookResponse;
import com.buyandsellstore.app.model.Book;
import com.buyandsellstore.app.repository.BookRepository;
import com.buyandsellstore.app.resolver.BookResolver;
import com.buyandsellstore.app.service.BookService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BookServiceTest {
    @Mock
    private BookRepository bookRepository;

    @InjectMocks
    private BookService bookService;

    @Mock
    private BookResolver bookResolver;

    private Book book;

    @BeforeEach
    public void setup() {
        book = new Book();
        book.setId("1");
        book.setTitle("Test Book");
        book.setAuthor("Test Author");
        book.setPrice(10.99);
    }

    @Test
    public void testGetAllBooks() {
        List<Book> books = Arrays.asList(book);
        when(bookRepository.findAll()).thenReturn(books);

        List<Book> result = bookService.getAllBooks();
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(bookRepository, times(1)).findAll();
    }

    @Test
    public void testGetBookById() {
        when(bookRepository.findById("1")).thenReturn(Optional.of(book));

        Book result = bookService.getBookById("1");
        assertNotNull(result);
        assertEquals("1", result.getId());
        verify(bookRepository, times(1)).findById("1");
    }


    //This is because update and upload both uses repository save method
    @Test
    public void testUploadBook_and_UpdateBook() {
        when(bookRepository.save(book)).thenReturn(book);
        Book uploadedBook = bookService.save(book);
        assertNotNull(uploadedBook);
        assertEquals("1", uploadedBook.getId());
        verify(bookRepository, times(1)).save(book);
    }
}
