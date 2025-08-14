import express from 'express';
import {
    createPlot,
    getAllPlots,
    getPlotById,
    updatePlot,
    deletePlot
} from '../controllers/plotController.js';

import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { checkCooperativeAccess } from '../middleware/coopAccessMiddleware.js';


const router = express.Router();

router.post(
  '/register',
  protect,
  authorizeRoles(['superadmin', 'manager']),
  checkCooperativeAccess('body'),
  createPlot
);

router.get(
  '/',
  protect,
  authorizeRoles(['superadmin', 'manager', 'member']),
  getAllPlots
);

router.get(
  '/:id',
  protect,
  authorizeRoles(['superadmin', 'manager', 'member']),
  checkCooperativeAccess('query'),
  getPlotById
);

router.put(
  '/:id',
  protect,
  authorizeRoles(['superadmin', 'manager']),
  checkCooperativeAccess('body'),
  updatePlot
);

router.delete(
  '/:id',
  protect,
  authorizeRoles(['superadmin', 'manager']),
  checkCooperativeAccess('body'),
  deletePlot
);

export default router;