-- Sprint 2 C1: tag SequenceTemplate by industry + sourcingMode so we can auto-pick
-- a branch-matched outreach cadence (event catering vs HDPE producer need very
-- different openers).
ALTER TABLE "SequenceTemplate" ADD COLUMN "industry" TEXT;
ALTER TABLE "SequenceTemplate" ADD COLUMN "sourcingMode" TEXT;

CREATE INDEX "SequenceTemplate_industry_sourcingMode_idx"
    ON "SequenceTemplate"("industry", "sourcingMode");

-- Seed 3 system defaults — one per sourcing mode. Industry-specific refinements
-- can come later; these cover 80% of the taste gap (product vs service pitch).

INSERT INTO "SequenceTemplate" ("id", "name", "isSystem", "industry", "sourcingMode", "createdAt", "updatedAt")
VALUES
    (gen_random_uuid(), 'Default — Product sourcing', true, NULL, 'product', NOW(), NOW()),
    (gen_random_uuid(), 'Default — Service sourcing', true, NULL, 'service', NOW(), NOW()),
    (gen_random_uuid(), 'Default — Events sourcing', true, 'events', 'service', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- For every newly-inserted default template, attach 3 steps (INITIAL / REMINDER D+3 / FINAL D+7).
DO $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN
        SELECT id, "sourcingMode", industry FROM "SequenceTemplate"
        WHERE "isSystem" = true AND "name" LIKE 'Default —%'
        AND NOT EXISTS (SELECT 1 FROM "SequenceStep" WHERE "templateId" = "SequenceTemplate".id)
    LOOP
        IF rec."sourcingMode" = 'product' THEN
            INSERT INTO "SequenceStep" ("id", "dayOffset", "type", "subject", "bodySnippet", "templateId")
            VALUES
                (gen_random_uuid(), 0, 'INITIAL', 'Zapytanie ofertowe — {{productName}}', 'Dzień dobry,\n\npiszę w sprawie zapytania ofertowego na {{productName}}. Potrzebujemy ilości {{quantity}} {{unit}}{{#moq}}, MOQ akceptujemy do {{moq}}{{/moq}}{{#leadTimeWeeks}}, lead time do {{leadTimeWeeks}} tygodni{{/leadTimeWeeks}}. Czy Państwo produkują/dostarczają ten produkt?\n\nPozdrawiam', rec.id),
                (gen_random_uuid(), 3, 'REMINDER', 'Przypomnienie — {{productName}}', 'Dzień dobry,\n\nponawiam prośbę o informację, czy mogą Państwo przedstawić ofertę na {{productName}} w podanych parametrach.\n\nPozdrawiam', rec.id),
                (gen_random_uuid(), 7, 'FINAL', 'Ostatnie przypomnienie — {{productName}}', 'Dzień dobry,\n\nostatnie przypomnienie — czy są Państwo zainteresowani złożeniem oferty na {{productName}}? Jeśli nie, prosimy o krótki sygnał.\n\nPozdrawiam', rec.id);
        ELSIF rec.industry = 'events' THEN
            INSERT INTO "SequenceStep" ("id", "dayOffset", "type", "subject", "bodySnippet", "templateId")
            VALUES
                (gen_random_uuid(), 0, 'INITIAL', 'Zapytanie o usługę — {{productName}} {{#city}}({{city}}){{/city}}', 'Dzień dobry,\n\norganizujemy wydarzenie{{#city}} w {{city}}{{/city}}{{#eventDate}} w dniu {{eventDate}}{{/eventDate}}{{#headcount}} dla około {{headcount}} osób{{/headcount}}. Szukamy wykonawcy: {{productName}}. Czy mogą Państwo obsłużyć to wydarzenie?\n\nProsimy o potwierdzenie dostępności i orientacyjną wycenę.\n\nPozdrawiam', rec.id),
                (gen_random_uuid(), 2, 'REMINDER', 'Przypomnienie — wydarzenie {{#city}}{{city}}{{/city}} {{#eventDate}}{{eventDate}}{{/eventDate}}', 'Dzień dobry,\n\nczy mogą Państwo potwierdzić dostępność dla wydarzenia{{#eventDate}} w dniu {{eventDate}}{{/eventDate}}? Terminy robią się ciasne.\n\nPozdrawiam', rec.id),
                (gen_random_uuid(), 5, 'FINAL', 'Ostatni termin — wydarzenie {{#eventDate}}{{eventDate}}{{/eventDate}}', 'Dzień dobry,\n\nzamykamy wybór wykonawcy w najbliższych dniach. Jeśli są Państwo zainteresowani, prosimy o pilną odpowiedź.\n\nPozdrawiam', rec.id);
        ELSE
            -- service (non-events)
            INSERT INTO "SequenceStep" ("id", "dayOffset", "type", "subject", "bodySnippet", "templateId")
            VALUES
                (gen_random_uuid(), 0, 'INITIAL', 'Zapytanie o usługę — {{productName}}', 'Dzień dobry,\n\npiszę w sprawie usługi: {{productName}}. {{#city}}Lokalizacja: {{city}}. {{/city}}Czy mogą Państwo zrealizować tę usługę i przedstawić wstępną wycenę?\n\nPozdrawiam', rec.id),
                (gen_random_uuid(), 3, 'REMINDER', 'Przypomnienie — {{productName}}', 'Dzień dobry,\n\nczy mieli Państwo okazję spojrzeć na nasze zapytanie o {{productName}}?\n\nPozdrawiam', rec.id),
                (gen_random_uuid(), 7, 'FINAL', 'Ostatnie przypomnienie — {{productName}}', 'Dzień dobry,\n\nostatnie przypomnienie — czy są Państwo zainteresowani realizacją usługi {{productName}}?\n\nPozdrawiam', rec.id);
        END IF;
    END LOOP;
END $$;
