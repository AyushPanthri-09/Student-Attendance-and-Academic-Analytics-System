# Create root folder
New-Item -ItemType Directory -Name backend -Force
Set-Location backend

# Create main folder structure
New-Item -ItemType Directory -Path "src/main/java/com/ayush/academicerp/config" -Force
New-Item -ItemType Directory -Path "src/main/java/com/ayush/academicerp/controller" -Force
New-Item -ItemType Directory -Path "src/main/java/com/ayush/academicerp/dto" -Force
New-Item -ItemType Directory -Path "src/main/java/com/ayush/academicerp/entity" -Force
New-Item -ItemType Directory -Path "src/main/java/com/ayush/academicerp/repository" -Force
New-Item -ItemType Directory -Path "src/main/java/com/ayush/academicerp/service" -Force
New-Item -ItemType Directory -Path "src/main/resources" -Force

# -------------------------------
# Create pom.xml
# -------------------------------
@"
<project xmlns="http://maven.apache.org/POM/4.0.0"
 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
 xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
 http://maven.apache.org/xsd/maven-4.0.0.xsd">

 <modelVersion>4.0.0</modelVersion>
 <groupId>com.ayush</groupId>
 <artifactId>academic-erp</artifactId>
 <version>0.0.1-SNAPSHOT</version>
 <packaging>jar</packaging>

 <parent>
     <groupId>org.springframework.boot</groupId>
     <artifactId>spring-boot-starter-parent</artifactId>
     <version>3.2.5</version>
 </parent>

 <properties>
     <java.version>17</java.version>
 </properties>

 <dependencies>
     <dependency>
         <groupId>org.springframework.boot</groupId>
         <artifactId>spring-boot-starter-web</artifactId>
     </dependency>

     <dependency>
         <groupId>org.springframework.boot</groupId>
         <artifactId>spring-boot-starter-data-jpa</artifactId>
     </dependency>

     <dependency>
         <groupId>org.springframework.boot</groupId>
         <artifactId>spring-boot-starter-security</artifactId>
     </dependency>

     <dependency>
         <groupId>mysql</groupId>
         <artifactId>mysql-connector-j</artifactId>
     </dependency>

     <dependency>
         <groupId>io.jsonwebtoken</groupId>
         <artifactId>jjwt-api</artifactId>
         <version>0.11.5</version>
     </dependency>

     <dependency>
         <groupId>io.jsonwebtoken</groupId>
         <artifactId>jjwt-impl</artifactId>
         <version>0.11.5</version>
         <scope>runtime</scope>
     </dependency>

     <dependency>
         <groupId>io.jsonwebtoken</groupId>
         <artifactId>jjwt-jackson</artifactId>
         <version>0.11.5</version>
         <scope>runtime</scope>
     </dependency>
 </dependencies>

 <build>
     <plugins>
         <plugin>
             <groupId>org.springframework.boot</groupId>
             <artifactId>spring-boot-maven-plugin</artifactId>
         </plugin>
     </plugins>
 </build>
</project>
"@ | Set-Content pom.xml

# -------------------------------
# application.properties
# -------------------------------
@"
spring.datasource.url=jdbc:mysql://localhost:3306/academic_erp?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=Ayush@123

spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect

server.port=8080

app.jwt.secret=AcademicErpSecretKeyForJwtToken123456789
app.jwt.expiration=86400000
"@ | Set-Content src/main/resources/application.properties

# -------------------------------
# Main Application Class
# -------------------------------
@"
package com.ayush.academicerp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AcademicErpApplication {
    public static void main(String[] args) {
        SpringApplication.run(AcademicErpApplication.class, args);
    }
}
"@ | Set-Content src/main/java/com/ayush/academicerp/AcademicErpApplication.java

Write-Host "Backend base structure created successfully."