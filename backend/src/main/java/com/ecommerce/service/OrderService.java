package com.ecommerce.service;

import com.ecommerce.dto.*;
import com.ecommerce.exception.*;
import com.ecommerce.model.*;
import com.ecommerce.repository.*;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final BigDecimal SHIPPING_COST = new BigDecimal("5.99");

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final AddressService addressService;

    public OrderService(OrderRepository orderRepository, CartItemRepository cartItemRepository,
                        ProductRepository productRepository, AddressRepository addressRepository,
                        UserRepository userRepository, AddressService addressService) {
        this.orderRepository = orderRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
        this.addressService = addressService;
    }

    @Transactional
    public OrderResponse placeOrder(Long userId, OrderRequest request) {
        List<CartItem> cartItems = cartItemRepository.findByUserIdWithProductDetails(userId);
        if (cartItems.isEmpty()) throw new IllegalArgumentException("Cart is empty");

        for (CartItem item : cartItems) {
            if (item.getProduct().getStockQuantity() < item.getQuantity()) {
                throw new InsufficientStockException("Insufficient stock for: " + item.getProduct().getName()
                        + ". Available: " + item.getProduct().getStockQuantity()
                        + ", Requested: " + item.getQuantity());
            }
        }
        for (CartItem item : cartItems) {
            Product p = item.getProduct();
            p.setStockQuantity(p.getStockQuantity() - item.getQuantity());
            productRepository.save(p);
        }

        Address shippingAddress = null;
        if (request.getAddressId() != null) {
            shippingAddress = addressRepository.findById(request.getAddressId())
                    .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
            if (!shippingAddress.getUser().getId().equals(userId))
                throw new UnauthorizedException("Access denied to address");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Order order = Order.builder().user(user).shippingAddress(shippingAddress)
                .status(OrderStatus.PENDING).shippingCost(SHIPPING_COST)
                .subtotal(BigDecimal.ZERO).total(BigDecimal.ZERO).build();
        Order savedOrder = orderRepository.save(order);

        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cartItems) {
            BigDecimal unitPrice = cartItem.getProduct().getPrice();
            subtotal = subtotal.add(unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity())));
            orderItems.add(OrderItem.builder().order(savedOrder).product(cartItem.getProduct())
                    .quantity(cartItem.getQuantity()).unitPrice(unitPrice).build());
        }

        savedOrder.setSubtotal(subtotal);
        savedOrder.setTotal(subtotal.add(SHIPPING_COST));
        savedOrder.setItems(orderItems);
        orderRepository.save(savedOrder);

        cartItemRepository.deleteByUserId(userId);
        return toResponse(savedOrder);
    }

    public Page<OrderResponse> getUserOrders(Long userId, int page, int size) {
        return orderRepository.findByUserIdOrderByOrderedAtDesc(userId, PageRequest.of(page, size))
                .map(this::toResponse);
    }

    public OrderResponse getOrder(Long userId, Long orderId, boolean isAdmin) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
        if (!isAdmin && !order.getUser().getId().equals(userId))
            throw new UnauthorizedException("Access denied");
        return toResponse(order);
    }

    @Transactional
    public OrderResponse updateStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
        try { order.setStatus(OrderStatus.valueOf(status.toUpperCase())); }
        catch (IllegalArgumentException e) { throw new IllegalArgumentException("Invalid status: " + status); }
        return toResponse(orderRepository.save(order));
    }

    public Page<OrderResponse> getAllOrders(int page, int size) {
        return orderRepository.findAllByOrderByOrderedAtDesc(PageRequest.of(page, size)).map(this::toResponse);
    }

    public OrderResponse toResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setUserId(order.getUser().getId());
        response.setUserEmail(order.getUser().getEmail());
        response.setStatus(order.getStatus().name());
        response.setSubtotal(order.getSubtotal());
        response.setShippingCost(order.getShippingCost());
        response.setTotal(order.getTotal());
        response.setOrderedAt(order.getOrderedAt());
        if (order.getShippingAddress() != null)
            response.setShippingAddress(addressService.toResponse(order.getShippingAddress()));
        if (order.getItems() != null) {
            response.setItems(order.getItems().stream().map(item -> {
                OrderItemResponse r = new OrderItemResponse();
                r.setId(item.getId());
                r.setProductId(item.getProduct().getId());
                r.setProductName(item.getProduct().getName());
                r.setQuantity(item.getQuantity());
                r.setUnitPrice(item.getUnitPrice());
                r.setItemTotal(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
                if (item.getProduct().getImages() != null && !item.getProduct().getImages().isEmpty()) {
                    item.getProduct().getImages().stream()
                        .filter(img -> Boolean.TRUE.equals(img.getIsPrimary())).findFirst()
                        .ifPresentOrElse(img -> r.setPrimaryImageUrl(img.getImageUrl()),
                            () -> r.setPrimaryImageUrl(item.getProduct().getImages().get(0).getImageUrl()));
                }
                return r;
            }).collect(Collectors.toList()));
        }
        return response;
    }
}
