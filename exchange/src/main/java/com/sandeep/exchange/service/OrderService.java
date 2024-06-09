package com.sandeep.exchange.service;

import com.sandeep.exchange.constants.BrokerName;
import com.sandeep.exchange.constants.OrderType;
import com.sandeep.exchange.dto.OrderRequest;
import com.sandeep.exchange.entity.Orders;
import com.sandeep.exchange.entity.StockPrice;
import com.sandeep.exchange.repository.OrdersRepository;
import com.sandeep.exchange.repository.StockPriceRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static com.sandeep.exchange.constants.OrderStatus.PENDING;
import static com.sandeep.exchange.constants.OrderStatus.SUCCESS;
import static com.sandeep.exchange.constants.OrderType.BUY;
import static com.sandeep.exchange.constants.OrderType.SELL;

@Service
public class OrderService {

    @Autowired
    private OrdersRepository repository;

    @Autowired
    private StockPriceRepository stockPriceRepository;

    @Transactional
    public Orders marketOrder(OrderRequest request) {
        //Fetching opposite orders
        OrderType oppositeOrderType = request.getOrderType() == SELL ? BUY : SELL;
        List<Orders> oppositeMatchedOrders = repository.findByTickerAndOrderTypeAndOrderStatusAndPrice(request.getTicker(),
                oppositeOrderType, PENDING, request.getPrice());

        if(oppositeMatchedOrders.isEmpty()) {
            Orders newOrder = Orders.builder().ticker(request.getTicker())
                    .orderStatus(PENDING)
                    .orderType(request.getOrderType())
                    .brokerName(request.getBrokerName())
                    .brokerUserId(request.getBrokerUserId())
                    .price(request.getPrice())
                    .quantity(request.getQuantity())
                    .filledQuantity(0)
                    .remainQuantity(request.getQuantity())
                    .createdDateTime(Instant.now())
                    .build();
            return repository.save(newOrder);
        }

        //Deduct quantity from the existing orders
        Integer requestQuantity = request.getQuantity();
        for (Orders oppositeMatcherOrders : oppositeMatchedOrders) {
            if(oppositeMatcherOrders.getRemainQuantity() > request.getQuantity()) {
                oppositeMatcherOrders.setFilledQuantity(request.getQuantity());
                oppositeMatcherOrders.setRemainQuantity(oppositeMatcherOrders.getRemainQuantity() - request.getQuantity());
                request.setQuantity(0);
                break;
            }

            request.setQuantity(request.getQuantity() - oppositeMatcherOrders.getRemainQuantity());
            oppositeMatcherOrders.setFilledQuantity(oppositeMatcherOrders.getQuantity());
            oppositeMatcherOrders.setRemainQuantity(0);
            oppositeMatcherOrders.setOrderStatus(SUCCESS);
        }
        repository.saveAll(oppositeMatchedOrders);

        //Save new order
        Orders newOrder = Orders.builder().ticker(request.getTicker())
                .orderStatus(request.getQuantity() > 0 ? PENDING : SUCCESS)
                .orderType(request.getOrderType())
                .brokerName(request.getBrokerName())
                .brokerUserId(request.getBrokerUserId())
                .price(request.getPrice())
                .quantity(requestQuantity)
                .filledQuantity(requestQuantity - request.getQuantity())
                .remainQuantity(request.getQuantity())
                .createdDateTime(Instant.now())
                .build();

        //update stock price
        if(newOrder.getOrderStatus().equals(SUCCESS))
            updateStockPrice(request);

        return repository.save(newOrder);
    }

    @Async
    private void updateStockPrice(OrderRequest request){
        Optional<StockPrice> optTicker = stockPriceRepository.findByTicker(request.getTicker());
        StockPrice stockPrice;
        if(optTicker.isPresent()){
            stockPrice = optTicker.get();
            stockPrice.setPrice(request.getPrice());
        }else{
            stockPrice = StockPrice.builder().ticker(request.getTicker())
                    .price(request.getPrice())
                    .build();
        }
        stockPriceRepository.save(stockPrice);
    }

    public StockPrice stockPrice(String ticker){
        return stockPriceRepository.findByTicker(ticker).orElseThrow(
                () -> new RuntimeException("No such ticker exist : " + ticker)
        );
    }

    public List<Orders> brokerOrders(BrokerName brokerName){
        return repository.findByBrokerName(brokerName);
    }
}
