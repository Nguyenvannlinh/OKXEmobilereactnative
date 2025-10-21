import express from 'express';
import {
    createReview,
    deleteReview,
    getAllReviews,
    getAverageRating,
    getReviewById,
    getReviewsByUser,
    updateReview
} from '../controller/Review_controller.js';

const routes = express.Router();

routes.get('/', getAllReviews);

routes.get('/:id', getReviewById);

routes.post('/', createReview);

routes.put('/:id', updateReview);

routes.delete('/:id', deleteReview);

routes.get('/user/:userId', getReviewsByUser);

routes.get('/user/:userId/average', getAverageRating);

export default routes;