"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMockAuditor = exports.getMockAnalyst = exports.MOCK_EXPLORER_RESPONSE_IRRELEVANT = exports.getMockExplorerRelevant = exports.getMockStrategy = void 0;
const DATASETS = {
    MACHINING: {
        companies: ["Schmidt Fertigungstechnik", "Pol-Stal Precision", "Tech-Metal Solutions", "Krak-Machining", "Bavaria CNC Works", "Silesia Automotive Parts", "Nord-Zerspanung", "Wroclaw Metal Works", "Euro-Turn", "Alpine Precision"],
        queries: ["cnc machining services poland manufacturer", "obróbka skrawaniem cnc producent polska", "cnc fräsen lohnfertiger deutschland", "precision machining supplier eu"],
        materials: ["Aluminum 6061", "Steel S235", "Titanium Grade 5", "Brass"],
        capabilities: ["5-axis milling", "Turning", "Surface Grinding", "Anodizing"]
    },
    ELECTRONICS: {
        companies: ["Electro-Tech Systems", "PCB-Pol Assembly", "Silesia Electronics", "Wroclaw Circuits", "Nord-PCB GmbH", "Euro-Tronix", "Alpine Circuits", "Smart-Board Solutions", "Techno-Logic", "Micro-Systems PL"],
        queries: ["pcb assembly services poland", "montaż elektroniki kontraktowy producent", "smt assembly supplier europe", "producent płytek drukowanych pcb"],
        materials: ["FR4 TG150", "Rogers 4350", "Aluminum IMS", "Copper"],
        capabilities: ["SMT Assembly", "THT Assembly", "AOI Inspection", "X-Ray Testing", "Box Build"]
    },
    PLASTICS: {
        companies: ["Poly-Plast Solutions", "Wtrysk-Pol", "Silesia Molders", "Nord-Plast GmbH", "Euro-Inject", "Alpine Plastics", "Techno-Polymers", "Mold-Master PL", "Plastic-Form", "Eco-Inject Systems"],
        queries: ["plastic injection molding poland", "wtryskownia tworzyw sztucznych producent", "spritzguss lieferant polen", "mold making services eu"],
        materials: ["ABS", "PP", "PA6 GF30", "PC/ABS"],
        capabilities: ["Injection Molding", "2K Molding", "Insert Molding", "Mold Design"]
    }
};
const getDataset = (text) => {
    const t = text.toLowerCase();
    if (t.includes('pcb') || t.includes('circuit') || t.includes('electronic') || t.includes('płyta') || t.includes('iot'))
        return 'ELECTRONICS';
    if (t.includes('injection') || t.includes('wtrysk') || t.includes('plastic') || t.includes('tworzyw') || t.includes('obudowa'))
        return 'PLASTICS';
    return 'MACHINING';
};
const getMockStrategy = (promptContext = '') => {
    const type = getDataset(promptContext);
    const data = DATASETS[type];
    return JSON.stringify({
        strategies: [
            {
                name: "Direct Manufacturer Sourcing",
                description: `Targeting specialized ${type.toLowerCase()} manufacturers in Poland & Germany`,
                queries: data.queries
            },
            {
                name: "Distributor/Specialist Check",
                description: "Checking local specialists for quick turnaround",
                queries: [data.queries[0] + " distributor", data.queries[1] + " magazyn"]
            }
        ]
    });
};
exports.getMockStrategy = getMockStrategy;
const getMockExplorerRelevant = (url, promptContext = '') => {
    const type = getDataset(promptContext);
    return JSON.stringify({
        is_relevant: true,
        page_type: "product_page",
        reason: `The page ${url} describes ${type.toLowerCase()} capabilities matching the specific requirements.`,
        confidence_score: 0.85 + Math.random() * 0.14,
        next_steps: ["Analyze capabilities", "Look for certifications"]
    });
};
exports.getMockExplorerRelevant = getMockExplorerRelevant;
exports.MOCK_EXPLORER_RESPONSE_IRRELEVANT = JSON.stringify({
    is_relevant: false,
    page_type: "blog_post",
    reason: "This is an informational article or blog post, not a qualified manufacturer page.",
    confidence_score: 0.92,
    next_steps: ["Skip"]
});
const getMockAnalyst = (seed = 0, promptContext = '') => {
    const type = getDataset(promptContext);
    const data = DATASETS[type];
    const companyBase = data.companies[seed % data.companies.length];
    const suffix = ["Sp. z o.o.", "GmbH", "S.A.", "Ltd."][seed % 4];
    const companyName = `${companyBase} ${suffix}`;
    const CITIES = ["Berlin", "Kraków", "Warszawa", "Monachium", "Katowice", "Wrocław", "Praga", "Brno", "Poznań", "Hamburg"];
    const city = CITIES[seed % CITIES.length];
    const country = ["GmbH", "Berlin", "Monachium", "Hamburg", "Nord"].some(x => companyName.includes(x) || city === x) ? "Germany" :
        companyName.includes("s.r.o.") || city === "Praga" || city === "Brno" ? "Czech Republic" : "Poland";
    return JSON.stringify({
        capability_match_score: 70 + Math.floor(Math.random() * 29),
        risks: Math.random() > 0.8 ? ["Lead times vary"] : ["Standard commercial terms"],
        extracted_data: {
            company_name: companyName,
            location: `${city}, ${country}`,
            certifications: ["ISO 9001:2015", type === 'ELECTRONICS' ? "IPC-A-610" : "ISO 14001"],
            capabilities: data.capabilities,
            materials: data.materials,
            contact_email: `sales@${companyBase.toLowerCase().replace(/[^a-z]/g, '')}.com`,
            phone: `+48 ${10 + seed} 345 67 ${89 - seed}`
        }
    });
};
exports.getMockAnalyst = getMockAnalyst;
const getMockAuditor = (analystData) => {
    const data = typeof analystData === 'string' ? JSON.parse(analystData) : analystData;
    const info = data?.extracted_data || {};
    return JSON.stringify({
        golden_record: {
            company_name: info.company_name || "Unknown Mfg",
            registration_number: "REG-" + Math.floor(Math.random() * 100000),
            vat_id: (info.location?.includes("Germany") ? "DE" : "PL") + Math.floor(Math.random() * 9999999999),
            address: `Industrial Zone ${Math.floor(Math.random() * 10)}, ${info.location || "Europe"}`,
            status: "Active",
            verification_source: "Official Registry API",
            confidence_level: "High",
            last_verified: new Date().toISOString().split('T')[0]
        }
    });
};
exports.getMockAuditor = getMockAuditor;
//# sourceMappingURL=mock-data.js.map