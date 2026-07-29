import type { Model, Document, Query } from 'mongoose';
import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

type FilterQuery<T> = Record<string, any>;

export interface ListQuery {
  page?: string;
  limit?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  [key: string]: string | undefined;
}

export interface CrudOptions<T = any> {
  searchFields?: (keyof T | string)[];
  defaultSort?: string;
  idField?: string;
  transform?: (doc: T) => Record<string, unknown>;
}

const SENSITIVE_RESPONSE_FIELDS = [
  'password', 'refreshToken', 'passwordResetToken', 'passwordResetExpires',
];

function makeCustomId(modelName: string): string {
  const prefix = modelName.replace(/[^a-z0-9]/gi, '').slice(0, 4).toUpperCase() || 'REC';
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${random}`;
}

function toSafeObject(doc: any, idField: string) {
  const result = { ...(doc.toObject ? doc.toObject() : doc) } as Record<string, unknown>;
  result.id = result[idField] ?? result._id?.toString();
  delete result._id;
  delete result.__v;
  for (const field of SENSITIVE_RESPONSE_FIELDS) delete result[field];
  return result;
}

function buildFilter<T>(query: ListQuery, searchFields: string[]): FilterQuery<T> {
  const filter: FilterQuery<T> = {};
  const { search, page: _p, limit: _l, sort: _s, order: _o, ...rest } = query;

  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined && value !== '') {
      (filter as Record<string, unknown>)[key] = value;
    }
  }

  if (search && searchFields.length) {
    filter.$or = searchFields.map(field => ({
      [field]: { $regex: search, $options: 'i' },
    })) as FilterQuery<T>['$or'];
  }

  return filter;
}

export function createCrudController<T = any>(
  Model: any,
  options: CrudOptions<T> = {}
) {
  const {
    searchFields = [],
    defaultSort = 'createdAt',
    idField = 'customId',
    transform,
  } = options;

  const toResponse = (doc: any) => {
    const result = toSafeObject(doc, idField);
    return transform ? transform(doc) : result;
  };

  return {
    list: asyncHandler(async (req: Request, res: Response) => {
      const query = req.query as ListQuery;
      const page = Math.max(1, Number(query.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(query.limit) || 50));
      const sortField = query.sort || defaultSort;
      const sortOrder = query.order === 'asc' ? 1 : -1;

      const filter = buildFilter<T>(query, searchFields as string[]);
      const [items, total] = await Promise.all([
        Model.find(filter)
          .sort({ [sortField]: sortOrder })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        Model.countDocuments(filter),
      ]);

      const data = items.map((item: any) => toSafeObject(item, idField));

      res.json({
        success: true,
        data,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      });
    }),

    getById: asyncHandler(async (req: Request, res: Response) => {
      const id = req.params.id as string;
      const doc = await Model.findOne({
        $or: [{ [idField]: id }, ...(typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])],
      } as FilterQuery<T>);
      if (!doc) throw new AppError('Record not found', 404);
      res.json({ success: true, data: toResponse(doc) });
    }),

    create: asyncHandler(async (req: Request, res: Response) => {
      const body = { ...req.body };
      if (Model.schema.path('customId') && !body.customId) {
        body.customId = makeCustomId(Model.modelName);
      }
      const doc = await Model.create(body);
      res.status(201).json({ success: true, data: toResponse(doc) });
    }),

    update: asyncHandler(async (req: Request, res: Response) => {
      const id = req.params.id;
      const doc = await Model.findOneAndUpdate(
        {
          $or: [{ [idField]: id }, ...(typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])],
        } as any,
        req.body,
        { new: true, runValidators: true }
      );
      if (!doc) throw new AppError('Record not found', 404);
      res.json({ success: true, data: toResponse(doc) });
    }),

    remove: asyncHandler(async (req: Request, res: Response) => {
      const id = req.params.id;
      const doc = await Model.findOneAndDelete({
        $or: [{ [idField]: id }, ...(typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])],
      } as any);
      if (!doc) throw new AppError('Record not found', 404);
      res.json({ success: true, message: 'Deleted successfully' });
    }),

    bulkDelete: asyncHandler(async (req: Request, res: Response) => {
      const { ids } = req.body as { ids: string[] };
      if (!Array.isArray(ids) || !ids.length) throw new AppError('ids array required', 422);
      const result = await Model.deleteMany({
        $or: [{ [idField]: { $in: ids } }, { _id: { $in: ids.filter(i => i.match(/^[0-9a-fA-F]{24}$/)) } }],
      } as FilterQuery<T>);
      res.json({ success: true, deleted: result.deletedCount });
    }),
  };
}
