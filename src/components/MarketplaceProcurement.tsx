'use client';

import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  CreditCard,
  Building,
  ShieldCheck,
  Truck,
  ArrowRight,
  Filter,
  Search,
  Tag,
  Package,
  Wrench,
  Radio,
  Cpu,
  Layers,
  FileText,
  DollarSign,
  AlertCircle,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { ComponentSpec } from '../types/space';

export interface MarketProduct {
  id: string;
  title: string;
  partNumber: string;
  category: 'ACCESSORY' | 'KIT' | 'SUBSYSTEM' | 'GROUND_LAB';
  condition: 'FLIGHT_MODEL' | 'ENGINEERING_MODEL' | 'LAB_GRADE' | 'FLIGHT_SPARE';
  sellerName: string;
  sellerRating: number;
  sellerCountry: string;
  priceUsd: number;
  stockCount: number;
  leadTime: string;
  description: string;
  keySpecs: string[];
  isNewListing?: boolean;
}

const DEFAULT_MARKET_PRODUCTS: MarketProduct[] = [
  // 1. Necessary Flight Accessories & Wiring
  {
    id: 'prod-coax-cable-kit',
    title: 'Space-Grade RG-316 SMA RF Coaxial Harness (Set of 4)',
    partNumber: 'ACC-RF-RG316-SMA',
    category: 'ACCESSORY',
    condition: 'FLIGHT_MODEL',
    sellerName: 'Amphenol Aerospace Interconnect',
    sellerRating: 4.9,
    sellerCountry: 'USA',
    priceUsd: 480,
    stockCount: 24,
    leadTime: 'Immediate Dispatch',
    description: 'Radiation-cured PTFE low-loss coaxial cabling rated to 18 GHz with gold-plated SMA male connectors. Outgassing ASTM E595 compliant for vacuum deployment.',
    keySpecs: ['Frequency: DC - 18 GHz', 'Impedance: 50 Ohm', 'Loss: <0.28 dB/m @ 2.4 GHz', 'Length: 250 mm'],
  },
  {
    id: 'prod-pc104-header-stack',
    title: 'CubeSat PC104 104-Pin Gold Stacking Header Kit',
    partNumber: 'ACC-PC104-104P-AU',
    category: 'ACCESSORY',
    condition: 'FLIGHT_MODEL',
    sellerName: 'Samtec Aerospace Division',
    sellerRating: 5.0,
    sellerCountry: 'Germany',
    priceUsd: 220,
    stockCount: 45,
    leadTime: 'Immediate Dispatch',
    description: 'High-reliability PC104 bus interconnect headers with 30 micro-inch gold contact plating. Conforms to standard ISIS and CalPoly CubeSat electrical bus layouts.',
    keySpecs: ['104-pin stackable header', 'Operating Temp: -55°C to +125°C', 'Current: 3A per pin', 'Vibration: 20 Grms'],
  },
  {
    id: 'prod-micro-d-harness',
    title: 'Micro-D 21-Pin Spacecraft Power & Telemetry Harness',
    partNumber: 'ACC-MD-21P-FLIGHT',
    category: 'ACCESSORY',
    condition: 'FLIGHT_MODEL',
    sellerName: 'Glenair Space Solutions',
    sellerRating: 4.8,
    sellerCountry: 'UK',
    priceUsd: 650,
    stockCount: 16,
    leadTime: 'In Stock',
    description: 'Ruggedized subminiature twist-pin connector with space-qualified Kapton insulated flight wire leads. Shielded braided nickel overwrap against electromagnetic interference (EMI).',
    keySpecs: ['Connector: MIL-DTL-83513', 'Contacts: 21 Pins Twist-Pin', 'Shielding: 92% Optical Coverage', 'Wire: AWG 26 Silver Plated'],
  },
  {
    id: 'prod-thermal-strap',
    title: 'Pyrolytic Graphite Flexible Thermal Heat Strap (3U)',
    partNumber: 'ACC-THM-PGS-3U',
    category: 'ACCESSORY',
    condition: 'FLIGHT_MODEL',
    sellerName: 'ThermaSpace Systems',
    sellerRating: 4.9,
    sellerCountry: 'France',
    priceUsd: 890,
    stockCount: 12,
    leadTime: 'In Stock',
    description: 'Ultra-flexible thermal conductor for routing heat from RF amplifiers and OBC processors directly to the outer aluminum chassis walls. Negligible mechanical load on delicate boards.',
    keySpecs: ['Conductivity: 1600 W/mK', 'Mass: 18 grams', 'Deflection: 3-Axis Multi-Flex', 'Thermal Range: -100°C to +150°C'],
  },
  {
    id: 'prod-deploy-switch-kit',
    title: 'CubeSat Separation Plunger Switch & RBF Pin Kit',
    partNumber: 'ACC-SEP-SW-RBF',
    category: 'ACCESSORY',
    condition: 'FLIGHT_MODEL',
    sellerName: 'NanoAvionics Components',
    sellerRating: 4.9,
    sellerCountry: 'Lithuania',
    priceUsd: 740,
    stockCount: 19,
    leadTime: 'Immediate Dispatch',
    description: 'Dual-redundant mechanical kill switches mounted on dispenser chassis rails. Keeps satellite unpowered during launch vibration until spring ejection clears dispenser canister.',
    keySpecs: ['Dual Normally-Closed Switches', 'Machined Remove-Before-Flight Pin', 'Gold-plated contacts', 'Meets Exolaunch / ISIS dispenser specs'],
  },

  // 2. Complete Technology & CubeSat Kits
  {
    id: 'prod-kit-cubesat-1u',
    title: '1U CubeSat Flight Platform Rapid Integration Kit',
    partNumber: 'KIT-CS-1U-COMPLETE',
    category: 'KIT',
    condition: 'FLIGHT_MODEL',
    sellerName: 'Orbital Dynamics Lab',
    sellerRating: 4.9,
    sellerCountry: 'Netherlands',
    priceUsd: 14500,
    stockCount: 4,
    leadTime: 'Ready to Ship',
    description: 'Turnkey 1U satellite bus kit including aluminum 7075 chassis skeleton, EPS power distribution board with solar panel inputs, 3.3V/5V rails, and basic microcontroller avionics.',
    keySpecs: ['Chassis: 100 x 100 x 113.5 mm', 'Mass: 420g bus core', 'Includes: EPS + Battery Stack + Skeleton', 'Flight heritage: 18 Missions'],
  },
  {
    id: 'prod-kit-starter-3u',
    title: '3U Educational & Technology Demonstration Satellite Kit',
    partNumber: 'KIT-CS-3U-EDU-TECH',
    category: 'KIT',
    condition: 'ENGINEERING_MODEL',
    sellerName: 'Aerospace Academy Hardware',
    sellerRating: 4.7,
    sellerCountry: 'Germany',
    priceUsd: 22000,
    stockCount: 3,
    leadTime: 'In Stock',
    description: 'Designed for universities and aerospace laboratories. Full 3U form factor with non-destructive flight-like components, ground test telemetry software, and deployable solar panel mockups.',
    keySpecs: ['Form Factor: 3U (300 x 100 x 100 mm)', 'Includes USB-C FlatSat bench interface', 'Telemetry software included', 'Full schematic documentation'],
  },

  // 3. Subsystem Tech
  {
    id: 'prod-adcs-reaction-wheel',
    title: 'Miniature 3-Axis CubeSat Reaction Wheel Core (20 mNms)',
    partNumber: 'SYS-ADCS-RW-20M',
    category: 'SUBSYSTEM',
    condition: 'FLIGHT_MODEL',
    sellerName: 'Precision Pointing Systems',
    sellerRating: 4.8,
    sellerCountry: 'Sweden',
    priceUsd: 38000,
    stockCount: 5,
    leadTime: 'In Stock',
    description: 'Brushless low-jitter DC momentum wheels mounted in orthogonal configuration with integrated DSP speed controller and internal temperature compensation.',
    keySpecs: ['Momentum Storage: 20 mN-m-s', 'Max Torque: 2.5 mN-m', 'Power: 1.2W nominal', 'Bus: CAN / I2C'],
  },
  {
    id: 'prod-solar-panel-3u',
    title: '3U Body-Mounted Triple-Junction Solar Panel Assembly',
    partNumber: 'SYS-PWR-3U-SOLAR',
    category: 'SUBSYSTEM',
    condition: 'FLIGHT_MODEL',
    sellerName: 'Azur Space Photovoltaics',
    sellerRating: 5.0,
    sellerCountry: 'Germany',
    priceUsd: 5900,
    stockCount: 8,
    leadTime: 'Immediate Dispatch',
    description: 'High-efficiency 30% GaAs triple-junction cells mounted on PCB substrate with integrated bypass diodes, coarse photodiode sun sensors, and PT1000 temperature sensor.',
    keySpecs: ['Output: 14.8W @ AM0', 'Efficiency: 30.2%', 'Sensors: Embedded Sun Sensor', 'Thickness: 1.6 mm'],
  },

  // 4. Ground & Lab Accessories
  {
    id: 'prod-ground-sdr-telemetry',
    title: 'Automated Satellite Downlink SDR Telemetry Ground Receiver',
    partNumber: 'LAB-SDR-SAT-RECV',
    category: 'GROUND_LAB',
    condition: 'LAB_GRADE',
    sellerName: 'OrbitRF Communications',
    sellerRating: 4.9,
    sellerCountry: 'Canada',
    priceUsd: 1450,
    stockCount: 15,
    leadTime: 'In Stock',
    description: 'Precision software-defined radio receiver optimized for VHF, UHF, and S-band CubeSat telemetry packet capture. Includes ultra-low noise amplifier (LNA) and bandpass filters.',
    keySpecs: ['Frequency: 70 MHz - 6 GHz', 'Noise Figure: <0.7 dB', 'Interface: USB 3.0 / Gigabit Ethernet', 'Pre-configured for GNU Radio & CCSDS'],
  },
  {
    id: 'prod-cleanroom-esd-kit',
    title: 'Aerospace Cleanroom ISO 5 Assembly & ESD Torque Toolset',
    partNumber: 'LAB-ESD-TORQUE-AERO',
    category: 'GROUND_LAB',
    condition: 'LAB_GRADE',
    sellerName: 'Staubli Aerospace Tools',
    sellerRating: 4.8,
    sellerCountry: 'Switzerland',
    priceUsd: 980,
    stockCount: 10,
    leadTime: 'Immediate Dispatch',
    description: 'Calibrated micro-torque drivers (0.05 Nm to 1.5 Nm) for titanium and space-grade stainless fasteners, non-magnetic tweezers, and certified dissipative grounding cords.',
    keySpecs: ['Torque Calibration: ISO 6789 Certified', 'ESD Safe: 10^6 - 10^9 Ohms', 'Titanium non-galling driver bits', 'Vacuum-compatible lubrication'],
  },
];

