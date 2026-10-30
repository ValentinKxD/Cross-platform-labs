import express from 'express';
import {
  getWaybills,
  getWaybillById,
  getWaybillByTrackingNumber,
  createWaybill,
  updateWaybill,
  deleteWaybill,
} from '../controllers/waybillController.js';
import { validateWaybill } from '../middleware/validateWaybill.js';

const router = express.Router();

router.get('/', getWaybills);
router.get('/track/:trackingNumber', getWaybillByTrackingNumber); 
router.get('/:id', getWaybillById);
router.post('/', validateWaybill, createWaybill);
router.put('/:id', validateWaybill, updateWaybill);
router.delete('/:id', deleteWaybill);

export default router;
