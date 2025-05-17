package com.buyandsellstore.app.resolver;

import com.buyandsellstore.app.dto.SellerStats;
import com.buyandsellstore.app.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

@Controller
public class SellerResolver {

    @Autowired
    private OrderService orderService;

    @QueryMapping(name = "getSellerStatistics")
    public SellerStats getSellerStatistics(@Argument String sellerId) {
        // Use centralized analytics logic from OrderService
        return orderService.getSellerStats(sellerId);
    }
}
