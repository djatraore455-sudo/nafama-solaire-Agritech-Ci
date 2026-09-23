import { CartItem, HarvestLot, TechnicalAlert, TransactionRecord, SmsSetting, TelemetryData, SolarProductionHistoryPoint } from '../types';

export const INITIAL_TELEMETRY: TelemetryData = {
  solarProductionKw: 4.8,
  sunlightPercent: 92,
  batteryPercent: 88,
  pumpFlowM3h: 14.2,
  pumpPressureBar: 3.4,
  soilHumidityPercent: 64,
  pumpActive: true,
  tankRemainingLiters: 18500,
  lastUpdated: 'En direct (LoRaWan CI)',
};

export const INITIAL_CART_ITEMS: CartItem[] = [
  {
    id: 'prod-1',
    name: 'Tomates fraîches bord-champ',
    category: 'Maraîchage',
    spec: 'Calibre A • Caisse de 50 kg',
    unitPrice: 18500,
    quantity: 1,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALOmFljq5C0lAw6dR94uq7Sbf3DsjJRKg0IIyubQhjjztNMI_AmweY3uxSFBvXbDvcRPG5T5AuvmiOpS6Y70lBfXMfATRkA6mt_Hu-cxhP3KbRa4O-sa1xzYcqSx8OtLSNCqWlJEeWeR6zcxy50MoYtWivluxli0TV3GlasiX5zrTg_R6lA_iqEB7sUWTkhEez5wEJZvP4d6DwSj9_KRgmD-9QGxhuSOcxxddnCKW8Oy0fm_avicpZKQ'
  },
  {
    id: 'prod-2',
    name: 'Piments frais de Korhogo',
    category: 'Épices & Vivriers',
    spec: 'Variété Pili Pili • Sac de 10 kg',
    unitPrice: 9000,
    quantity: 1,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCh86jKNVQBrnnasiWGp4FHOukNkN_egKetX1bV_zKCQVgldOlkH12SNBcKoygrt55pgxuF_LYIxIudVdIAlOV2qGK6AW0fxS1un65uLrWQf7sQNOL_KhiOmQyYak0gyXoN4i8qvsbVpkdG2ZBZbfYPjoCMSX0L-UQrTKvgIzIYAfcKr-0PWaBOHfhTWtaOweqQ5D8N7I1eBc5XY1IcPXV_ayAFM312tHUABqlr2B7-nfrSapgYOo6DDw'
  },
  {
    id: 'prod-3',
    name: 'Maïs grain sec (Coop)',
    category: 'Céréales',
    spec: 'Séchage solaire garanti • 25 kg',
    unitPrice: 6500,
    quantity: 1,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD68CAd4MA-uqU7CdgPROMHZ9HAQuAhsQcuqF83_8x39Wjrc2rrKY3cY3_Jc9MYiqOsxvxKO1x77R2KvfqYvJ1h86-A9QG1zJbziNexsD04TLpZu1G4q2mvWqmPZsAqLudQBWBG5Hpg89HPvucgPDSImF45IWMUp_GAKjPkgI7X2zsUvNypNzxG15bLhEoTRvZXA3xfpOOJ7cE9Qoj-3Nv5NdznFTaLtQObRAtoXIvjl3Ei1bhNW8wz4Q'
  }
];

