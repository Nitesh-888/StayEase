import { isLoggedIn, isAuthor, validateReview } from '../middlewares.js';
import { addReview, deleteReview } from '../controllers/reviewsCon.js';
import { wrapAsync } from '../utils/wrapAsync.js';
import express from 'express';
const app = express();

const router = express.Router({ mergeParams : true }); // Allows merging of params from parent routes


//review routes
//add route
router.post('/', isLoggedIn, validateReview, wrapAsync(addReview));

//delete route
router.delete('/:reviewId', isLoggedIn, isAuthor, wrapAsync(deleteReview));

export default router;