import React, { useState, useRef } from 'react';
import { CartItem, ScreenId } from '../types';
import { ImageLightboxModal } from './ImageLightboxModal';

interface ScreenMarcheProps {
  onAddToCart: (item: Omit<CartItem, 'quantity'>) => void;
  onNavigate: (screen: ScreenId) => void;
  onTriggerSmsNotification: (message: string) => void;
}

export interface MarketItemData {
  id: string;
  name: string;
  category: 'legumes' | 'cereales' | 'epices' | 'fruits';
  spec: string;
  unitPrice: number;
  producer: string;
  energyType: string;
  image: string;
  isUserUploaded?: boolean;
  dateAdded?: string;
}

export interface GalleryPhoto {
  id: string;
  title: string;
  caption: string;
  category: string;
  image: string;
  isUserUploaded?: boolean;
  author: string;
  date: string;
}

const DEFAULT_MARKET_ITEMS: MarketItemData[] = [
  {
    id: 'mkt-1',
    name: 'Tomates fraîches bord-champ',
    category: 'legumes',
    spec: 'Calibre A • Caisse de 50 kg',
    unitPrice: 18500,
    producer: 'Coop Yêrêflô (Korhogo)',
    energyType: '100% Solaire',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALOmFljq5C0lAw6dR94uq7Sbf3DsjJRKg0IIyubQhjjztNMI_AmweY3uxSFBvXbDvcRPG5T5AuvmiOpS6Y70lBfXMfATRkA6mt_Hu-cxhP3KbRa4O-sa1xzYcqSx8OtLSNCqWlJEeWeR6zcxy50MoYtWivluxli0TV3GlasiX5zrTg_R6lA_iqEB7sUWTkhEez5wEJZvP4d6DwSj9_KRgmD-9QGxhuSOcxxddnCKW8Oy0fm_avicpZKQ'
  },
  {
    id: 'mkt-2',
    name: 'Piments frais de Korhogo',
    category: 'epices',
    spec: 'Variété Pili Pili • Sac de 10 kg',
    unitPrice: 9000,
    producer: 'Plantation Nambékaha (Poro)',
    energyType: 'Irrigué Solaire',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCh86jKNVQBrnnasiWGp4FHOukNkN_egKetX1bV_zKCQVgldOlkH12SNBcKoygrt55pgxuF_LYIxIudVdIAlOV2qGK6AW0fxS1un65uLrWQf7sQNOL_KhiOmQyYak0gyXoN4i8qvsbVpkdG2ZBZbfYPjoCMSX0L-UQrTKvgIzIYAfcKr-0PWaBOHfhTWtaOweqQ5D8N7I1eBc5XY1IcPXV_ayAFM312tHUABqlr2B7-nfrSapgYOo6DDw'
  },
  {
    id: 'mkt-3',
    name: 'Maïs grain sec (Coop)',
    category: 'cereales',
    spec: 'Séchage solaire garanti • 25 kg',
    unitPrice: 6500,
    producer: 'Coopérative Djiboua',
    energyType: 'Séchoir Solaire',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD68CAd4MA-uqU7CdgPROMHZ9HAQuAhsQcuqF83_8x39Wjrc2rrKY3cY3_Jc9MYiqOsxvxKO1x77R2KvfqYvJ1h86-A9QG1zJbziNexsD04TLpZu1G4q2mvWqmPZsAqLudQBWBG5Hpg89HPvucgPDSImF45IWMUp_GAKjPkgI7X2zsUvNypNzxG15bLhEoTRvZXA3xfpOOJ7cE9Qoj-3Nv5NdznFTaLtQObRAtoXIvjl3Ei1bhNW8wz4Q'
  },
  {
    id: 'mkt-4',
    name: 'Banane Foutou & Manioc Doux',
    category: 'legumes',
    spec: 'Régime frais • Lot de 30 kg',
    unitPrice: 9600,
    producer: 'Coop Anondo (Dabou)',
    energyType: 'Circuit Court',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSZi23oYY6bbX16CT-5dlo7fFBoqbqWeMRLOVPTA7i8l2Ad1CVg7TOh6aANrCI6jlq6R8y8IonYzW4RZ1bTaipTTYvTgBJieul3LXIjkEQ9FI9GAPWybc4zyETsdKM2_u_g5SUqt5GHwhyWnQlUuYEFI1kcER6_jjPfWPIHVZACtUsHnDSTElnWULEYLxswO8N11jkWscRrgSJVOXaYuyCafVmmNb4pGETzqM0DbnQ4P13AZWYu0w-zw'
  }
];

