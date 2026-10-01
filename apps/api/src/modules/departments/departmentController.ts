import { Request, Response, NextFunction } from 'express';
import { departmentService } from '../../services/departmentService.js';

export async function listDepartments(_req: Request, res: Response, next: NextFunction) {
  try {
    const departments = await departmentService.getDepartments();
    res.status(200).json({
      count: departments.length,
      data: departments,
    });
  } catch (err) {
    next(err);
  }
}

export async function getDepartmentById(req: Request, res: Response, next: NextFunction) {
  try {
    const department = await departmentService.getDepartmentById(req.params.id);
    if (!department) {
      res.status(404).json({ error: 'Department not found', id: req.params.id });
      return;
    }
    res.status(200).json(department);
  } catch (err) {
    next(err);
  }
}
