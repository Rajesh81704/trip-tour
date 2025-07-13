import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "@/config/config";
import { IUser, UserModel } from "@/models/user.model";
import bcrypt from "bcrypt";
import { AdminModel } from "@/models/admin.model";

export const google = (req: Request, res: Response) => {
	const user = req.user as IUser;
	if (!user) {
		return res.redirect("/login");
	}

	const payload = {
		id: user._id,
		email: user.email,
		name: user.name,
		avatar: user.avatar,
	};

	const token = jwt.sign(payload, config.jwtSecret as string, {
		expiresIn: "7d",
	});

	res.cookie("token", token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: 7 * 24 * 60 * 60 * 1000,
	});

	res.redirect("/");
};

export const register = async (req: Request, res: Response) => {
	try {
		const { name, email, password } = req.body;
		if (!name || !email || !password) {
			return res.status(400).json({ message: "All fields are required" });
		}
		if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
			return res.status(400).json({ message: "Invalid data types" });
		}
		if (password.length < 8) {
			return res.status(400).json({ message: "Password must be at least 8 characters long" });
		}
		if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
			return res.status(400).json({ message: "Invalid email format" });
		}
		if (name.length < 2 || name.length > 50) {
			return res.status(400).json({ message: "Name must be between 2 and 50 characters" });
		}
		if (email.length < 5 || email.length > 100) {
			return res.status(400).json({ message: "Email must be between 5 and 100 characters" });
		}
		const existingUser = await UserModel.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: "User already exists" });
		}
		const avatar = `https://ui-avatars.com/api/?name=${name}&background=random`;
		const hashedPassword = await bcrypt.hash(password, 12);
		const user = await UserModel.create({ name, email, password: hashedPassword, avatar });
		const payload = {
			id: user._id,
			email: user.email,
			name: user.name,
			avatar: avatar,
		};
		const token = jwt.sign(payload, config.jwtSecret as string, {
			expiresIn: "7d",
		});
		const userWithoutPassword = {
			_id: user._id,
			name: user.name,
			email: user.email,
			avatar: user.avatar,
		};
		res.cookie("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});
		res.status(201).json({ message: "User created successfully", user: userWithoutPassword });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const login = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return res.status(400).json({ message: "All fields are required" });
		}
		if (typeof email !== "string" || typeof password !== "string") {
			return res.status(400).json({ message: "Invalid data types" });
		}
		if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
			return res.status(400).json({ message: "Invalid email format" });
		}
		if (email.length < 5 || email.length > 100) {
			return res.status(400).json({ message: "Email must be between 5 and 100 characters" });
		}
		if (password.length < 8) {
			return res.status(400).json({ message: "Password must be at least 8 characters long" });
		}
		const user = await UserModel.findOne({ email }).select("+password");
		if (!user) {
			return res.status(401).json({ message: "Invalid credentials" });
		}
		const isPasswordValid = await bcrypt.compare(String(password), String(user.password));
		if (!isPasswordValid) {
			return res.status(401).json({ message: "Invalid credentials" });
		}
		const payload = {
			id: user._id,
			email: user.email,
			name: user.name,
			avatar: user.avatar,
		};
		const token = jwt.sign(payload, config.jwtSecret as string, {
			expiresIn: "7d",
		});

		const userWithoutPassword = {
			_id: user._id,
			name: user.name,
			email: user.email,
			avatar: user.avatar,
		};
		res.cookie("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});
		res.status(200).json({ message: "Login successful", user: userWithoutPassword });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const adminLogin = async (req: Request, res: Response) => {
	try {
		const { identifier, password } = req.body;

		if (!identifier || !password) {
			return res.status(400).json({ message: "Identifier and password are required" });
		}

		if (typeof identifier !== "string" || typeof password !== "string") {
			return res.status(400).json({ message: "Invalid data types" });
		}

		const query: Record<string, string> = {};
		const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
		if (emailRegex.test(identifier)) {
			if (identifier.length < 5 || identifier.length > 100) {
				return res.status(400).json({ message: "Email must be between 5 and 100 characters" });
			}
			query.email = identifier;
		} else {
			if (identifier.length < 3 || identifier.length > 50) {
				return res.status(400).json({ message: "Username must be between 3 and 50 characters" });
			}
			query.username = identifier;
		}

		if (password.length < 8) {
			return res.status(400).json({ message: "Password must be at least 8 characters long" });
		}

		const admin = await AdminModel.findOne(query).select("+password");
		if (!admin) {
			return res.status(401).json({ message: "Invalid credentials" });
		}
		const isPasswordValid = await bcrypt.compare(String(password), String(admin.password));
		if (!isPasswordValid) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		const payload = {
			id: admin._id,
			email: admin.email,
			username: admin.username,
			name: admin.name,
		};
		const token = jwt.sign(payload, config.jwtSecret as string, {
			expiresIn: "7d",
		});
		res.cookie("adminToken", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});
		res.status(200).json({ message: "Admin login successful" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error" });
	}
};