export const INITIAL_HARVEST_LOTS: HarvestLot[] = [
  {
    id: 'lot-1',
    name: 'Tomates Plein Champ (Petroma F1)',
    producer: 'Kouassi Yao (Yamoussoukro)',
    location: 'Yamoussoukro',
    quantity: '850 kg',
    pricePerKg: 450,
    tag: 'Irrigué Solaire',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpeM9nkPvqBV0cV9mKGoR07bxfwuwXEb_brWyWUXeECJbxe3UdTwFDsIqzdr7bw3xhRfl3iCoKw2Aca9H3Jdii_O0UR5svvozf_856AhiOgW8vBJD7Z7ALgPvTQx2mBuqGnHZnx_glszKfNh7kcKbH6O19gnvucJeSMDWTklumu4Fd_Y_TW_5wq-e0PKhPzcfaNnoMINc9uC7zToUJdlgsEz1Z-1cmAipdWychKPIkXcZw1Bu11lLbDQ',
    status: 'pending'
  },
  {
    id: 'lot-2',
    name: 'Banane Foutou & Manioc Doux',
    producer: 'Coopérative Anondo (Dabou)',
    location: 'Dabou',
    quantity: '1.2 Tonne',
    pricePerKg: 320,
    tag: 'Commande Groupée',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSZi23oYY6bbX16CT-5dlo7fFBoqbqWeMRLOVPTA7i8l2Ad1CVg7TOh6aANrCI6jlq6R8y8IonYzW4RZ1bTaipTTYvTgBJieul3LXIjkEQ9FI9GAPWybc4zyETsdKM2_u_g5SUqt5GHwhyWnQlUuYEFI1kcER6_jjPfWPIHVZACtUsHnDSTElnWULEYLxswO8N11jkWscRrgSJVOXaYuyCafVmmNb4pGETzqM0DbnQ4P13AZWYu0w-zw',
    status: 'pending'
  },
  {
    id: 'lot-3',
    name: 'Aubergines Kôyô & Gombo Vert',
    producer: 'Silué Bakary (Korhogo)',
    location: 'Korhogo',
    quantity: '400 kg',
    pricePerKg: 500,
    tag: 'Certifié Bio Nafama',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALOmFljq5C0lAw6dR94uq7Sbf3DsjJRKg0IIyubQhjjztNMI_AmweY3uxSFBvXbDvcRPG5T5AuvmiOpS6Y70lBfXMfATRkA6mt_Hu-cxhP3KbRa4O-sa1xzYcqSx8OtLSNCqWlJEeWeR6zcxy50MoYtWivluxli0TV3GlasiX5zrTg_R6lA_iqEB7sUWTkhEez5wEJZvP4d6DwSj9_KRgmD-9QGxhuSOcxxddnCKW8Oy0fm_avicpZKQ',
    status: 'pending'
  }
];

export const INITIAL_TECHNICAL_ALERTS: TechnicalAlert[] = [
  {
    id: 'alt-1',
    title: 'Pompe #NF-408 (Korhogo)',
    location: "Coopérative Yêrêflô • Pression d'eau critique (0.2 Bar)",
    description: "Chute brutale de pression constatée. Débit quasi nul.",
    metric: '12.1V (Chute de tension)',
    severity: 'critical',
    tag: 'Débit nul'
  },
  {
    id: 'alt-2',
    title: 'Boîtier LoRa #GW-092 (Bouaké)',
    location: "Plantation N'Gatta • Déconnexion GSM depuis 2h",
    description: "Perte temporaire du relais télémétrique.",
    metric: 'Panneau 320W opérationnel',
    severity: 'warning',
    tag: 'Signal Faible'
  }
];

export const INITIAL_TRANSACTIONS: TransactionRecord[] = [
  {
    id: 'tx-1',
    operator: 'wave',
    title: 'Wave CI • Acompte Pompe',
    sender: 'Bakayoko Seydou (Sinematiali)',
    amount: 125000,
    status: 'valide',
    date: 'Il y a 12 min'
  },
  {
    id: 'tx-2',
    operator: 'orange',
    title: 'Orange Money • Achat Lot Piment',
    sender: 'Maquis Le Refuge (Cocody Blockhauss)',
    amount: 68500,
    status: 'valide',
    date: 'Il y a 44 min'
  },
  {
    id: 'tx-3',
    operator: 'mtn',
    title: 'MTN MoMo • Rechargement Solaire',
    sender: 'Coopérative Djiboua (Divo)',
    amount: 35000,
    status: 'en_attente',
    date: 'Il y a 1 h'
  }
];

