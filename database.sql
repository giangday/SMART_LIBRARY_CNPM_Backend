-- 1. Tạo cơ sở dữ liệu
CREATE DATABASE IF NOT EXISTS SMART_LIBRARY_CNPM;
USE SMART_LIBRARY_CNPM;

SET foreign_key_checks = 0;

-- Bảng USERS
CREATE TABLE USERS (
    UserID INT PRIMARY KEY,
    FullName VARCHAR(50) NOT NULL,
    Email VARCHAR(100) NOT NULL,
    Password VARCHAR(100) NOT NULL,
    PhoneNumber VARCHAR(15),
    DateOfBirth DATE,
    Sex CHAR(1) CHECK (Sex IN ('M', 'F')),
    Active CHAR(1) CHECK (Active IN ('T', 'F')),
    NoActive CHAR(1) CHECK (NoActive IN ('T', 'F'))
);

-- Bảng STUDENT
CREATE TABLE STUDENT (
    UserID INT,
    MSSV INT,
    UNIQUE(MSSV),
    Department_Class VARCHAR(50),
    FullName VARCHAR(50),
    Date_Start_SignUp DATE,
    Student_NoRoom INT,
    Student_Location VARCHAR(10),
    Student_Building VARCHAR(10),
    PRIMARY KEY(UserID, MSSV),
    FOREIGN KEY (UserID) REFERENCES USERS(UserID) ON DELETE CASCADE,
    FOREIGN KEY (Student_NoRoom, Student_Location, Student_Building)
        REFERENCES SPACE_ROOM(NoRoom, Location, Building) ON DELETE SET NULL
);

-- Bảng ADMIN
CREATE TABLE ADMIN (
    UserID INT,
    MSNV_Admin INT,
    Salary DECIMAL(10,2),
    PRIMARY KEY(UserID, MSNV_Admin),
    UNIQUE(MSNV_Admin),
    FOREIGN KEY (UserID) REFERENCES USERS(UserID) ON DELETE CASCADE
);

-- Bảng STAFF
CREATE TABLE STAFF (
    UserID INT,
    MSNV_Staff INT,
    Salary DECIMAL(10,2),
    PRIMARY KEY(UserID, MSNV_Staff),
    UNIQUE(MSNV_Staff),
    FOREIGN KEY (UserID) REFERENCES USERS(UserID) ON DELETE CASCADE
);

-- Bảng SPACE_ROOM
CREATE TABLE SPACE_ROOM (
    NoRoom INT,
    TypeRoom VARCHAR(50),
    Amount INT,
    QRCheckIn VARCHAR(100),
    QRCheckOut VARCHAR(100),
    Emptys INT,
    NoEmpty INT,
    MSNV_Admin_Room INT,
    Location VARCHAR(50),
    Building VARCHAR(50),
    PRIMARY KEY(NoRoom, Location, Building),
    FOREIGN KEY (MSNV_Admin_Room) REFERENCES ADMIN(MSNV_Admin) ON DELETE SET NULL
);

-- Bảng EQUIPMENT
CREATE TABLE EQUIPMENT (
    MTB INT PRIMARY KEY,
    Name_s VARCHAR(100),
    Amount INT,
    TimeStart DATETIME,
    TimeEnd DATETIME,
    Status VARCHAR(20),
    MSSV_Equipment INT,
    MSNV_Staff_Equipment INT,
    FOREIGN KEY (MSSV_Equipment) REFERENCES STUDENT(MSSV) ON DELETE SET NULL,
    FOREIGN KEY (MSNV_Staff_Equipment) REFERENCES STAFF(MSNV_Staff) ON DELETE SET NULL
);

-- Bảng NOTIFICATION
CREATE TABLE NOTIFICATION (
    STT INT PRIMARY KEY,
    Statistical VARCHAR(100),
    Content TEXT,
    Date_s DATE,
    Read_s CHAR(1),
    News CHAR(1),
    Notification_Before_Time DATETIME,
    MSSV_Notification INT,
    MSNV_Admin_Notification INT,
    FOREIGN KEY (MSSV_Notification) REFERENCES STUDENT(MSSV) ON DELETE CASCADE,
    FOREIGN KEY (MSNV_Admin_Notification) REFERENCES ADMIN(MSNV_Admin) ON DELETE CASCADE
);

-- Bảng REPORT
CREATE TABLE REPORT (
    STT INT PRIMARY KEY,
    Report_Date DATE,
    Content TEXT,
    Date_Sent DATE,
    Amount INT,
    MSNV_Staff_Report INT,
    FOREIGN KEY (MSNV_Staff_Report) REFERENCES STAFF(MSNV_Staff) ON DELETE CASCADE
);

-- Bảng RESERVATION (Thêm mới)
CREATE TABLE RESERVATION (
    ReservationID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT,
    NoRoom INT,
    Location VARCHAR(50),
    Building VARCHAR(50),
    StartTime DATETIME NOT NULL,
    EndTime DATETIME NOT NULL,
    Status ENUM('Pending', 'Confirmed', 'Cancelled', 'Completed') DEFAULT 'Pending',
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES USERS(UserID) ON DELETE CASCADE,
    FOREIGN KEY (NoRoom, Location, Building) REFERENCES SPACE_ROOM(NoRoom, Location, Building) ON DELETE CASCADE,
    CHECK (EndTime > StartTime)
);

