package com.buyandsellstore.app.resolver;

import com.buyandsellstore.app.model.Book;
import com.buyandsellstore.app.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class RecommendationResolver {

    @Autowired
    private RecommendationService recommendationService;

    @QueryMapping
    public List<Book> recommendBooksForUser(@Argument String userId) {
        //System.out.println("📡 recommendBooksForUser triggered for userId: " + userId);
        return recommendationService.recommendBooks(userId);
    }
}
