import express from 'express';
import {
    createPayment,
    deletePayment,
    getAllPayments,
    getPaymentById,
    updatePayment
} from '../controller/Payment_controller.js';

const routes = express.Router();

routes.get('/', getAllPayments);

routes.get('/:id', getPaymentById);

routes.post('/', createPayment);

routes.put('/:id', updatePayment);

routes.delete('/:id', deletePayment);

export default routes;
