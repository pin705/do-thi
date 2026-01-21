import { Request, Response } from 'express';
import { CharacterModel } from '../models/Character.js';
import { Character, LinhCan, CultivationLevel } from '@urban-xianxia/shared';

export class PlayerController {
  // Create a new character (Awakening)
  static async create(req: Request, res: Response) {
    try {
      const { linhCan } = req.body;

      if (!Object.values(LinhCan).includes(linhCan)) {
        return res.status(400).json({ success: false, error: 'Invalid Linh Can' });
      }

      // Generate a Taoist name
      const prefix = ['Đạo', 'Huyền', 'Thanh', 'Tử', 'Linh'];
      const suffix = ['Tử', 'Phong', 'Vân', 'Sơn', 'Hải'];
      const randomName = `${prefix[Math.floor(Math.random() * prefix.length)]} ${suffix[Math.floor(Math.random() * suffix.length)]} ${Math.floor(Math.random() * 100)}`;

      const newCharacter = await CharacterModel.create({
        name: randomName,
        linhCan: linhCan,
        level: CultivationLevel.LUYEN_KHI,
        linhKhi: 0,
        exp: 0,
        inventory: [],
        lastOnline: Date.now(),
        totalDistance: 0,
      });

      return res.status(201).json({
        success: true,
        data: newCharacter.toJSON(),
      });
    } catch (error) {
      console.error('Create character error:', error);
      return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }

  // Get character details
  static async get(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const character = await CharacterModel.findById(id);

      if (!character) {
        return res.status(404).json({ success: false, error: 'Character not found' });
      }

      return res.json({
        success: true,
        data: character.toJSON(),
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }

  // Update progress (called periodically or on specific events)
  static async updateProgress(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { distanceDelta, linhKhiDelta } = req.body;

      const character = await CharacterModel.findById(id);
      if (!character) {
        return res.status(404).json({ success: false, error: 'Character not found' });
      }

      if (distanceDelta) character.totalDistance += Number(distanceDelta);
      if (linhKhiDelta) character.linhKhi += Number(linhKhiDelta);

      character.lastOnline = Date.now();
      await character.save();

      return res.json({ success: true, data: character.toJSON() });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }
}