SET foreign_key_checks = 1;

-- Dữ liệu mẫu cho USERS
INSERT INTO USERS (UserID, FullName, Email, Password, PhoneNumber, DateOfBirth, Sex, Active, NoActive)
VALUES
(1, 'Nguyen Van A', 'a@hcmut.edu.vn', 'passA', '0123456789', '2002-01-01', 'M', 'T', 'F'),
(2, 'Tran Thi B', 'b@hcmut.edu.vn', 'passB', '0123456790', '2001-03-15', 'F', 'T', 'F'),
(3, 'Le Van C', 'c@hcmut.edu.vn', 'passC', '0123456791', '2003-06-30', 'M', 'F', 'T'),
(4, 'Pham Thi D', 'd@hcmut.edu.vn', 'passD', '0123456792', '2000-12-12', 'F', 'T', 'F'),
(5, 'Hoang Van E', 'e@hcmut.edu.vn', 'passE', '0123456793', '2002-05-09', 'M', 'T', 'F'),
(6, 'Nguyen Van F', 'f@hcmut.edu.vn', 'passF', '0123456794', '2001-08-21', 'M', 'F', 'T'),
(7, 'Tran Thi G', 'g@hcmut.edu.vn', 'passG', '0123456795', '2002-11-01', 'F', 'T', 'F'),
(8, 'Le Van H', 'h@hcmut.edu.vn', 'passH', '0123456796', '2001-02-18', 'M', 'T', 'F'),
(9, 'Pham Thi I', 'i@hcmut.edu.vn', 'passI', '0123456797', '2000-10-10', 'F', 'T', 'F'),
(10, 'Hoang Van J', 'j@hcmut.edu.vn', 'passJ', '012-major', '2003-07-07', 'M', 'T', 'F');

-- Dữ liệu mẫu cho STUDENT
INSERT INTO STUDENT (UserID, MSSV, Department_Class, FullName, Date_Start_SignUp, Student_NoRoom, Student_Location, Student_Building)
VALUES
(1, 2010001, 'CTTT-K22', 'Nguyen Van A', '2022-09-01', 101, 'KhuA', 'A1'),
(2, 2010002, 'CLC-K23', 'Tran Thi B', '2022-09-01', 102, 'KhuA', 'A1'),
(3, 2010003, 'CS-K21', 'Le Van C', '2021-09-01', 103, 'KhuA', 'A2'),
(4, 2010004, 'CTTT-K22', 'Pham Thi D', '2022-09-01', 101, 'KhuA', 'A1'),
(5, 2010005, 'CLC-K24', 'Hoang Van E', '2023-09-01', 104, 'KhuB', 'B1'),
(6, 2010006, 'CS-K20', 'Nguyen Van F', '2020-09-01', 102, 'KhuA', 'A1'),
(7, 2010007, 'CTTT-K21', 'Tran Thi G', '2021-09-01', 105, 'KhuB', 'B1'),
(8, 2010008, 'CS-K23', 'Le Van H', '2022-09-01', 106, 'KhuC', 'C1'),
(9, 2010009, 'CS-K22', 'Pham Thi I', '2022-09-01', 106, 'KhuC', 'C1'),
(10, 2010010, 'CS-K24', 'Hoang Van J', '2023-09-01', 104, 'KhuB', 'B1');

-- Dữ liệu mẫu cho ADMIN
INSERT INTO ADMIN (UserID, MSNV_Admin, Salary)
VALUES
(3, 30001, 12000000.00),
(4, 30002, 13000000.00);

-- Dữ liệu mẫu cho STAFF
INSERT INTO STAFF (UserID, MSNV_Staff, Salary)
VALUES
(6, 40001, 8000000.00),
(7, 40002, 9000000.00);

-- Dữ liệu mẫu cho SPACE_ROOM
INSERT INTO SPACE_ROOM (NoRoom, TypeRoom, Amount, QRCheckIn, QRCheckOut, Emptys, NoEmpty, MSNV_Admin_Room, Location, Building)
VALUES
(101, 'Phòng nhóm', 8, 'QRin101', 'QRout101', 2, 6, 30001, 'KhuA', 'A1'),
(102, 'Phòng cá nhân', 4, 'QRin102', 'QRout102', 1, 3, 30001, 'KhuA', 'A1'),
(103, 'Phòng nhóm', 10, 'QRin103', 'QRout103', 5, 5, 30001, 'KhuA', 'A2'),
(104, 'Phòng hội thảo', 15, 'QRin104', 'QRout104', 3, 12, 30002, 'KhuB', 'B1'),
(105, 'Phòng nhóm', 6, 'QRin105', 'QRout105', 2, 4, 30002, 'KhuB', 'B1'),
(106, 'Phòng cá nhân', 2, 'QRin106', 'QRout106', 0, 2, 30002, 'KhuC', 'C1');

