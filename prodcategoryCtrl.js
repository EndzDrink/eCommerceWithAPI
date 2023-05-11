const PCategory = require("../models/prodcategoryModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const { validateMongoDbId } = require("../utils/validateMongoDbId");

const createCategory = asyncHandler (async (req, res) => {
    try {
        const newCategory = await PCategory.create(req.body);
        res.json(newCategory);
    } catch (error){
        throw new Error(error);
    }
});

const updateCategory = asyncHandler (async (req, res) => {
    const {id} = req.params;
    // validateMongoDbId(id);
    try {
        const updatedCategory = await PCategory.findByIdAndUpdate(id, req.body, 
            {
                new:true,
            }
        );
        res.json(updatedCategory);
    } catch (error){
        throw new Error(error);
    }
});

const deleteCategory = asyncHandler (async (req, res) => {
    const {id} = req.params;
    // validateMongoDbId(id);
    try {
        const deletedCategory = await PCategory.findByIdAndDelete(id);
        res.json(deletedCategory);
    } catch (error){
        throw new Error(error);
    }
});

const getCategory = asyncHandler (async (req, res) => {
    const {id} = req.params;
    // validateMongoDbId(id);
    try {
        const gotCategory = await PCategory.findById(id);
        res.json(gotCategory);
    } catch (error){
        throw new Error(error);
    }
});

const getAllCategory = asyncHandler (async (req, res) => {
    try {
        const gotAllCategory = await PCategory.find();
        res.json(gotAllCategory);
    } catch (error){
        throw new Error(error);
    }
});


module.exports = {
    createCategory, 
    updateCategory, 
    deleteCategory, 
    getCategory,
    getAllCategory
};