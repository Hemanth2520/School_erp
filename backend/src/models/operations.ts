import { Schema, model } from 'mongoose';

const hostelSchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    type: String,
    floors: Number,
    totalRooms: Number,
    occupiedRooms: Number,
    capacity: Number,
    warden: String,
    chiefWarden: String,
    facilities: [String],
    status: { type: String, default: 'Active' },
  },
  { timestamps: true }
);

export const Hostel = model('Hostel', hostelSchema);

const hostelRoomSchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    hostelId: { type: Schema.Types.Mixed },
    roomNo: String,
    type: String,
    capacity: Number,
    occupied: Number,
    floor: Number,
    facilities: [String],
    status: String,
  },
  { timestamps: true }
);

export const HostelRoom = model('HostelRoom', hostelRoomSchema);

const hostelerSchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    studentId: { type: Schema.Types.Mixed },
    studentName: String,
    hostelId: { type: Schema.Types.Mixed },
    hostelName: String,
    roomId: { type: Schema.Types.Mixed },
    roomNo: String,
    checkIn: Date,
    status: String,
  },
  { timestamps: true }
);

export const Hosteler = model('Hosteler', hostelerSchema);

const hostelAttendanceSchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    studentId: { type: Schema.Types.Mixed },
    studentName: String,
    hostelId: { type: Schema.Types.Mixed },
    date: Date,
    status: String,
    checkInTime: String,
    checkOutTime: String,
  },
  { timestamps: true }
);

export const HostelAttendance = model('HostelAttendance', hostelAttendanceSchema);

const bookSchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    title: { type: String, required: true },
    author: String,
    isbn: String,
    category: String,
    publisher: String,
    year: Number,
    copies: Number,
    available: Number,
    status: String,
  },
  { timestamps: true }
);

export const Book = model('Book', bookSchema);

const bookIssueSchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    bookId: { type: Schema.Types.Mixed },
    bookTitle: String,
    memberId: { type: Schema.Types.Mixed },
    memberName: String,
    issueDate: Date,
    dueDate: Date,
    returnDate: Date,
    status: String,
    fine: Number,
  },
  { timestamps: true }
);

export const BookIssue = model('BookIssue', bookIssueSchema);

const libraryMemberSchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    memberId: { type: Schema.Types.Mixed },
    name: String,
    type: String,
    classDept: String,
    phone: String,
    email: String,
    booksIssued: { type: Number, default: 0 },
    maxLimit: { type: Number, default: 3 },
    status: { type: String, default: 'Active' },
    joinDate: Date,
  },
  { timestamps: true }
);

export const LibraryMember = model('LibraryMember', libraryMemberSchema);

const busSchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    busNo: String,
    driver: String,
    driverId: { type: Schema.Types.Mixed },
    capacity: Number,
    students: Number,
    route: { type: Schema.Types.Mixed },
    coordinator: String,
    status: String,
    lastService: Date,
  },
  { timestamps: true }
);

export const Bus = model('Bus', busSchema);

const routeSchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    stops: [String],
    busId: { type: Schema.Types.Mixed },
    students: Number,
    distance: String,
    time: String,
  },
  { timestamps: true }
);

export const Route = model('Route', routeSchema);

const inventorySchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    category: String,
    quantity: Number,
    unit: String,
    minStock: Number,
    supplier: { type: Schema.Types.Mixed },
    cost: Number,
    lastPurchase: Date,
    location: String,
    status: String,
  },
  { timestamps: true }
);

export const Inventory = model('Inventory', inventorySchema);

const supplierSchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    contact: String,
    phone: String,
    email: String,
    address: String,
    category: String,
    status: String,
  },
  { timestamps: true }
);

export const Supplier = model('Supplier', supplierSchema);

const inventoryIssueSchema = new Schema(
  {
    customId: { type: String, unique: true, required: true },
    itemId: { type: Schema.Types.Mixed },
    itemName: String,
    quantity: Number,
    issuedTo: String,
    issuedToId: { type: Schema.Types.Mixed },
    department: String,
    purpose: String,
    issueDate: Date,
    returnDate: Date,
    status: String,
    remarks: String,
  },
  { timestamps: true }
);

export const InventoryIssue = model('InventoryIssue', inventoryIssueSchema);
