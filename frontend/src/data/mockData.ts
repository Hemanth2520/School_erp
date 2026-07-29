// ============================================
// COMPLETE MOCK DATA ENGINE - School ERP
// ============================================

// ---- STUDENTS ----
export const students = [
  { id: 'STU001', name: 'Aarav Sharma', rollNo: '101', class: '10th', section: 'A', gender: 'Male', dob: '2009-03-15', phone: '9876543210', email: 'aarav@school.com', address: '12, MG Road, Pune', parentName: 'Ramesh Sharma', status: 'Active', admissionDate: '2023-06-01', feeStatus: 'Paid', photo: '' },
  { id: 'STU002', name: 'Diya Patel', rollNo: '102', class: '10th', section: 'A', gender: 'Female', dob: '2009-07-22', phone: '9876543211', email: 'diya@school.com', address: '45, SV Road, Mumbai', parentName: 'Hiren Patel', status: 'Active', admissionDate: '2023-06-01', feeStatus: 'Pending', photo: '' },
  { id: 'STU003', name: 'Rohan Gupta', rollNo: '201', class: '11th', section: 'Science', gender: 'Male', dob: '2008-11-10', phone: '9876543212', email: 'rohan@school.com', address: '78, FC Road, Pune', parentName: 'Suresh Gupta', status: 'Active', admissionDate: '2022-06-01', feeStatus: 'Paid', photo: '' },
  { id: 'STU004', name: 'Ananya Singh', rollNo: '301', class: '8th', section: 'C', gender: 'Female', dob: '2011-05-18', phone: '9876543213', email: 'ananya@school.com', address: '23, DL Road, Delhi', parentName: 'Vikram Singh', status: 'Active', admissionDate: '2023-06-01', feeStatus: 'Overdue', photo: '' },
  { id: 'STU005', name: 'Kiran Reddy', rollNo: '401', class: '12th', section: 'Commerce', gender: 'Male', dob: '2007-09-03', phone: '9876543214', email: 'kiran@school.com', address: '56, Jubilee Hills, Hyderabad', parentName: 'Naresh Reddy', status: 'Active', admissionDate: '2021-06-01', feeStatus: 'Paid', photo: '' },
  { id: 'STU006', name: 'Priya Joshi', rollNo: '501', class: '9th', section: 'B', gender: 'Female', dob: '2010-01-25', phone: '9876543215', email: 'priya@school.com', address: '34, Koregaon Park, Pune', parentName: 'Amit Joshi', status: 'Active', admissionDate: '2023-06-01', feeStatus: 'Paid', photo: '' },
  { id: 'STU007', name: 'Arjun Kumar', rollNo: '601', class: '7th', section: 'A', gender: 'Male', dob: '2012-08-14', phone: '9876543216', email: 'arjun@school.com', address: '67, Anna Nagar, Chennai', parentName: 'Rajesh Kumar', status: 'Inactive', admissionDate: '2022-06-01', feeStatus: 'Pending', photo: '' },
  { id: 'STU008', name: 'Meera Verma', rollNo: '701', class: '6th', section: 'B', gender: 'Female', dob: '2013-12-30', phone: '9876543217', email: 'meera@school.com', address: '89, BTM Layout, Bangalore', parentName: 'Sanjay Verma', status: 'Active', admissionDate: '2023-06-01', feeStatus: 'Paid', photo: '' },
];

