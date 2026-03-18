package com.ayush.academicerp.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="markss")
@Getter @Setter
public class Marks {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
}
