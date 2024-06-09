package com.sandeep.exchange.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

import static jakarta.persistence.GenerationType.AUTO;

@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@ToString
public class StockPrice {

    @Id
    @GeneratedValue(strategy = AUTO)
    Long id;

    @Column
    String ticker;

    @Column
    @Setter
    BigDecimal price;

}
