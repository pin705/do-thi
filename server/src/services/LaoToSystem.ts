import { CultivationLevel } from '@urban-xianxia/shared';

// Data templates
const GREETINGS = [
  'Tiểu tử, ngươi đã đến {location} rồi sao? Khí tức nơi này hỗn tạp, cẩn thận!',
  'Ồ, {level} mà dám bén mảng tới {location}? Gan ngươi cũng lớn đấy.',
  'Hừm, phong thủy {location} không tệ. Ngồi xuống tu luyện đi!',
  'Này đạo hữu, ta thấy {location} có hào quang lạ. Mau kiểm tra xem!',
];

const LEVEL_COMMENTS: Record<string, string> = {
  [CultivationLevel.LUYEN_KHI]: 'Mới nhập môn mà chạy lung tung.',
  [CultivationLevel.TRUC_CO]: 'Trúc Cơ rồi à? Đã biết ngự kiếm chưa?',
  [CultivationLevel.KET_DAN]: 'Kim Đan đại đạo, không tồi không tồi.',
  [CultivationLevel.NGUYEN_ANH]: 'Nguyên Anh lão quái, kính nể kính nể!',
};

export class LaoToSystem {
  /**
   * Generate a contextual message
   */
  static getMessage(context: {
    type: 'greeting' | 'event' | 'levelup';
    level?: CultivationLevel;
    locationName?: string;
    playerName?: string;
  }): string {
    const { type, level, locationName, playerName } = context;

    switch (type) {
      case 'greeting':
        return this.generateGreeting(
          level || CultivationLevel.LUYEN_KHI,
          locationName || 'vùng đất hoang',
        );
      case 'levelup':
        return `Chúc mừng ${playerName}, tu vi đại tiến!`;
      default:
        return 'Thiên đạo vô thường...';
    }
  }

  private static generateGreeting(level: CultivationLevel, location: string): string {
    // Pick random template
    const template = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];

    // Fill data
    let msg = template.replace('{location}', location);
    msg = msg.replace('{level}', this.getLevelName(level));

    // Append level specific comment occasionally
    if (Math.random() > 0.5) {
      msg += ' ' + (LEVEL_COMMENTS[level] || '');
    }

    return msg;
  }

  private static getLevelName(level: CultivationLevel): string {
    switch (level) {
      case CultivationLevel.LUYEN_KHI:
        return 'Luyện Khí kỳ';
      case CultivationLevel.TRUC_CO:
        return 'Trúc Cơ kỳ';
      default:
        return 'Tu sĩ';
    }
  }
}