-- Dữ liệu mẫu cho EQUIPMENT
INSERT INTO EQUIPMENT (MTB, Name_s, Amount, TimeStart, TimeEnd, Status, MSSV_Equipment, MSNV_Staff_Equipment)
VALUES
(501, 'Máy chiếu', 2, '2025-04-15 08:00:00', '2025-04-15 10:00:00', 'Đang sử dụng', 2010001, 40001),
(502, 'Laptop', 5, '2025-04-15 09:00:00', '2025-04-15 11:00:00', 'Tốt', 2010002, 40001),
(503, 'Bảng tương tác', 3, '2025-04-15 07:30:00', '2025-04-15 09:00:00', 'Bảo trì', 2010003, 40002),
(504, 'Micro', 4, '2025-04-15 10:00:00', '2025-04-15 12:00:00', 'Hỏng', 2010004, 40002);

-- Dữ liệu mẫu cho NOTIFICATION
INSERT INTO NOTIFICATION (STT, Statistical, Content, Date_s, Read_s, News, Notification_Before_Time, MSSV_Notification, MSNV_Admin_Notification)
VALUES
(1, 'Thông báo thiết bị', 'Bảo trì máy chiếu phòng 101', '2025-04-10', 'F', 'T', '2025-04-09 09:00:00', 2010001, 30001),
(2, 'Nhắc lịch', 'Bạn có lịch học tại phòng 104', '2025-04-12', 'T', 'T', '2025-04-11 08:00:00', 2010005, 30002);

-- Dữ liệu mẫu cho REPORT
INSERT INTO REPORT (STT, Report_Date, Content, Date_Sent, Amount, MSNV_Staff_Report)
VALUES
(1, '2025-04-10', 'Máy chiếu phòng 103 bị lỗi nguồn', '2025-04-11', 1, 40001),
(2, '2025-04-12', 'Laptop không khởi động được', '2025-04-13', 2, 40002);

-- Dữ liệu mẫu cho RESERVATION
INSERT INTO RESERVATION (UserID, NoRoom, Location, Building, StartTime, EndTime, Status)
VALUES
(1, 101, 'KhuA', 'A1', '2025-04-30 08:00:00', '2025-04-30 10:00:00', 'Confirmed'),
(2, 102, 'KhuA', 'A1', '2025-04-30 09:00:00', '2025-04-30 11:00:00', 'Pending'),
(5, 104, 'KhuB', 'B1', '2025-04-30 10:00:00', '2025-04-30 12:00:00', 'Confirmed'),
(8, 106, 'KhuC', 'C1', '2025-04-30 13:00:00', '2025-04-30 15:00:00', 'Cancelled'),
(9, 105, 'KhuB', 'B1', '2025-04-30 14:00:00', '2025-04-30 16:00:00', 'Confirmed');

-- Trigger: Tự động cập nhật trạng thái phòng khi số lượng chỗ trống thay đổi
DELIMITER //
CREATE TRIGGER auto_update_room_status
AFTER UPDATE ON SPACE_ROOM
FOR EACH ROW
BEGIN 
    DECLARE total INT;
    SET total = NEW.Emptys + NEW.NoEmpty;
    IF NEW.Emptys = total THEN
        UPDATE SPACE_ROOM SET TypeRoom = CONCAT(NEW.TypeRoom, '(Trống hoàn toàn)')
        WHERE NoRoom = NEW.NoRoom AND Location = NEW.Location AND Building = NEW.Building;
    END IF;
END;//
DELIMITER ;

-- Trigger: Tự động hủy đặt chỗ nếu không check-in đúng giờ
DELIMITER //
CREATE TRIGGER auto_cancel_reservation
BEFORE UPDATE ON RESERVATION
FOR EACH ROW
BEGIN
    IF NEW.Status = 'Pending' AND NEW.StartTime < NOW() AND TIMESTAMPDIFF(MINUTE, NEW.StartTime, NOW()) > 10 THEN
        SET NEW.Status = 'Cancelled';
    END IF;
END;//
DELIMITER ;

-- Stored Procedure: Báo cáo tình trạng thiết bị
DELIMITER //
CREATE PROCEDURE Equipment_Status_Report()
BEGIN 
    SELECT Status, COUNT(*) AS Total FROM EQUIPMENT GROUP BY Status;
END;// 
DELIMITER ;

-- Stored Procedure: Báo cáo sử dụng phòng
DELIMITER //
CREATE PROCEDURE Room_Usage_Report(IN start_date DATE, IN end_date DATE)
BEGIN 
    SELECT 
        r.NoRoom, 
        r.Location, 
        r.Building, 
        COUNT(res.ReservationID) AS TotalReservations,
        SUM(TIMESTAMPDIFF(HOUR, res.StartTime, res.EndTime)) AS TotalHours
    FROM SPACE_ROOM r
    LEFT JOIN RESERVATION res ON r.NoRoom = res.NoRoom AND r.Location = res.Location AND r.Building = res.Building
    WHERE res.StartTime BETWEEN start_date AND end_date
    GROUP BY r.NoRoom, r.Location, r.Building;
END;// 
DELIMITER ;