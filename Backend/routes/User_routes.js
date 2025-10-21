import express from 'express';
import {
    assignRoleToUser,
    createUser,
    deleteUser,
    getAllUsers,
    getUserById,
    removeRoleFromUser,
    updateUser
} from '../controller/User_controller.js';

const routes = express.Router();

routes.get('/', getAllUsers);

routes.get('/:id', getUserById);

routes.post('/', createUser);

routes.put('/:id', updateUser);

routes.delete('/:id', deleteUser);

routes.post('/assign-role', assignRoleToUser);

routes.post('/remove-role', removeRoleFromUser);

export default routes;
