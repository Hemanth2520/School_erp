import type { Model, Document, UpdateQuery } from 'mongoose';

type FilterQuery<T> = Record<string, any>;
import { AppError } from '../utils/AppError.js';

export abstract class BaseRepository<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async findMany(filter: FilterQuery<T> = {}, options: {
    page?: number;
    limit?: number;
    sort?: any;
    select?: string;
  } = {}) {
    const { page = 1, limit = 10, sort, select } = options;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model.find(filter)
        .sort(sort || { createdAt: -1 })
        .select(select || '')
        .skip(skip)
        .limit(limit),
      this.model.countDocuments(filter),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    };
  }

  async findById(id: string, select: string = '') {
    const doc = await this.model.findById(id).select(select);
    if (!doc) throw new AppError('Resource not found', 404);
    return doc;
  }

  async create(data: any) {
    return this.model.create(data);
  }

  async update(id: string, data: UpdateQuery<T>) {
    const doc = await this.model.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    });
    if (!doc) throw new AppError('Resource not found', 404);
    return doc;
  }

  async delete(id: string) {
    const doc = await this.model.findByIdAndDelete(id);
    if (!doc) throw new AppError('Resource not found', 404);
    return doc;
  }
}
