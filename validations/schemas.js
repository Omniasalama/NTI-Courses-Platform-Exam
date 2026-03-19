/** @format */

import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(/[A-Z]/, "uppercase")
    .pattern(/[0-9]/, "number")
    .required()
    .messages({
      "string.pattern.name":
        "Password must contain at least 1 uppercase letter and 1 number",
    }),
  role: Joi.string().valid("teacher", "student").required(),
  cardNumber: Joi.when("role", {
    is: "teacher",
    then: Joi.string()
      .length(16)
      .pattern(/^\d{16}$/)
      .optional(),
    otherwise: Joi.forbidden(),
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Courses
export const courseSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().optional().allow(""),
  price: Joi.number().min(0).optional(),
  category: Joi.string().optional().allow(""),
});

export const sessionSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  order: Joi.number().integer().min(1).required(),
  contentType: Joi.string().valid("video", "pdf").required(),
  duration: Joi.number().min(0).optional(),
  passingScore: Joi.number().min(0).max(1).optional(),
});

export const sessionUpdateSchema = Joi.object({
  title: Joi.string().min(3).max(100).optional(),
  order: Joi.number().integer().min(1).optional(),
  duration: Joi.number().min(0).optional(),
  passingScore: Joi.number().min(0).max(1).optional(),
});

// questions
export const questionSchema = Joi.object({
  text: Joi.string().required(),
  options: Joi.array().items(Joi.string()).min(2).max(5).required(),
  correctAnswerIndex: Joi.number().integer().min(0).required(),
});

// quize answer
export const quizSubmitSchema = Joi.object({
  answers: Joi.array()
    .items(
      Joi.object({
        questionId: Joi.string().required(),
        selectedIndex: Joi.number().integer().min(0).required(),
      }),
    )
    .min(1)
    .required(),
});

// subscribtion
export const subscribeSchema = Joi.object({
  cardNumber: Joi.string()
    .length(16)
    .pattern(/^\d{16}$/)
    .optional(),
});

// viladate
export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const messages = error.details.map((d) => d.message);
    return res
      .status(422)
      .json({ message: "Validation failed", errors: messages });
  }
  next();
};
