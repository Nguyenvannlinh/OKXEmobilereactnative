import express from 'express';
import {
    createBodyType,
    deleteBodyType,
    getAllBodyTypes,
    getBodyTypeById,
    updateBodyType
} from '../controller/Bodytype_controller.js';

const routes = express.Router();

routes.get('/', getAllBodyTypes);

routes.get('/:id', getBodyTypeById);

routes.post('/', createBodyType);

routes.put('/:id', updateBodyType);

routes.delete('/:id', deleteBodyType);

export default routes;