export type ScreenId = 'solaire' | 'formules' | 'paiement' | 'admin' | 'auth' | 'marche';

export type LanguageCode = 'fr' | 'dioula' | 'senoufo' | 'baoule';

export interface TelemetryData {
  solarProductionKw: number;
  sunlightPercent: number;
  batteryPercent: number;
  pumpFlowM3h: number;
  pumpPressureBar: number;
  soilHumidityPercent: number;
  pumpActive: boolean;
  tankRemainingLiters: number;
  lastUpdated: string;
}

export interface CartItem {
  id: string;
  name: string;
  category: string;
  spec: string;
  unitPrice: number;
  quantity: number;
  image: string;
}

export type DeliveryMode = 'express' | 'pickup';

export type MomoOperator = 'wave' | 'orange' | 'mtn' | 'moov';

export interface HarvestLot {
  id: string;
  name: string;
  producer: string;
  location: string;
  quantity: string;
  pricePerKg: number;
  tag: string;
  image: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface TechnicalAlert {
  id: string;
  title: string;
  location: string;
  description: string;
  metric: string;
  severity: 'critical' | 'warning';
  tag: string;
  assignedTo?: string;
}

export interface TransactionRecord {
  id: string;
  operator: MomoOperator;
  title: string;
  sender: string;
  amount: number;
  status: 'valide' | 'en_attente';
  date: string;
}

export interface SmsSetting {
  id: string;
  title: string;
  description: string;
  priority: string;
  enabled: boolean;
  extraInfo?: string;
  isOption?: boolean;
}

export interface MarketProduct {
  id: string;
  name: string;
  category: 'legumes' | 'cereales' | 'epices' | 'fruits';
  spec: string;
  unitPrice: number;
  producer: string;
  energyType: string;
  image: string;
  isUserUploaded?: boolean;
  uploadDate?: string;
}

export type UserRole = 'producer' | 'technician' | 'buyer' | 'admin';

export interface UserAccount {
  nom: string;
  prenom: string;
  phone: string;
  location: string;
  role: UserRole;
  pin: string;
  isLoggedIn: boolean;
  avatar?: string;
  email?: string;
}

export interface SolarProductionHistoryPoint {
  time: string;
  hourLabel: string;
  productionKw: number;
  consumptionKw: number;
  irradianceWm2: number;
  pumpFlowM3h: number;
  batterySoc: number;
}