interface MarketplaceProcurementProps {
  rfqItems: ComponentSpec[];
  onRemoveFromRFQ: (id: string) => void;
  onClearRFQ: () => void;
}

export default function MarketplaceProcurement({
  rfqItems,
  onRemoveFromRFQ,
  onClearRFQ,
}: MarketplaceProcurementProps) {
  const [activeTab, setActiveTab] = useState<'BUY' | 'SELL' | 'CART'>('BUY');
  const [products, setProducts] = useState<MarketProduct[]>(DEFAULT_MARKET_PRODUCTS);
  const [cart, setCart] = useState<{ product: MarketProduct; quantity: number }[]>([
    { product: DEFAULT_MARKET_PRODUCTS[0], quantity: 2 }, // Coaxial Cable kit
    { product: DEFAULT_MARKET_PRODUCTS[2], quantity: 1 }, // Micro-D harness
  ]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Seller Listing Form State
  const [newTitle, setNewTitle] = useState('');
  const [newPartNumber, setNewPartNumber] = useState('');
  const [newCategory, setNewCategory] = useState<'ACCESSORY' | 'KIT' | 'SUBSYSTEM' | 'GROUND_LAB'>('ACCESSORY');
  const [newCondition, setNewCondition] = useState<'FLIGHT_MODEL' | 'ENGINEERING_MODEL' | 'LAB_GRADE' | 'FLIGHT_SPARE'>('FLIGHT_MODEL');
  const [newPrice, setNewPrice] = useState<number>(1200);
  const [newStock, setNewStock] = useState<number>(5);
  const [newSeller, setNewSeller] = useState('Apex Orbital Devices');
  const [newCountry, setNewCountry] = useState('Cambodia');
  const [newDescription, setNewDescription] = useState('');
  const [listingSuccess, setListingSuccess] = useState(false);

  // Checkout / Order State
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [buyerName, setBuyerName] = useState('Dr. Alex Chen');
  const [buyerOrg, setBuyerOrg] = useState('NewSpace AstroTech Laboratory');
  const [buyerEmail, setBuyerEmail] = useState('procurement@astrotech-space.org');
  const [shippingAddress, setShippingAddress] = useState('Cleanroom Complex B, Technology Science Park');
  const [paymentMethod, setPaymentMethod] = useState<'ESCROW' | 'WIRE' | 'CREDIT_CARD'>('ESCROW');
  const [orderReceipt, setOrderReceipt] = useState<{
    orderId: string;
    totalAmount: number;
    date: string;
    items: { title: string; qty: number; price: number }[];
  } | null>(null);

  // Cart operations
  const addToCart = (product: MarketProduct) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === id) {
            const newQty = Math.max(1, item.quantity + delta);
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== id));
  };

  const cartTotalUsd = cart.reduce((sum, item) => sum + item.product.priceUsd * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Filter products
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'ALL' && p.category !== selectedCategory) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchPart = p.partNumber.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchSeller = p.sellerName.toLowerCase().includes(q);
      if (!matchTitle && !matchPart && !matchDesc && !matchSeller) return false;
    }
    return true;
  });

  // Handle Publish New Item to Sell
  const handlePublishListing = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: MarketProduct = {
      id: `prod-user-${Date.now()}`,
      title: newTitle || 'Custom Aerospace Accessory',
      partNumber: newPartNumber || `ACC-${Math.floor(1000 + Math.random() * 9000)}`,
      category: newCategory,
      condition: newCondition,
      sellerName: newSeller,
      sellerRating: 5.0,
      sellerCountry: newCountry,
      priceUsd: newPrice,
      stockCount: newStock,
      leadTime: 'Immediate Dispatch',
      description: newDescription || 'Standard aerospace certified flight hardware / accessory ready for integration.',
      keySpecs: ['Quality Certified: AS9100D', 'Cleanroom sealed packaging', 'Flight Readiness Verified'],
      isNewListing: true,
    };

    setProducts((prev) => [newProduct, ...prev]);
    setListingSuccess(true);
    setTimeout(() => {
      setListingSuccess(false);
      setActiveTab('BUY');
    }, 1500);
  };

  // Handle Complete Order / Purchase
  const handleCompleteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const receipt = {
      orderId: `SPX-ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      totalAmount: cartTotalUsd + 350, // including insured aerospace freight
      date: new Date().toISOString().substring(0, 10),
      items: cart.map((i) => ({
        title: i.product.title,
        qty: i.quantity,
        price: i.product.priceUsd * i.quantity,
      })),
    };

    setOrderReceipt(receipt);
    setCart([]);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Tabs */}
      <div className="hud-panel p-5 rounded-lg border border-space-700/80 bg-space-900/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-aeroblue" />
              <h2 className="text-xl font-bold tracking-tight text-white uppercase font-mono">
                SPACETECH COMMERCE: BUY & SELL HARDWARE & ACCESSORIES
              </h2>
            </div>
            <p className="text-xs text-space-300 mt-1 max-w-2xl">
              Buy space-qualified components, CubeSat kits, and flight accessories directly, or list your own aerospace
              technology and ground equipment for sale with guaranteed milestone escrow.
            </p>
          </div>

          {/* Action Tabs: BUY, SELL, CART */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={() => setActiveTab('BUY')}
              className={`px-4 py-2 rounded transition-all flex items-center gap-2 ${
                activeTab === 'BUY'
                  ? 'bg-aeroblue text-space-950 font-bold shadow-md shadow-aeroblue/20'
                  : 'bg-space-950 text-space-300 hover:text-white border border-space-800'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>BROWSE & BUY</span>
            </button>

            <button
              onClick={() => setActiveTab('SELL')}
              className={`px-4 py-2 rounded transition-all flex items-center gap-2 ${
                activeTab === 'SELL'
                  ? 'bg-aerogreen text-space-950 font-bold shadow-md shadow-aerogreen/20'
                  : 'bg-space-950 text-space-300 hover:text-white border border-space-800'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>SELL TECHNOLOGY</span>
            </button>

            <button
              onClick={() => setActiveTab('CART')}
              className={`px-4 py-2 rounded transition-all flex items-center gap-2 ${
                activeTab === 'CART'
                  ? 'bg-space-800 text-aeroblue-light border border-aeroblue font-bold'
                  : 'bg-space-950 text-space-300 hover:text-white border border-space-800'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>SHOPPING CART ({cartItemCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: BROWSE & BUY STOREFRONT */}
      {activeTab === 'BUY' && (
        <div className="space-y-6">
          {/* Filter & Search Bar */}
          <div className="hud-panel p-4 rounded-lg border border-space-700/80 bg-space-900/60 font-mono text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-space-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search accessories, wiring, RF cables, kits, sensors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-space-950 border border-space-700 rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-space-500 focus:outline-none focus:border-aeroblue"
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { key: 'ALL', label: 'All Items' },
                { key: 'ACCESSORY', label: 'Accessories & Wiring' },
                { key: 'KIT', label: 'CubeSat Kits' },
                { key: 'SUBSYSTEM', label: 'Subsystems' },
                { key: 'GROUND_LAB', label: 'Lab & Ground SDR' },
              ].map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    selectedCategory === cat.key
                      ? 'bg-space-800 text-aeroblue-light border border-aeroblue font-semibold'
                      : 'bg-space-950 text-space-400 hover:text-white border border-space-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((product) => {
              const inCart = cart.some((i) => i.product.id === product.id);

              return (
                <div
                  key={product.id}
                  className="hud-panel rounded-lg border border-space-700/80 bg-space-900/60 hover:border-space-500 transition-all flex flex-col justify-between overflow-hidden group"
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-space-800 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-space-800 text-aeroblue-light border border-space-700">
                        {product.category.replace('_', ' ')}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {product.isNewListing && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-aerogreen/20 text-aerogreen border border-aerogreen/40 font-bold animate-pulse">
                            NEW LISTING
                          </span>
                        )}
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-space-800 text-white font-semibold border border-space-700">
                          {product.condition.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-aeroblue-light transition-colors line-clamp-2">
                      {product.title}
                    </h3>

                    <div className="flex items-center justify-between text-[11px] font-mono text-space-400">
                      <span>Part: {product.partNumber}</span>
                      <span>
                        Seller: {product.sellerName} ({product.sellerCountry})
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3 flex-1 font-mono text-xs">
                    <p className="text-space-300 text-[11px] line-clamp-3 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Technical Specs Tags */}
                    <div className="bg-space-950 p-2.5 rounded border border-space-850 space-y-1">
                      <span className="text-[10px] text-space-500 block uppercase font-bold">KEY METRICS</span>
                      <div className="grid grid-cols-2 gap-1 text-[10px] text-space-300">
                        {product.keySpecs.slice(0, 4).map((spec, i) => (
                          <div key={i} className="truncate">
                            &bull; {spec}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-space-400">Stock Availability:</span>
                      <span className="text-aerogreen font-semibold">{product.stockCount} Units ({product.leadTime})</span>
                    </div>
                  </div>

                  {/* Card Footer: Price & Buy Buttons */}
                  <div className="p-4 border-t border-space-800 bg-space-950/70 flex items-center justify-between gap-3 font-mono">
                    <div>
                      <span className="text-[10px] text-space-500 block">DIRECT PRICE</span>
                      <span className="text-base font-bold text-white">
                        ${product.priceUsd.toLocaleString()} USD
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          addToCart(product);
                          setActiveTab('CART');
                        }}
                        className="px-3 py-1.5 rounded bg-aeroblue hover:bg-aeroblue-light text-space-950 font-bold text-xs transition-colors shadow-sm"
                      >
                        BUY NOW
                      </button>

                      <button
                        onClick={() => addToCart(product)}
                        className={`p-1.5 rounded border transition-colors ${
                          inCart
                            ? 'bg-aerogreen/20 border-aerogreen text-aerogreen'
                            : 'bg-space-850 border-space-700 text-space-300 hover:text-white hover:border-space-500'
                        }`}
                        title="Add to Shopping Cart"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: SELL TECHNOLOGY & ACCESSORIES (SELLER SUBMISSION FORM) */}
      {activeTab === 'SELL' && (
        <div className="max-w-3xl mx-auto hud-panel p-6 rounded-lg border border-space-700/80 bg-space-900/80 font-mono text-xs space-y-5">
          <div className="border-b border-space-800 pb-3">
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-aerogreen" />
              <h3 className="text-base font-bold uppercase tracking-tight text-white">
                LIST YOUR SPACE TECHNOLOGY OR ACCESSORY FOR SALE
              </h3>
            </div>
            <p className="text-xs text-space-300 mt-1">
              Monetize your flight-heritage hardware, surplus RF components, ground test gear, or CubeSat kits directly
              to global satellite teams.
            </p>
          </div>

          {listingSuccess ? (
            <div className="p-6 rounded bg-aerogreen/15 border border-aerogreen/40 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-aerogreen mx-auto" />
              <div className="text-white font-bold text-sm">HARDWARE LISTED ON MARKETPLACE!</div>
              <p className="text-space-300 text-xs">
                Your technology item is now live and available for purchase in the Storefront.
              </p>
            </div>
          ) : (
            <form onSubmit={handlePublishListing} className="space-y-4">
              <div>
                <label className="block text-space-400 text-[11px] mb-1">
                  HARDWARE OR ACCESSORY TITLE *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Space-Grade UHF Deployable Dipole Antenna Assembly"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-space-950 border border-space-700 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-aeroblue"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-space-400 text-[11px] mb-1">PART / MODEL CODE *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ANT-UHF-DIP-01"
                    value={newPartNumber}
                    onChange={(e) => setNewPartNumber(e.target.value)}
                    className="w-full bg-space-950 border border-space-700 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-aeroblue"
                  />
                </div>

                <div>
                  <label className="block text-space-400 text-[11px] mb-1">CATEGORY *</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full bg-space-950 border border-space-700 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-aeroblue"
                  >
                    <option value="ACCESSORY">Flight Accessory, Wiring & Cables</option>
                    <option value="KIT">CubeSat Satellite Kit</option>
                    <option value="SUBSYSTEM">Subsystem Hardware</option>
                    <option value="GROUND_LAB">Ground Station & Lab Test Gear</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-space-400 text-[11px] mb-1">HARDWARE CONDITION *</label>
                  <select
                    value={newCondition}
                    onChange={(e: any) => setNewCondition(e.target.value)}
                    className="w-full bg-space-950 border border-space-700 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-aeroblue"
                  >
                    <option value="FLIGHT_MODEL">Flight Model (FM) - Vacuum Ready</option>
                    <option value="ENGINEERING_MODEL">Engineering Model (EM)</option>
                    <option value="FLIGHT_SPARE">Flight Spare (Surplus)</option>
                    <option value="LAB_GRADE">Lab / Ground Test Grade</option>
                  </select>
                </div>

                <div>
                  <label className="block text-space-400 text-[11px] mb-1">SALE PRICE (USD) *</label>
                  <input
                    type="number"
                    required
                    min="10"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full bg-space-950 border border-space-700 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-aeroblue"
                  />
                </div>

                <div>
                  <label className="block text-space-400 text-[11px] mb-1">STOCK QUANTITY *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full bg-space-950 border border-space-700 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-aeroblue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-space-400 text-[11px] mb-1">YOUR ORGANIZATION / SELLER BRAND</label>
                  <input
                    type="text"
                    required
                    value={newSeller}
                    onChange={(e) => setNewSeller(e.target.value)}
                    className="w-full bg-space-950 border border-space-700 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-aeroblue"
                  />
                </div>

                <div>
                  <label className="block text-space-400 text-[11px] mb-1">COUNTRY OF SHIPMENT</label>
                  <input
                    type="text"
                    required
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                    className="w-full bg-space-950 border border-space-700 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-aeroblue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-space-400 text-[11px] mb-1">
                  TECHNICAL DESCRIPTION & SPECIFICATIONS *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detail outgassing compliance, vacuum ratings, mass, voltage, pinouts, and test certificates included..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-space-950 border border-space-700 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-aeroblue"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded bg-aerogreen hover:bg-aerogreen-light text-space-950 font-bold uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-aerogreen/15 text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>PUBLISH & LIST ITEM IN LIVE STORE</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* VIEW 3: SHOPPING CART & INSTANT CHECKOUT */}
      {activeTab === 'CART' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs">
          {/* Cart Items List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="hud-panel rounded-lg border border-space-700/80 overflow-hidden">
              <div className="p-4 bg-space-900/90 border-b border-space-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-white">
                    PURCHASE CART HARDWARE
                  </h3>
                  <span className="text-xs text-space-400 font-mono">({cartItemCount} Items)</span>
                </div>

                {cart.length > 0 && (
                  <button
                    onClick={() => setCart([])}
                    className="text-xs text-space-400 hover:text-aerored transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="p-12 text-center text-space-400 space-y-3">
                  <ShoppingBag className="w-8 h-8 text-space-600 mx-auto" />
                  <p>Your shopping cart is currently empty.</p>
                  <button
                    onClick={() => setActiveTab('BUY')}
                    className="px-4 py-2 bg-space-800 hover:bg-space-700 text-aeroblue rounded text-xs transition-colors"
                  >
                    Browse Space Accessories & Kits
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-space-800">
                  {cart.map(({ product, quantity }) => (
                    <div key={product.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.2 rounded bg-space-800 text-aeroblue border border-space-700">
                            {product.category}
                          </span>
                          <span className="text-[10px] text-space-400">{product.sellerName}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-white mt-1">{product.title}</h4>
                        <div className="text-[10px] text-space-400 mt-0.5">Part: {product.partNumber}</div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-5">
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-space-700 rounded bg-space-950">
                          <button
                            onClick={() => updateCartQuantity(product.id, -1)}
                            className="p-1.5 text-space-400 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-white font-bold">{quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(product.id, 1)}
                            className="p-1.5 text-space-400 hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right min-w-[80px]">
                          <div className="text-sm font-bold text-white">
                            ${(product.priceUsd * quantity).toLocaleString()}
                          </div>
                          <div className="text-[10px] text-space-500">
                            ${product.priceUsd.toLocaleString()} / ea
                          </div>
                        </div>

                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="p-1.5 text-space-400 hover:text-aerored"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Escrow Guarantee Info Card */}
            <div className="hud-panel p-4 rounded-lg border border-space-700/80 bg-space-900/60 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-aerogreen flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-white font-semibold">Aerospace Buyer & Seller Protection</div>
                <p className="text-space-300 text-[11px] leading-relaxed">
                  Every order includes Certificate of Conformance (CoC), material lot tracking, and optional milestone
                  funds escrow. Payments are only settled once vacuum inspection criteria are validated.
                </p>
              </div>
            </div>
          </div>

          {/* Checkout Order Summary Form (5 cols) */}
          <div className="lg:col-span-5">
            <div className="hud-panel p-5 rounded-lg border border-space-700/80 bg-space-900/80 space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-aeroblue" />
                <h3 className="text-xs font-bold uppercase tracking-wide text-white">
                  CHECKOUT & ORDER EXECUTION
                </h3>
              </div>

              {orderReceipt ? (
                <div className="p-5 rounded bg-aerogreen/15 border border-aerogreen/40 space-y-3">
                  <div className="flex items-center gap-2 text-aerogreen font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>PURCHASE ORDER CONFIRMED</span>
                  </div>
                  <div className="text-space-300 text-xs space-y-1 border-y border-space-800 py-2">
                    <div>PO Tracking: <strong className="text-white">{orderReceipt.orderId}</strong></div>
                    <div>Order Date: <strong className="text-white">{orderReceipt.date}</strong></div>
                    <div>Total Settled: <strong className="text-white">${orderReceipt.totalAmount.toLocaleString()} USD</strong></div>
                  </div>
                  <div className="text-[10px] text-space-400">
                    Cleanroom dispatch package prepared. Automated tracking telemetry sent to {buyerEmail}.
                  </div>
                  <button
                    onClick={() => setOrderReceipt(null)}
                    className="w-full py-2 bg-space-800 hover:bg-space-700 text-white rounded text-xs transition-colors"
                  >
                    Place Another Order
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCompleteOrder} className="space-y-3">
                  <div>
                    <label className="block text-space-400 text-[10px] mb-1">BUYER / REQUISITIONER NAME</label>
                    <input
                      type="text"
                      required
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full bg-space-950 border border-space-700 rounded px-3 py-1.5 text-white focus:outline-none focus:border-aeroblue"
                    />
                  </div>

                  <div>
                    <label className="block text-space-400 text-[10px] mb-1">LABORATORY / AEROSPACE ORG</label>
                    <input
                      type="text"
                      required
                      value={buyerOrg}
                      onChange={(e) => setBuyerOrg(e.target.value)}
                      className="w-full bg-space-950 border border-space-700 rounded px-3 py-1.5 text-white focus:outline-none focus:border-aeroblue"
                    />
                  </div>

                  <div>
                    <label className="block text-space-400 text-[10px] mb-1">PROCUREMENT EMAIL</label>
                    <input
                      type="email"
                      required
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      className="w-full bg-space-950 border border-space-700 rounded px-3 py-1.5 text-white focus:outline-none focus:border-aeroblue"
                    />
                  </div>

                  <div>
                    <label className="block text-space-400 text-[10px] mb-1">CLEANROOM DELIVERY ADDRESS</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full bg-space-950 border border-space-700 rounded px-3 py-1.5 text-white focus:outline-none focus:border-aeroblue"
                    />
                  </div>

                  <div>
                    <label className="block text-space-400 text-[10px] mb-1">PAYMENT & SETTLEMENT PROTOCOL</label>
                    <select
                      value={paymentMethod}
                      onChange={(e: any) => setPaymentMethod(e.target.value)}
                      className="w-full bg-space-950 border border-space-700 rounded px-3 py-1.5 text-white focus:outline-none focus:border-aeroblue"
                    >
                      <option value="ESCROW">Milestone Escrow (AS9100 Verified)</option>
                      <option value="WIRE">Direct Corporate Bank Wire (SWIFT / Fedwire)</option>
                      <option value="CREDIT_CARD">Corporate Procurement Card (Instant Charge)</option>
                    </select>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="pt-2 border-t border-space-800 space-y-1.5">
                    <div className="flex justify-between text-space-400">
                      <span>Hardware Subtotal:</span>
                      <span className="text-white">${cartTotalUsd.toLocaleString()} USD</span>
                    </div>
                    <div className="flex justify-between text-space-400">
                      <span>Insured Cleanroom Courier:</span>
                      <span className="text-white">$350 USD</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-space-850">
                      <span className="text-aeroblue-light">TOTAL PURCHASE:</span>
                      <span>${(cartTotalUsd + 350).toLocaleString()} USD</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={cart.length === 0}
                    className="w-full py-3 rounded bg-aeroblue hover:bg-aeroblue-light text-space-950 font-bold uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-aeroblue/15 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>CONFIRM & EXECUTE PURCHASE ORDER</span>
                  </button>

                  <div className="text-[10px] text-space-500 text-center">
                    Compliant with bilateral aerospace procurement NDAs and ITAR export rules.
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
