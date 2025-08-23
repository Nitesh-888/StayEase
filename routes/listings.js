import express from 'express';

const router = express.Router();

import { wrapAsync } from '../utils/wrapAsync.js';
import { validateListing, isLoggedIn, isOwner} from '../middlewares.js';
import { index, newListingForm, show, create, edit, update, deleteListing} from '../controllers/listingsCon.js';
import reviewRouter from './reviews.js';
import multer from 'multer';
import { storage } from '../cloudConfig.js';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const ejsMate = require('ejs-mate');
const upload = multer({ storage });

//index route and create route
router.route("/")
    .get(wrapAsync(index))
    // upload must run before validateListing so multipart form fields are parsed into req.body
    .post(isLoggedIn, upload.single('image'), validateListing, wrapAsync(create));

//new route
router.get("/new", isLoggedIn, newListingForm);


// show route and update route and delete route
router.route("/:id")
    .get(wrapAsync(show))
    // upload must run before validateListing so multipart form fields are parsed into req.body
    .put(isLoggedIn, isOwner, upload.single('image'), validateListing, wrapAsync(update))
    .delete(isLoggedIn, isOwner, wrapAsync(deleteListing));

//edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(edit));

router.use('/:id/reviews', reviewRouter);


export default router;