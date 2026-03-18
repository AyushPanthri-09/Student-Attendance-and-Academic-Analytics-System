package com.ayush.academicerp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name="faculty")
@Getter @Setter
public class Faculty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    // Many faculty → One department
    @ManyToOne
    @JoinColumn(name = "department_id")
    @JsonBackReference  // Avoid recursion when serializing department → faculty → department
    private Department department;

    // One faculty → Many courses
    @OneToMany(mappedBy = "faculty", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference  // Include courses when serializing faculty
    private List<Course> courses;
}