import express from 'express';
import {
    createOrder,
    deleteOrder,
    getAllOrders,
    getOrderById,
    getOrdersByBuyerId,
    updateOrder
} from '../controller/Order_controller.js';

const routes = express.Router();

routes.get('/', getAllOrders);

routes.get('/:id', getOrderById);

routes.get("/buyer/:buyerId", getOrdersByBuyerId);

routes.post('/', createOrder);

routes.put('/:id', updateOrder);

routes.delete('/:id', deleteOrder);

export default routes;
