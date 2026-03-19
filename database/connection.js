/** @format */

import mongoose from "mongoose";

export const databaseConnection = () => {
  mongoose
    .connect("mongodb://localhost:27017/CoursesPlatform")
    .then(() => {
      console.log("database connectedsucessfully");
    })
    .catch((err) => {
      console.log(err);
    });
};
