# Convert CSV to Excel Workbook with Formulas

The `rfq-comparison-template.csv` file gives you the data structure. To turn it into a fully-featured Excel workbook with formulas, conditional formatting, and a scoring tab, follow these steps (15 minutes).

## Step 1: Open in Excel and save as XLSX

1. Open `rfq-comparison-template.csv` in Excel (File → Open).
2. Save as → `rfq-comparison-template.xlsx` (Excel Workbook, not CSV).
3. Rename the sheet from `rfq-comparison-template` to `Quotes`.

## Step 2: Add scoring columns

Add these five columns after `Notes` (right side of the sheet):

| Column | Header | Formula / Values |
|---|---|---|
| M | Score Price (1-5) | Manual entry |
| N | Score Quality (1-5) | Manual entry |
| O | Score Lead Time (1-5) | Manual entry |
| P | Score Terms (1-5) | Manual entry |
| Q | Weighted Score | `=((M2*Weights!$B$2)+(N2*Weights!$B$3)+(O2*Weights!$B$4)+(P2*Weights!$B$5))/5*20` |

Drag the formula in column Q down to cover all supplier rows.

## Step 3: Create the Weights tab

Add a new sheet named `Weights`. Populate:

| A | B |
|---|---|
| Dimension | Weight |
| Price | 0.40 |
| Quality | 0.25 |
| Lead Time | 0.20 |
| Terms | 0.15 |
| **Total** | **=SUM(B2:B5)** |

The Total cell should always show 1.00. If it doesn't, you've miskeyed a weight.

## Step 4: Conditional formatting — weighted score column

Select column Q (Weighted Score). Home → Conditional Formatting → Color Scales → Green-Yellow-Red.

- Green: 80-100 (shortlist)
- Yellow: 60-79 (review)
- Red: below 60 (exclude unless justified)

## Step 5: Conditional formatting — missing-data flag

Add a column R named `Data Completeness`. Formula:

```
=IF(COUNTBLANK(C2:L2)>0,"Incomplete — missing " & COUNTBLANK(C2:L2) & " field(s)","Complete")
```

Apply conditional formatting: text contains "Incomplete" → red fill. This catches suppliers whose quote is missing fields before you scoring them against complete quotes.

## Step 6: Create the Summary tab

Add a new sheet named `Summary`.

- Cell A1: `Top 3 by weighted score`
- A2: `Supplier`, B2: `Country`, C2: `Weighted Score`
- A3: `=INDEX(Quotes.A:A, MATCH(LARGE(Quotes.Q:Q,1), Quotes.Q:Q, 0))`
- A4: `=INDEX(Quotes.A:A, MATCH(LARGE(Quotes.Q:Q,2), Quotes.Q:Q, 0))`
- A5: `=INDEX(Quotes.A:A, MATCH(LARGE(Quotes.Q:Q,3), Quotes.Q:Q, 0))`
- Repeat for Country (column B) and Weighted Score (column C).

This gives you an automatic top-3 shortlist for the decision meeting.

## Step 7: Add a chart

With cells Q2:Q10 selected (or however many supplier rows you have), Insert → Bar Chart → Clustered Bar. Chart title: "RFQ Weighted Score by Supplier". Save chart on the Summary tab for stakeholder presentations.

## Step 8: Lock the Weights tab

Once the weights are set and version-locked (per the README's audit defensibility note):

1. Right-click the Weights sheet tab → Protect Sheet.
2. Password (optional). Allow: Select unlocked cells only.
3. This prevents someone from changing the weights mid-RFQ and post-hoc favouring a particular supplier.

## Step 9: Export to PPTX (optional, for C-level presentations)

1. On the Summary tab, select the chart + top-3 table.
2. Copy.
3. PowerPoint → Paste Special → Microsoft Excel Object (keeps live link) or Picture (static).
4. Title slide: "[Category] RFQ — Recommendation". Done.

## Troubleshooting

- **INDEX/MATCH returns #N/A**: the supplier list in `Quotes` has blank rows. Remove blanks or adjust the range to `A2:A100`.
- **Weighted Score shows 0 for all suppliers**: you haven't filled in the 1-5 manual scores (columns M-P). The formula requires these.
- **Google Sheets users**: replace `Quotes.A:A` with `Quotes!A:A` (Google uses `!`, Excel uses `.` in older versions — both syntaxes usually work in modern Excel and Sheets).

## Why no macros

This workbook deliberately avoids VBA / Apps Script. Most enterprise IT departments block macro-enabled workbooks (.xlsm) by default. A formula-only workbook works in every Excel 2016+ and Google Sheets install without security warnings. If you need automation beyond this, that's the signal to look at a dedicated tool.
