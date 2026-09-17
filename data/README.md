# Procurement data

Drop your Ghana Big Push Watch procurement dataset here as `procurement.csv`
(the 107-contract dataset sourced via RTI through The Fourth Estate).

`scripts/seed.js` expects these columns (rename your existing export's headers
to match, or edit the column map at the top of `seed.js`):

| Column               | Maps to                          |
| -------------------- | --------------------------------- |
| project_name         | Project.name                      |
| location             | Project.location                  |
| region               | Project.region                    |
| latitude             | Project.latitude                  |
| longitude            | Project.longitude                 |
| contractor_name      | Contractor.name (created if new)  |
| contract_value_ghs   | Project.contractValueGhs          |
| start_date           | Project.startDate (YYYY-MM-DD)    |
| expected_completion  | Project.expectedCompletion        |
| source_reference     | Project.sourceReference           |

Rows with a `contractor_name` that already exists are linked to the same
Contractor record rather than duplicated.