export const INITIAL_SMS_SETTINGS: SmsSetting[] = [
  {
    id: 'sms-pannes',
    title: 'Alertes Pannes & Pompes Solaires',
    description: "Arrêt soudain, surchauffe variateur, cuve d'eau presque vide.",
    priority: 'Priorité Haute (Immédiat)',
    enabled: true
  },
  {
    id: 'sms-meteo',
    title: 'Bulletin Météo Agricole Matinal',
    description: "Prévisions de pluie, orages isolés et humidité à 6h00 du matin.",
    priority: '6h00 GMT • Zone : Bouaké Sud',
    enabled: true,
    extraInfo: 'Zone : Bouaké Sud'
  },
  {
    id: 'sms-ventes',
    title: 'Alertes Ventes & Commandes',
    description: "Demande d'achat d'un maquis/grossiste ou réception d'acompte Mobile Money.",
    priority: 'Temps réel',
    enabled: true
  },
  {
    id: 'sms-ia',
    title: "Conseils d'Irrigation IA",
    description: "Recommandations en Français, Baoulé ou Dioula selon l'humidité du sol.",
    priority: 'Option',
    enabled: false,
    isOption: true
  }
];

export const RECIPIENT_NUMBERS = [
  {
    id: 'rec-advisor',
    phone: '+225 64 64 84 39 12',
    name: 'Conseiller Agricole NAFAMA (Direct)',
    operator: 'Orange CI',
    badge: 'Conseiller'
  },
  {
    id: 'rec-1',
    phone: '+225 07 58 42 19 80',
    name: 'Konan Kouassi (Propriétaire)',
    operator: 'Orange CI',
    badge: 'Exploitant'
  },
  {
    id: 'rec-2',
    phone: '+225 05 02 18 99 43',
    name: 'Mamadou T. (Chef de culture)',
    operator: 'MTN CI',
    badge: 'Terrain'
  }
];

export const VOICE_PROMPTS = {
  fr: {
    label: 'Français',
    prompt: "« Démarrer l'arrosage parcelle 2 »",
    sub: "Appuyez pour parler en Dioula, Sénoufo ou Français",
    welcome: "Bienvenue sur Nafama Solaire. Vous pouvez piloter vos pompes solaires et vérifier votre récolte.",
    pump_on: "La pompe immergée solaire a été activée. Débit nominal 14.2 mètres cubes par heure.",
    pump_off: "La pompe immergée solaire a été arrêtée manuellement.",
    sms_test: "Message test SMS envoyé à vos deux contacts enregistrés."
  },
  dioula: {
    label: 'Dioula',
    prompt: "« Ji bila kɛnɛ kan sisan »",
    sub: "Kuma Dioulakan na walasa ka pompi kɔrɔsi",
    welcome: "I bisimila Nafama Solaire la. Télémétrie pompi be baara kɛ kosɛbɛ.",
    pump_on: "Pompi dalen bɛ kɛnɛ kan sisan ni télémétrie ye.",
    pump_off: "Pompi dabila la sisan.",
    sms_test: "SMS ci kɛra i ka dɔgɔkunw ma sisan."
  },
  senoufo: {
    label: 'Sénoufo',
    prompt: "« Loo leele kpara na »",
    sub: "Kori Sénoufo na ma pumpu kpan",
    welcome: "Fôh baa Nafama Solaire na. Kpaan leele na fôh loo pumpu.",
    pump_on: "Pumpu kpaan leele na sisan.",
    pump_off: "Pumpu yôlôgô na.",
    sms_test: "SMS kpan gbeligbé ci na."
  },
  baoule: {
    label: 'Baoulé',
    prompt: "« Goua nzoué liké su »",
    sub: "Kanyi Baoulé nun kpa ba su kpo",
    welcome: "Nianmiên kpa. Nafama Solaire su man bé pompi kpa.",
    pump_on: "Pompi nun titilé kpa nzoué be fin.",
    pump_off: "Pompi ti kpou.",
    sms_test: "SMS kpa ba man amun sran mun."
  }
};

