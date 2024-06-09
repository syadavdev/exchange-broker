package com.sandeep.exchange.entity;

import com.sandeep.exchange.constants.BrokerName;
import com.sandeep.exchange.constants.OrderStatus;
import com.sandeep.exchange.constants.OrderType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

import static jakarta.persistence.GenerationType.AUTO;

@Entity
@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Orders {

    @Id
    @GeneratedValue(strategy = AUTO)
    Long id;

    @Column
    @Enumerated(EnumType.STRING)
    BrokerName brokerName;

    @Column
    String ticker;

    @Column
    @Enumerated(EnumType.STRING)
    OrderType orderType;

    @Column
    @Setter
    @Enumerated(EnumType.STRING)
    OrderStatus orderStatus;

    @Column
    @Setter
    Integer quantity;

    @Column
    @Setter
    Integer filledQuantity;

    @Column
    @Setter
    Integer remainQuantity;

    @Column
    BigDecimal price;

    @Column
    String brokerUserId;

    @Column
    Instant createdDateTime;

}
