package com.ayush.academicerp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name="courses")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String duration;

    // Many courses → One department
    @ManyToOne
    @JoinColumn(name = "department_id")
    @JsonBackReference  // Prevent infinite loop when serializing department → course → department
    private Department department;

    // Many courses → One faculty
    @ManyToOne
    @JoinColumn(name = "faculty_id", nullable = true)
    @JsonBackReference  // Prevent infinite loop when serializing faculty → course → faculty
    private Faculty faculty;

    // One course → Many students
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference  // Include students when serializing a course
    private List<Student> students;
}