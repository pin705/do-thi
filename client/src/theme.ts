// 🖋️ TÀI LIỆU THIẾT KẾ THẨM MỸ CAO CẤP: DIGITAL ARTIFACT
// Implementation of GAME-STYLES.MD

export const COLORS = {
  // Bảng màu chiến thuật
  DEEP_VOID: 0x020617, // Nền chính
  CIRCUIT_SLATE: 0x1e293b, // Nền menu phụ
  SPIRIT_TEAL: 0x2dd4bf, // Linh khí mặc định
  ANCIENT_GOLD: 0xa16207, // Cấp độ đại năng
  WARNING_RED: 0xe11d48, // Cảnh báo
  MONOCHROME_TEXT: 0xf8fafc, // Văn bản chính

  // Hex Strings for DOM/CSS
  HEX: {
    DEEP_VOID: '#020617',
    CIRCUIT_SLATE: '#1E293B',
    SPIRIT_TEAL: '#2DD4BF',
    ANCIENT_GOLD: '#A16207',
    WARNING_RED: '#E11D48',
    MONOCHROME_TEXT: '#F8FAFC',
  },
};

export const FONTS = {
  MONO: '"JetBrains Mono", "Courier New", monospace', // Chỉ số
  SERIF: '"Cinzel", "Playfair Display", serif', // Tiêu đề
  SANS: '"Inter", system-ui, sans-serif', // Fallback
};

export const STYLES = {
  // Glassmorphism nguyên bản
  GLASS_PANEL: {
    fillStyle: { color: COLORS.CIRCUIT_SLATE, alpha: 0.8 },
    lineStyle: { width: 1, color: 0xffffff, alpha: 0.1 },
    radius: 2,
  },

  // Nút chức năng Line-art
  BUTTON: {
    default: { color: COLORS.SPIRIT_TEAL, alpha: 0.1 },
    hover: { color: COLORS.SPIRIT_TEAL, alpha: 0.3 },
    stroke: { width: 1, color: COLORS.SPIRIT_TEAL },
  },
};
