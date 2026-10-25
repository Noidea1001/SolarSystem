'use client';

import React, { useState } from 'react';
import {
  ShoppingBag,
  ShieldCheck,
  FileText,
  DollarSign,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Truck,
  Building,
  Trash2,
  Plus,
  Minus,
  Download,
  Lock,
} from 'lucide-react';
import { ComponentSpec, RFQRequest, RFQItem } from '../types/space';

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
  const [quantities, setQuantities] = useState<{ [id: string]: number }>({});
  const [customerName, setCustomerName] = useState('Dr. Elena Rostova');
  const [customerOrg, setCustomerOrg] = useState('Apex Orbital Systems GmbH');
  const [customerEmail, setCustomerEmail] = useState('procurement@apex-orbital.space');
  const [specialRequirements, setSpecialRequirements] = useState(
    'Require ECSS-E-ST-10-03C Thermal Vacuum test report and CoC (Certificate of Conformance).'
  );
  const [submittedRfq, setSubmittedRfq] = useState<RFQRequest | null>(null);

  const getQty = (id: string) => quantities[id] || 1;

  const updateQty = (id: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[id] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const totalHardwareCostUsd = rfqItems.reduce((sum, item) => {
    const qty = getQty(item.id);
    return sum + (item.priceUsd || 0) * qty;
  }, 0);

  const handleSubmitRFQ = (e: React.FormEvent) => {
    e.preventDefault();
    const newRfq: RFQRequest = {
      id: `RFQ-${Math.floor(100000 + Math.random() * 900000)}`,
      title: `Flight Hardware Procurement - ${customerOrg}`,
      customerName,
      customerOrg,
      email: customerEmail,
      items: rfqItems.map((item) => ({
        componentId: item.id,
        componentName: item.name,
        manufacturer: item.manufacturer,
        quantity: getQty(item.id),
        targetDeliveryDate: '2027-02-28',
        notes: `Model ${item.modelCode}`,
      })),
      escrowMilestoneTerms: {
        advancePercentage: 25,
        environmentalTestPercentage: 45,
        deliveryPercentage: 30,
      },
      specialRequirements,
      status: 'PENDING_SUPPLIER_REVIEW',
      createdAt: new Date().toISOString(),
      totalEstimatedUsd: totalHardwareCostUsd,
    };

    setSubmittedRfq(newRfq);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="hud-panel p-5 rounded-lg border border-space-700/80 bg-space-900/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-aeroblue" />
              <h2 className="text-xl font-bold tracking-tight text-white uppercase font-mono">
                B2B AEROSPACE PROCUREMENT & ESCROW RFQ
              </h2>
            </div>
            <p className="text-xs text-space-300 mt-1 max-w-2xl">
              Commercial-off-the-shelf (COTS) and flight-heritage space hardware acquisition with milestone-based escrow
              safeguards, automated NDAs, and export verification.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right font-mono text-xs">
              <span className="text-space-400 block text-[10px]">ESCROW PROTECTION</span>
              <span className="text-aerogreen font-semibold">AS9100D AUDITED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Procurement Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Cart / Hardware Selection (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="hud-panel rounded-lg border border-space-700/80 overflow-hidden">
            <div className="p-4 bg-space-900/90 border-b border-space-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase font-mono tracking-wide text-white">
                  PROCUREMENT HARDWARE QUEUE
                </h3>
                <span className="text-xs text-space-400 font-mono">({rfqItems.length} Items)</span>
              </div>

              {rfqItems.length > 0 && (
                <button
                  onClick={onClearRFQ}
                  className="text-xs font-mono text-space-400 hover:text-aerored transition-colors"
                >
                  Clear Queue
                </button>
              )}
            </div>

            {rfqItems.length === 0 ? (
              <div className="p-12 text-center text-space-400 font-mono text-xs space-y-2">
                <ShoppingBag className="w-8 h-8 text-space-600 mx-auto" />
                <p>Your procurement queue is currently empty.</p>
                <p className="text-space-500 text-[11px]">
                  Browse the Subsystems Catalog or Mission Architect to add qualified components.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-space-800">
                {rfqItems.map((item) => {
                  const qty = getQty(item.id);
                  const lineTotal = (item.priceUsd || 0) * qty;

                  return (
                    <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-space-800 text-aeroblue border border-space-700">
                            {item.category}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-space-800 text-space-300 border border-space-700">
                            TRL {item.trl}
                          </span>
                          <span className="text-[10px] font-mono text-space-400">
                            {item.manufacturer} ({item.country})
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-white">{item.name}</h4>
                        <div className="text-[11px] font-mono text-space-400">
                          Lead Time: {item.leadTimeWeeks} Weeks &bull; {item.exportCompliance}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-5">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-space-700 rounded bg-space-950 font-mono text-xs">
                          <button
                            onClick={() => updateQty(item.id, -1)}
                            className="p-1.5 text-space-400 hover:text-white transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-white font-semibold">{qty}</span>
                          <button
                            onClick={() => updateQty(item.id, 1)}
                            className="p-1.5 text-space-400 hover:text-white transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price & Delete */}
                        <div className="text-right font-mono min-w-[90px]">
                          <div className="text-xs font-bold text-white">
                            {item.priceUsd ? `$${lineTotal.toLocaleString()}` : 'RFQ Quote'}
                          </div>
                          <div className="text-[10px] text-space-500">
                            {item.priceUsd ? `$${item.priceUsd.toLocaleString()} / unit` : 'Custom quote'}
                          </div>
                        </div>

                        <button
                          onClick={() => onRemoveFromRFQ(item.id)}
                          className="p-1.5 rounded text-space-400 hover:text-aerored hover:bg-space-800 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Total Row */}
            {rfqItems.length > 0 && (
              <div className="p-4 bg-space-950/80 border-t border-space-800 flex items-center justify-between font-mono text-xs">
                <span className="text-space-400">ESTIMATED HARDWARE TOTAL</span>
                <span className="text-base font-bold text-white">
                  ${totalHardwareCostUsd.toLocaleString()} USD
                </span>
              </div>
            )}
          </div>

          {/* Milestone Escrow Breakdown Card */}
          <div className="hud-panel p-4 rounded-lg border border-space-700/80 bg-space-900/60 font-mono text-xs space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Lock className="w-4 h-4 text-aerogreen" />
              <span>AEROSPACE MILESTONE ESCROW STRUCTURE</span>
            </div>
            <p className="text-space-300 text-[11px] leading-relaxed">
              Funds are held securely in a segregated aerospace trust account and released strictly upon independent
              engineering milestones:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-2.5 bg-space-950/80 border border-space-800 rounded">
                <span className="text-aeroblue font-bold block text-sm">25% ADVANCE</span>
                <span className="text-[10px] text-space-400">Order placement & parts procurement</span>
              </div>
              <div className="p-2.5 bg-space-950/80 border border-space-800 rounded">
                <span className="text-aeroblue font-bold block text-sm">45% TVAC / VIBE</span>
                <span className="text-[10px] text-space-400">Passing environmental qualification</span>
              </div>
              <div className="p-2.5 bg-space-950/80 border border-space-800 rounded">
                <span className="text-aeroblue font-bold block text-sm">30% DELIVERY</span>
                <span className="text-[10px] text-space-400">Final cleanroom pre-ship acceptance</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: RFQ Submission Form (5 cols) */}
        <div className="lg:col-span-5">
          <div className="hud-panel p-5 rounded-lg border border-space-700/80 bg-space-900/80">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-aeroblue" />
              <h3 className="text-xs font-bold uppercase font-mono tracking-wide text-white">
                SUBMIT FORMAL REQUEST FOR QUOTE
              </h3>
            </div>

            {submittedRfq ? (
              <div className="p-5 rounded bg-aerogreen/10 border border-aerogreen/30 font-mono text-xs space-y-3">
                <div className="flex items-center gap-2 text-aerogreen font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>RFQ SUBMITTED SUCCESSFULLY</span>
                </div>
                <div className="text-space-300 text-[11px] space-y-1">
                  <div>
                    RFQ Tracking Code: <strong className="text-white">{submittedRfq.id}</strong>
                  </div>
                  <div>
                    Organization: <strong className="text-white">{submittedRfq.customerOrg}</strong>
                  </div>
                  <div>
                    Total Estimated Amount: $
                    <strong className="text-white">{submittedRfq.totalEstimatedUsd.toLocaleString()}</strong> USD
                  </div>
                </div>
                <div className="p-3 bg-space-950/60 rounded border border-space-800 text-[10px] text-space-400">
                  Notification sent to hardware manufacturers. Standard turnaround for certified aerospace formal quotes
                  is 2-3 business days with formal NDA.
                </div>
                <button
                  onClick={() => setSubmittedRfq(null)}
                  className="w-full py-2 bg-space-800 hover:bg-space-700 text-white rounded font-mono text-xs transition-colors"
                >
                  Create Another Procurement Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitRFQ} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-space-400 text-[11px] mb-1">LEAD ENGINEER / CONTACT NAME</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-space-950 border border-space-700 rounded px-3 py-2 text-white focus:outline-none focus:border-aeroblue"
                  />
                </div>

                <div>
                  <label className="block text-space-400 text-[11px] mb-1">
                    CUSTOMER ORGANIZATION / AEROSPACE FIRM
                  </label>
                  <input
                    type="text"
                    required
                    value={customerOrg}
                    onChange={(e) => setCustomerOrg(e.target.value)}
                    className="w-full bg-space-950 border border-space-700 rounded px-3 py-2 text-white focus:outline-none focus:border-aeroblue"
                  />
                </div>

                <div>
                  <label className="block text-space-400 text-[11px] mb-1">OFFICIAL PROCUREMENT EMAIL</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-space-950 border border-space-700 rounded px-3 py-2 text-white focus:outline-none focus:border-aeroblue"
                  />
                </div>

                <div>
                  <label className="block text-space-400 text-[11px] mb-1">
                    SPECIAL STANDARDS & TEST COMPLIANCE
                  </label>
                  <textarea
                    rows={3}
                    value={specialRequirements}
                    onChange={(e) => setSpecialRequirements(e.target.value)}
                    className="w-full bg-space-950 border border-space-700 rounded px-3 py-2 text-white focus:outline-none focus:border-aeroblue text-[11px]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={rfqItems.length === 0}
                    className="w-full py-2.5 px-4 rounded bg-aeroblue hover:bg-aeroblue-light text-space-950 font-bold uppercase transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-aeroblue/10"
                  >
                    <Send className="w-4 h-4" />
                    <span>TRANSMIT RFQ TO SUPPLIERS ({rfqItems.length} ITEMS)</span>
                  </button>
                </div>

                <div className="text-[10px] text-space-500 text-center">
                  Protected by bilateral non-disclosure agreement and ITAR-compliant data storage.
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
