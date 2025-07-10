import { Types } from "mongoose";

export interface IUser {
	_id: Types.ObjectId;
	name: string;
	username: string;
	password: string;
	matchPassword(enteredPassword: string): Promise<boolean>;
	createdAt: Date;
	updatedAt: Date;
}
