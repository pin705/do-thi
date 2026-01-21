// --- ENUMS ---

export enum LinhCan {
  KIM = 'kim', // Gold/Yellow - Metal
  MOC = 'moc', // Green - Wood
  THUY = 'thuy', // Blue - Water
  HOA = 'hoa', // Red - Fire
  THO = 'tho', // Brown - Earth
}

export enum CultivationLevel {
  LUYEN_KHI = 'luyen_khi', // Luyện Khí (Qi Refining)
  TRUC_CO = 'truc_co', // Trúc Cơ (Foundation)
  KET_DAN = 'ket_dan', // Kết Đan (Core Formation)
  NGUYEN_ANH = 'nguyen_anh', // Nguyên Anh (Nascent Soul)
  HOA_THAN = 'hoa_than', // Hóa Thần (Spirit Severing)
  LUYEN_HU = 'luyen_hu', // Luyện Hư (Void Refinement)
  DAI_THUA = 'dai_thua', // Đại Thừa (Mahayana)
  DO_KIEP = 'do_kiep', // Độ Kiếp (Tribulation)
}

export enum ItemType {
  LINH_THAO = 'linh_thao', // Spirit Herb
  DAN_DUOC = 'dan_duoc', // Pills
  VU_KHI = 'vu_khi', // Weapon
  PHAP_BAO = 'phap_bao', // Treasure
}

export enum ItemRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

export enum GestureType {
  SWORD_STRIKE = 'sword_strike', // V shape
  SHIELD = 'shield', // Circle
  FIRE_BALL = 'fire_ball', // Triangle
  WAVE = 'wave', // Horizontal line
}

// --- INTERFACES ---

// Inventory item
export interface InventoryItem {
  id: string;
  type: ItemType;
  name: string;
  quantity: number;
  rarity: ItemRarity;
}

// Player character data
export interface Character {
  id: string;
  name: string;
  avatar?: string; // Avatar URL
  linhCan: LinhCan;
  level: CultivationLevel;
  linhKhi: number; // Linh Khí (Qi)
  exp: number;
  inventory: InventoryItem[];
  lastOnline: number; // Timestamp
  lastPosition?: { lat: number, lng: number };
  totalDistance: number; // Meters
  createdAt: number;
}

// GPS Position
export interface GPSPosition {
  lat: number;
  lng: number;
  timestamp: number;
}

export enum PlayerStatus {
  IDLE = 'idle',           // Đứng im
  WALKING = 'walking',     // Di chuyển
  MEDITATING = 'meditating' // Ngồi thiền (AFK lâu)
}

// Real-time player data for Map
export interface PlayerMapData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  linhCan: LinhCan;
  level: CultivationLevel;
  avatar?: string;
  status: PlayerStatus;
  speed: number; // km/h
}

// Spirit Herb on map
export interface SpiritHerb {
  id: string;
  name: string;
  lat: number;
  lng: number;
  rarity: ItemRarity;
  linhCan: LinhCan;
  sprite: string;
}

// Voice commands
export interface VoiceCommand {
  keyword: string;
  action: 'attack_boost' | 'shield' | 'heal';
  linhKhiCost: number;
}

// --- SOCKET.IO EVENTS ---

export interface ServerToClientEvents {
  'player:nearby': (players: PlayerMapData[]) => void;
  'player:joined': (player: PlayerMapData) => void;
  'player:left': (playerId: string) => void;
  'player:moved': (player: PlayerMapData) => void;
  'linhKhi:updated': (amount: number) => void;
  'player:exp_gained': (data: { id: string, amount: number }) => void;
  'laoTo:message': (message: string) => void;
  'combat:damage': (data: { targetId: string; amount: number }) => void;
}

export interface ClientToServerEvents {
  'player:register': (data: { characterId: string; position: GPSPosition }) => void;
  'player:move': (position: GPSPosition) => void;
  'player:meditate': (isMeditating: boolean) => void;
  'player:action': (action: { type: string; targetId?: string }) => void;
  'player:disconnect': () => void;
}

// --- API RESPONSES ---

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
