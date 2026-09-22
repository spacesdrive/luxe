import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            min: 0,
            required: true,
        },
        image: {
            type: String,
            required: [true, "Image is required"],
        },
        category: {
            type: String,
            required: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        // Available clothing sizes (XS, S, M, L, XL, XXL, 3XL)
        sizes: {
            type: [String],
            default: [],
        },
        // Available shoe sizes (UK 5, UK 6, etc.)
        shoeSizes: {
            type: [String],
            default: [],
        },
    },
    { timestamps: true }
);

export { productSchema };