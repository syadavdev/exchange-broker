package com.sandeep.exchange.repository;

import com.sandeep.exchange.entity.StockPrice;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface StockPriceRepository extends CrudRepository<StockPrice, Integer> {

    Optional<StockPrice> findByTicker(String ticker);

}