const DEFAULT_GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    id: 'gal-1',
    title: 'Parcelle Maraîchère Korhogo',
    caption: 'Goutte-à-goutte alimenté par pompe solaire submersible 3.5 kW',
    category: 'Installation Solaire',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpeM9nkPvqBV0cV9mKGoR07bxfwuwXEb_brWyWUXeECJbxe3UdTwFDsIqzdr7bw3xhRfl3iCoKw2Aca9H3Jdii_O0UR5svvozf_856AhiOgW8vBJD7Z7ALgPvTQx2mBuqGnHZnx_glszKfNh7kcKbH6O19gnvucJeSMDWTklumu4Fd_Y_TW_5wq-e0PKhPzcfaNnoMINc9uC7zToUJdlgsEz1Z-1cmAipdWychKPIkXcZw1Bu11lLbDQ',
    author: 'Coop Yêrêflô',
    date: 'Hier'
  },
  {
    id: 'gal-2',
    title: 'Récolte Tomates Bio',
    caption: 'Cueillette matinale sous ombrière, arrosage 100% solaire',
    category: 'Récoltes',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALOmFljq5C0lAw6dR94uq7Sbf3DsjJRKg0IIyubQhjjztNMI_AmweY3uxSFBvXbDvcRPG5T5AuvmiOpS6Y70lBfXMfATRkA6mt_Hu-cxhP3KbRa4O-sa1xzYcqSx8OtLSNCqWlJEeWeR6zcxy50MoYtWivluxli0TV3GlasiX5zrTg_R6lA_iqEB7sUWTkhEez5wEJZvP4d6DwSj9_KRgmD-9QGxhuSOcxxddnCKW8Oy0fm_avicpZKQ',
    author: 'Ferme Kouassi',
    date: 'Il y a 2 jours'
  },
  {
    id: 'gal-3',
    title: 'Piments Séchés Naturels',
    caption: 'Séchage solaire hygiénique sans feu de bois',
    category: 'Transformation',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCh86jKNVQBrnnasiWGp4FHOukNkN_egKetX1bV_zKCQVgldOlkH12SNBcKoygrt55pgxuF_LYIxIudVdIAlOV2qGK6AW0fxS1un65uLrWQf7sQNOL_KhiOmQyYak0gyXoN4i8qvsbVpkdG2ZBZbfYPjoCMSX0L-UQrTKvgIzIYAfcKr-0PWaBOHfhTWtaOweqQ5D8N7I1eBc5XY1IcPXV_ayAFM312tHUABqlr2B7-nfrSapgYOo6DDw',
    author: 'Plantation Nambékaha',
    date: 'Cette semaine'
  },
  {
    id: 'gal-4',
    title: 'Transmetteur LoRa & Boîtier GSM',
    caption: 'Sonde d’humidité de sol et pilotage électrovanne en champ libre',
    category: 'Capteurs IoT',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuChMbHJbGHnt4wXr-C60OpH-alpDXhR2EGc2cMc2kmE7MJh4J7yDTNpyEt279OCVFNQUjVuZ3vACZ1hLR1aZ1VyyCtDGz7JHmPi8959fPBJz8MeLi3B2mEvfXaMSAXWCliK-kaOdPjQucooUsp-5eO4BY6H41xzy9JWp6D2RMDfetpnZKyxZLWmOKk9Yx8zCvSyUHWPVig_YEQHRPPS8CkJ5MmZ-ebwwvxfqVdOl7-rbpID6DmrbOz4NA',
    author: 'Équipe Technique NAFAMA',
    date: 'Octobre 2025'
  }
];

