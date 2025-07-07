# Travel Agency Backend

## Project Structure

```
backend/
├── src/
│   ├── config/             # DB, logger, CORS setup
│   │   ├── config.ts
│   │   ├── db.ts
│   │   └── multer.ts
│   ├── controllers/        # Thin route logic
│   ├── middlewares/        # Auth, error handling, validation
│   │   └── error-handler.ts
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express routers by module
│   ├── types/              # TypeScript type definitions
│   │   ├── env.d.ts
│   │   ├── file.d.ts
│   │   └── user.d.ts
│   ├── utils/              # Reusable functions
│   │   └── cloudinary.ts
│   └── app.ts              # Main express app (mounted routes, middlewares)
├── node_modules/           # Dependencies
├── .env
├── .gitignore
├── .prettierrc
├── eslint.config.js
├── package.json
├── package-lock.json
├── readme.md
└── tsconfig.json
```

## Description

This is a TypeScript-based Express.js backend for a travel agency application.

## Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **Cloudinary** - Image storage and management
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your configuration values

3. Start the development server:
   ```bash
   npm run dev
   ```

## Project Architecture

- **config/**: Configuration files for database, middleware setup
- **controllers/**: Business logic handlers for routes
- **middlewares/**: Custom middleware functions
- **models/**: Database schema definitions
- **routes/**: API route definitions
- **types/**: TypeScript type definitions
- **utils/**: Helper functions and utilities

# 🚀 Backend API Reference

> RESTful API built with **Node.js**, **Express**, **MongoDB**, and **Mongoose**

This document provides a clear and consistent reference for your backend routes and MongoDB schema structures. It is designed to help developers on your team onboard quickly and build confidently. ✅

---

## ✅ Health Check

| Method | Route         | Description       |
| ------ | ------------- | ----------------- |
| `GET`  | `/api/health` | API health status |

---

## 🔐 Auth Routes

| Method | Route                         | Description          |
| ------ | ----------------------------- | -------------------- |
| `POST` | `/api/auth/register`          | Register new user    |
| `POST` | `/api/auth/login`             | Login user           |
| `GET`  | `/api/auth/google`            | Google OAuth start   |
| `GET`  | `/api/auth/facebook`          | Facebook OAuth start |
| `POST` | `/api/auth/callback/google`   | Google callback      |
| `POST` | `/api/auth/callback/facebook` | Facebook callback    |

---

### 🔐 `User` Schema

```ts
interface IUser {
	name: string;
	username: string;
	password: string;
	email: string;
	avatar: string;
}
```

---

## 📦 Package Routes

| Method   | Route                        | Description              |
| -------- | ---------------------------- | ------------------------ |
| `GET`    | `/api/packages`              | Get all packages         |
| `GET`    | `/api/packages/:id`          | Get single package       |
| `GET`    | `/api/packages/state/:state` | Filter packages by state |
| `GET`    | `/api/packages/trending`     | Get trending packages    |
| `POST`   | `/api/packages`              | Create new package       |
| `PUT`    | `/api/packages`              | Update existing package  |
| `DELETE` | `/api/packages`              | Delete a package         |

---

### 📦 `Package` Schema

```ts
interface IPackage {
	title: string;
	location: {
		city: string;
		state: string;
		destination: string;
	};
	duration: string;
	price: number;
	originalPrice: number;
	rating: number;
	reviews: number;
	images: string[];
	features: string[];
	discount: number;
	description: string;
	highlights: string[];
	itinerary: {
		day: number;
		title: string;
		description: string;
	}[];
	inclusions: string[];
	exclusions: string[];
	createdAt: Date;
	updatedAt: Date;
}
```

---

## 📍 Destination Routes

| Method | Route                       | Description              |
| ------ | --------------------------- | ------------------------ |
| `GET`  | `/api/destinations/popular` | Get popular destinations |

---

## 📨 Inquiry Routes

| Method   | Route              | Description          |
| -------- | ------------------ | -------------------- |
| `POST`   | `/api/inquiry`     | Submit an inquiry    |
| `GET`    | `/api/inquiry`     | Get all inquiries    |
| `DELETE` | `/api/inquiry/:id` | Delete inquiry by ID |

---

### 📨 `Inquiry` Schema

```ts
enum InquiryType {
	CorporatePackages = "Corporate Packages",
	GroupTours = "Group Tours",
	MICE = "MICE (Meetings, Incentives, Conferences, Events)",
	CustomItineraries = "Custom Itineraries",
	PartnershipOpportunities = "Partnership Opportunities",
	Other = "Other",
}

interface IB2B {
	companyName: string;
	name: string;
	email: string;
	phone: string;
	website?: string;
	message: string;
	inquiryType: InquiryType;
	createdAt: Date;
	updatedAt: Date;
}
```

---

## 📬 Contact Routes

| Method   | Route              | Description              |
| -------- | ------------------ | ------------------------ |
| `POST`   | `/api/contact`     | Submit contact form      |
| `GET`    | `/api/contact`     | Get all contact messages |
| `DELETE` | `/api/contact/:id` | Delete message by ID     |

---

### 📬 `Contact` Schema

```ts
interface IContact {
	name: string;
	email: string;
	company: string;
	project_type: string;
	budget_range: string;
	message: string;
	createdAt: Date;
}
```

---

## ☎️ Callback Request Routes

| Method   | Route                       | Description               |
| -------- | --------------------------- | ------------------------- |
| `POST`   | `/api/callback-request`     | Submit callback request   |
| `GET`    | `/api/callback-request`     | Get all callback requests |
| `GET`    | `/api/callback-request/:id` | Get callback by ID        |
| `DELETE` | `/api/callback-request/:id` | Delete callback by ID     |

---

### ☎️ `CallbackRequest` Schema

```ts
interface ICallbackRequest {
	name: string;
	email: string;
	phone: string;
	message: string;
	travelerCount: number;
	specialRequirements: string;
	package: ObjectId;
	createdAt: Date;
	updatedAt: Date;
}
```

---

## ⭐ Review Routes

| Method | Route              | Description              |
| ------ | ------------------ | ------------------------ |
| `POST` | `/api/reviews`     | Submit a review          |
| `GET`  | `/api/reviews`     | Get all reviews          |
| `GET`  | `/api/reviews/:id` | Get review by package ID |
