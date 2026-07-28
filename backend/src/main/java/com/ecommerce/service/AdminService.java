package com.ecommerce.service;

import com.ecommerce.dto.DashboardStatsDto;
import com.ecommerce.model.OrderStatus;
import com.ecommerce.repository.*;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class AdminService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public AdminService(ProductRepository productRepository, OrderRepository orderRepository,
                        UserRepository userRepository) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    public DashboardStatsDto getDashboardStats() {
        DashboardStatsDto stats = new DashboardStatsDto();
        stats.setTotalProducts(productRepository.countByIsActiveTrue());
        stats.setTotalOrders(orderRepository.count());
        stats.setTotalUsers(userRepository.count());
        stats.setTotalRevenue(orderRepository.sumTotalExcludingStatus(OrderStatus.CANCELLED));
        Map<String, Long> ordersByStatus = new HashMap<>();
        orderRepository.countByStatus().forEach(row -> ordersByStatus.put(row[0].toString(), (Long) row[1]));
        stats.setOrdersByStatus(ordersByStatus);
        return stats;
    }
}
