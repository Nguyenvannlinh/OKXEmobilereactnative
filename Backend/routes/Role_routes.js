import express from 'express';
import {
    createRole,
    deleteRole,
    getAllRoles,
    getRoleById,
    getUsersByRole,
    updateRole
} from '../controller/Role_controller.js';

const router = express.Router();

router.get('/', getAllRoles);

router.get('/:id', getRoleById);

router.post('/', createRole);

router.put('/:id', updateRole);

router.delete('/:id', deleteRole);

router.get('/:roleId/users', getUsersByRole);

export default router;