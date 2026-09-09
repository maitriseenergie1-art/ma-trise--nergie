import { ScanSearch, Ruler, ClipboardCheck, Wrench, SlidersHorizontal, ChartNoAxesCombined, Landmark, Building2 } from 'lucide-react';
const icons = { diagnostic: ScanSearch, conception: Ruler, etude: ClipboardCheck, travaux: Wrench, pilotage: SlidersHorizontal, suivi: ChartNoAxesCombined, financement: Landmark, site: Building2 };
export function StepIcon({ name='diagnostic' }) { const Icon = icons[name] || ScanSearch; return <Icon className="step-icon" size={28} strokeWidth={1.6} aria-hidden="true"/>; }
