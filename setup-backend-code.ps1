Set-Location backend

# ===============================
# ENTITY: User
# ===============================
@"
package com.ayush.academicerp.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="users")
@Getter @Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique=true)
    private String username;

    private String password;

    private String role;

    private boolean enabled;
}
"@ | Set-Content src/main/java/com/ayush/academicerp/entity/User.java


# ===============================
# GENERIC SIMPLE ENTITIES
# ===============================

$entities = @(
"AcademicCalendar","Attendance","Course","Department","Faculty",
"Fees","Marks","Resource","Student","Subject"
)

foreach ($e in $entities) {
@"
package com.ayush.academicerp.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="$($e.ToLower())s")
@Getter @Setter
public class $e {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
}
"@ | Set-Content "src/main/java/com/ayush/academicerp/entity/$e.java"
}


# ===============================
# REPOSITORIES
# ===============================

foreach ($e in $entities) {
@"
package com.ayush.academicerp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ayush.academicerp.entity.$e;

public interface ${e}Repository extends JpaRepository<$e, Long> {}
"@ | Set-Content "src/main/java/com/ayush/academicerp/repository/${e}Repository.java"
}

@"
package com.ayush.academicerp.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.ayush.academicerp.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}
"@ | Set-Content src/main/java/com/ayush/academicerp/repository/UserRepository.java


# ===============================
# DTOs
# ===============================
@"
package com.ayush.academicerp.dto;
import lombok.*;

@Getter @Setter
public class LoginRequest {
    private String username;
    private String password;
}
"@ | Set-Content src/main/java/com/ayush/academicerp/dto/LoginRequest.java

@"
package com.ayush.academicerp.dto;
import lombok.*;

@AllArgsConstructor
@Getter
public class AuthResponse {
    private String token;
}
"@ | Set-Content src/main/java/com/ayush/academicerp/dto/AuthResponse.java


# ===============================
# JWT SERVICE
# ===============================
@"
package com.ayush.academicerp.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

@Service
public class JwtService {

    @Value("\${app.jwt.secret}")
    private String secret;

    @Value("\${app.jwt.expiration}")
    private long expiration;

    private Key getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis()+expiration))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
}
"@ | Set-Content src/main/java/com/ayush/academicerp/config/JwtService.java


# ===============================
# UserDetailsService
# ===============================
@"
package com.ayush.academicerp.service;

import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import com.ayush.academicerp.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository repo;

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        var user = repo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                Collections.singleton(new SimpleGrantedAuthority("ROLE_"+user.getRole()))
        );
    }
}
"@ | Set-Content src/main/java/com/ayush/academicerp/service/CustomUserDetailsService.java


# ===============================
# SECURITY CONFIG
# ===============================
@"
package com.ayush.academicerp.config;

import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.*;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated()
            );
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
"@ | Set-Content src/main/java/com/ayush/academicerp/config/SecurityConfig.java


# ===============================
# AUTH CONTROLLER
# ===============================
@"
package com.ayush.academicerp.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.ayush.academicerp.dto.*;
import com.ayush.academicerp.repository.UserRepository;
import com.ayush.academicerp.config.JwtService;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {

        var user = repo.findByUsername(request.getUsername())
                .orElseThrow();

        if(!encoder.matches(request.getPassword(), user.getPassword()))
            throw new RuntimeException("Invalid credentials");

        String token = jwt.generateToken(user.getUsername());
        return new AuthResponse(token);
    }
}
"@ | Set-Content src/main/java/com/ayush/academicerp/controller/AuthController.java


Write-Host "FULL BACKEND CODE GENERATED SUCCESSFULLY."