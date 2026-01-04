
import mongoose, { Model, model, Document } from 'mongoose';

export interface IApiKey extends Document {
    _id: mongoose.Types.ObjectId;
    companyId: string;
    name: string; // e.g. "Backend Integration"
    keyHash: string;

    environment: 'test' | 'live';

    status: 'ACTIVE' | 'REVOKED';

    usagePlan: 'FREE' | 'STANDARD' | 'PREMIUM';

    lastUsedAt?: Date;
    createdAt: Date;
}

let ApiKeySchema = new mongoose.Schema({
    companyId: { type: String, index: true },
    name: { type: String }, // e.g. "Backend Integration"
    keyHash: { type: String, required: true },

    environment: { type: String, enum: ['test', 'live'] },

    status: {
        type: String,
        enum: ['ACTIVE', 'REVOKED'],
        default: 'ACTIVE'
    },

    usagePlan: {
        type: String,
        enum: ['FREE', 'STANDARD', 'PREMIUM'],
        default: 'FREE'
    },

    lastUsedAt: Date,
    createdAt: { type: Date, default: Date.now }
});

//Crea indice para el codigo
ApiKeySchema.index({ companyId: 1, name: 1 }, { unique: true });

export const ApiKey: Model<IApiKey> = model<IApiKey>("ApiKey", ApiKeySchema);