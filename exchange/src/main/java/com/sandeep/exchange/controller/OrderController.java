package com.sandeep.exchange.controller;

import com.sandeep.exchange.constants.BrokerName;
import com.sandeep.exchange.dto.OrderRequest;
import com.sandeep.exchange.dto.OrderResponse;
import com.sandeep.exchange.dto.TickerPriceRequest;
import com.sandeep.exchange.entity.Orders;
import com.sandeep.exchange.entity.StockPrice;
import com.sandeep.exchange.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000/")
public class OrderController {

    @Autowired
    private OrderService service;

    @PostMapping("/market")
    public ResponseEntity<OrderResponse> marketOrder(@Valid @RequestBody OrderRequest request){
        Orders orders = service.marketOrder(request);
        return ResponseEntity.ok().body(OrderResponse.builder()
                .orderId(orders.getId())
                .ticker(orders.getTicker())
                .brokerName(orders.getBrokerName())
                .brokerUserId(orders.getBrokerUserId())
                .quantity(orders.getQuantity())
                .filledQuantity(orders.getFilledQuantity())
                .remainingQuantity(orders.getRemainQuantity())
                .orderType(orders.getOrderType())
                .orderStatus(orders.getOrderStatus())
                .build());
    }

    @GetMapping("/orders/{brokerName}")
    public ResponseEntity<List<Orders>> orders(@PathVariable("brokerName") BrokerName brokerName){
        return ResponseEntity.ok().body(service.brokerOrders(brokerName));
    }

    @MessageMapping("/tickerPrice")
    @SendTo("/price")
    public StockPrice tickerPrice(TickerPriceRequest request) {
        return service.stockPrice(request.getTickerName());
    }

}
