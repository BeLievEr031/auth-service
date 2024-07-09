import { checkSchema } from "express-validator";
import { Role } from "../constant";

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
    firstName: {
        in: ["body"],
        notEmpty: {
            errorMessage: "Firstname field cannot be empty",
        },
    },
    lastName: {
        in: ["body"],
        notEmpty: {
            errorMessage: "Firstname field cannot be empty",
        },
    },
    password: {
        in: ["body"],
        notEmpty: {
            errorMessage: "password field cannot be empty",
        },
    },
    role: {
        in: ["body"],
        notEmpty: {
            errorMessage: "Role field cannot be empty",
        },
        isIn: {
            options: [Object.values(Role)],
            errorMessage: "Invalid role",
        },
    },
});
