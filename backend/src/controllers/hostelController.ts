import { createCrudController } from './crudFactory.js';
import { Hostel, HostelRoom, Hosteler, HostelAttendance } from '../models/operations.js';

export const hostelCrud = createCrudController(Hostel, {
  searchFields: ['name'],
  idField: 'customId'
});

export const hostelRoomCrud = createCrudController(HostelRoom, {
  searchFields: ['roomNo'],
  idField: 'customId'
});

export const hostelerCrud = createCrudController(Hosteler, {
  searchFields: ['studentName'],
  idField: 'customId'
});

export const hostelAttendanceCrud = createCrudController(HostelAttendance, {
  searchFields: ['studentName'],
  idField: 'customId'
});
