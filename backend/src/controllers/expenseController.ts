import { createCrudController } from './crudFactory.js';
import { Expense } from '../models/finance.js';

export const expenseCrud = createCrudController(Expense, {
  searchFields: ['title'],
  idField: 'customId'
});
