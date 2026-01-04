

import { Document, Schema, Model, model, Types } from "mongoose";

export interface ICompany extends Document {
    _id: Types.ObjectId;
    ruc: String;
    autorization: String;
    autorizationDate: Date;
    name: String;
    address: String;
    urlLogo: String;
    email: String;
    phone: String;
    active: Boolean;
    signaturePassword: String;
}

let CompanySchema = new Schema(
    {
        ruc: {
            type: String,
            required: [true, 'El RUC es obligatorio'],
            maxLength: [13, 'Maximo 13 caracteres'],
            minLength: [13, 'Minimo 13 caracteres'],
            trim: true,
            unique: true
        },
        email: {
            type: String,
            required: false,
            lowercase: true,
            match: [/\S+@\S+\.\S+/, 'El email no es valido'],
            trim: true
        },
        active: {
            type: Boolean,
            required: true,
            default: false
        },
        name: {
            type: String,
            required: false,
            trim: true
        },
        address: {
            type: String,
            required: false,
            trim: true
        },
        urlLogo: {
            type: String,
            required: false,
            trim: true
        },
        phone: {
            type: String,
            required: false,
            trim: true
        },
        signaturePassword: {
            type: String,
            required: false,
            trim: true
        },
        autorization: {
            type: String,
            required: false,
            trim: true
        },
        autorizationDate: {
            type: Date,
            required: false
        }

    }, { timestamps: true }
);

//Crea indice para el codigo
CompanySchema.index({ ruc: 1, email: 1 }, { unique: true });

export const Company: Model<ICompany> = model<ICompany>("Company", CompanySchema);