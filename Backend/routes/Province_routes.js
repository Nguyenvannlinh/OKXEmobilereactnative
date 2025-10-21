import express from 'express';
import {
    createProvince,
    deleteProvince,
    getAllProvinces,
    getProvinceById,
    updateProvince
} from '../controller/Province_controller.js';

const routes = express.Router();

routes.get('/', getAllProvinces);

routes.get('/:id', getProvinceById);

routes.post('/', createProvince);

routes.put('/:id', updateProvince);

routes.delete('/:id', deleteProvince);

export default routes;