// ---- TEACHERS ----
export const teachers = [
  { id: 'TCH001', name: 'Dr. John Mathew', employeeId: 'EMP001', subject: 'Mathematics', qualification: 'M.Sc, B.Ed', experience: '12 years', phone: '9988776655', email: 'john.m@school.com', gender: 'Male', dob: '1985-04-10', joinDate: '2012-07-01', salary: 75000, status: 'Active', classTeacher: '10th A', address: '23 Oak Lane, Pune' },
  { id: 'TCH002', name: 'Alice Smith', employeeId: 'EMP002', subject: 'Physics', qualification: 'M.Sc', experience: '8 years', phone: '9988776656', email: 'alice.s@school.com', gender: 'Female', dob: '1990-09-15', joinDate: '2016-07-01', salary: 65000, status: 'Active', classTeacher: '11th Science', address: '45 Maple Ave, Mumbai' },
  { id: 'TCH003', name: 'Robert King', employeeId: 'EMP003', subject: 'Chemistry', qualification: 'M.Sc, Ph.D', experience: '15 years', phone: '9988776657', email: 'robert.k@school.com', gender: 'Male', dob: '1980-02-20', joinDate: '2009-07-01', salary: 85000, status: 'Active', classTeacher: '12th Science', address: '67 Pine Rd, Bangalore' },
  { id: 'TCH004', name: 'Mary Jane', employeeId: 'EMP004', subject: 'English', qualification: 'M.A, B.Ed', experience: '10 years', phone: '9988776658', email: 'mary.j@school.com', gender: 'Female', dob: '1988-11-05', joinDate: '2014-07-01', salary: 60000, status: 'Active', classTeacher: '9th A', address: '89 Cedar St, Delhi' },
  { id: 'TCH005', name: 'Suresh Nair', employeeId: 'EMP005', subject: 'History', qualification: 'M.A', experience: '5 years', phone: '9988776659', email: 'suresh.n@school.com', gender: 'Male', dob: '1993-07-18', joinDate: '2019-07-01', salary: 50000, status: 'On Leave', classTeacher: '8th B', address: '12 Willow Way, Chennai' },
  { id: 'TCH006', name: 'Priya Menon', employeeId: 'EMP006', subject: 'Biology', qualification: 'M.Sc, B.Ed', experience: '9 years', phone: '9988776660', email: 'priya.m@school.com', gender: 'Female', dob: '1991-03-22', joinDate: '2015-07-01', salary: 68000, status: 'Active', classTeacher: '11th Biology', address: '34 Elm Blvd, Hyderabad' },
];

// ---- PARENTS ----
export const parents = [
  { id: 'PAR001', name: 'Ramesh Sharma', phone: '9876543210', email: 'ramesh.s@gmail.com', occupation: 'Engineer', address: '12, MG Road, Pune', students: ['STU001'], annualIncome: '₹12,00,000' },
  { id: 'PAR002', name: 'Hiren Patel', phone: '9876543211', email: 'hiren.p@gmail.com', occupation: 'Businessman', address: '45, SV Road, Mumbai', students: ['STU002'], annualIncome: '₹18,00,000' },
  { id: 'PAR003', name: 'Suresh Gupta', phone: '9876543212', email: 'suresh.g@gmail.com', occupation: 'Doctor', address: '78, FC Road, Pune', students: ['STU003'], annualIncome: '₹25,00,000' },
  { id: 'PAR004', name: 'Vikram Singh', phone: '9876543213', email: 'vikram.s@gmail.com', occupation: 'IAS Officer', address: '23, DL Road, Delhi', students: ['STU004'], annualIncome: '₹10,00,000' },
];

// ---- ADMISSIONS ----
export const admissions = [
  { id: 'ADM001', name: 'Aarav Sharma', class: '10th', section: 'A', date: '2024-05-12', status: 'Approved', gender: 'Male', dob: '2009-03-15', parentName: 'Ramesh Sharma', phone: '9876543210', source: 'Walk-in', agent: 'Direct', previousSchool: 'Green Valley School' },
  { id: 'ADM002', name: 'Diya Patel', class: '9th', section: 'B', date: '2024-05-12', status: 'Pending', gender: 'Female', dob: '2010-07-22', parentName: 'Hiren Patel', phone: '9876543211', source: 'Agent', agent: 'AGT001', previousSchool: 'Sunrise Academy' },
  { id: 'ADM003', name: 'Rohan Gupta', class: '11th', section: 'Science', date: '2024-05-11', status: 'Approved', gender: 'Male', dob: '2008-11-10', parentName: 'Suresh Gupta', phone: '9876543212', source: 'Online', agent: 'Direct', previousSchool: 'Star International School' },
  { id: 'ADM004', name: 'Ananya Singh', class: '8th', section: 'C', date: '2024-05-10', status: 'Approved', gender: 'Female', dob: '2011-05-18', parentName: 'Vikram Singh', phone: '9876543213', source: 'Walk-in', agent: 'Direct', previousSchool: 'City School' },
  { id: 'ADM005', name: 'Kiran Reddy', class: '12th', section: 'Commerce', date: '2024-05-09', status: 'Rejected', gender: 'Male', dob: '2007-09-03', parentName: 'Naresh Reddy', phone: '9876543214', source: 'Agent', agent: 'AGT002', previousSchool: 'Apollo School' },
  { id: 'ADM006', name: 'Fatima Khan', class: '10th', section: 'B', date: '2024-05-08', status: 'Interview', gender: 'Female', dob: '2009-06-20', parentName: 'Imran Khan', phone: '9876543215', source: 'Online', agent: 'Direct', previousSchool: 'Crescent School' },
];

