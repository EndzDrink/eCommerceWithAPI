const Blog = require("../models/blogModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const fs = require("fs");
const { validateMongoDbId } = require("../utils/validateMongoDbId");
const cloudinaryUploadImg = require('../utils/cloudinary');



const createBlog = asyncHandler(async (req, res) => {
    try {
        const newBlog = await Blog.create(req.body);
        res.json(newBlog); 
    } catch(error){
    throw new Error(error);
    }
});

const updateBlog = asyncHandler(async (req, res) => {
    const {id} = req.params;
    // validateMongoDbId(id);
    try {
        const updateBlog = await Blog.findByIdAndUpdate(id, req.body,{
            new: true,
        });
        res.json(updateBlog); 
    } catch(error){
        throw new Error(error);
    }
});

const getBlog = asyncHandler(async (req, res) => {
    const {id} = req.params;
    // validateMongoDbId(id);
    try {
        const getBlog = await Blog.findById(id)
            .populate("likes")
            .populate("disLikes");
        const updateViews = await Blog.findByIdAndUpdate(id,
        {
            $inc:{numViews:1},
        },
        { new:true }
        );
        res.json(getBlog); 
    } catch(error) {
    throw new Error(error);
    }
});

const getAllBlogs = asyncHandler(async(req, res) => {
    try {
        const getBlogs = await Blog.find();
        res.json(getBlogs); 
    } catch(error){
    throw new Error(error);
    }
});

const deleteBlog = asyncHandler(async (req, res) => {
    const {id} = req.params;
    // validateMongoDbId(id);
    try {
        const deleteBlog = await Blog.findByIdAndDelete(id);
        res.json(deleteBlog); 
    } catch(error){
    throw new Error(error);
    }
});

const likeBlog = asyncHandler(async(req, res) => {
    const { blogId } = req.body;
    // validateMongoDbId(blogId);
    // find the blog you wish to like
    const blog = await Blog.findById(blogId);
    // find the logged in user
    const loginUserId = req?.user?._id;
    // find out if the user has liked the blog
    const isLiked = blog?.isLiked;
    // find out if the user has disliked the blog
    const alreadyDisliked = blog?.disLikes?.find(
        (userId) => userId?.toString() === loginUserId?.toString()
        );
        if(alreadyDisliked){
            const blog = await Blog.findByIdAndUpdate(blogId, {
                $pull: { disLikes: loginUserId},
                isDisliked: false,
            },
                {new:true}
            );
            res.json(blog);
        }
        if(isLiked){
            const blog = await Blog.findByIdAndUpdate(
                blogId, 
                {
                $pull: { likes: loginUserId},
                isLiked: false,
            },
                {new:true}
            );
            res.json(blog);
        } else {
            const blog = await Blog.findByIdAndUpdate(
                blogId, 
                {
                $push: { likes: loginUserId},
                isLiked: true,
            },
                {new:true}
            );
            res.json(blog);
        }
});

const disLikeBlog = asyncHandler(async(req, res) => {
    const { blogId } = req.body;
    // validateMongoDbId(blogId);
    // find the blog you wish to like
    const blog = await Blog.findById(blogId);
    // find the logged in user
    const loginUserId = req?.user?._id;
    // find out if the user has liked the blog
    const isDisliked = blog?.isDisliked;
    // find out if the user has disliked the blog
    const alreadyLiked = blog?.likes?.find(
        (userId) => userId?.toString() === loginUserId?.toString()
    );
    if (alreadyLiked) {
        const blog = await Blog.findByIdAndUpdate(blogId, {
                $pull: { likes: loginUserId},
                isLiked: false,
            },
            { new: true }
        );
        res.json(blog);
    }
    if (isDisliked) {
        const blog = await Blog.findByIdAndUpdate(
            blogId, 
            {
                $pull: { disLikes: loginUserId},
                isDisliked: false,
            },
            { new: true }
        );
        res.json(blog);
    } else {
        const blog = await Blog.findByIdAndUpdate(
            blogId, 
            {
                $push: { disLikes: loginUserId},
                isDisliked: true,
            },
            { new: true }
        );
        res.json(blog);
    }
});

const blogImages = asyncHandler(async(req, res) => {
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
        const findBlog = await Blog.findByIdAndUpdate(id, {
            images: urls.map((file) => {
                return file;
            }),
        },{
            new: true,
        });
        res.json(findBlog);
    }catch (error) {
        throw new Error(error);
    }
});


module.exports = {createBlog, updateBlog, getBlog, getAllBlogs, deleteBlog, likeBlog, disLikeBlog, blogImages };