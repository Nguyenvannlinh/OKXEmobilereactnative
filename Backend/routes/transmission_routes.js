import express from 'express';
import {
    createTransmission,
    deleteTransmission,
    getAllTransmissions,
    getTransmissionById,
    updateTransmission
} from '../controller/Transmission_controller.js';

const routes = express.Router();

routes.get('/', getAllTransmissions);

routes.get('/:id', getTransmissionById);

routes.post('/', createTransmission);

routes.put('/:id', updateTransmission);

routes.delete('/:id', deleteTransmission);

export default routes;