// ---- FEE TYPES ----
export const feeTypes = [
  { id: 'FT001', name: 'Tuition Fee', description: 'Monthly tuition charges', amount: 15000, frequency: 'Monthly', applicable: 'All Classes', status: 'Active' },
  { id: 'FT002', name: 'Transport Fee', description: 'School bus charges', amount: 2500, frequency: 'Monthly', applicable: 'Transport Students', status: 'Active' },
  { id: 'FT003', name: 'Library Fee', description: 'Annual library membership', amount: 1000, frequency: 'Annual', applicable: 'All Classes', status: 'Active' },
  { id: 'FT004', name: 'Lab Fee', description: 'Science lab usage fee', amount: 3000, frequency: 'Annual', applicable: '9th - 12th', status: 'Active' },
  { id: 'FT005', name: 'Sports Fee', description: 'Sports and games fee', amount: 1500, frequency: 'Annual', applicable: 'All Classes', status: 'Active' },
  { id: 'FT006', name: 'Hostel Fee', description: 'Boarding and lodging', amount: 12000, frequency: 'Monthly', applicable: 'Hostel Students', status: 'Active' },
  { id: 'FT007', name: 'Admission Fee', description: 'One-time admission charges', amount: 5000, frequency: 'One-time', applicable: 'New Students', status: 'Active' },
];

// ---- TRANSACTIONS ----
export const transactions = [
  { id: 'TRX-1092', student: 'Aarav Sharma', studentId: 'STU001', type: 'Tuition Fee', amount: 15000, date: '2024-06-01', status: 'Completed', method: 'Credit Card', receiptNo: 'RCP-2024-001', class: '10th A' },
  { id: 'TRX-1093', student: 'Diya Patel', studentId: 'STU002', type: 'Library Fee', amount: 1000, date: '2024-06-02', status: 'Pending', method: 'Bank Transfer', receiptNo: '', class: '9th B' },
  { id: 'TRX-1094', student: 'Rohan Gupta', studentId: 'STU003', type: 'Transport Fee', amount: 2500, date: '2024-06-02', status: 'Completed', method: 'Cash', receiptNo: 'RCP-2024-002', class: '11th Science' },
  { id: 'TRX-1095', student: 'Ananya Singh', studentId: 'STU004', type: 'Tuition Fee', amount: 15000, date: '2024-06-03', status: 'Failed', method: 'UPI', receiptNo: '', class: '8th C' },
  { id: 'TRX-1096', student: 'Kiran Reddy', studentId: 'STU005', type: 'Hostel Fee', amount: 12000, date: '2024-06-04', status: 'Completed', method: 'Cheque', receiptNo: 'RCP-2024-003', class: '12th Commerce' },
  { id: 'TRX-1097', student: 'Priya Joshi', studentId: 'STU006', type: 'Lab Fee', amount: 3000, date: '2024-06-05', status: 'Completed', method: 'UPI', receiptNo: 'RCP-2024-004', class: '9th B' },
];

// ---- SUBJECTS ----
export const subjects = [
  { id: 'SUB001', name: 'Mathematics', code: 'MTH101', teacher: 'Dr. John Mathew', teacherId: 'TCH001', classes: ['10th A', '10th B'], credits: 4, type: 'Core', status: 'Active' },
  { id: 'SUB002', name: 'Physics', code: 'PHY101', teacher: 'Alice Smith', teacherId: 'TCH002', classes: ['11th Science'], credits: 4, type: 'Core', status: 'Active' },
  { id: 'SUB003', name: 'Chemistry', code: 'CHM101', teacher: 'Robert King', teacherId: 'TCH003', classes: ['11th Science', '12th Science'], credits: 4, type: 'Core', status: 'Active' },
  { id: 'SUB004', name: 'English Literature', code: 'ENG201', teacher: 'Mary Jane', teacherId: 'TCH004', classes: ['9th A', '9th B'], credits: 3, type: 'Core', status: 'Active' },
  { id: 'SUB005', name: 'History', code: 'HST101', teacher: 'Suresh Nair', teacherId: 'TCH005', classes: ['8th B', '8th C'], credits: 3, type: 'Core', status: 'Active' },
  { id: 'SUB006', name: 'Biology', code: 'BIO101', teacher: 'Priya Menon', teacherId: 'TCH006', classes: ['11th Biology', '12th Biology'], credits: 4, type: 'Core', status: 'Active' },
  { id: 'SUB007', name: 'Computer Science', code: 'CS101', teacher: 'Dr. John Mathew', teacherId: 'TCH001', classes: ['10th A', '11th Science'], credits: 3, type: 'Elective', status: 'Active' },
];

