
// --- DATASETS ---
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

type IndustryType = 'MACHINING' | 'ELECTRONICS' | 'PLASTICS';

const getDataset = (text: string): IndustryType => {
    const t = text.toLowerCase();
    if (t.includes('pcb') || t.includes('circuit') || t.includes('electronic') || t.includes('płyta') || t.includes('iot')) return 'ELECTRONICS';
    if (t.includes('injection') || t.includes('wtrysk') || t.includes('plastic') || t.includes('tworzyw') || t.includes('obudowa')) return 'PLASTICS';
    return 'MACHINING';
};

// --- GENERATORS ---

export const getMockStrategy = (promptContext: string = '') => {
    const type = getDataset(promptContext);
    const data = DATASETS[type];

    // Extract actual parameters from the prompt context
    const categoryMatch = promptContext.match(/Kategoria:\s*"([^"]+)"/);
    const materialMatch = promptContext.match(/Materiał:\s*"([^"]+)"/);
    const regionMatch = promptContext.match(/Region:\s*"([^"]+)"/);

    const category = categoryMatch?.[1] || 'General';
    const material = materialMatch?.[1] || '';
    const region = regionMatch?.[1] || 'EU';

    // Build context-aware queries from actual campaign data
    const baseTerms = [material, category].filter(Boolean).join(' ');

    const plQueries = [
        `${baseTerms} producent polska`.trim(),
        `${material || category} producent fabryka`.trim(),
        `${baseTerms} zakład produkcyjny`.trim(),
    ].filter(q => q.length > 10);

    const enQueries = [
        `${baseTerms} manufacturer europe`.trim(),
        `${material || category} manufacturer supplier OEM`.trim(),
        `${baseTerms} factory producer`.trim(),
    ].filter(q => q.length > 10);

    // Fall back to dataset queries if no useful context
    const finalPlQueries = plQueries.length >= 2 ? plQueries : data.queries.slice(0, 3);
    const finalEnQueries = enQueries.length >= 2 ? enQueries : data.queries.slice(0, 3);

    const strategies: any[] = [];

    if (region === 'PL' || region === 'EU') {
        strategies.push({
            country: "Poland",
            language: "pl",
            queries: finalPlQueries,
            negatives: ["-allegro", "-olx", "-sklep", "-ceneo"]
        });
    }

    if (region === 'EU' || region === 'GLOBAL' || region === 'GLOBAL_NO_CN') {
        strategies.push({
            country: "Global",
            language: "en",
            queries: finalEnQueries,
            negatives: ["-amazon", "-ebay", "-alibaba"]
        });
    }

    return JSON.stringify({
        rationale: `Mock strategy for ${baseTerms || type} in region ${region}`,
        region_selected: region,
        languages_used: strategies.map(s => s.language),
        strategies,
    });
};

export const getMockExplorerRelevant = (url: string, promptContext: string = '') => {
    const type = getDataset(promptContext);
    return JSON.stringify({
        is_relevant: true,
        page_type: "product_page",
        reason: `The page ${url} describes ${type.toLowerCase()} capabilities matching the specific requirements.`,
        confidence_score: 0.85 + Math.random() * 0.14,
        next_steps: ["Analyze capabilities", "Look for certifications"]
    });
};

export const MOCK_EXPLORER_RESPONSE_IRRELEVANT = JSON.stringify({
    is_relevant: false,
    page_type: "blog_post",
    reason: "This is an informational article or blog post, not a qualified manufacturer page.",
    confidence_score: 0.92,
    next_steps: ["Skip"]
});

export const getMockAnalyst = (seed: number = 0, promptContext: string = '') => {
    const type = getDataset(promptContext);
    const data = DATASETS[type];

    // Try to extract real company info from the page content in the prompt
    let companyName = '';
    let country = 'Poland';
    let city = '';
    let domain = '';

    // Try to find domain/URL in prompt context
    const urlMatch = promptContext.match(/https?:\/\/(?:www\.)?([a-zA-Z0-9.-]+)/);
    if (urlMatch) {
        domain = urlMatch[1];
        // Use domain as company name base (e.g., "alupol.pl" -> "Alupol")
        const domainBase = domain.split('.')[0];
        companyName = domainBase.charAt(0).toUpperCase() + domainBase.slice(1);

        // Infer country from TLD
        if (domain.endsWith('.pl')) country = 'Poland';
        else if (domain.endsWith('.de')) country = 'Germany';
        else if (domain.endsWith('.cz')) country = 'Czech Republic';
        else if (domain.endsWith('.fr')) country = 'France';
        else if (domain.endsWith('.it')) country = 'Italy';
        else if (domain.endsWith('.com') || domain.endsWith('.eu')) country = 'Europe';
    }

    // Fallback to dataset company names if no URL found
    if (!companyName) {
        const companyBase = data.companies[seed % data.companies.length];
        companyName = companyBase;
    }

    const CITIES = ["Kraków", "Warszawa", "Katowice", "Wrocław", "Poznań", "Berlin", "Monachium", "Praga"];
    if (!city) city = CITIES[seed % CITIES.length];

    return JSON.stringify({
        capability_match_score: 60 + Math.floor(Math.random() * 35),
        match_reason: `Mock analysis: ${companyName} appears to be a relevant manufacturer`,
        risks: ["Mock mode - real AI analysis required for accurate assessment"],
        extracted_data: {
            company_name: companyName,
            country: country,
            city: city,
            website: domain ? `https://${domain}` : undefined,
            certifications: ["ISO 9001:2015"],
            capabilities: data.capabilities.slice(0, 2),
            materials: data.materials.slice(0, 2),
            specialization: `${type.charAt(0) + type.slice(1).toLowerCase()} manufacturing`,
            contact_email: domain ? `info@${domain}` : `info@example.com`,
            employee_count: "50-200"
        }
    });
};

export const getMockAuditor = (analystData: any) => {
    const data = typeof analystData === 'string' ? JSON.parse(analystData) : analystData;
    const info = data?.extracted_data || {};

    return JSON.stringify({
        is_valid: true,
        is_match: true,
        validation_result: "APPROVED",
        confidence_score: 0.8,
        rejection_reason: null,
        warnings: ["Mock mode - real AI validation needed"],
        checks_performed: {
            domain_company_match: true,
            is_blog_or_article: false,
            is_distributor: false,
            location_domain_consistent: true
        },
        golden_record: {
            company_name: info.company_name || "Unknown Mfg",
            website: info.website || "",
            country: info.country || "Poland",
            city: info.city || null,
            specialization: info.specialization || "Manufacturing",
            employee_count: info.employee_count || null,
            certificates: info.certificates || ["ISO 9001"],
            contact_emails: info.contact_emails || [],
            is_verified_manufacturer: true,
            registration_number: "REG-" + Math.floor(Math.random() * 100000),
            status: "Active",
            verification_source: "Mock Registry",
            last_verified: new Date().toISOString().split('T')[0]
        }
    });
};
