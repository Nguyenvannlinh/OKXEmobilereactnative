import express from 'express';
import {
    createFuelType,
    deleteFuelType,
    getAllFuelTypes,
    getFuelTypeById,
    updateFuelType
} from '../controller/Fueltype_controller.js';

const router = express.Router();

router.get('/', getAllFuelTypes);

router.get('/:id', getFuelTypeById);

router.post('/', createFuelType);

router.put('/:id', updateFuelType);

router.delete('/:id', deleteFuelType);

export default router;