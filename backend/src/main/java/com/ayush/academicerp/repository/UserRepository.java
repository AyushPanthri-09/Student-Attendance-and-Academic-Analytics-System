package com.ayush.academicerp.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.ayush.academicerp.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}
