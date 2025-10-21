import express from 'express';
import {
    createModel,
    deleteModel,
    getAllModels,
    getModelById,
    getModelsByManufacturer,
    updateModel
} from '../controller/Model_controller.js';

const routes = express.Router();

routes.get('/', getAllModels);

routes.get('/:id', getModelById);

routes.post('/', createModel);

routes.put('/:id', updateModel);

routes.delete('/:id', deleteModel);

routes.get('/manufacturer/:manufacturerId', getModelsByManufacturer);

export default routes;