// ---- CLASSES ----
export const classes = [
  { id: 'CLS001', name: '10th', sections: ['A', 'B', 'C'], students: 120, classTeacher: 'Dr. John Mathew', room: 'Room 201', academicYear: '2024-25' },
  { id: 'CLS002', name: '11th', sections: ['Science', 'Commerce', 'Arts'], students: 95, classTeacher: 'Alice Smith', room: 'Room 301', academicYear: '2024-25' },
  { id: 'CLS003', name: '12th', sections: ['Science', 'Commerce'], students: 85, classTeacher: 'Robert King', room: 'Room 401', academicYear: '2024-25' },
  { id: 'CLS004', name: '9th', sections: ['A', 'B'], students: 110, classTeacher: 'Mary Jane', room: 'Room 101', academicYear: '2024-25' },
  { id: 'CLS005', name: '8th', sections: ['A', 'B', 'C'], students: 130, classTeacher: 'Suresh Nair', room: 'Room 102', academicYear: '2024-25' },
];

// ---- ATTENDANCE ----
export const attendanceRecords = [
  { id: 'ATT001', studentId: 'STU001', studentName: 'Aarav Sharma', class: '10th A', date: '2024-06-10', status: 'Present', subject: 'Mathematics' },
  { id: 'ATT002', studentId: 'STU002', studentName: 'Diya Patel', class: '10th A', date: '2024-06-10', status: 'Absent', subject: 'Mathematics' },
  { id: 'ATT003', studentId: 'STU003', studentName: 'Rohan Gupta', class: '11th Science', date: '2024-06-10', status: 'Present', subject: 'Physics' },
  { id: 'ATT004', studentId: 'STU004', studentName: 'Ananya Singh', class: '8th C', date: '2024-06-10', status: 'Late', subject: 'History' },
  { id: 'ATT005', studentId: 'STU005', studentName: 'Kiran Reddy', class: '12th Commerce', date: '2024-06-10', status: 'Present', subject: 'Accounts' },
  { id: 'ATT006', studentId: 'STU006', studentName: 'Priya Joshi', class: '9th B', date: '2024-06-10', status: 'Present', subject: 'English' },
];

// ---- EXAMS ----
export const exams = [
  { id: 'EXM001', name: 'Mid-Term Examination', class: '10th', type: 'Mid-Term', startDate: '2024-07-15', endDate: '2024-07-25', totalMarks: 100, passMarks: 35, status: 'Upcoming' },
  { id: 'EXM002', name: 'Unit Test 1', class: '11th Science', type: 'Unit Test', startDate: '2024-06-20', endDate: '2024-06-22', totalMarks: 50, passMarks: 20, status: 'Completed' },
  { id: 'EXM003', name: 'Annual Examination', class: 'All Classes', type: 'Annual', startDate: '2025-02-15', endDate: '2025-03-05', totalMarks: 100, passMarks: 35, status: 'Scheduled' },
  { id: 'EXM004', name: 'Quarterly Exam', class: '9th', type: 'Quarterly', startDate: '2024-08-10', endDate: '2024-08-15', totalMarks: 80, passMarks: 28, status: 'Upcoming' },
];

// ---- EXAM RESULTS ----
export const examResults = [
  { id: 'RES001', examId: 'EXM002', studentId: 'STU001', studentName: 'Aarav Sharma', class: '11th Science', subject: 'Physics', marksObtained: 42, totalMarks: 50, percentage: 84, grade: 'A', rank: 3 },
  { id: 'RES002', examId: 'EXM002', studentId: 'STU003', studentName: 'Rohan Gupta', class: '11th Science', subject: 'Physics', marksObtained: 48, totalMarks: 50, percentage: 96, grade: 'A+', rank: 1 },
  { id: 'RES003', examId: 'EXM002', studentId: 'STU006', studentName: 'Priya Joshi', class: '11th Science', subject: 'Physics', marksObtained: 38, totalMarks: 50, percentage: 76, grade: 'B+', rank: 5 },
];

// ---- HOSTELS ----
export const hostels = [
  { id: 'HST001', name: 'Boys Hostel Block A', type: 'Boys', floors: 3, totalRooms: 60, occupiedRooms: 52, capacity: 180, warden: 'Mr. Govind Das', chiefWarden: 'Dr. Sanjay Bose', facilities: ['Wi-Fi', 'Mess', 'Gym', 'TV Room'], status: 'Active' },
  { id: 'HST002', name: 'Girls Hostel Block B', type: 'Girls', floors: 4, totalRooms: 80, occupiedRooms: 75, capacity: 240, warden: 'Mrs. Rekha Sharma', chiefWarden: 'Dr. Sanjay Bose', facilities: ['Wi-Fi', 'Mess', 'Library', 'Common Room'], status: 'Active' },
];

