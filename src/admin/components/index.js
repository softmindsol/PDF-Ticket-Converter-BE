// src/admin/components/index.js
import MyInput from "./my-input.jsx"; // Import your custom input component
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const Components = {
  MyInput,
  MyLoginPage: path.resolve(__dirname, "login.js"),
};
