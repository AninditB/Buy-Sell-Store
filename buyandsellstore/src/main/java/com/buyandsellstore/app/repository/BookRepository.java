package com.buyandsellstore.app.repository;

import com.buyandsellstore.app.model.Book;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends MongoRepository<Book, String> {

    Book findByTitleAndSellerId(String title, String sellerId);

    List<Book> findBySellerId(String sellerId);

    List<Book> findByTitleContainingIgnoreCaseAndSellerId(String title, String sellerId);
}
