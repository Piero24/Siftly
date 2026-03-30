---
sidebar_position: 5
---

# CSV Import & Export

Siftly supports full data portability via CSV files.

## Exporting

1. Go to **Settings** → **Data & Storage**
2. Click **Export CSV**
3. A file named `siftly-export-YYYY-MM-DD.csv` will download

The export includes all fields: company, position, status, salary, dates, links, notes, and more.

## Importing

1. Go to **Settings** → **Data & Storage**
2. Click **Import CSV**
3. Select your CSV file
4. Review the preview — Siftly maps columns automatically
5. Click **Import** to add the applications

### Supported Formats

The importer handles:

- Siftly's own export format (recommended)
- Custom CSVs with standard column names

### Column Mapping

The importer expects these column names (case-insensitive):

| Column     | Required | Description                   |
| ---------- | -------- | ----------------------------- |
| `company`  | ✅       | Company name                  |
| `position` | ✅       | Job title                     |
| `status`   | —        | Application status            |
| `country`  | —        | Country name or ISO code      |
| `city`     | —        | City name                     |
| `salary`   | —        | Salary amount                 |
| `currency` | —        | Salary currency               |
| `date`     | —        | Application date (ISO format) |
| `workType` | —        | remote / hybrid / onsite      |
| `sector`   | —        | Industry / sector             |

:::tip
Export your data first to see the exact format Siftly uses, then match your import file to that format.
:::
