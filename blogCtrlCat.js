const BCategory = require("../models/blogModelCat");
const asyncHandler = require("express-async-handler");
const { validateMongoDbId } = require("../utils/validateMongoDbId");

const createBlogCat = asyncHandler (async (req, res) => {
    try {
        const newBlogCat = await BCategory.create(req.body);
        res.json(newBlogCat);
    } catch (error){
        throw new Error(error);
    }
});

const updateBlogCategory = asyncHandler (async (req, res) => {
    const {id} = req.params;
    // validateMongoDbId(id);
    try {
        const updatedBlogCategory = await BCategory.findByIdAndUpdate(id, req.body, 
            {
                new:true,
            }
        );
        res.json(updatedBlogCategory);
    } catch (error){
        throw new Error(error);
    }
});

const deleteBlogCategory = asyncHandler (async (req, res) => {
    const {id} = req.params;
    // validateMongoDbId(id);
    try {
        const deletedBlogCategory = await BCategory.findByIdAndDelete(id);
        res.json(deletedBlogCategory);
    } catch (error){
        throw new Error(error);
    }
});

const getBlogCategory = asyncHandler (async (req, res) => {
    const {id} = req.params;
    // validateMongoDbId(id);
    try {
        const gotBlogCategory = await BCategory.findById(id);
        res.json(gotBlogCategory);
    } catch (error){
        throw new Error(error);
    }
});

const getAllBlogCategory = asyncHandler (async (req, res) => {
    try {
        const gotAllBlogCategory = await BCategory.find();
        res.json(gotAllBlogCategory);
    } catch (error){
        throw new Error(error);
    }
});
module.exports = {
    createBlogCat, 
    updateBlogCategory, 
    deleteBlogCategory, 
    getBlogCategory,
    getAllBlogCategory
};