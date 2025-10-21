import express from 'express';
import {
  getAllSavedListings,
  getSavedListingById,
  getSavedListingsByUser,
  saveListing,
  unsaveListing
} from '../controller/Savedlisting_controller.js';

const routes = express.Router();

routes.get('/', getAllSavedListings);

routes.get('/:userId/:listingId', getSavedListingById);

routes.post('/', saveListing);

routes.delete('/:userId/:listingId', unsaveListing);

routes.get('/user/:userId', getSavedListingsByUser);

export default routes;