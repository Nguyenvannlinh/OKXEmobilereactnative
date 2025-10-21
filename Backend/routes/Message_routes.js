import express from 'express';
import {
    createMessage,
    deleteMessage,
    getAllMessages,
    getConversation,
    getMessageById,
    getMessagesByUser,
    updateMessage
} from '../controller/Message_controller.js';

const routes = express.Router();

routes.get('/', getAllMessages);

routes.get('/:id', getMessageById);

routes.post('/', createMessage);

routes.put('/:id', updateMessage);

routes.delete('/:id', deleteMessage);

routes.get('/user/:userId', getMessagesByUser);

routes.get('/conversation/:user1/:user2/:listingId', getConversation);

export default routes;