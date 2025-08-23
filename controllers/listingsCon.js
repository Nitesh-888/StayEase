import { listing } from '../models/listingsModel.js';
import { cloudinary } from '../cloudConfig.js';
import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding.js';
const mapToken = process.env.MAPBOX_KEY;

const geocodingClient = mbxGeocoding({ accessToken: mapToken });

//index route
export const index = async (req, res) => {
    let allData = await listing.find();
    res.render('listings/listingPage', {allData});
};

//new route
export const newListingForm = (req, res) => {
    res.render('listings/newform');
};

//show route
export const show = async (req, res) => {
    let id = req.params.id;
    let details = await listing.findById(id)
        .populate({
            path : 'reviews',
            select : 'comment rating author',
            populate: {
                path: 'author',
                select: 'username _id'
            }
        })
        // Populate owner field with username
        .populate('owner', 'username _id'); 
    if(!details){
        req.flash('error', 'Listing you requested for does not exist!');
        res.redirect('/listings');
        return;
    }
    res.render('listings/showPage', {details});
};

//create route
export const create = async (req, res, next) => {
    const response = await geocodingClient.forwardGeocode({
        query : req.body.location + ', ' + req.body.country,
        limit : 1
    }).send();
    
    let url = req.file.path;
    let filename = req.file.filename;
    req.body.image = {url, filename};
    const newListing = new listing(req.body);
    newListing.owner = req.user._id; // Set the owner to the current user

    newListing.geometry = response.body.features[0].geometry;

    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

//edit route
export const edit = async (req, res) => {
    let id = req.params.id;
    let details = await listing.findById(id);
    if(!details){
        req.flash('error', 'Listing you requested for does not exist!');
        res.redirect('/listings');
    }
    let originalImage = details.image.url; // Store the original image URL
    originalImage = originalImage.replace("/upload", "/upload/w_300/q_auto:low/f_auto");
    res.render('listings/updatePage', {details, originalImage});
};

//update route
export  const update = async (req, res, next) => {
    let id = req.params.id;
    let currListing = await listing.findById(id);
    console.log(req.body);
    let updatedListing = await listing.findByIdAndUpdate(id, {...req.body}, {runValidators: true, new: true});
    if(req.file){
        await cloudinary.uploader.destroy(currListing.image.filename, {invalidate : true});
        let url = req.file.path;
        let filename = req.file.filename;
        updatedListing.image = {url, filename};
        await updatedListing.save();
    }
    req.flash("success", "Listing Updated!")
    res.redirect(`/listings/${id}`)
};

//delete route
export const deleteListing = async (req, res) => {
    let id = req.params.id;
    let deletedListing = await listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!")
    res.redirect('/listings');
};