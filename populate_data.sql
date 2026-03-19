-- Assign departments to subjects
UPDATE subjects SET department_id = 1 WHERE id IN (1, 2, 3, 4, 5);
UPDATE subjects SET department_id = 2 WHERE id IN (6, 7, 8, 9, 10);
UPDATE subjects SET department_id = 3 WHERE id IN (11, 12);
UPDATE subjects SET department_id = 4 WHERE id IN (13, 14, 15);

-- Clear existing data
DELETE FROM attendance;
DELETE FROM student_subject_enrollments;

-- Enroll students into subjects matching their department
INSERT INTO student_subject_enrollments (student_id, subject_id, is_active)
SELECT s.id, sub.id, 1
FROM students s
JOIN subjects sub ON s.department_id = sub.department_id;

-- Function-like generation of random attendance for the last 60 days
DROP PROCEDURE IF EXISTS GenerateAttendance;
DELIMITER //

CREATE PROCEDURE GenerateAttendance()
BEGIN
    DECLARE student_id_var BIGINT;
    DECLARE subject_id_var BIGINT;
    DECLARE day_offset INT;
    DECLARE status_var VARCHAR(20);
    DECLARE rand_val DOUBLE;
    
    DECLARE done INT DEFAULT FALSE;
    DECLARE cur CURSOR FOR SELECT student_id, subject_id FROM student_subject_enrollments;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO student_id_var, subject_id_var;
        IF done THEN
            LEAVE read_loop;
        END IF;

        SET day_offset = 0;
        WHILE day_offset < 60 DO
            SET rand_val = RAND();
            IF rand_val < 0.80 THEN
                SET status_var = 'PRESENT';
            ELSE
                SET status_var = 'ABSENT';
            END IF;

            INSERT INTO attendance (student_id, subject_id, date, status)
            VALUES (student_id_var, subject_id_var, DATE_SUB(CURDATE(), INTERVAL day_offset DAY), status_var);
            
            SET day_offset = day_offset + 1;
        END WHILE;
    END LOOP;

    CLOSE cur;
END //

DELIMITER ;

CALL GenerateAttendance();
DROP PROCEDURE GenerateAttendance;
