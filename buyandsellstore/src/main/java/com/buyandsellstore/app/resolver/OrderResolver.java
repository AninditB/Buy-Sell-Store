package com.buyandsellstore.app.resolver;

import com.buyandsellstore.app.dto.OrderResponse;
import com.buyandsellstore.app.model.*;
import com.buyandsellstore.app.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;


import java.util.List;

@Controller
public class OrderResolver {
    @Autowired
    private OrderService orderService;

    @MutationMapping
    public OrderResponse createOrder(
            @Argument String userId,
            @Argument List<CartItem> items,
            @Argument float totalPrice,
            @Argument Address billing,
            @Argument Address shipping,
            @Argument Payment payment
    ) {
        return orderService.createOrder(userId, items, totalPrice, billing, shipping, payment);
    }

    @QueryMapping
    public List<Order> getOrdersByUserId(@Argument String userId){
        return orderService.getOrdersByUserId(userId);
    }

    @QueryMapping
    public List<SoldItem> getSoldItemsBySellerId(@Argument String sellerId){
        return orderService.getSoldItemsBySellerId(sellerId);
    }

}
