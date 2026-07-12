import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "TripToo Travels API",
			version: "1.0.0",
			description:
				"REST API documentation for the TripToo Travels backend. Supports user authentication, package management, inquiries, B2B requests, contacts, and reviews.",
		},
		servers: [
			{
				url: "http://localhost:8000",
				description: "Local Development Server",
			},
			{
				url: "https://api.triptootravels.com",
				description: "Production Server",
			},
		],
		components: {
			securitySchemes: {
				cookieAuth: {
					type: "apiKey",
					in: "cookie",
					name: "token",
					description: "JWT token stored in a cookie (used for user auth)",
				},
				adminCookieAuth: {
					type: "apiKey",
					in: "cookie",
					name: "adminToken",
					description: "JWT token stored in a cookie (used for admin auth)",
				},
			},
			schemas: {
				// ── Auth ──────────────────────────────────────────────────────────────
				RegisterRequest: {
					type: "object",
					required: ["name", "email", "password"],
					properties: {
						name: { type: "string", example: "John Doe" },
						email: { type: "string", format: "email", example: "john@example.com" },
						password: { type: "string", format: "password", example: "secret123" },
					},
				},
				LoginRequest: {
					type: "object",
					required: ["email", "password"],
					properties: {
						email: { type: "string", format: "email", example: "john@example.com" },
						password: { type: "string", format: "password", example: "secret123" },
					},
				},
				AdminLoginRequest: {
					type: "object",
					required: ["email", "password"],
					properties: {
						email: { type: "string", format: "email", example: "admin@triptootravels.com" },
						password: { type: "string", format: "password", example: "admin@123" },
					},
				},

				// ── User ─────────────────────────────────────────────────────────────
				User: {
					type: "object",
					properties: {
						_id: { type: "string", example: "64abc123def456" },
						name: { type: "string", example: "John Doe" },
						email: { type: "string", format: "email", example: "john@example.com" },
						avatar: { type: "string", example: "https://cdn.example.com/avatar.jpg" },
						googleId: { type: "string", example: "108xxxxxxxxxxxx" },
						createdAt: { type: "string", format: "date-time" },
						updatedAt: { type: "string", format: "date-time" },
					},
				},

				// ── Admin ────────────────────────────────────────────────────────────
				Admin: {
					type: "object",
					properties: {
						_id: { type: "string", example: "64abc123def456" },
						name: { type: "string", example: "Admin" },
						email: { type: "string", format: "email", example: "admin@triptootravels.com" },
						username: { type: "string", example: "admin" },
					},
				},

				// ── Package ──────────────────────────────────────────────────────────
				PackageImage: {
					type: "object",
					properties: {
						url: { type: "string", example: "https://res.cloudinary.com/..." },
						public_id: { type: "string", example: "nature_vacation/packages/abc123" },
					},
				},
				ItineraryDay: {
					type: "object",
					required: ["day", "title", "description"],
					properties: {
						day: { type: "integer", example: 1 },
						title: { type: "string", example: "Arrival & Sightseeing" },
						description: { type: "string", example: "Arrive at destination, check in, local tour." },
					},
				},
				Package: {
					type: "object",
					properties: {
						_id: { type: "string", example: "64abc123def456" },
						title: { type: "string", example: "Kerala Backwaters Tour" },
						description: { type: "string", example: "A serene journey through Kerala's backwaters." },
						location: {
							type: "object",
							properties: {
								city: { type: "string", example: "Alleppey" },
								state: { type: "string", example: "Kerala" },
								destination: { type: "string", example: "Alleppey Backwaters" },
							},
						},
						duration: {
							type: "object",
							properties: {
								day: { type: "integer", example: 5 },
								night: { type: "integer", example: 4 },
							},
						},
						price: { type: "number", example: 15000 },
						discount: { type: "number", example: 10 },
						category: { type: "string", example: "Nature" },
						features: {
							type: "array",
							items: { type: "string" },
							example: ["Houseboat Stay", "Backwater Cruise"],
						},
						highlights: {
							type: "array",
							items: { type: "string" },
							example: ["Sunrise on the backwaters", "Coconut grove walk"],
						},
						itinerary: {
							type: "array",
							items: { $ref: "#/components/schemas/ItineraryDay" },
						},
						inclusions: {
							type: "array",
							items: { type: "string" },
							example: ["Accommodation", "Breakfast"],
						},
						exclusions: {
							type: "array",
							items: { type: "string" },
							example: ["Airfare", "Personal expenses"],
						},
						images: {
							type: "array",
							items: { $ref: "#/components/schemas/PackageImage" },
						},
						reviews: {
							type: "array",
							items: { type: "string" },
							description: "Array of Review ObjectIds",
						},
						createdAt: { type: "string", format: "date-time" },
						updatedAt: { type: "string", format: "date-time" },
					},
				},

				// ── Review ───────────────────────────────────────────────────────────
				Review: {
					type: "object",
					properties: {
						_id: { type: "string", example: "64abc123def456" },
						rating: { type: "integer", minimum: 1, maximum: 5, example: 4 },
						comment: {
							type: "string",
							maxLength: 500,
							example: "Amazing experience, highly recommend!",
						},
						user: { type: "string", description: "User ObjectId", example: "64abc123def456" },
						package: { type: "string", description: "Package ObjectId", example: "64abc123def456" },
						createdAt: { type: "string", format: "date-time" },
						updatedAt: { type: "string", format: "date-time" },
					},
				},
				CreateReviewRequest: {
					type: "object",
					required: ["rating", "comment", "packageId"],
					properties: {
						rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
						comment: { type: "string", maxLength: 500, example: "Fantastic trip!" },
						packageId: { type: "string", example: "64abc123def456" },
					},
				},

				// ── Inquiry ──────────────────────────────────────────────────────────
				Inquiry: {
					type: "object",
					properties: {
						_id: { type: "string", example: "64abc123def456" },
						name: { type: "string", example: "Jane Smith" },
						mobileNumber: { type: "string", example: "+919876543210" },
						email: { type: "string", format: "email", example: "jane@example.com" },
						destination: { type: "string", example: "Manali" },
						message: { type: "string", example: "I would like to know more about the package." },
						packageId: {
							type: "string",
							nullable: true,
							description: "Optional Package ObjectId",
							example: "64abc123def456",
						},
						createdAt: { type: "string", format: "date-time" },
						updatedAt: { type: "string", format: "date-time" },
					},
				},
				CreateInquiryRequest: {
					type: "object",
					required: ["name", "mobileNumber", "email", "destination", "message"],
					properties: {
						name: { type: "string", example: "Jane Smith" },
						mobileNumber: { type: "string", example: "+919876543210" },
						email: { type: "string", format: "email", example: "jane@example.com" },
						destination: { type: "string", example: "Manali" },
						message: { type: "string", example: "I would like to know more about the package." },
						packageId: { type: "string", example: "64abc123def456" },
					},
				},

				// ── B2B ──────────────────────────────────────────────────────────────
				B2BRequest: {
					type: "object",
					properties: {
						_id: { type: "string", example: "64abc123def456" },
						companyName: { type: "string", example: "Adventure Corp" },
						email: { type: "string", format: "email", example: "biz@adventurecorp.com" },
						phone: { type: "string", example: "+919876543210" },
						website: { type: "string", example: "https://adventurecorp.com" },
						contactName: { type: "string", example: "Rajesh Kumar" },
						inquiryType: { type: "string", example: "Corporate Packages" },
						message: { type: "string", example: "We need group tour packages for 50 employees." },
						createdAt: { type: "string", format: "date-time" },
						updatedAt: { type: "string", format: "date-time" },
					},
				},
				CreateB2BRequest: {
					type: "object",
					required: ["companyName", "email", "phone", "message", "inquiryType"],
					properties: {
						companyName: { type: "string", example: "Adventure Corp" },
						email: { type: "string", format: "email", example: "biz@adventurecorp.com" },
						phone: { type: "string", example: "+919876543210" },
						website: { type: "string", example: "https://adventurecorp.com" },
						contactName: { type: "string", example: "Rajesh Kumar" },
						inquiryType: { type: "string", example: "Corporate Packages" },
						message: { type: "string", example: "We need group tour packages for 50 employees." },
					},
				},

				// ── Contact ──────────────────────────────────────────────────────────
				Contact: {
					type: "object",
					properties: {
						_id: { type: "string", example: "64abc123def456" },
						name: { type: "string", example: "Alice" },
						email: { type: "string", format: "email", example: "alice@example.com" },
						subject: { type: "string", example: "Package query" },
						phone: { type: "string", example: "+919876543210" },
						message: { type: "string", example: "I want to book a customized tour." },
						createdAt: { type: "string", format: "date-time" },
						updatedAt: { type: "string", format: "date-time" },
					},
				},
				CreateContactRequest: {
					type: "object",
					required: ["name", "email", "subject", "phone", "message"],
					properties: {
						name: { type: "string", example: "Alice" },
						email: { type: "string", format: "email", example: "alice@example.com" },
						subject: { type: "string", example: "Package query" },
						phone: { type: "string", example: "+919876543210" },
						message: { type: "string", example: "I want to book a customized tour." },
					},
				},

				// ── Common ────────────────────────────────────────────────────────────
				MessageResponse: {
					type: "object",
					properties: {
						message: { type: "string", example: "Operation successful" },
					},
				},
				ErrorResponse: {
					type: "object",
					properties: {
						message: { type: "string", example: "Something went wrong" },
					},
				},
			},
		},
		tags: [
			{ name: "Health", description: "Server health check" },
			{ name: "Auth", description: "Authentication — register, login, Google OAuth" },
			{ name: "Users", description: "Authenticated user profile" },
			{ name: "Admin", description: "Admin profile and actions" },
			{ name: "Packages", description: "Travel package CRUD" },
			{ name: "Reviews", description: "Package reviews" },
			{ name: "Inquiries", description: "Customer inquiry form submissions" },
			{ name: "B2B", description: "Business-to-business partnership requests" },
			{ name: "Contacts", description: "Contact messages from users" },
			{ name: "Dashboard", description: "Admin dashboard statistics" },
		],
	},
	apis: ["./src/routes/*.ts", "./src/app.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
