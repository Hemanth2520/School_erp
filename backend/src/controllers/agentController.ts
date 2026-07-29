import { createCrudController } from './crudFactory.js';
import { Agent } from '../models/people.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { Response } from 'express';

export const agentCrud = createCrudController(Agent, {
  searchFields: ['name', 'contactPerson', 'email'],
  idField: 'customId',
});

export const getAgentStats = asyncHandler(async (_req: any, res: Response) => {
  const total = await Agent.countDocuments();
  const active = await Agent.countDocuments({ status: 'Active' });
  const inactive = await Agent.countDocuments({ status: 'Inactive' });

  res.json({
    success: true,
    data: {
      total,
      active,
      inactive,
    },
  });
});
