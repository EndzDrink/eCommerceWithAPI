const Product = require('../models/productModel');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');
const fs = require("fs");
const { validateMongoDbId } = require('../utils/validateMongoDbId');
const cloudinaryUploadImg = require('../utils/cloudinary');

const createProduct = asyncHandler(async (req, res, next) => {
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const newProduct = await Product.create(req.body);
        res.json(newProduct);
    } catch(error) {
        next(error);
    }
});

const updateProduct = asyncHandler(async (req, res, next) => {
    const {id} = req.params;
    try{
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const updateProduct = await Product.findOneAndUpdate(id,
            req.body, 
            {
                new:true,
            });
        res.json(updateProduct);
    }
    catch(error){
        throw new Error(error);
    }
});



const deleteProduct = asyncHandler(async (req, res, next) => {
    const {id} = req.params;
    try{
        const deleteProduct = await Product.findOneAndDelete(id);
        res.json(deleteProduct);
    }
    catch(error){
        throw new Error(error);
    }
});

const getaProduct = asyncHandler(async (req, res) => {
    const {id} = req.params;
    try{
        const findProduct = await Product.findById(id);
        res.json(findProduct);
    } 
    catch(error){
        throw new Error(error);
    }
});

const getAllProduct = asyncHandler(async (req, res, next) => {
    try{
        // filturing section
        const queryObj = {...req.query};
        const excludeFields = ['page', 'sort', 'limit', 'fields'];
        excludeFields.forEach((el) => delete queryObj[el]);

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        
        let query = Product.find(JSON.parse(queryStr));

        // sorting section
        if (req.query.sort) {
            const sortBy = req.query.sort.split(",").join(" ");
            query = query.sort(sortBy);
        } else {
            query = query.sort("-createdAt");
        }

        // limiting the fields
        if (req.query.fields){
            const fields = req.query.fields.split(",").join(" ");
            query = query.select(fields);
        } else {
            query = query.select("-__v");
        }

        // pagination 
        const page = req.query.page;
        const limit = req.query.limit;
        const skip = (page -1) * limit;
        query = query.skip(skip).limit(limit);
        if (req.query.page){
            const productCount = await Product.countDocuments();
            if(skip>= productCount)
            throw new Error ('This page does not exist');
        }
        console.log(page, limit, skip);

        const product = await query;
        res.json(getAllProduct);
    } catch (error){
        next(error);
    }
}); 

const addToWishlist = asyncHandler(async(req, res) => {
    const {id} = req.params;
    const {prodId} = req.body;
    try{
        const user = await User.findById(id);
        const alreadyadded = user.wishlist.find((id)=>id.toString() === prodId);
        if(alreadyadded) {
            const updatedUser = await User.findByIdAndUpdate(id, {
                $pull : {wishlist: prodId},
            }, {
                new: true,
            });
            res.json(user);
        } else {
            const updatedUser = await User.findByIdAndUpdate(id, {
                $push : {wishlist: prodId},
            }, {
                new: true,
            });
            res.json(updatedUser);
        }
    } catch(error){
        throw new Error(error);
    } 
});

const rating = asyncHandler(async(req, res ) => {
    const {id} = req.params;
    // validateMongoDbId(id);
    const {star, prodId, comment} = req.body;
    try { 
        const product = await Product.findById(prodId);
        let alreadyRated = product.ratings.find((userId) => userId.postedby.toString() === id.toString());
    if (alreadyRated){
    const updateRating = await Product.updateOne(
    {
        ratings: { $elemMatch: alreadyRated },
    },
    {
        $set: { "ratings.$.star": star, "ratings.$.comment": comment},
    },
    {
       new: true, 
    }
);
    } else {
        const rateProduct = await Product.findByIdAndUpdate(prodId, {
            $push: {
                ratings: {
                    star: star,
                    comment: comment,
                    postedby: id,
                },
            },
        },
        {
            new: true,
        } 
    );
    }
   const getAllRating = await Product.findById(prodId);
   let totalRating = getAllRating.ratings.length;
   let ratingsum = getAllRating.ratings.
        map((item) => item.star).
        reduce((prev, curr) => prev + curr, 0);
        let actualRating = Math.round(ratingsum / totalRating);
        let finalproductrating = await Product.findByIdAndUpdate(prodId,{
        totalrating: actualRating,
    }, 
    {
        new: true,
    }
    );
res.json(finalproductrating);

} catch(error){
    throw new Error(error);
}
});

const uploadImages = asyncHandler(async(req, res) => {
    const {id} = req.params;
    // validateMongoDbId(id);
    console.log(req.files);
    try {
        const uploader = (path) => cloudinaryUploadImg(path, "images");
        const urls = [];
        const files = req.files;
        for ( const file of files) {
            const {path} = file;
            const newpath = await uploader(path);
            console.log(newpath);
            urls.push(newpath);
            fs.unlinkSync(path);
        }
        const findProduct = await Product.findByIdAndUpdate(id, {
            images: urls.map((file) => {
                return file;
            }),
        },{
            new: true,
        });
        res.json(findProduct);
    }catch (error) {
        throw new Error(error);
    }
});

module.exports = { 
    createProduct, 
    getaProduct, 
    getAllProduct, 
    updateProduct, 
    deleteProduct,
    addToWishlist,
    rating,
    uploadImages,
};