// ---- HOSTEL ROOMS ----
export const hostelRooms = [
  { id: 'HRM001', hostelId: 'HST001', roomNo: '101', type: 'Double', capacity: 2, occupied: 2, floor: 1, facilities: ['AC', 'Attached Bath'], status: 'Full' },
  { id: 'HRM002', hostelId: 'HST001', roomNo: '102', type: 'Triple', capacity: 3, occupied: 2, floor: 1, facilities: ['Fan', 'Attached Bath'], status: 'Available' },
  { id: 'HRM003', hostelId: 'HST002', roomNo: '201', type: 'Single', capacity: 1, occupied: 1, floor: 2, facilities: ['AC', 'Attached Bath', 'Study Table'], status: 'Full' },
  { id: 'HRM004', hostelId: 'HST002', roomNo: '202', type: 'Double', capacity: 2, occupied: 0, floor: 2, facilities: ['Fan'], status: 'Available' },
];

// ---- LIBRARY ----
export const books = [
  { id: 'BK001', title: 'Advanced Mathematics Vol. 1', author: 'R.D. Sharma', isbn: '978-93-5176-123-4', category: 'Academics', publisher: 'Dhanpat Rai', year: 2020, copies: 15, available: 8, status: 'Available' },
  { id: 'BK002', title: 'Concepts of Physics', author: 'H.C. Verma', isbn: '978-81-7764-480-4', category: 'Academics', publisher: 'Bharati Bhawan', year: 2019, copies: 20, available: 5, status: 'Available' },
  { id: 'BK003', title: 'Wings of Fire', author: 'A.P.J. Abdul Kalam', isbn: '978-81-7371-146-8', category: 'Biography', publisher: 'Universities Press', year: 2018, copies: 10, available: 0, status: 'All Issued' },
  { id: 'BK004', title: 'Organic Chemistry', author: 'O.P. Tandon', isbn: '978-93-5176-789-2', category: 'Academics', publisher: 'G.R. Bathla', year: 2021, copies: 12, available: 7, status: 'Available' },
  { id: 'BK005', title: 'Discovery of India', author: 'Jawaharlal Nehru', isbn: '978-81-7371-056-0', category: 'History', publisher: 'Penguin Books', year: 2016, copies: 8, available: 3, status: 'Available' },
];

// ---- BOOK ISSUES ----
export const bookIssues = [
  { id: 'ISS001', bookId: 'BK001', bookTitle: 'Advanced Mathematics Vol. 1', memberId: 'STU001', memberName: 'Aarav Sharma', issueDate: '2024-05-20', dueDate: '2024-06-03', returnDate: null, status: 'Issued', fine: 0 },
  { id: 'ISS002', bookId: 'BK003', bookTitle: 'Wings of Fire', memberId: 'STU002', memberName: 'Diya Patel', issueDate: '2024-04-15', dueDate: '2024-04-29', returnDate: '2024-05-10', status: 'Returned', fine: 55 },
  { id: 'ISS003', bookId: 'BK002', bookTitle: 'Concepts of Physics', memberId: 'TCH002', memberName: 'Alice Smith', issueDate: '2024-05-01', dueDate: '2024-05-15', returnDate: null, status: 'Overdue', fine: 120 },
];

// ---- TRANSPORT ----
export const buses = [
  { id: 'BUS001', busNo: 'MH-12-AB-1234', driver: 'Ram Shetty', driverId: 'DRV001', capacity: 45, students: 38, route: 'Route A - Koregaon Park', coordinator: 'Vijay More', status: 'Active', lastService: '2024-05-01' },
  { id: 'BUS002', busNo: 'MH-12-CD-5678', driver: 'Shyam Yadav', driverId: 'DRV002', capacity: 45, students: 42, route: 'Route B - Kothrud', coordinator: 'Anita Patil', status: 'Active', lastService: '2024-04-15' },
  { id: 'BUS003', busNo: 'MH-12-EF-9012', driver: 'Mohan Singh', driverId: 'DRV003', capacity: 35, students: 30, route: 'Route C - Wakad', coordinator: 'Rahul Desai', status: 'Maintenance', lastService: '2024-03-20' },
];