export const SOLAR_HISTORY_24H: SolarProductionHistoryPoint[] = [
  { time: '00:00', hourLabel: '00h', productionKw: 0.0, consumptionKw: 0.1, irradianceWm2: 0, pumpFlowM3h: 0.0, batterySoc: 82 },
  { time: '01:00', hourLabel: '01h', productionKw: 0.0, consumptionKw: 0.1, irradianceWm2: 0, pumpFlowM3h: 0.0, batterySoc: 80 },
  { time: '02:00', hourLabel: '02h', productionKw: 0.0, consumptionKw: 0.1, irradianceWm2: 0, pumpFlowM3h: 0.0, batterySoc: 79 },
  { time: '03:00', hourLabel: '03h', productionKw: 0.0, consumptionKw: 0.1, irradianceWm2: 0, pumpFlowM3h: 0.0, batterySoc: 78 },
  { time: '04:00', hourLabel: '04h', productionKw: 0.0, consumptionKw: 0.1, irradianceWm2: 0, pumpFlowM3h: 0.0, batterySoc: 77 },
  { time: '05:00', hourLabel: '05h', productionKw: 0.0, consumptionKw: 0.1, irradianceWm2: 0, pumpFlowM3h: 0.0, batterySoc: 76 },
  { time: '06:00', hourLabel: '06h', productionKw: 0.4, consumptionKw: 0.2, irradianceWm2: 85, pumpFlowM3h: 0.0, batterySoc: 76 },
  { time: '07:00', hourLabel: '07h', productionKw: 1.3, consumptionKw: 1.2, irradianceWm2: 270, pumpFlowM3h: 4.5, batterySoc: 78 },
  { time: '08:00', hourLabel: '08h', productionKw: 2.6, consumptionKw: 2.3, irradianceWm2: 520, pumpFlowM3h: 8.8, batterySoc: 82 },
  { time: '09:00', hourLabel: '09h', productionKw: 3.8, consumptionKw: 3.2, irradianceWm2: 740, pumpFlowM3h: 11.5, batterySoc: 87 },
  { time: '10:00', hourLabel: '10h', productionKw: 4.4, consumptionKw: 3.6, irradianceWm2: 880, pumpFlowM3h: 13.0, batterySoc: 92 },
  { time: '11:00', hourLabel: '11h', productionKw: 4.7, consumptionKw: 3.8, irradianceWm2: 940, pumpFlowM3h: 13.8, batterySoc: 96 },
  { time: '12:00', hourLabel: '12h', productionKw: 4.9, consumptionKw: 3.9, irradianceWm2: 990, pumpFlowM3h: 14.2, batterySoc: 98 },
  { time: '13:00', hourLabel: '13h', productionKw: 4.8, consumptionKw: 3.9, irradianceWm2: 970, pumpFlowM3h: 14.2, batterySoc: 100 },
  { time: '14:00', hourLabel: '14h', productionKw: 4.6, consumptionKw: 3.8, irradianceWm2: 920, pumpFlowM3h: 14.0, batterySoc: 100 },
  { time: '15:00', hourLabel: '15h', productionKw: 3.9, consumptionKw: 3.4, irradianceWm2: 780, pumpFlowM3h: 12.4, batterySoc: 98 },
  { time: '16:00', hourLabel: '16h', productionKw: 2.8, consumptionKw: 2.5, irradianceWm2: 560, pumpFlowM3h: 9.2, batterySoc: 95 },
  { time: '17:00', hourLabel: '17h', productionKw: 1.6, consumptionKw: 1.5, irradianceWm2: 310, pumpFlowM3h: 5.1, batterySoc: 92 },
  { time: '18:00', hourLabel: '18h', productionKw: 0.5, consumptionKw: 0.4, irradianceWm2: 95, pumpFlowM3h: 0.0, batterySoc: 90 },
  { time: '19:00', hourLabel: '19h', productionKw: 0.0, consumptionKw: 0.2, irradianceWm2: 0, pumpFlowM3h: 0.0, batterySoc: 89 },
  { time: '20:00', hourLabel: '20h', productionKw: 0.0, consumptionKw: 0.2, irradianceWm2: 0, pumpFlowM3h: 0.0, batterySoc: 87 },
  { time: '21:00', hourLabel: '21h', productionKw: 0.0, consumptionKw: 0.1, irradianceWm2: 0, pumpFlowM3h: 0.0, batterySoc: 86 },
  { time: '22:00', hourLabel: '22h', productionKw: 0.0, consumptionKw: 0.1, irradianceWm2: 0, pumpFlowM3h: 0.0, batterySoc: 84 },
  { time: '23:00', hourLabel: '23h', productionKw: 0.0, consumptionKw: 0.1, irradianceWm2: 0, pumpFlowM3h: 0.0, batterySoc: 83 }
];
