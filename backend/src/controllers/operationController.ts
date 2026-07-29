import { createCrudController } from './crudFactory.js';
import { Hostel, HostelRoom, Hosteler, HostelAttendance, Book, BookIssue, LibraryMember, Bus, Route, Inventory, Supplier, InventoryIssue } from '../models/operations.js';
import { Driver } from '../models/people.js';

export const hostelCrud = createCrudController(Hostel, {
  searchFields: ['name'],
  idField: 'customId',
});

export const hostelRoomCrud = createCrudController(HostelRoom, {
  searchFields: ['roomNo'],
  idField: 'customId',
});

export const hostelerCrud = createCrudController(Hosteler, {
  searchFields: ['studentName'],
  idField: 'customId',
});

export const hostelAttendanceCrud = createCrudController(HostelAttendance, {
  searchFields: ['studentName'],
  idField: 'customId',
});

export const bookCrud = createCrudController(Book, {
  searchFields: ['title', 'author', 'isbn'],
  idField: 'customId',
});

export const bookIssueCrud = createCrudController(BookIssue, {
  searchFields: ['bookTitle', 'memberName'],
  idField: 'customId',
});

export const libraryMemberCrud = createCrudController(LibraryMember, {
  searchFields: ['name'],
  idField: 'customId',
});

export const busCrud = createCrudController(Bus, {
  searchFields: ['busNo', 'route'],
  idField: 'customId',
});

export const routeCrud = createCrudController(Route, {
  searchFields: ['name'],
  idField: 'customId',
});

export const inventoryCrud = createCrudController(Inventory, {
  searchFields: ['name', 'category'],
  idField: 'customId',
});

export const supplierCrud = createCrudController(Supplier, {
  searchFields: ['name'],
  idField: 'customId',
});

export const inventoryIssueCrud = createCrudController(InventoryIssue, {
  searchFields: ['itemName', 'department', 'issuedTo', 'purpose'],
  idField: 'customId',
});

export const driverCrud = createCrudController(Driver, { searchFields: ['name', 'license', 'phone'], idField: 'customId' });
