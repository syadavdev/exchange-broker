package com.sandeep.exchange.dto;

import com.sandeep.exchange.constants.BrokerName;
import com.sandeep.exchange.constants.OrderType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Data
public class OrderRequest {

    @NotBlank(message = "Ticket can't be blank")
    String ticker;

    @NotNull(message = "Quantity required")
    Integer quantity;

    @NotNull(message = "Provide valid order type")
    OrderType orderType;

    @NotNull(message = "Price can't be null")
    BigDecimal price;

    @NotNull(message = "Provide valid broker name")
    BrokerName brokerName;

    @NotNull(message = "Provide broker user Id")
    String brokerUserId;

}
