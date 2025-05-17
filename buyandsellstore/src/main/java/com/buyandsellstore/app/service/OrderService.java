package com.buyandsellstore.app.service;

import com.buyandsellstore.app.dto.*;
import com.buyandsellstore.app.model.*;
import com.buyandsellstore.app.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private HomeItemRepository homeItemRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private WishlistItemRepository wishlistItemRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private CartService cartService;

    @Autowired
    private BookService bookService;

    public SellerStats getSellerStats(String sellerId) {
        List<Order> allOrders = orderRepository.findAll();
        List<Cart> allCarts = cartRepository.findAll();
        List<WishlistItem> wishlistItems = wishlistItemRepository.findAll();

        Set<String> uniqueBuyers = new HashSet<>();
        int totalPurchases = 0;
        double totalRevenue = 0.0;
        List<Book> purchasedBooks = new ArrayList<>();
        Map<String, Double> revenueByDate = new TreeMap<>();
        Map<String, Integer> bookSalesCount = new HashMap<>();
        Map<String, Integer> userPurchaseCount = new HashMap<>();
        List<FulfillmentEntry> fulfillmentEntries = new ArrayList<>();

        for (Order order : allOrders) {
            boolean sellerInOrder = false;
            long fulfillmentDelay = 0L;
            for (CartItem item : order.getItems()) {
                if (sellerId.equals(item.getSellerId())) {
                    double itemRevenue = item.getQuantity() * item.getPrice();
                    totalPurchases += item.getQuantity();
                    totalRevenue += itemRevenue;
                    sellerInOrder = true;

                    String dateKey = new SimpleDateFormat("yyyy-MM-dd").format(order.getCreatedAt());
                    revenueByDate.merge(dateKey, itemRevenue, Double::sum);

                    bookRepository.findById(item.getItemId()).ifPresent(book -> {
                        purchasedBooks.add(book);
                        bookSalesCount.merge(book.getId(), item.getQuantity(), Integer::sum);
                    });

                    userPurchaseCount.merge(order.getUserId(), 1, Integer::sum);
                }
            }
            if (sellerInOrder) {
                uniqueBuyers.add(order.getUserId());
                // fake delay example: assume createdAt + 4 hours for demo
                fulfillmentEntries.add(new FulfillmentEntry(order.getId(), 4.0f));
            }
        }

        List<String> sortedTopBooks = bookSalesCount.entrySet().stream()
                .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue()))
                .map(Map.Entry::getKey).collect(Collectors.toList());

        List<Book> topSellingBooks = sortedTopBooks.stream().limit(3)
                .map(id -> bookRepository.findById(id).orElse(null))
                .filter(Objects::nonNull).collect(Collectors.toList());

        List<Book> leastSellingBooks = sortedTopBooks.stream()
                .skip(Math.max(0, sortedTopBooks.size() - 3))
                .map(id -> bookRepository.findById(id).orElse(null))
                .filter(Objects::nonNull).collect(Collectors.toList());

        Map<String, Integer> wishlistCountMap = new HashMap<>();
        for (WishlistItem item : wishlistItems) {
            if (item.getType().equalsIgnoreCase("book")) {
                bookRepository.findById(item.getItemId()).ifPresent(book -> {
                    if (sellerId.equals(book.getSellerId())) {
                        wishlistCountMap.merge(book.getId(), 1, Integer::sum);
                    }
                });
            }
        }
        List<WishlistEntry> wishlistFrequency = wishlistCountMap.entrySet().stream()
                .map(e -> new WishlistEntry(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        Map<String, Double> avgRatings = new HashMap<>();
        bookRepository.findAll().stream()
                .filter(book -> sellerId.equals(book.getSellerId()) && book.getReviews() != null && !book.getReviews().isEmpty())
                .forEach(book -> {
                    double avg = book.getReviews().stream().mapToDouble(Review::getRating).average().orElse(0.0);
                    avgRatings.put(book.getId(), avg);
                });

        List<String> mostActiveBuyers = userPurchaseCount.entrySet().stream()
                .sorted((a, b) -> b.getValue() - a.getValue()).limit(5)
                .map(Map.Entry::getKey).collect(Collectors.toList());

        int usersWithItems = 0, usersWhoOrdered = 0;
        Set<String> buyers = new HashSet<>(userPurchaseCount.keySet());
        for (Cart cart : allCarts) {
            boolean hasSellerItem = cart.getItems().stream().anyMatch(item -> sellerId.equals(item.getSellerId()));
            if (hasSellerItem) {
                usersWithItems++;
                if (buyers.contains(cart.getUserId())) usersWhoOrdered++;
            }
        }
        double cartAbandonmentRate = usersWithItems == 0 ? 0.0 : (1 - (usersWhoOrdered * 1.0 / usersWithItems)) * 100;

        List<RevenueEntry> revenueEntries = revenueByDate.entrySet().stream()
                .map(e -> new RevenueEntry(e.getKey(), e.getValue())).collect(Collectors.toList());

        List<RatingEntry> ratingEntries = avgRatings.entrySet().stream()
                .map(e -> new RatingEntry(e.getKey(), e.getValue())).collect(Collectors.toList());

        List<PurchaseEntry> purchaseEntries = userPurchaseCount.entrySet().stream()
                .map(e -> new PurchaseEntry(e.getKey(), e.getValue())).collect(Collectors.toList());

        SellerStats stats = new SellerStats(uniqueBuyers.size(), totalPurchases, totalRevenue, purchasedBooks);
        stats.setRevenueByDate(revenueEntries);
        stats.setTopSellingBooks(topSellingBooks);
        stats.setLeastSellingBooks(leastSellingBooks);
        stats.setWishlistFrequency(wishlistFrequency);
        stats.setAverageRatings(ratingEntries);
        stats.setMostActiveBuyers(mostActiveBuyers);
        stats.setUserPurchaseFrequency(purchaseEntries);
        stats.setCartAbandonmentRate(cartAbandonmentRate);
        stats.setTotalOrders(allOrders.size());
        stats.setOrderFulfillmentDelay(fulfillmentEntries);
        stats.setTrendingRecommendations(new ArrayList<>());

        return stats;
    }

    public OrderResponse createOrder(String userId, List<CartItem> items, float totalPrice,
                                     Address billing, Address shipping, Payment payment) {
        try {
            List<CartItem> processedItems = new ArrayList<>();

            for (CartItem item : items) {
                if ("book".equalsIgnoreCase(item.getType())) {
                    bookRepository.findById(item.getItemId()).ifPresent(book -> {
                        item.setSellerId(book.getSellerId());
                        processedItems.add(item);
                    });
                } else if ("home".equalsIgnoreCase(item.getType())) {
                    homeItemRepository.findById(item.getItemId()).ifPresent(homeItem -> {
                        item.setSellerId(homeItem.getSellerId());
                        processedItems.add(item);
                    });
                } else {
                    processedItems.add(item);
                }
            }

            Order order = new Order();
            order.setId(UUID.randomUUID().toString());
            order.setUserId(userId);
            order.setItems(processedItems);
            order.setTotalPrice(totalPrice);
            order.setBilling(billing);
            order.setShipping(shipping);
            order.setPayment(payment);
            order.setCreatedAt(new Date());

            orderRepository.save(order);
            cartService.removeFromCart(userId, null, null);

            return new OrderResponse(true, "Order created successfully", order);
        } catch (Exception e) {
            e.printStackTrace();
            return new OrderResponse(false, "Failed to create order: " + e.getMessage(), null);
        }
    }

    public List<Order> getOrdersByUserId(String userId) {
        try {
            List<Order> orderList = orderRepository.findByUserId(userId);
            return orderList.isEmpty() ? Collections.emptyList() : orderList;
        } catch (Exception e) {
            throw new RuntimeException("Error fetching orders for user ID: " + userId, e);
        }
    }

    public long removeOrderByUserId(String userId) {
        return orderRepository.removeByUserId(userId);
    }

    public List<SoldItem> getSoldItemsBySellerId(String sellerId) {
        List<Order> allOrders = orderRepository.findAll();
        List<SoldItem> soldItems = new ArrayList<>();
        for (Order order : allOrders) {
            for (CartItem item : order.getItems()) {
                if (sellerId.equals(item.getSellerId())) {
                    SoldItem soldItem = new SoldItem(
                            item.getItemId(),
                            item.getType(),
                            item.getName(),
                            item.getQuantity(),
                            item.getPrice(),
                            item.getImageUrl(),
                            item.getSellerId(),
                            order.getCreatedAt()
                    );
                    soldItems.add(soldItem);
                }
            }
        }
        return soldItems;
    }
}
