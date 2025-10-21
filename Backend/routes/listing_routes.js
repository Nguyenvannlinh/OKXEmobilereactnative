import express from 'express';
import {
    createListing,
    deleteListing,
    getAllListings,
    getListingById,
    getListingsByUserId,
    updateListing
} from '../controller/Listing_controller.js';

const routes = express.Router();

routes.get('/', getAllListings);

routes.get('/:id', getListingById);


routes.post('/', createListing);

routes.put('/:id', updateListing);

routes.delete('/:id', deleteListing);

routes.get('/user/:userId', getListingsByUserId);

export default routes;