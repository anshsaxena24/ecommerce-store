package com.ecommerce;

import com.ecommerce.model.*;
import com.ecommerce.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.logging.Logger;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = Logger.getLogger(DataSeeder.class.getName());

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, CategoryRepository categoryRepository,
                      ProductRepository productRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded. Skipping.");
            return;
        }
        log.info("Seeding database...");

        userRepository.save(makeUser("admin@store.com", "admin123", "Admin", "One", Role.ADMIN));
        userRepository.save(makeUser("superadmin@store.com", "admin123", "Super", "Admin", Role.ADMIN));
        userRepository.save(makeUser("user1@store.com", "user123", "Alice", "Smith", Role.USER));
        userRepository.save(makeUser("user2@store.com", "user123", "Bob", "Jones", Role.USER));
        userRepository.save(makeUser("user3@store.com", "user123", "Carol", "White", Role.USER));

        Category electronics = save("Electronics", "electronics", null);
        Category clothing    = save("Clothing",    "clothing",    null);
        Category books       = save("Books",       "books",       null);
        Category homeGarden  = save("Home & Garden","home-garden", null);
        Category sports      = save("Sports",      "sports",      null);
        Category phones      = save("Phones",  "phones",  electronics);
        Category laptops     = save("Laptops", "laptops", electronics);
        Category audio       = save("Audio",   "audio",   electronics);

        saveProduct("iPhone 15 Pro",
            "The latest iPhone with titanium design, A17 Pro chip, and a 48MP main camera. Experience next-level performance.",
            new BigDecimal("999.99"), 50, phones,
            "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600");

        saveProduct("Samsung Galaxy S24 Ultra",
            "Revolutionary AI-powered smartphone with built-in S Pen, 200MP camera, and all-day battery life.",
            new BigDecimal("1199.99"), 35, phones,
            "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600");

        saveProduct("Google Pixel 8 Pro",
            "Google's flagship phone with the best computational photography and 7 years of updates.",
            new BigDecimal("899.99"), 28, phones,
            "https://images.unsplash.com/photo-1598327106026-d9521da673d1?w=600");

        saveProduct("MacBook Pro 14-inch M3",
            "Supercharged by M3 Pro or M3 Max with an immersive Liquid Retina XDR display.",
            new BigDecimal("1999.99"), 20, laptops,
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600");

        saveProduct("Dell XPS 15",
            "Premium Windows laptop with OLED display, Intel Core i9 processor, and NVIDIA RTX graphics.",
            new BigDecimal("1749.99"), 15, laptops,
            "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600");

        saveProduct("Sony WH-1000XM5",
            "Industry-leading noise cancelling headphones with 30-hour battery life and superior sound quality.",
            new BigDecimal("349.99"), 60, audio,
            "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600");

        saveProduct("AirPods Pro (2nd generation)",
            "Active Noise Cancellation up to 2x more powerful than the previous generation.",
            new BigDecimal("249.99"), 80, audio,
            "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600");

        saveProduct("Men's Running Jacket",
            "Lightweight, water-resistant running jacket with reflective details for low-light visibility.",
            new BigDecimal("89.99"), 100, clothing,
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600");

        saveProduct("Women's Yoga Leggings",
            "High-waist yoga leggings with four-way stretch fabric and moisture-wicking technology.",
            new BigDecimal("59.99"), 150, clothing,
            "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600");

        saveProduct("The Pragmatic Programmer",
            "Your journey to mastery. A seminal work covering personal responsibility to architectural techniques.",
            new BigDecimal("39.99"), 200, books,
            "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600");

        saveProduct("Clean Code: A Handbook",
            "A Handbook of Agile Software Craftsmanship by Robert C. Martin.",
            new BigDecimal("34.99"), 180, books,
            "https://images.unsplash.com/photo-1589998059171-988d887df646?w=600");

        saveProduct("Instant Pot Duo 7-in-1",
            "7-in-1 multi-cooker: pressure cooker, slow cooker, rice cooker, steamer, saute, yogurt maker, and warmer.",
            new BigDecimal("79.99"), 75, homeGarden,
            "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600");

        saveProduct("Garden Tool Set",
            "Premium 3-piece stainless steel garden tool set with ergonomic rubber handles.",
            new BigDecimal("44.99"), 90, homeGarden,
            "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600");

        saveProduct("Adjustable Dumbbells Set",
            "Space-saving adjustable dumbbell set replacing 15 sets of weights. Select 5 to 52.5 lbs.",
            new BigDecimal("299.99"), 40, sports,
            "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600");

        saveProduct("Yoga Mat Premium",
            "Non-slip yoga mat with alignment lines, extra thick 6mm cushioning, and carry strap.",
            new BigDecimal("49.99"), 120, sports,
            "https://images.unsplash.com/photo-1571019613576-2b22c76fd955?w=600");

        log.info("Database seeded successfully.");
    }

    private User makeUser(String email, String password, String first, String last, Role role) {
        return User.builder().email(email).passwordHash(passwordEncoder.encode(password))
                .firstName(first).lastName(last).role(role).build();
    }

    private Category save(String name, String slug, Category parent) {
        return categoryRepository.save(Category.builder().name(name).slug(slug).parent(parent).build());
    }

    private void saveProduct(String name, String description, BigDecimal price,
                              int stock, Category category, String imageUrl) {
        Product product = Product.builder().name(name).description(description)
                .price(price).stockQuantity(stock).category(category).isActive(true).build();
        ProductImage image = new ProductImage();
        image.setProduct(product);
        image.setImageUrl(imageUrl);
        image.setIsPrimary(true);
        image.setDisplayOrder(0);
        product.setImages(List.of(image));
        productRepository.save(product);
    }
}
