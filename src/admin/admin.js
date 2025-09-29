// src/admin/admin.js
import AdminJS from "adminjs";
import * as AdminJSMongoose from "@adminjs/mongoose";
import AdminJSExpress from "@adminjs/express";
import session from "express-session";
import MongoStore from "connect-mongo";
import bcrypt from "bcrypt";
import User from "#models/user.model.js";
import { Components } from "./components/index.js";  // Import custom components
import departmentModel from "#models/department.model.js";

AdminJS.registerAdapter(AdminJSMongoose);

export const createAdmin = (app, mongooseConnection) => {
  const adminOptions = {
    rootPath: "/admin",
    resources: [
      {
        resource: User,
        options: {
          navigation: { name: "Users", icon: "User" },
          properties: {
            username: { type: 'string' },  // Default property for username
            password: {
              type: 'string',
              components: {
                edit: Components.MyInput,  // Apply the custom input component
              },
            },
          },
          actions: {
            new: {
              before: async (req) => {
                if (req.payload?.password) {
                  req.payload.password = await bcrypt.hash(req.payload.password, 10);
                }
                return req;
              },
            },
            edit: {
              before: async (req) => {
                if (req.payload?.password) {
                  req.payload.password = await bcrypt.hash(req.payload.password, 10);
                }
                return req;
              },
            },
          },
        },
      },
      {
        resource: departmentModel, // Add the Department model here
        options: {
          navigation: { name: "Management", icon: "Building" }, // You can customize its navigation
        },
      },
    ],
    branding: {
      companyName: "PDF Ticket Converter Admin",
      softwareBrothers: false,
      favicon: 'southLogo.png'
    },
  };

  // Initialize AdminJS
  const admin = new AdminJS(adminOptions);

  // MongoDB session store
  const sessionStore = MongoStore.create({
    client: mongooseConnection.getClient(),
  });

  // Build AdminJS router
  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    admin,
    {
      authenticate: async (username, password) => {
        const user = await User.findOne({ username, role: "admin" });
        if (!user) return null;

        const matched = await bcrypt.compare(password, user.password);
        if (!matched) return null;

        return {
          username: user.username,
          role: user.role,
          id: user._id.toString(),
        };
      },
      cookiePassword: process.env.SESSION_SECRET || "supersecret",
    },
    null,
    {
      store: sessionStore,
      resave: false,
      saveUninitialized: true,
      secret: process.env.SESSION_SECRET || "supersecret",
      cookie: { httpOnly: true, secure: false },
    },
    {
              loginPath: Components.MyLoginPage

    }
  );

  app.use(admin.options.rootPath, adminRouter);
};
