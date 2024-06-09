package com.sandeep.exchange.repository;

import com.sandeep.exchange.constants.BrokerName;
import com.sandeep.exchange.constants.OrderStatus;
import com.sandeep.exchange.constants.OrderType;
import com.sandeep.exchange.entity.Orders;
import org.springframework.data.repository.CrudRepository;

import java.math.BigDecimal;
import java.util.List;

public interface OrdersRepository extends CrudRepository<Orders, String> {

    List<Orders> findByTickerAndOrderTypeAndOrderStatusAndPrice(String ticker, OrderType orderType, OrderStatus status, BigDecimal price);

    List<Orders> findByBrokerName(BrokerName brokerName);

}
