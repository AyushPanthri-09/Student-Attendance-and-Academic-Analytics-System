package com.ayush.academicerp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "students")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "roll_no", nullable = false, unique = true)
    private String rollNo;

    @Column(nullable = false)
    private String name;

    private LocalDate dob;

    // MANY students → ONE department
    @ManyToOne
    @JoinColumn(name = "department_id")
    @JsonIgnoreProperties({"students", "subjects"})
    private Department department;

    // MANY students → ONE course
    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "course_id")
    @JsonIgnore
    private Course course;

    @Column(nullable = false)
    private Integer semester;

    @Column(name = "exam_eligible")
    private Boolean examEligible;

    public Boolean getExamEligible() {
        return examEligible;
    }

    public void setExamEligible(Boolean examEligible) {
        this.examEligible = examEligible;
    }

    // Derived field for analytics - will be calculated
    @Transient
    private Double attendancePercentage;
}