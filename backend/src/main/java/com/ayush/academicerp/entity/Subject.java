package com.ayush.academicerp.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="subjects")
@Getter
@Setter
@Builder
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "code", nullable = false, unique = true)
    private String code;

    // Many subjects → one department
    @ManyToOne
    @JoinColumn(name="department_id")
    private Department department;

    @Column(nullable = false)
    private Integer semester;
}