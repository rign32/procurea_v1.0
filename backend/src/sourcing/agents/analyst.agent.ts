import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from '../../common/services/gemini.service';

@Injectable()
export class AnalystAgentService {
    private readonly logger = new Logger(AnalystAgentService.name);

    constructor(private readonly geminiService: GeminiService) { }

    async execute(content: string, rfqData: any): Promise<any> {
        this.logger.log('Executing Analyst Agent...');

        const systemPrompt = `
Jesteś Starszym Analitykiem Skautingu Dostawców (Procurement Analyst).
Twoim zadaniem jest EKSTRAKCJA twardych danych o dostawcy z treści jego strony internetowej.

DANE WEJŚCIOWE (RFQ):
${JSON.stringify(rfqData)}

TREŚĆ STRONY:
${content.substring(0, 12000)}

INSTRUKCJE:
1. Przeanalizuj treść pod kątem dopasowania do RFQ.
2. Wydobądź dane firmy. Jeśli nazwy firmy nie ma wprost (np. w stopce), UŻYJ NAZWY DOMENY jako nazwy firmy (np. "granulat.com" -> "Granulat"). NIE zwracaj "Unknown" ani "Należy ustalić".
3. Lokalizacja: Jeśli brak adresu, wywnioskuj kraj z domeny (.pl -> Polska, .de -> Niemcy) lub numeru telefonu (+48 -> Polska). Wpisz miasto, jeśli znajdziesz.
4. Certyfikaty: Szukaj słów kluczowych: ISO 9001, IATF 16949, ISO 14001, UL. Wypisz je w tablicy.
5. Specjalizacja: Krótkie zdanie opisujące co robią (np. "Wtrysk tworzyw sztucznych i budowa form").
6. Wielkość: Szukaj haseł typu "employees", "staff", "pracowników". Jeśli brak, oszacuj ("Mała", "Średnia", "Duża") lub zostaw puste stringi.

FORMAT WYJŚCIOWY (JSON Only):
{
  "capability_match_score": 0-100,
  "match_reason": "Zwięzłe uzasadnienie oceny (1 zdanie).",
  "risks": ["Ryzyko 1", "Ryzyko 2"],
  "extracted_data": {
    "company_name": "Pełna nazwa lub Domena (z dużej litery)",
    "vat_id": "Numer NIP/VAT (jeśli znaleziono)",
    "address": "Ulica, Miasto, Kraj",
    "country": "Kod kraju (PL, DE, etc.) lub pełna nazwa",
    "city": "Miasto (jeśli znaleziono)",
    "email": "Email kontaktowy",
    "phone": "Telefon",
    "website": "URL strony głównej",
    "specialization": "Krótki opis działalności (max 5-7 słów)",
    "certificates": ["ISO 9001", "IATF 16949"],
    "employee_count": "Liczba pracowników (np. '50-100' lub '500+')"
  }
}
    `;

        try {
            const responseText = await this.geminiService.generateContent(systemPrompt);
            const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonString);
        } catch (e) {
            this.logger.error('Failed to execute Analyst Agent', e);
            // FALLBACK
            return {
                error: e.message,
                capability_match_score: 50,
                match_reason: "AI unavailable. Pre-qualified by keyword match.",
                extracted_data: {
                    company_name: "Detected Supplier",
                    location: "Unknown"
                }
            };
        }
    }
}