export const ScreenMarche: React.FC<ScreenMarcheProps> = ({
  onAddToCart,
  onNavigate,
  onTriggerSmsNotification
}) => {
  const [activeTab, setActiveTab] = useState<'marche' | 'galerie'>('marche');
  const [activeCategory, setActiveCategory] = useState<'tous' | 'legumes' | 'cereales' | 'epices' | 'fruits'>('tous');
  const [selectedCity, setSelectedCity] = useState<'Korhogo' | 'Bouaké' | 'Yamoussoukro' | 'Abidjan'>('Korhogo');
  
  // Market items state (persisted or local)
  const [marketItems, setMarketItems] = useState<MarketItemData[]>(() => {
    try {
      const saved = localStorage.getItem('nafama_user_market_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_MARKET_ITEMS;
  });

  // Gallery photos state
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>(() => {
    try {
      const saved = localStorage.getItem('nafama_gallery_photos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_GALLERY_PHOTOS;
  });

  // Upload produce modal / form states
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [produceName, setProduceName] = useState('');
  const [produceCategory, setProduceCategory] = useState<'legumes' | 'cereales' | 'epices' | 'fruits'>('legumes');
  const [produceSpec, setProduceSpec] = useState('');
  const [producePrice, setProducePrice] = useState('');
  const [produceProducer, setProduceProducer] = useState('Ferme Locale (Korhogo)');
  const [produceEnergy, setProduceEnergy] = useState('100% Solaire');
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [uploadFileName, setUploadFileName] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Gallery direct upload modal state
  const [isGalleryUploadOpen, setIsGalleryUploadOpen] = useState(false);
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryCaption, setGalleryCaption] = useState('');
  const [galleryCategory, setGalleryCategory] = useState('Ma Récolte');
  const [galleryImagePreview, setGalleryImagePreview] = useState<string | null>(null);

  // Lightbox Modal state
  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean;
    imageUrl: string;
    title: string;
    subtitle?: string;
    tag?: string;
  }>({
    isOpen: false,
    imageUrl: '',
    title: ''
  });

  const produceFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  // Handle image file selection for produce
  const handleProduceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Veuillez sélectionner un fichier image valide (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadError("L'image est trop volumineuse (max 8 Mo).");
      return;
    }

    setUploadFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setUploadedImagePreview(result);
    };
    reader.onerror = () => {
      setUploadError("Erreur lors de la lecture du fichier sur votre appareil.");
    };
    reader.readAsDataURL(file);
  };

  // Handle image file selection for gallery
  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Veuillez sélectionner un fichier image valide.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setGalleryImagePreview(result);
      if (!galleryTitle) {
        setGalleryTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit new produce
  const handlePublishProduce = (e: React.FormEvent) => {
    e.preventDefault();
    if (!produceName || !producePrice || !uploadedImagePreview) {
      setUploadError("Veuillez sélectionner une image depuis votre appareil et renseigner le nom et le prix.");
      return;
    }

    const newItem: MarketItemData = {
      id: `usr-mkt-${Date.now()}`,
      name: produceName,
      category: produceCategory,
      spec: produceSpec || 'Lot fraîcheur bord-champ',
      unitPrice: parseInt(producePrice, 10) || 5000,
      producer: produceProducer || 'Exploitant Partenaire NAFAMA',
      energyType: produceEnergy,
      image: uploadedImagePreview,
      isUserUploaded: true,
      dateAdded: "À l'instant"
    };

    const updatedItems = [newItem, ...marketItems];
    setMarketItems(updatedItems);
    try {
      localStorage.setItem('nafama_user_market_items', JSON.stringify(updatedItems));
    } catch {
      // safe ignore
    }

    // Also add to gallery so it displays in both places
    const newGalItem: GalleryPhoto = {
      id: `usr-gal-${Date.now()}`,
      title: produceName,
      caption: `${produceSpec || 'Récolte fraîche'} • ${produceProducer}`,
      category: 'Récolte Utilisateur',
      image: uploadedImagePreview,
      isUserUploaded: true,
      author: produceProducer,
      date: "Aujourd'hui"
    };
    const updatedGallery = [newGalItem, ...galleryPhotos];
    setGalleryPhotos(updatedGallery);
    try {
      localStorage.setItem('nafama_gallery_photos', JSON.stringify(updatedGallery));
    } catch {
      // safe ignore
    }

    onTriggerSmsNotification(`Votre récolte "${produceName}" a été publiée avec succès avec votre photo !`);

    // Reset form
    setProduceName('');
    setProduceSpec('');
    setProducePrice('');
    setUploadedImagePreview(null);
    setUploadFileName('');
    setIsPublishModalOpen(false);
  };

  // Submit new gallery photo
  const handlePublishGalleryPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryImagePreview) {
      setUploadError("Veuillez choisir une photo depuis votre appareil.");
      return;
    }

    const newPhoto: GalleryPhoto = {
      id: `gal-usr-${Date.now()}`,
      title: galleryTitle || 'Photo de mon exploitation',
      caption: galleryCaption || 'Image importée par l’utilisateur',
      category: galleryCategory,
      image: galleryImagePreview,
      isUserUploaded: true,
      author: 'Mon Exploitation',
      date: "À l'instant"
    };

    const updated = [newPhoto, ...galleryPhotos];
    setGalleryPhotos(updated);
    try {
      localStorage.setItem('nafama_gallery_photos', JSON.stringify(updated));
    } catch {
      // safe ignore
    }

    onTriggerSmsNotification(`Photo "${newPhoto.title}" ajoutée à la galerie aux côtés des autres images.`);
    setGalleryTitle('');
    setGalleryCaption('');
    setGalleryImagePreview(null);
    setIsGalleryUploadOpen(false);
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = marketItems.filter((i) => i.id !== id);
    setMarketItems(filtered);
    try {
      localStorage.setItem('nafama_user_market_items', JSON.stringify(filtered));
    } catch {
      // safe ignore
    }
    onTriggerSmsNotification("Article supprimé du marché.");
  };

  const handleDeleteGalleryPhoto = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = galleryPhotos.filter((p) => p.id !== id);
    setGalleryPhotos(filtered);
    try {
      localStorage.setItem('nafama_gallery_photos', JSON.stringify(filtered));
    } catch {
      // safe ignore
    }
  };

  const filteredItems = activeCategory === 'tous'
    ? marketItems
    : marketItems.filter((item) => item.category === activeCategory);

  const WEATHER_DATA = {
    Korhogo: { temp: '33°C', condition: 'Ensoleillé & Brise légère', solarIndex: '9.4 kWh/m²', advice: 'Idéal pour pompage solaire continu entre 10h et 16h.' },
    Bouaké: { temp: '31°C', condition: 'Ciel voilé', solarIndex: '7.8 kWh/m²', advice: 'Irrigation recommandée en matinée.' },
    Yamoussoukro: { temp: '30°C', condition: 'Éclaircies', solarIndex: '8.2 kWh/m²', advice: 'Rendement solaire optimal sur variateurs.' },
    Abidjan: { temp: '28°C', condition: 'Humidité côtière 78%', solarIndex: '6.5 kWh/m²', advice: 'Production modérée, batteries en appui.' }
  };

  const currentWeather = WEATHER_DATA[selectedCity];

  return (
    <div className="flex flex-col w-full px-4 pb-24 pt-2 gap-4 max-w-md mx-auto">
      {/* Weather & Solar Yield Banner */}
      <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#eaedff]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#855300] text-[22px]">partly_cloudy_day</span>
            <h2 className="text-sm font-bold text-[#131b2e]">Météo Agricole & Rendement Solaire</h2>
          </div>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value as any)}
            className="text-xs bg-[#f2f3ff] text-[#004c22] font-bold px-2 py-1 rounded-lg border border-[#dae2fd] focus:outline-none"
          >
            <option value="Korhogo">Korhogo</option>
            <option value="Bouaké">Bouaké</option>
            <option value="Yamoussoukro">Yamoussoukro</option>
            <option value="Abidjan">Abidjan</option>
          </select>
        </div>

        <div className="bg-[#f2f3ff] rounded-xl p-3 flex items-center justify-between border border-[#dae2fd]">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#131b2e]">{currentWeather.temp}</span>
              <span className="text-xs text-[#404940]">{currentWeather.condition}</span>
            </div>
            <p className="text-[11px] text-[#004c22] font-bold mt-1">
              Rayonnement : {currentWeather.solarIndex}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#ffddb8] flex items-center justify-center text-[#855300]">
            <span className="material-symbols-outlined text-[24px]">sunny</span>
          </div>
        </div>

        <p className="text-xs text-[#404940] mt-2 leading-snug">
          Conseil IA : {currentWeather.advice}
        </p>
      </section>

      {/* Main Switcher: Marché vs Galerie Photos */}
      <div className="flex bg-[#e2e7ff] p-1 rounded-2xl text-xs font-bold shadow-inner">
        <button
          type="button"
          onClick={() => setActiveTab('marche')}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'marche'
              ? 'bg-white text-[#004c22] shadow-sm'
              : 'text-[#404940] hover:text-[#004c22]'
          }`}
        >
          <span className="material-symbols-outlined text-[17px]">storefront</span>
          <span>Marché Vivrier ({marketItems.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('galerie')}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'galerie'
              ? 'bg-white text-[#004c22] shadow-sm'
              : 'text-[#404940] hover:text-[#004c22]'
          }`}
        >
          <span className="material-symbols-outlined text-[17px]">photo_library</span>
          <span>Galerie Photos ({galleryPhotos.length})</span>
        </button>
      </div>

      {/* UPLOAD ACTION BANNER (Highlighted Image Upload Feature) */}
      <section className="bg-gradient-to-r from-[#004c22] to-[#166534] text-white rounded-2xl p-4 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-bl-full pointer-events-none"></div>
        <div className="flex items-start justify-between relative z-10">
          <div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#a6f4b5] uppercase tracking-wider mb-1">
              <span className="material-symbols-outlined text-[14px]">add_a_photo</span>
              Import d'images depuis votre appareil
            </span>
            <h3 className="text-sm font-bold leading-tight">
              Ajoutez vos propres photos de récoltes
            </h3>
            <p className="text-xs text-white/80 mt-1 leading-snug">
              Sélectionnez des images depuis votre téléphone ou ordinateur pour les afficher aux côtés des autres produits.
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-3 relative z-10">
          <button
            type="button"
            onClick={() => {
              setUploadError(null);
              setIsPublishModalOpen(true);
            }}
            className="flex-1 py-2.5 px-3 bg-[#a6f4b5] hover:bg-[#8bd79b] text-[#00210b] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            <span>Publier une récolte avec photo</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setUploadError(null);
              setIsGalleryUploadOpen(true);
            }}
            className="py-2.5 px-3 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-transform"
            title="Importer directement dans la galerie"
          >
            <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
            <span>Ajouter photo</span>
          </button>
        </div>
      </section>

      {/* ===================== TAB 1: MARCHÉ VIVRIER ===================== */}
      {activeTab === 'marche' && (
        <>
          {/* Produce Category Selector */}
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#131b2e]">Offres des Récoltes Disponibles</h2>
              <span className="text-xs text-[#004c22] font-semibold">Circuit Court & Solaire</span>
            </div>

            <div className="flex bg-[#eaedff] p-1 rounded-xl gap-1 overflow-x-auto no-scrollbar">
              {[
                { id: 'tous', label: 'Tous' },
                { id: 'legumes', label: 'Légumes' },
                { id: 'cereales', label: 'Céréales' },
                { id: 'epices', label: 'Épices' },
                { id: 'fruits', label: 'Fruits' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`flex-1 min-w-[60px] py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeCategory === cat.id
                      ? 'bg-white text-[#004c22] shadow-xs'
                      : 'text-[#404940] hover:text-[#004c22]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </section>

          {/* Produce List with Images Displayed Side-by-Side */}
          <section className="flex flex-col gap-3">
            {filteredItems.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center border border-[#eaedff]">
                <span className="material-symbols-outlined text-[36px] text-[#707a6f]">search_off</span>
                <p className="text-xs font-semibold text-[#131b2e] mt-1">Aucune récolte dans cette catégorie</p>
                <button
                  type="button"
                  onClick={() => setIsPublishModalOpen(true)}
                  className="mt-3 px-4 py-2 bg-[#004c22] text-white text-xs font-bold rounded-xl"
                >
                  Soyez le premier à ajouter une photo !
                </button>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl p-3.5 shadow-sm border transition-all ${
                    item.isUserUploaded
                      ? 'border-[#004c22]/40 bg-gradient-to-r from-white via-white to-[#a6f4b5]/10'
                      : 'border-[#eaedff]'
                  } flex gap-3 items-center relative overflow-hidden`}
                >
                  {/* Clickable Image with Zoom indicator */}
                  <div
                    onClick={() =>
                      setLightboxState({
                        isOpen: true,
                        imageUrl: item.image,
                        title: item.name,
                        subtitle: `${item.spec} • ${item.producer}`,
                        tag: item.energyType
                      })
                    }
                    className="relative w-22 h-22 rounded-xl overflow-hidden shrink-0 border border-[#eaedff] group cursor-pointer bg-[#f2f3ff]"
                    title="Cliquez pour agrandir la photo"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <span className="material-symbols-outlined text-[20px]">zoom_in</span>
                    </div>

                    {item.isUserUploaded && (
                      <span className="absolute bottom-1 left-1 bg-[#004c22] text-white text-[9px] px-1 py-0.5 rounded font-bold">
                        Votre photo
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <div className="truncate">
                        <h3 className="text-xs font-bold text-[#131b2e] truncate">{item.name}</h3>
                        {item.isUserUploaded && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-[#004c22] font-bold">
                            <span className="material-symbols-outlined text-[12px]">verified</span>
                            Photo importée de l'appareil
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-[#855300] bg-[#ffddb8]/60 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                        {item.energyType}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#404940] mt-0.5">{item.spec}</p>
                    <p className="text-[10px] text-[#707a6f] truncate">{item.producer}</p>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#eaedff]">
                      <span className="text-xs font-extrabold text-[#004c22]">
                        {item.unitPrice.toLocaleString('fr-FR')} FCFA
                      </span>

                      <div className="flex items-center gap-1.5">
                        {item.isUserUploaded && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteItem(item.id, e)}
                            className="w-7 h-7 rounded-lg bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center hover:bg-[#ffb4ab] transition-colors"
                            title="Supprimer mon annonce"
                          >
                            <span className="material-symbols-outlined text-[15px]">delete</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            onAddToCart({
                              id: item.id,
                              name: item.name,
                              category: item.category,
                              spec: item.spec,
                              unitPrice: item.unitPrice,
                              image: item.image
                            });
                            onTriggerSmsNotification(`Ajouté au panier : ${item.name}`);
                          }}
                          className="px-3 py-1 bg-[#004c22] text-white rounded-lg text-xs font-bold flex items-center gap-1 active:scale-95 transition-transform hover:bg-[#166534]"
                        >
                          <span className="material-symbols-outlined text-[15px]">add_shopping_cart</span>
                          Commander
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>

          {/* Cart Quick Summary Floating Action */}
          <button
            onClick={() => onNavigate('paiement')}
            className="w-full h-12 bg-[#855300] text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:bg-[#653e00] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
            <span>Voir mon panier & Payer par Mobile Money (3% commission)</span>
          </button>
        </>
      )}

      {/* ===================== TAB 2: GALERIE PHOTOS ===================== */}
      {activeTab === 'galerie' && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#131b2e]">Galerie des Exploitations & Récoltes</h2>
              <p className="text-xs text-[#404940]">Vos clichés s'affichent aux côtés des fermes partenaires</p>
            </div>
            <button
              onClick={() => {
                setUploadError(null);
                setIsGalleryUploadOpen(true);
              }}
              className="px-2.5 py-1.5 bg-[#004c22] text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs hover:bg-[#166534]"
            >
              <span className="material-symbols-outlined text-[16px]">add_photo_alternate</span>
              <span>Ajouter</span>
            </button>
          </div>

          {/* Gallery Photo Grid */}
          <div className="grid grid-cols-2 gap-3">
            {galleryPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() =>
                  setLightboxState({
                    isOpen: true,
                    imageUrl: photo.image,
                    title: photo.title,
                    subtitle: `${photo.caption} • ${photo.author}`,
                    tag: photo.category
                  })
                }
                className="bg-white rounded-2xl overflow-hidden shadow-xs border border-[#eaedff] group cursor-pointer flex flex-col relative"
              >
                <div className="relative aspect-square w-full bg-[#f2f3ff] overflow-hidden">
                  <img
                    src={photo.image}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-[24px]">zoom_in</span>
                  </div>

                  {photo.isUserUploaded && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-[#004c22] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
                      <span className="material-symbols-outlined text-[11px]">person</span>
                      <span>Votre photo</span>
                    </div>
                  )}

                  {photo.isUserUploaded && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteGalleryPhoto(photo.id, e)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                      title="Supprimer"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  )}
                </div>

                <div className="p-2.5 flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-[#855300] uppercase tracking-wider">
                      {photo.category}
                    </span>
                    <span className="text-[9px] text-[#707a6f]">{photo.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-[#131b2e] truncate mt-0.5">{photo.title}</h4>
                  <p className="text-[10px] text-[#404940] line-clamp-1 mt-0.5">{photo.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===================== MODAL: PUBLISH HARVEST WITH IMAGE ===================== */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn overflow-y-auto">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-[#eaedff] my-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#004c22] text-[22px]">add_photo_alternate</span>
                <h3 className="text-sm font-bold text-[#131b2e]">Publier une Récolte</h3>
              </div>
              <button
                onClick={() => setIsPublishModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f2f3ff] text-[#404940] flex items-center justify-center hover:bg-[#eaedff]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handlePublishProduce} className="flex flex-col gap-3 mt-3">
              {uploadError && (
                <div className="p-2 rounded-xl bg-[#ffdad6] text-[#ba1a1a] text-xs font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Native File Input for Selecting Image From Device */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#131b2e] flex items-center justify-between">
                  <span>Photo de votre appareil</span>
                  <span className="text-[10px] font-normal text-[#707a6f]">JPG, PNG, WebP</span>
                </label>

                <input
                  ref={produceFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProduceFileChange}
                  className="hidden"
                />

                {uploadedImagePreview ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-[#004c22] bg-[#f2f3ff] p-2 flex items-center gap-3">
                    <img
                      src={uploadedImagePreview}
                      alt="Aperçu"
                      className="w-16 h-16 rounded-xl object-cover border border-[#eaedff]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#131b2e] truncate">{uploadFileName || 'Image sélectionnée'}</p>
                      <p className="text-[11px] text-[#004c22] font-semibold flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Prête à l'affichage
                      </p>
                      <button
                        type="button"
                        onClick={() => produceFileInputRef.current?.click()}
                        className="text-[10px] font-bold text-[#855300] hover:underline mt-1 block"
                      >
                        Changer la photo
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedImagePreview(null);
                        setUploadFileName('');
                      }}
                      className="w-7 h-7 rounded-full bg-white shadow-xs text-[#ba1a1a] flex items-center justify-center hover:bg-[#ffdad6]"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => produceFileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#004c22]/40 hover:border-[#004c22] bg-[#f2f3ff]/60 hover:bg-[#e2e7ff]/40 rounded-2xl p-4 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-1.5"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#004c22] text-white flex items-center justify-center shadow-xs">
                      <span className="material-symbols-outlined text-[20px]">file_upload</span>
                    </div>
                    <span className="text-xs font-bold text-[#004c22]">
                      Cliquez pour choisir une photo sur votre appareil
                    </span>
                    <span className="text-[10px] text-[#404940]">
                      Depuis votre galerie photo ou explorateur de fichiers
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info Fields */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#404940]">Nom de la récolte</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Gombos frais de Sinématiali"
                  value={produceName}
                  onChange={(e) => setProduceName(e.target.value)}
                  className="w-full bg-[#f2f3ff] rounded-xl px-3 py-2 text-xs text-[#131b2e] focus:outline-none border border-transparent focus:border-[#004c22]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#404940]">Catégorie</label>
                  <select
                    value={produceCategory}
                    onChange={(e) => setProduceCategory(e.target.value as any)}
                    className="w-full bg-[#f2f3ff] rounded-xl px-2.5 py-2 text-xs text-[#131b2e] focus:outline-none"
                  >
                    <option value="legumes">Légumes</option>
                    <option value="epices">Épices</option>
                    <option value="cereales">Céréales</option>
                    <option value="fruits">Fruits</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#404940]">Prix en FCFA</label>
                  <input
                    type="number"
                    required
                    placeholder="Ex: 12000"
                    value={producePrice}
                    onChange={(e) => setProducePrice(e.target.value)}
                    className="w-full bg-[#f2f3ff] rounded-xl px-3 py-2 text-xs text-[#131b2e] focus:outline-none border border-transparent focus:border-[#004c22]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#404940]">Conditionnement / Poids</label>
                <input
                  type="text"
                  placeholder="Ex: Caisse de 25 kg • Calibre standard"
                  value={produceSpec}
                  onChange={(e) => setProduceSpec(e.target.value)}
                  className="w-full bg-[#f2f3ff] rounded-xl px-3 py-2 text-xs text-[#131b2e] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#404940]">Producteur / Coop</label>
                  <input
                    type="text"
                    value={produceProducer}
                    onChange={(e) => setProduceProducer(e.target.value)}
                    className="w-full bg-[#f2f3ff] rounded-xl px-3 py-2 text-xs text-[#131b2e] focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#404940]">Énergie</label>
                  <select
                    value={produceEnergy}
                    onChange={(e) => setProduceEnergy(e.target.value)}
                    className="w-full bg-[#f2f3ff] rounded-xl px-2 py-2 text-xs text-[#131b2e] focus:outline-none"
                  >
                    <option value="100% Solaire">100% Solaire</option>
                    <option value="Irrigué Solaire">Irrigué Solaire</option>
                    <option value="Séchoir Solaire">Séchoir Solaire</option>
                    <option value="Circuit Court">Circuit Court</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPublishModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#f2f3ff] text-[#404940] text-xs font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#004c22] text-white text-xs font-bold shadow-md hover:bg-[#166534] transition-colors flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  Publier l'annonce
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: QUICK PHOTO IMPORT TO GALLERY ===================== */}
      {isGalleryUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-[#eaedff]">
            <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#855300] text-[22px]">add_a_photo</span>
                <h3 className="text-sm font-bold text-[#131b2e]">Ajouter une Photo à la Galerie</h3>
              </div>
              <button
                onClick={() => setIsGalleryUploadOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f2f3ff] text-[#404940] flex items-center justify-center hover:bg-[#eaedff]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handlePublishGalleryPhoto} className="flex flex-col gap-3 mt-3">
              <input
                ref={galleryFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleGalleryFileChange}
                className="hidden"
              />

              {galleryImagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-[#855300] aspect-video bg-black flex items-center justify-center">
                  <img
                    src={galleryImagePreview}
                    alt="Aperçu Galerie"
                    className="max-h-full max-w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => galleryFileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white rounded-lg text-[10px] font-bold"
                  >
                    Changer
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => galleryFileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#855300]/40 hover:border-[#855300] bg-[#ffddb8]/20 rounded-2xl p-5 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[28px] text-[#855300]">cloud_upload</span>
                  <span className="text-xs font-bold text-[#855300]">
                    Sélectionner une photo sur votre appareil
                  </span>
                  <span className="text-[10px] text-[#404940]">
                    Photos de votre champ, pompe solaire ou récolte
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#404940]">Titre de la photo</label>
                <input
                  type="text"
                  placeholder="Ex: Mes panneaux solaires à l'aube"
                  value={galleryTitle}
                  onChange={(e) => setGalleryTitle(e.target.value)}
                  className="w-full bg-[#f2f3ff] rounded-xl px-3 py-2 text-xs text-[#131b2e] focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#404940]">Description / Légende</label>
                <input
                  type="text"
                  placeholder="Ex: Parcelle irriguée par pompe 14.2 m3/h"
                  value={galleryCaption}
                  onChange={(e) => setGalleryCaption(e.target.value)}
                  className="w-full bg-[#f2f3ff] rounded-xl px-3 py-2 text-xs text-[#131b2e] focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#404940]">Catégorie</label>
                <select
                  value={galleryCategory}
                  onChange={(e) => setGalleryCategory(e.target.value)}
                  className="w-full bg-[#f2f3ff] rounded-xl px-2.5 py-2 text-xs text-[#131b2e] focus:outline-none"
                >
                  <option value="Installation Solaire">Installation Solaire</option>
                  <option value="Ma Récolte">Ma Récolte</option>
                  <option value="Capteurs & IoT">Capteurs & IoT</option>
                  <option value="Terrain Agricole">Terrain Agricole</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGalleryUploadOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#f2f3ff] text-[#404940] text-xs font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#855300] text-white text-xs font-bold shadow-md hover:bg-[#653e00] transition-colors"
                >
                  Afficher dans la galerie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== FULLSCREEN LIGHTBOX MODAL ===================== */}
      <ImageLightboxModal
        isOpen={lightboxState.isOpen}
        onClose={() => setLightboxState((prev) => ({ ...prev, isOpen: false }))}
        imageUrl={lightboxState.imageUrl}
        title={lightboxState.title}
        subtitle={lightboxState.subtitle}
        tag={lightboxState.tag}
      />
    </div>
  );
};
