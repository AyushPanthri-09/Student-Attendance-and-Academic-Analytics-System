create table departments (
  id bigint auto_increment primary key,
  name varchar(255) not null
);

create table faculty (
  id bigint auto_increment primary key,
  name varchar(255)
);

create table courses (
  id bigint auto_increment primary key,
  name varchar(255),
  duration varchar(100),
  department_id bigint,
  faculty_id bigint
);

create table subjects (
  id bigint auto_increment primary key,
  name varchar(255) not null,
  code varchar(100) not null,
  department_id bigint,
  semester integer
);

create table students (
  id bigint auto_increment primary key,
  roll_no varchar(100) not null,
  name varchar(255) not null,
  dob date,
  department_id bigint,
  course_id bigint,
  semester integer,
  exam_eligible boolean
);

create table student_subject_enrollments (
  id bigint auto_increment primary key,
  student_id bigint not null,
  subject_id bigint not null,
  enrollment_date timestamp,
  is_active integer
);

create table attendances (
  id bigint auto_increment primary key,
  student_id bigint not null,
  subject_id bigint not null,
  date date not null,
  status varchar(20) not null,
  remarks varchar(1024)
);

-- minimal FK constraints (optional for test)
alter table subjects add constraint fk_subject_department foreign key (department_id) references departments(id);
alter table students add constraint fk_student_department foreign key (department_id) references departments(id);
alter table courses add constraint fk_course_department foreign key (department_id) references departments(id);
alter table courses add constraint fk_course_faculty foreign key (faculty_id) references faculty(id);
alter table student_subject_enrollments add constraint fk_enroll_student foreign key (student_id) references students(id);
alter table student_subject_enrollments add constraint fk_enroll_subject foreign key (subject_id) references subjects(id);
alter table attendances add constraint fk_att_student foreign key (student_id) references students(id);
alter table attendances add constraint fk_att_subject foreign key (subject_id) references subjects(id);
