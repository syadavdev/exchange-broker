package com.sandeep.exchange.dto;

import com.sandeep.exchange.constants.BrokerName;
import com.sandeep.exchange.constants.OrderStatus;
import com.sandeep.exchange.constants.OrderType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class OrderResponse {

    Long orderId;

    String ticker;

    BrokerName brokerName;

    String brokerUserId;

    OrderType orderType;

    OrderStatus orderStatus;

    Integer quantity;

    Integer filledQuantity;

    Integer remainingQuantity;

}
