# RFQ Comparison — Notion Database Template

> Duplicate this page into your Notion workspace. The formulas below use Notion's native formula syntax (post-2024 update).

## Database schema

Create a new database with these properties (use the exact names — formulas reference them):

| Property name | Type | Configuration |
|---|---|---|
| Supplier Name | Title | — |
| Country | Select | Options: Poland, Turkey, Portugal, Romania, Hungary, Czechia, Germany, China, India, Other |
| Unit Price EUR | Number | Format: Euro |
| Currency | Select | EUR, USD, PLN, TRY, CNY |
| MOQ | Number | Format: Number with commas |
| Lead Time Days | Number | Format: Number |
| Payment Terms | Select | Net 30, Net 45, Net 60, T/T 30/70, 50% deposit, Other |
| Certifications | Multi-select | ISO 9001, ISO 14001, IATF 16949, ISO 13485, AS9100, FSC, Sedex, EcoVadis |
| Incoterm | Select | EXW, FCA, FOB, CIF, DAP, DDP |
| Sample | Select | Yes-free, Yes-paid, No, Pending |
| Score Price | Number | Manual entry 1-5 after calibration meeting |
| Score Quality | Number | Manual entry 1-5 |
| Score Lead Time | Number | Manual entry 1-5 |
| Score Terms | Number | Manual entry 1-5 |
| Weighted Score | Formula | See formula below |
| Notes | Text | Free text |
| Status | Select | Awaiting quote, Received, Declined, Shortlist, Awarded |
| RFQ Sent Date | Date | — |
| Quote Received Date | Date | — |

## Weighted score formula

Paste into the `Weighted Score` formula property:

```
round(
  (prop("Score Price") * 40 +
   prop("Score Quality") * 25 +
   prop("Score Lead Time") * 20 +
   prop("Score Terms") * 15) / 5 * 20
) / 10
```

This produces a score out of 100, assuming equal-scale 1-5 inputs. Adjust weights (40/25/20/15) in the formula to reflect category priority — for commodity categories push price up to 55%, for strategic categories push quality up to 35%.

## Views to create

1. **By Status** — grouped kanban (Awaiting → Received → Shortlist → Awarded). Use this as your weekly RFQ standup view.
2. **Scoring Sort** — table view, sorted by Weighted Score descending, filtered to Status = Received. This is your decision view.
3. **Missing Data** — filtered view where any of (Unit Price, Lead Time, Certifications) is empty. Shows rows not yet ready to score.
4. **By Country** — board view grouped by Country. Useful when presenting diversification to the board.

## Sample seed rows

Paste these into your database as three starter rows (same data as the CSV version):

| Supplier | Country | Unit Price | MOQ | Lead Time | Payment | Certs | Incoterm | Status |
|---|---|---|---|---|---|---|---|---|
| Nordweld Precision Sp. z o.o. | Poland | 12.40 | 500 | 21 | Net 45 | ISO 9001, IATF 16949 | FCA Gdansk | Shortlist |
| Burç Metal Makina A.S. | Turkey | 10.80 | 1000 | 28 | Net 30 | ISO 9001, ISO 14001 | FCA Istanbul | Received |
| Shenzhen Huagong Metal Ltd. | China | 8.95 | 2000 | 56 | T/T 30/70 | ISO 9001 | FOB Shenzhen | Received |

## Why Notion for RFQ comparison

Excel is the spreadsheet you own. Notion is the workspace your stakeholders read without asking for the file. Use Excel when Finance is in the loop. Use Notion when you need Engineering, Quality, and Commercial to comment on the same artefact asynchronously during a 7-day quote window.

Most procurement teams we see run both: Excel for the calc, Notion for the discussion.
