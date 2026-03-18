package com.ayush.academicerp.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="resources")
@Getter @Setter
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
}
