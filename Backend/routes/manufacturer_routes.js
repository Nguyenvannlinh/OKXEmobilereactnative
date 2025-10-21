import express from 'express';
import {
    createManufacturer,
    deleteManufacturer,
    getAllManufacturers,
    getManufacturerById,
    updateManufacturer
} from '../controller/manufacturer_controller.js';

const routes = express.Router();

routes.get('/', getAllManufacturers);

routes.get('/:id', getManufacturerById);

routes.post('/', createManufacturer);

routes.put('/:id', updateManufacturer);

routes.delete('/:id', deleteManufacturer);

export default routes;