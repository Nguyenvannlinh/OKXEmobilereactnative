import express from 'express';
import {
    createFeature,
    deleteFeature,
    getAllFeatures,
    getFeatureById,
    updateFeature
} from '../controller/feature_controller.js';

const routes = express.Router();

routes.get('/', getAllFeatures);

routes.get('/:id', getFeatureById);

routes.post('/', createFeature);

routes.put('/:id', updateFeature);

routes.delete('/:id', deleteFeature);

export default routes;