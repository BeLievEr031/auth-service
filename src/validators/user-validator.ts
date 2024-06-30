import { checkSchema } from "express-validator";

export default checkSchema({
    email: {
        in: ["body"],
        isEmail: {
            errorMessage: "Must be a valid email",
        },
        notEmpty: {
            errorMessage: "Email field cannot be empty",
        },

        errorMessage: "Invalid email format",
        normalizeEmail: true,
    },
});
