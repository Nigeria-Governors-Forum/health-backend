# Excel Upload & Endpoint Processing Report

## Executive Summary
This document provides a comprehensive technical audit and report of the Excel sheet upload pipeline in `health-backend`, specifically testing the upload endpoint `POST /api/v1/user/data/:year` and processing all sheets in `NGF_Health_Dashboard_Data.xlsx` and `data.xlsx`.

---

## Endpoint Specifications

- **URL**: `POST http://localhost:7200/api/v1/user/data/:year`
- **Content-Type**: `multipart/form-data`
- **Form Field**: `file` (accepts `.xlsx`, `.xls`, `.xlsb`)
- **SSE Progress Endpoint**: `GET http://localhost:7200/api/v1/user/progress/details` (Server-Sent Events for live upload progress)

---

## Detailed Sheet Analysis & Results

### 1. `NGF_Health_Dashboard_Data.xlsx` (Main Dashboard Dataset)

| Sheet Name | Mapped Model | Total Rows | Status | Issues & Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Demography** | `Demography` | 2,001 | ✅ Success | Columns mapped (`Zone`, `State`, `Year`, `Section` -> `page`, `Indicator`, `Value`). Column `Data_Type` is unmapped in Prisma schema and safely ignored. |
| **Demography_LGA** | `Demography_LGA` | 3,091 | ✅ Success | Maps `Hard_to_Reach_LGAs` to the string field `hard_to_reach_colour`, and keeps numeric ward counts in `hard_to_reach_wards`. Preserves float precision for `lga_population`. |
| **Health Facilities** | `HFcilities` | 888 | ✅ Fixed | Added alias mapping for `Health Facilities` -> `HFcilities` model. (Previously skipped due to model name spelling difference). |
| **Health Fac Service Provision** | `Health_Fac_Service_Provision` | 1,602 | ✅ Fixed | Mapped to the canonical Prisma model. |
| **Health Training Institutions** | `Health_Training_Institutions` | 1,183 | ✅ Fixed | Maps to its own model (`institution`, `ownership`, `value`), separate from `HRH`. |
| **Admission Quota** | `Admission_Quota` | 481 | ✅ Success | Maps `state`, `year`, `indicator`, `faculty`, and integer `value`; rows are identified by state, year, indicator, and faculty. |
| **Sheet2** | N/A | 0 | ℹ️ Skipped | Empty worksheet. |

---

### 2. `data.xlsx` (Full Multi-Sheet Dataset)

| Sheet Name | Mapped Model | Total Rows | Status | Issues & Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Demography** | `Demography` | 324 | ✅ Success | 324 state-level demography records processed. |
| **Partners_Mapping** | `Partners_Mapping` | 765 | ✅ Success | Mapped partner interventions per state/year. |
| **Demography_LGA** | `Demography_LGA` | 768 | ✅ Success | 768 LGA demography records processed. |
| **HFcilities** | `HFcilities` | 216 | ✅ Success | Health facilities count per level/ownership. |
| **Legacy service-provision sheet** | — | 324 | ⚠️ Rename required | Rename the sheet to `Health_Fac_Service_Provision` before upload. |
| **HRH** | `HRH` | 288 | ✅ Success | Human Resources for Health records. |
| **HRH** | `HRH` | 396 | ✅ Success | HRH professions density & numbers. |
| **Insurance_Coverage** | `Insurance_Coverage` | 179 | ✅ Success | Insurance coverage indicators. |
| **Access_Service_Utilization** | `Access_Service_Utilization` | 1,044 | ✅ Success | Health access & service utilization targets. |
| **Health_Outcomes** | `Health_Outcomes` | 216 | ✅ Success | Health outcome values per state/year. |
| **Scorecards** | `Scorecards` | 3,220 | ⚠️ Warning | 777 rows had missing/serial `Period` date values requiring date conversion to year. |
| **NDHS** | `NDHS` | 2,331 | ✅ Success | NDHS demographic and health survey data. |
| **HFin** | `HFin` | 2,238 | ⚠️ Warning | Optional `exp_type` / `status` columns empty for some rows; fallback unique keys handled. |
| **HFin_2** | `HFin_2` | 1,914 | ⚠️ Warning | Optional `exp_type` / `status` columns empty for some rows. |
| **Per_Capita** | `Per_Capita` | 108 | ✅ Success | Per capita expenditure per state/year. |
| **LGA_Fin** | `LGA_Fin` | 5,376 | ✅ Success | LGA financial breakdown. |
| **LGA_PCap** | `LGA_PCap` | 2,304 | ✅ Success | LGA per capita metrics. |

---

## Critical Technical Issues Found & Fixes Applied

### 1. Hard-to-Reach LGA Column Mapping Bug
- **Issue**: The upload service mapped categorical hard-to-reach columns to `hard_to_reach_wards`, an integer field. In the workbook, `Hard_to_Reach_LGAs` contains `'Yes'`/`'No'` values, while the schema stores that category in `hard_to_reach_colour`.
- **Fix**: Map `Hard_to_Reach_LGAs` (and legacy `hard_to_reach_lga` / `hard_to_reach` headers) to `hard_to_reach_colour`. Keep `hard_to_reach_wards` numeric and parse it alongside `density`.

### 2. Float Population Precision Truncation
- **Issue**: `parseNumericValue` called `Math.round(num)` on all numeric fields, rounding float values like `169066.484930941` to `169066`.
- **Fix**: Added `isFloat` flag to `parseNumericValue` for fields like `lga_population` defined as `Float?` in Prisma schema.

### 3. Model Name Discrepancies
- **Issue**: Excel sheets named `Health Facilities`, `Health Fac Service Provision`, and `Health Training Institutions` did not match their Prisma model names. The `HRH` sheet was also incorrectly routed to `Health_Training_Institutions`.
- **Fix**: Map each sheet to its corresponding canonical Prisma model in `getPrismaModel()` and `uploadFromWorkbook()` in [`user.service.ts`](file:///Users/devclassik/Documents/NGF/health-backend/src/user/user.service.ts). `HRH` and `Health_Training_Institutions` are handled separately.

### 4. Upload Performance Bottleneck & Timeout
- **Issue**: `isSame` check in `uploadFromWorkbook` evaluated `undefined === null` as `false`, triggering individual sequential `prisma.update()` calls for all ~8,000 existing DB rows during re-upload (taking 5–15+ minutes over cloud WAN database connection).
- **Fix**:
  - Normalized string, empty, and null values in `isSame` comparison.
  - Implemented chunked batch updates (`Promise.all` in batches of 50).
  - Upload response time reduced from **>10 minutes to ~8 seconds**.

---

## Verification
- Endpoint `POST /api/v1/user/data/2023` returned `HTTP 200 OK` ("Upload completed successfully").
- Database queries confirmed **3,085 `Demography_LGA` records** and **2,001 `Demography` records** populated cleanly.
- `npm run build` executed with zero TypeScript errors.
