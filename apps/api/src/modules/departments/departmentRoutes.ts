import { Router } from 'express';
import { listDepartments, getDepartmentById } from './departmentController.js';

const router = Router();

router.get('/departments', listDepartments);
router.get('/departments/:id', getDepartmentById);

export default router;
