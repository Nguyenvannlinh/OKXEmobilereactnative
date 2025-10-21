import express from 'express';
import {
    createDealer,
    deleteDealer,
    getAllDealers,
    getDealerById,
    getDealersByUserId,
    updateDealer,
    verifyDealer
} from '../controller/dealer_controller.js';

const routes = express.Router();

routes.get('/', getAllDealers);

routes.get('/:id', getDealerById);

routes.post('/', createDealer);

routes.put('/:id', updateDealer);

routes.delete('/:id', deleteDealer);

routes.get('/user/:userId', getDealersByUserId);

routes.put('/:id/verify', verifyDealer);

export default routes;