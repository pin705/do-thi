import mongoose, { Schema, Document } from 'mongoose';
import { Character, CultivationLevel, LinhCan, ItemType, ItemRarity } from '@urban-xianxia/shared';

export interface ICharacter extends Document, Omit<Character, 'id'> {
  _id: mongoose.Types.ObjectId;
}

const InventoryItemSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, enum: Object.values(ItemType), required: true },
  name: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  rarity: { type: String, enum: Object.values(ItemRarity), required: true },
});

const CharacterSchema = new Schema(
  {
    username: { type: String, unique: true, sparse: true },
    password: { type: String, select: false },
    name: { type: String, required: true },
    avatar: { type: String, default: '' },
    linhCan: { type: String, enum: Object.values(LinhCan), required: true },
    level: {
      type: String,
      enum: Object.values(CultivationLevel),
      default: CultivationLevel.LUYEN_KHI,
    },
    linhKhi: { type: Number, default: 0 },
    exp: { type: Number, default: 0 },
    inventory: [InventoryItemSchema],
    lastOnline: { type: Number, default: Date.now },
    lastPosition: {
        lat: { type: Number, default: 21.0285 },
        lng: { type: Number, default: 105.8542 }
    },
    totalDistance: { type: Number, default: 0 },
    createdAt: { type: Number, default: Date.now },
  },
  {
    toJSON: {
      transform: (_, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
      },
    },
  },
);

export const CharacterModel = mongoose.model<ICharacter>('Character', CharacterSchema);