export const routes = [
  { id: 'RT001', name: 'Route A - Koregaon Park', stops: ['School Gate', 'Kalyani Nagar', 'Koregaon Park', 'Bund Garden', 'Camp'], busId: 'BUS001', students: 38, distance: '12 km', time: '45 mins' },
  { id: 'RT002', name: 'Route B - Kothrud', stops: ['School Gate', 'Karve Nagar', 'Warje', 'Kothrud', 'Chandni Chowk'], busId: 'BUS002', students: 42, distance: '15 km', time: '55 mins' },
  { id: 'RT003', name: 'Route C - Wakad', stops: ['School Gate', 'Aundh', 'Baner', 'Balewadi', 'Wakad'], busId: 'BUS003', students: 30, distance: '18 km', time: '65 mins' },
];

// ---- INVENTORY ----
export const inventory = [
  { id: 'INV001', name: 'A4 Paper Ream', category: 'Stationery', quantity: 500, unit: 'Reams', minStock: 50, supplier: 'PaperWorld Pvt Ltd', cost: 350, lastPurchase: '2024-05-01', location: 'Store Room 1', status: 'In Stock' },
  { id: 'INV002', name: 'Whiteboard Marker', category: 'Stationery', quantity: 200, unit: 'Pcs', minStock: 30, supplier: 'Camlin India', cost: 25, lastPurchase: '2024-05-15', location: 'Store Room 1', status: 'In Stock' },
  { id: 'INV003', name: 'Desk Chair', category: 'Furniture', quantity: 12, unit: 'Nos', minStock: 5, supplier: 'FurnitureCo', cost: 3500, lastPurchase: '2024-03-01', location: 'Store Room 2', status: 'In Stock' },
  { id: 'INV004', name: 'Chemistry Lab Glassware Set', category: 'Lab Equipment', quantity: 4, unit: 'Set', minStock: 5, supplier: 'LabSupplies Ltd', cost: 8500, lastPurchase: '2024-01-15', location: 'Lab Store', status: 'Low Stock' },
  { id: 'INV005', name: 'Projector Bulb', category: 'Electronics', quantity: 2, unit: 'Nos', minStock: 3, supplier: 'TechZone', cost: 4500, lastPurchase: '2024-04-01', location: 'AV Room', status: 'Low Stock' },
];

// ---- NOTICES ----
export const notices = [
  { id: 'NOT001', title: 'Annual Sports Day - 2024', content: 'The Annual Sports Day will be held on July 15, 2024. All students are requested to participate enthusiastically. Parents are cordially invited to attend the event.', category: 'Event', targetAudience: 'All', date: '2024-06-10', author: 'Principal', priority: 'High', status: 'Published' },
  { id: 'NOT002', title: 'Holiday Notice - Eid', content: 'School will remain closed on June 17, 2024 on account of Eid. Classes will resume on June 18, 2024.', category: 'Holiday', targetAudience: 'All', date: '2024-06-08', author: 'Admin', priority: 'Medium', status: 'Published' },
  { id: 'NOT003', title: 'Parent-Teacher Meeting - June 2024', content: 'Parent-Teacher Meeting is scheduled for June 20, 2024 from 9:00 AM to 1:00 PM. All parents are requested to attend.', category: 'Meeting', targetAudience: 'Parents', date: '2024-06-07', author: 'Principal', priority: 'High', status: 'Published' },
  { id: 'NOT004', title: 'Online Exam Guidelines', content: 'Students appearing for the online examination must ensure stable internet connection. The exam link will be sent 30 minutes before the scheduled time.', category: 'Academic', targetAudience: 'Students', date: '2024-06-05', author: 'Exam Coordinator', priority: 'Medium', status: 'Draft' },
];

// ---- AGENTS ----
export const agents = [
  { id: 'AGT001', name: 'Vijay Consultancy', contactPerson: 'Vijay Mehta', phone: '9898989898', email: 'vijay.consult@gmail.com', area: 'Pune South', commission: '5%', totalAdmissions: 45, pendingPayment: 12500, status: 'Active' },
  { id: 'AGT002', name: 'EduPoint Services', contactPerson: 'Priya Agarwal', phone: '9797979797', email: 'edupoint@gmail.com', area: 'Mumbai West', commission: '6%', totalAdmissions: 32, pendingPayment: 8200, status: 'Active' },
  { id: 'AGT003', name: 'Bright Future Academy', contactPerson: 'Rajan Shah', phone: '9696969696', email: 'bright.future@gmail.com', area: 'Nashik', commission: '4%', totalAdmissions: 18, pendingPayment: 0, status: 'Inactive' },
];

