import { RevealOnScroll } from "@/components/ui/RevealOnScroll"

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

interface SystemLogo {
  name: string
  acronym: string
}

// Top row — ERP systems (23 items)
const TOP_ROW: SystemLogo[] = [
  { name: 'SAP S/4HANA', acronym: 'S/4' },
  { name: 'SAP ECC', acronym: 'ECC' },
  { name: 'SAP Business One', acronym: 'B1' },
  { name: 'SAP Ariba', acronym: 'ARB' },
  { name: 'Oracle NetSuite', acronym: 'NS' },
  { name: 'Oracle Fusion Cloud', acronym: 'OFC' },
  { name: 'Oracle JD Edwards', acronym: 'JDE' },
  { name: 'Oracle EBS', acronym: 'EBS' },
  { name: 'Microsoft Dynamics 365 BC', acronym: 'D365' },
  { name: 'Microsoft Dynamics 365 F&O', acronym: 'F&O' },
  { name: 'Microsoft Dynamics 365 CRM', acronym: 'DCRM' },
  { name: 'Microsoft Dynamics NAV', acronym: 'NAV' },
  { name: 'Microsoft Dynamics GP', acronym: 'GP' },
  { name: 'Microsoft Dynamics AX', acronym: 'AX' },
  { name: 'Acumatica', acronym: 'ACU' },
  { name: 'Infor CloudSuite', acronym: 'INF' },
  { name: 'Epicor', acronym: 'EPI' },
  { name: 'Sage X3', acronym: 'X3' },
  { name: 'Sage Intacct', acronym: 'INT' },
  { name: 'Sage 200', acronym: '200' },
  { name: 'QuickBooks Online', acronym: 'QBO' },
  { name: 'QuickBooks Enterprise', acronym: 'QBE' },
  { name: 'Xero', acronym: 'XRO' },
]

// Bottom row — CRM, procurement, other (24 items)
const BOTTOM_ROW: SystemLogo[] = [
  { name: 'Salesforce', acronym: 'SF' },
  { name: 'Salesforce Commerce Cloud', acronym: 'SCC' },
  { name: 'HubSpot', acronym: 'HS' },
  { name: 'Zoho CRM', acronym: 'ZOH' },
  { name: 'Pipedrive', acronym: 'PD' },
  { name: 'Workday', acronym: 'WD' },
  { name: 'Coupa', acronym: 'CPA' },
  { name: 'Ariba SLP', acronym: 'SLP' },
  { name: 'Jaggaer', acronym: 'JAG' },
  { name: 'Ivalua', acronym: 'IVA' },
  { name: 'Zycus', acronym: 'ZYC' },
  { name: 'GEP SMART', acronym: 'GEP' },
  { name: 'Odoo', acronym: 'ODO' },
  { name: '1C:Enterprise', acronym: '1C' },
  { name: 'Priority Software', acronym: 'PRI' },
  { name: 'IFS Cloud', acronym: 'IFS' },
  { name: 'Unit4', acronym: 'U4' },
  { name: 'Abas ERP', acronym: 'ABA' },
  { name: 'Ramco ERP', acronym: 'RAM' },
  { name: 'Plex ERP', acronym: 'PLX' },
  { name: 'Deltek', acronym: 'DLT' },
  { name: 'Syspro', acronym: 'SYS' },
  { name: 'ServiceNow', acronym: 'SNW' },
  { name: 'Slack', acronym: 'SLK' },
]

const copy = {
  heading: isEN
    ? 'And 50+ other ERP, CRM, and procurement systems'
    : 'I ponad 50 innych systemów ERP, CRM i procurement',
  subheading: isEN
    ? 'Custom integration available for any system in your stack — ask us.'
    : 'Customowa integracja dostępna dla dowolnego systemu w Twoim stacku — zapytaj.',
}

function LogoCard({ system }: { system: SystemLogo }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-black/[0.06] bg-white px-4 py-2.5 shadow-sm shrink-0 mx-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 text-white text-[10px] font-bold shrink-0">
        {system.acronym}
      </div>
      <span className="text-sm font-semibold text-foreground whitespace-nowrap">
        {system.name}
      </span>
    </div>
  )
}

export function IntegrationsLogosCarousel() {
  return (
    <section className="relative py-12 md:py-16 overflow-hidden bg-slate-50/40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mb-8 text-center">
        <RevealOnScroll>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
            {copy.heading}
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            {copy.subheading}
          </p>
        </RevealOnScroll>
      </div>

      {/* Top row — left-to-right */}
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div
          className="flex animate-scroll-left hover:[animation-play-state:paused]"
          style={{ width: 'max-content' }}
        >
          {[...TOP_ROW, ...TOP_ROW].map((s, i) => (
            <LogoCard key={`top-${i}-${s.name}`} system={s} />
          ))}
        </div>
      </div>

      {/* Bottom row — right-to-left */}
      <div className="relative overflow-hidden mt-3 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div
          className="flex animate-scroll-right hover:[animation-play-state:paused]"
          style={{ width: 'max-content' }}
        >
          {[...BOTTOM_ROW, ...BOTTOM_ROW].map((s, i) => (
            <LogoCard key={`bot-${i}-${s.name}`} system={s} />
          ))}
        </div>
      </div>
    </section>
  )
}
