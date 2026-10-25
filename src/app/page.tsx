'use client';

import React, { useState } from 'react';
import NavigationHeader, { ActiveTab } from '../components/NavigationHeader';
import OrbitalExplorer3D from '../components/OrbitalExplorer3D';
import MissionArchitect from '../components/MissionArchitect';
import ComponentCatalog from '../components/ComponentCatalog';
import MarketplaceProcurement from '../components/MarketplaceProcurement';
import LaunchRideshareBrokering from '../components/LaunchRideshareBrokering';
import GroundStationNetwork from '../components/GroundStationNetwork';
import ComponentComparator from '../components/ComponentComparator';
import SupplierStudio from '../components/SupplierStudio';
import { ComponentSpec, SubsystemCategory } from '../types/space';
import { SPACE_COMPONENTS } from '../data/spaceComponents';
import { ShieldCheck, Satellite, Terminal, ExternalLink } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('explorer');
  const [itarFreeOnly, setItarFreeOnly] = useState<boolean>(false);
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState<SubsystemCategory | null>(null);

  // Default active BOM for a high-performance 6U Earth Observation Mission
  const [currentBOM, setCurrentBOM] = useState<ComponentSpec[]>([
    SPACE_COMPONENTS.find((c) => c.id === 'struct-nanoavionics-6u')!,
    SPACE_COMPONENTS.find((c) => c.id === 'adcs-bct-xact50')!,
    SPACE_COMPONENTS.find((c) => c.id === 'eps-spectrolab-xtj6u')!,
    SPACE_COMPONENTS.find((c) => c.id === 'eps-gomspace-p31u')!,
    SPACE_COMPONENTS.find((c) => c.id === 'obc-aac-sirius')!,
    SPACE_COMPONENTS.find((c) => c.id === 'rf-endurosat-sband')!,
    SPACE_COMPONENTS.find((c) => c.id === 'payload-simera-xscape100')!,
    SPACE_COMPONENTS.find((c) => c.id === 'prop-enpulsion-micro-r3')!,
  ].filter(Boolean));

  // RFQ queue items
  const [rfqItems, setRfqItems] = useState<ComponentSpec[]>([
    SPACE_COMPONENTS.find((c) => c.id === 'adcs-bct-xact50')!,
    SPACE_COMPONENTS.find((c) => c.id === 'payload-simera-xscape100')!,
  ].filter(Boolean));

  // Compared components
  const [comparedComponents, setComparedComponents] = useState<ComponentSpec[]>([
    SPACE_COMPONENTS.find((c) => c.id === 'adcs-bct-xact50')!,
    SPACE_COMPONENTS.find((c) => c.id === 'adcs-cubespace-3axis')!,
  ].filter(Boolean));

  // Handlers
  const handleAddToBOM = (component: ComponentSpec) => {
    if (!currentBOM.some((c) => c.id === component.id)) {
      setCurrentBOM((prev) => [...prev, component]);
    }
  };

  const handleRemoveFromBOM = (id: string) => {
    setCurrentBOM((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAddToRFQ = (component: ComponentSpec) => {
    if (!rfqItems.some((c) => c.id === component.id)) {
      setRfqItems((prev) => [...prev, component]);
    }
    setActiveTab('marketplace');
  };

  const handleSendEntireBOMToRFQ = (items: ComponentSpec[]) => {
    setRfqItems((prev) => {
      const existingIds = new Set(prev.map((c) => c.id));
      const newItems = items.filter((item) => !existingIds.has(item.id));
      return [...prev, ...newItems];
    });
    setActiveTab('marketplace');
  };

  const handleAddToCompare = (component: ComponentSpec) => {
    if (!comparedComponents.some((c) => c.id === component.id)) {
      if (comparedComponents.length >= 4) {
        setComparedComponents((prev) => [...prev.slice(1), component]);
      } else {
        setComparedComponents((prev) => [...prev, component]);
      }
    }
    setActiveTab('comparator');
  };

  const handleRemoveFromCompare = (id: string) => {
    setComparedComponents((prev) => prev.filter((c) => c.id !== id));
  };

  const handleOpenCatalogToSelect = (category: SubsystemCategory) => {
    setSelectedCatalogCategory(category);
    setActiveTab('catalog');
  };

  return (
    <div className="min-h-screen flex flex-col bg-space-950 text-slate-100 font-sans selection:bg-aeroblue/30 selection:text-white">
      {/* Global Aerospace Header */}
      <NavigationHeader
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'catalog') setSelectedCatalogCategory(null);
        }}
        rfqCount={rfqItems.length}
        bomCount={currentBOM.length}
        itarFreeOnly={itarFreeOnly}
        onToggleItarFree={() => setItarFreeOnly(!itarFreeOnly)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'explorer' && <OrbitalExplorer3D />}

        {activeTab === 'architect' && (
          <MissionArchitect
            currentBOM={currentBOM}
            onAddBOMItem={handleAddToBOM}
            onRemoveBOMItem={handleRemoveFromBOM}
            onSendToRFQ={handleSendEntireBOMToRFQ}
            onOpenCatalogToSelect={handleOpenCatalogToSelect}
          />
        )}

        {activeTab === 'catalog' && (
          <ComponentCatalog
            onAddToBOM={handleAddToBOM}
            onAddToRFQ={handleAddToRFQ}
            onAddToCompare={handleAddToCompare}
            comparedIds={comparedComponents.map((c) => c.id)}
            initialCategoryFilter={selectedCatalogCategory}
            itarFreeOnly={itarFreeOnly}
          />
        )}

        {activeTab === 'marketplace' && (
          <MarketplaceProcurement
            rfqItems={rfqItems}
            onRemoveFromRFQ={(id) => setRfqItems((prev) => prev.filter((c) => c.id !== id))}
            onClearRFQ={() => setRfqItems([])}
          />
        )}

        {activeTab === 'rideshare' && <LaunchRideshareBrokering />}

        {activeTab === 'ground' && <GroundStationNetwork />}

        {activeTab === 'comparator' && (
          <ComponentComparator
            comparedComponents={comparedComponents}
            onRemoveFromCompare={handleRemoveFromCompare}
            onAddToBOM={handleAddToBOM}
            onClearCompare={() => setComparedComponents([])}
            onAddQuickCompare={(id) => {
              const comp = SPACE_COMPONENTS.find((c) => c.id === id);
              if (comp) handleAddToCompare(comp);
            }}
          />
        )}

        {activeTab === 'supplier' && <SupplierStudio />}
      </main>

      {/* Aerospace Platform Footer */}
      <footer className="mt-auto border-t border-space-850 bg-space-950/80 px-6 py-6 text-xs font-mono text-space-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded bg-space-800 border border-space-700 flex items-center justify-center text-aeroblue">
              <Satellite className="w-3 h-3" />
            </div>
            <div>
              <span className="text-white font-bold tracking-wider">AEROVEX SPACE PLATFORM</span>
              <span className="text-space-600 mx-2">&bull;</span>
              <span>MISSION ARCHITECTURE & B2B COMMERCIAL PROCUREMENT</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-space-400">
            <span className="flex items-center gap-1.5 text-aerogreen">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ITAR & EAR99 ENCRYPTED</span>
            </span>
            <span className="text-space-600">&bull;</span>
            <span>CCSDS / ECSS COMPLIANT</span>
            <span className="text-space-600">&bull;</span>
            <span>SYSTEM REVISION: 2026.4</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