// ---- LEAVE MANAGEMENT ----
export const leaveTypes = [
  { id: 'LT001', name: 'Casual Leave', code: 'CL', maxDays: 12, carryForward: false, paidLeave: true, applicableTo: 'All Staff' },
  { id: 'LT002', name: 'Medical Leave', code: 'ML', maxDays: 15, carryForward: false, paidLeave: true, applicableTo: 'All Staff' },
  { id: 'LT003', name: 'Earned Leave', code: 'EL', maxDays: 30, carryForward: true, paidLeave: true, applicableTo: 'Teaching Staff' },
  { id: 'LT004', name: 'Maternity Leave', code: 'MAL', maxDays: 180, carryForward: false, paidLeave: true, applicableTo: 'Female Staff' },
];

export const leaveApplications = [
  { id: 'LA001', applicantId: 'TCH002', applicantName: 'Alice Smith', type: 'Casual Leave', startDate: '2024-06-17', endDate: '2024-06-18', days: 2, reason: 'Personal work', status: 'Approved', approvedBy: 'Principal', appliedOn: '2024-06-10' },
  { id: 'LA002', applicantId: 'TCH005', applicantName: 'Suresh Nair', type: 'Medical Leave', startDate: '2024-06-20', endDate: '2024-06-28', days: 9, reason: 'Medical treatment', status: 'Pending', approvedBy: null, appliedOn: '2024-06-15' },
  { id: 'LA003', applicantId: 'TCH001', applicantName: 'Dr. John Mathew', type: 'Earned Leave', startDate: '2024-07-01', endDate: '2024-07-05', days: 5, reason: 'Vacation', status: 'Rejected', approvedBy: 'Principal', appliedOn: '2024-06-20' },
];

// ---- STAFF ----
export const staff = [
  { id: 'STF001', name: 'Gopal Naidu', employeeId: 'ADM001', designation: 'Principal', department: 'Administration', phone: '9911001100', email: 'principal@school.com', joinDate: '2010-01-01', salary: 120000, status: 'Active', type: 'Administrative' },
  { id: 'STF002', name: 'Kamla Patil', employeeId: 'ADM002', designation: 'Vice Principal', department: 'Administration', phone: '9911001101', email: 'vp@school.com', joinDate: '2012-07-01', salary: 95000, status: 'Active', type: 'Administrative' },
  { id: 'STF003', name: 'Ravi Kumar', employeeId: 'ACC001', designation: 'Accountant', department: 'Finance', phone: '9911001102', email: 'accounts@school.com', joinDate: '2015-01-01', salary: 45000, status: 'Active', type: 'Non-Teaching' },
  { id: 'STF004', name: 'Sita Devi', employeeId: 'CLN001', designation: 'Head Cleaner', department: 'Support', phone: '9911001103', email: null, joinDate: '2018-01-01', salary: 18000, status: 'Active', type: 'Support' },
];

// ---- PAYROLL ----
export const payroll = [
  { id: 'PAY001', employeeId: 'TCH001', employeeName: 'Dr. John Mathew', month: 'June 2024', basicSalary: 75000, hra: 15000, ta: 5000, deductions: 5850, netSalary: 89150, status: 'Paid', paidOn: '2024-07-01' },
  { id: 'PAY002', employeeId: 'TCH002', employeeName: 'Alice Smith', month: 'June 2024', basicSalary: 65000, hra: 13000, ta: 5000, deductions: 5070, netSalary: 77930, status: 'Paid', paidOn: '2024-07-01' },
  { id: 'PAY003', employeeId: 'TCH005', employeeName: 'Suresh Nair', month: 'June 2024', basicSalary: 50000, hra: 10000, ta: 4000, deductions: 3900, netSalary: 60100, status: 'Pending', paidOn: null },
  { id: 'PAY004', employeeId: 'STF001', employeeName: 'Gopal Naidu', month: 'June 2024', basicSalary: 120000, hra: 24000, ta: 8000, deductions: 9360, netSalary: 142640, status: 'Paid', paidOn: '2024-07-01' },
];

// ---- CHART DATA ----
export const revenueData = [
  { name: 'Jan', total: 1200000 },
  { name: 'Feb', total: 1400000 },
  { name: 'Mar', total: 1100000 },
  { name: 'Apr', total: 1800000 },
  { name: 'May', total: 1500000 },
  { name: 'Jun', total: 2000000 },
  { name: 'Jul', total: 2400000 },
  { name: 'Aug', total: 2100000 },
  { name: 'Sep', total: 2800000 },
  { name: 'Oct', total: 2600000 },
  { name: 'Nov', total: 3200000 },
  { name: 'Dec', total: 3800000 },
];

export const attendanceData = [
  { name: 'Mon', present: 92, absent: 8 },
  { name: 'Tue', present: 88, absent: 12 },
  { name: 'Wed', present: 95, absent: 5 },
  { name: 'Thu', present: 90, absent: 10 },
  { name: 'Fri', present: 85, absent: 15 },
];

