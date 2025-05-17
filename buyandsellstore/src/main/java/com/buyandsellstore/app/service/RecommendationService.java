package com.buyandsellstore.app.service;

import com.buyandsellstore.app.model.Book;
import com.buyandsellstore.app.model.CartItem;
import com.buyandsellstore.app.model.Order;
import com.buyandsellstore.app.model.Review;
import com.buyandsellstore.app.repository.BookRepository;
import com.buyandsellstore.app.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private OrderRepository orderRepository;

    public List<Book> recommendBooks(String userId) {
        List<Order> userOrders = orderRepository.findByUserId(userId);
        Set<String> purchasedBookIds = userOrders.stream()
                .flatMap(order -> order.getItems().stream())
                .map(CartItem::getItemId)
                .collect(Collectors.toSet());

        List<Book> allBooks = bookRepository.findAll();

        // Build user-rating matrix
        Map<String, Map<String, Double>> userRatings = new HashMap<>();
        for (Book book : allBooks) {
            for (Review review : book.getReviews()) {
                userRatings.computeIfAbsent(String.valueOf(review.getUserId()), k -> new HashMap<>())
                        .put(book.getId(), review.getRating());
            }
        }

        // 🔍 Debug: Print user-rating matrix
        //System.out.println("🧱 Built user-rating matrix:");
        //userRatings.forEach((uid, ratings) -> {
         //   System.out.println("User: " + uid + " → Ratings: " + ratings);
        //});

        Map<String, Double> currentUserRatings = userRatings.get(userId);

        if ((purchasedBookIds == null || purchasedBookIds.isEmpty()) &&
                (currentUserRatings == null || currentUserRatings.isEmpty())) {
            return new ArrayList<>();
        }

        Map<String, Double> similarityScores = new HashMap<>();
        if (currentUserRatings != null) {
            for (String otherUser : userRatings.keySet()) {
                if (!otherUser.equals(userId)) {
                    double sim = calculateCosineSimilarity(currentUserRatings, userRatings.get(otherUser));
                    if (sim > 0) {
                        similarityScores.put(otherUser, sim);
                    }
                }
            }
        }

        Map<String, Integer> purchaseCount = new HashMap<>();
        Map<String, Double> ratingSum = new HashMap<>();
        Map<String, Integer> ratingCount = new HashMap<>();

        for (Order order : orderRepository.findAll()) {
            for (CartItem item : order.getItems()) {
                purchaseCount.put(item.getItemId(),
                        purchaseCount.getOrDefault(item.getItemId(), 0) + item.getQuantity());
            }
        }

        for (Book book : allBooks) {
            double sum = 0;
            int count = 0;
            for (Review r : book.getReviews()) {
                sum += r.getRating();
                count++;
            }
            ratingSum.put(book.getId(), sum);
            ratingCount.put(book.getId(), count);
        }

        Map<String, Double> finalScores = new HashMap<>();
        for (Book book : allBooks) {
            String bookId = book.getId();
            if (purchasedBookIds.contains(bookId) ||
                    (currentUserRatings != null && currentUserRatings.containsKey(bookId))) {
                continue;
            }

            double avgRating = ratingSum.getOrDefault(bookId, 0.0) /
                    Math.max(ratingCount.getOrDefault(bookId, 1), 1);
            double popularityScore = 0.5 * avgRating +
                    0.3 * purchaseCount.getOrDefault(bookId, 0) +
                    0.2 * ratingCount.getOrDefault(bookId, 0);

            double cfScore = 0.0;
            for (Map.Entry<String, Double> entry : similarityScores.entrySet()) {
                String otherUserId = entry.getKey();
                double sim = entry.getValue();
                Double otherUserRating = userRatings.get(otherUserId).get(bookId);
                if (otherUserRating != null) {
                    cfScore += sim * otherUserRating;
                }
            }

            double finalScore = 0.7 * cfScore + 0.3 * popularityScore;
            finalScores.put(bookId, finalScore);
        }

        // Final Debugging
        //System.out.println("\n Debugging Recommendation Logic:");
        //System.out.println("User ID: " + userId);
        //System.out.println("User Ratings Map Keys: " + userRatings.keySet());
        //System.out.println("Current Ratings for User: " + currentUserRatings);
        //System.out.println("Similarity Scores: " + similarityScores);
        //System.out.println("Final Recommended Book IDs: " + finalScores.keySet());
        //System.out.println("Recommended Books:");
        finalScores.entrySet().stream()
                .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                .forEach(entry -> System.out.println("📘 BookId: " + entry.getKey() + ", Score: " + entry.getValue()));

        return finalScores.entrySet().stream()
                .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                .map(entry -> allBooks.stream().filter(b -> b.getId().equals(entry.getKey())).findFirst().orElse(null))
                .filter(Objects::nonNull)
                .limit(10)
                .collect(Collectors.toList());
    }

    private double calculateCosineSimilarity(Map<String, Double> a, Map<String, Double> b) {
        Set<String> common = new HashSet<>(a.keySet());
        common.retainAll(b.keySet());

        if (common.isEmpty()) return 0;

        double dot = 0, normA = 0, normB = 0;
        for (String key : common) {
            dot += a.get(key) * b.get(key);
        }
        for (double val : a.values()) normA += val * val;
        for (double val : b.values()) normB += val * val;

        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
