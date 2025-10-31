import { ObjectId } from "mongodb";

export const queryWithId = (id) => ({ _id: new ObjectId(id) });
