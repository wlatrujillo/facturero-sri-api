

import { Document, Schema, Model, model, Types } from "mongoose";

export interface IInvoice extends Document {
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

let InvoiceSchema = new Schema(
    {
        ruc: {
            type: String,
            required: [true, 'El RUC es obligatorio'],
            maxLength: [13, 'Maximo 13 caracteres'],
            minLength: [13, 'Minimo 13 caracteres'],
            trim: true,
            unique: true
        },
        status: {
            type: String,
            required: [true, 'El estado es obligatorio'],
            enum: {
                values: ['PENDING', 'SENT', 'AUTHORIZED', 'REJECTED', 'CANCELED'],
                message: '{VALUE} no es un estado valido'
            },
            default: 'PENDING'
        },
        xml: {
            type: String,
            required: [true, 'El contenido XML es obligatorio']
        },
        accessKey: {
            type: String,
            required: [true, 'La clave de acceso es obligatoria'],
            unique: true,
            length: [49, 'La clave de acceso debe tener 49 caracteres'],
            trim: true
        },
        createdAt: {
            type: Date,
            required: true,
            default: Date.now
        }, 
        updatedAt: {
            type: Date,
            required: true,
            default: Date.now
        }

    }, { timestamps: true }
);

//Crea indice para el codigo
InvoiceSchema.index({ ruc: 1 }, { unique: true });

export const Invoice: Model<IInvoice> = model<IInvoice>("Invoice", InvoiceSchema);