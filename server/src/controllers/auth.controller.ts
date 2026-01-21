import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { CharacterModel } from '../models/Character.js';
import { LinhCan, CultivationLevel } from '@urban-xianxia/shared';

export class AuthController {
  
  static async register(req: Request, res: Response) {
    try {
      const { username, password, linhCan } = req.body;

      // Validate
      if (!username || !password || !linhCan) {
        return res.status(400).json({ success: false, error: 'Missing fields' });
      }

      const existingUser = await CharacterModel.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ success: false, error: 'Username taken' });
      }

      // Hash Password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Generate Name
      const prefix = ['Đạo', 'Huyền', 'Thanh', 'Tử', 'Linh'];
      const suffix = ['Tử', 'Phong', 'Vân', 'Sơn', 'Hải'];
      const randomName = `${prefix[Math.floor(Math.random() * prefix.length)]} ${suffix[Math.floor(Math.random() * suffix.length)]} ${Math.floor(Math.random() * 100)}`;

      // Create
      const newCharacter = await CharacterModel.create({
        username,
        password: hashedPassword,
        name: randomName,
        linhCan: linhCan,
        level: CultivationLevel.LUYEN_KHI,
        linhKhi: 0,
        exp: 0,
        inventory: [],
        lastOnline: Date.now(),
        totalDistance: 0,
        avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${randomName}&backgroundColor=b6e3f4`
      });

      // Token
      const token = jwt.sign({ id: newCharacter._id }, process.env.TOKEN_SECRET || 'secret', { expiresIn: '7d' });

      return res.status(201).json({
        success: true,
        data: {
            character: newCharacter.toJSON(),
            token
        }
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      const user = await CharacterModel.findOne({ username }).select('+password');
      if (!user) {
        return res.status(400).json({ success: false, error: 'Invalid credentials' });
      }

      const validPass = await bcrypt.compare(password, user.password as string);
      if (!validPass) {
        return res.status(400).json({ success: false, error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET || 'secret', { expiresIn: '7d' });

      return res.json({
        success: true,
        data: {
            character: user.toJSON(),
            token
        }
      });

    } catch (error) {
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }
}
