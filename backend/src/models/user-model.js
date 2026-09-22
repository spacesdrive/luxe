import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const COMMON_WEAK_PASSWORDS = [
    "password", "password1", "password123", "12345678", "123456789",
    "1234567890", "qwerty123", "qwertyuiop", "iloveyou", "admin1234",
    "letmein1", "welcome1", "monkey123", "dragon12", "master12",
    "sunshine", "princess", "football", "shadow12", "superman",
    "baseball", "abc12345", "passw0rd", "trustno1", "starwars",
    "linkedin", "welcome!", "hello123", "charlie1", "donald123",
];

const validatePassword = (password) => {
    if (password.length < 8) {
        return "Password must be at least 8 characters long";
    }
    if (password.length > 64) {
        return "Password must be no more than 64 characters long";
    }
    if (COMMON_WEAK_PASSWORDS.includes(password.toLowerCase())) {
        return "Password is too common. Please choose a more unique password";
    }
    return null;
};

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Enter Name"],
        },
        email: {
            type: String,
            required: [true, "Enter Email"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Enter Password"],
            minLength: [8, "Password must be at least 8 characters long"],
            maxLength: [64, "Password must be no more than 64 characters long"],
            validate: {
                validator: function (value) {
                    if (value.startsWith("$2")) return true;
                    return validatePassword(value) === null;
                },
                message: (props) => validatePassword(props.value) || "Invalid password",
            },
        },
        cartItems: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: false,
                },
                quantity: {
                    type: Number,
                    default: 1,
                },
                selectedSize: {
                    type: String,
                    default: null,
                },
            },
        ],
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function () {
    if (this.isModified("cartItems")) {
        this.cartItems = this.cartItems
            .map((item) => {
                if (!item.product && item.id) {
                    item.product = item.id;
                }
                return item;
            })
            .filter((item) => item.product);
    }

    if (!this.isModified("password")) return;

    const error = validatePassword(this.password);
    if (error) {
        throw new Error(error);
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

export { userSchema };