export const admissionTrend = [
  { name: 'Apr', count: 12 },
  { name: 'May', count: 28 },
  { name: 'Jun', count: 45 },
  { name: 'Jul', count: 38 },
  { name: 'Aug', count: 10 },
];

// ---- CERTIFICATES ----
export const certificateTemplates = [
  { id: 'CT001', name: 'Transfer Certificate', type: 'TC', description: 'Official transfer certificate for students leaving the school', lastUsed: '2024-06-01', status: 'Active' },
  { id: 'CT002', name: 'Bonafide Certificate', type: 'BON', description: 'Certificate confirming student enrollment', lastUsed: '2024-06-08', status: 'Active' },
  { id: 'CT003', name: 'Character Certificate', type: 'CHR', description: 'Character certificate for students', lastUsed: '2024-05-20', status: 'Active' },
  { id: 'CT004', name: 'Merit Certificate', type: 'MRT', description: 'Certificate for academic merit and achievements', lastUsed: '2024-04-15', status: 'Active' },
];

export const generatedCertificates = [
  { id: 'GCT001', templateId: 'CT001', templateName: 'Transfer Certificate', studentId: 'STU007', studentName: 'Arjun Kumar', class: '7th A', generatedOn: '2024-06-01', generatedBy: 'Admin', serial: 'TC-2024-001' },
  { id: 'GCT002', templateId: 'CT002', templateName: 'Bonafide Certificate', studentId: 'STU001', studentName: 'Aarav Sharma', class: '10th A', generatedOn: '2024-06-08', generatedBy: 'Admin', serial: 'BON-2024-001' },
];

// ---- MERITS ----
export const merits = [
  { id: 'MER001', name: 'Academic Excellence', category: 'Academic', points: 10, description: 'Awarded for scoring above 90% in exams', status: 'Active' },
  { id: 'MER002', name: 'Sports Achievement', category: 'Sports', points: 8, description: 'Awarded for winning in school sports competitions', status: 'Active' },
  { id: 'MER003', name: 'Perfect Attendance', category: 'Discipline', points: 5, description: 'Awarded for 100% attendance in a month', status: 'Active' },
  { id: 'MER004', name: 'Community Service', category: 'Social', points: 6, description: 'Awarded for participating in social service activities', status: 'Active' },
];

// ---- DRIVERS ----
export const drivers = [
  { id: 'DRV001', name: 'Ram Shetty', license: 'DL-MH-2018-1234567', phone: '9800012345', dob: '1982-06-15', joinDate: '2019-01-01', busId: 'BUS001', busNo: 'MH-12-AB-1234', address: '12 Nagar Road, Pune', status: 'Active', experience: '12 years' },
  { id: 'DRV002', name: 'Shyam Yadav', license: 'DL-MH-2016-9876543', phone: '9800012346', dob: '1979-03-20', joinDate: '2018-07-01', busId: 'BUS002', busNo: 'MH-12-CD-5678', address: '45 Station Road, Pune', status: 'Active', experience: '15 years' },
  { id: 'DRV003', name: 'Mohan Singh', license: 'DL-MH-2020-5551234', phone: '9800012347', dob: '1990-11-10', joinDate: '2022-01-01', busId: 'BUS003', busNo: 'MH-12-EF-9012', address: '78 Market Lane, Pune', status: 'On Leave', experience: '8 years' },
];

// ---- QUICK STATS (Dashboard) ----
export const dashboardStats = {
  totalStudents: 2845,
  totalTeachers: 142,
  totalRevenue: '₹14.2M',
  attendanceRate: '94%',
  pendingAdmissions: 6,
  pendingFees: '₹1.25M',
  upcomingExams: 4,
  notices: 12,
};

// ---- RECENT ACTIVITIES ----
export const recentActivities = [
  { id: 'ACT001', type: 'admission', text: 'New admission for Fatima Khan in 10th B', time: '2 minutes ago', icon: 'user-plus' },
  { id: 'ACT002', type: 'fee', text: 'Fee received ₹15,000 from Aarav Sharma', time: '15 minutes ago', icon: 'credit-card' },
  { id: 'ACT003', type: 'notice', text: 'New notice published: Annual Sports Day', time: '1 hour ago', icon: 'bell' },
  { id: 'ACT004', type: 'leave', text: 'Leave request from Suresh Nair approved', time: '2 hours ago', icon: 'calendar' },
  { id: 'ACT005', type: 'exam', text: 'Exam schedule published for Unit Test 2', time: '3 hours ago', icon: 'file-text' },
];

export const recentAdmissions = admissions.slice(0, 4);
