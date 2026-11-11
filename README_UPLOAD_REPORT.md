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
| **Demography_LGA** | `Demography_LGA` | 3,091 | ✅ Success | Fixed column mapping for `Hard_to_Reach_Colour` -> `hard_to_reach_wards` (**578 hard-to-reach LGAs saved as 'Yes'**). Preserved float precision for `lga_population`. |
| **Health Facilities** | `HFcilities` | 888 | ✅ Fixed | Added alias mapping for `Health Facilities` -> `HFcilities` model. (Previously skipped due to model name spelling difference). |
| **Health Fac Service Provision** | `HFcilities_Service_Provision` | 1,602 | ✅ Fixed | Added alias mapping for `Health Fac Service Provision` -> `HFcilities_Service_Provision` model. |
| **Health Training Institutions** | `HRH` | 1,183 | ✅ Fixed | Added alias mapping for `Health Training Institutions` -> `HRH` model (`institution`, `ownership`, `value`). |
| **Admission Quota** | `Admission_Quota` | 481 | ✅ Success | Mapped `state`, `year`, `school`, `faculty`, `admission_quota`. |
| **Sheet2** | N/A | 0 | ℹ️ Skipped | Empty worksheet. |

---

### 2. `data.xlsx` (Full Multi-Sheet Dataset)

| Sheet Name | Mapped Model | Total Rows | Status | Issues & Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Demography** | `Demography` | 324 | ✅ Success | 324 state-level demography records processed. |
| **Partners_Mapping** | `Partners_Mapping` | 765 | ✅ Success | Mapped partner interventions per state/year. |
| **Demography_LGA** | `Demography_LGA` | 768 | ✅ Success | 768 LGA demography records processed. |
| **HFcilities** | `HFcilities` | 216 | ✅ Success | Health facilities count per level/ownership. |
| **HFcilities_Service_Provision** | `HFcilities_Service_Provision` | 324 | ✅ Success | Service provision counts & percentages. |
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
- **Issue**: In `NGF_Health_Dashboard_Data.xlsx`, the hard-to-reach column header was named `Hard_to_Reach_Colour` (`'Yes'`/`'No'`). The backend only looked for `hard_to_reach_wards`, causing all hard-to-reach values to be saved as `'No'` (0 hard-to-reach LGAs found in DB query).
- **Fix**: Updated [`script/seed-demography.js`](file:///Users/devclassik/Documents/NGF/health-backend/script/seed-demography.js) and [`src/user/user.service.ts`](file:///Users/devclassik/Documents/NGF/health-backend/src/user/user.service.ts) to recognize `Hard_to_Reach_Colour`, `hard_to_reach_lga`, and `hard_to_reach`. **578 hard-to-reach LGAs now correctly saved as `'Yes'`.**

### 2. Float Population Precision Truncation
- **Issue**: `parseNumericValue` called `Math.round(num)` on all numeric fields, rounding float values like `169066.484930941` to `169066`.
- **Fix**: Added `isFloat` flag to `parseNumericValue` for fields like `lga_population` defined as `Float?` in Prisma schema.

### 3. Model Name Spelling Discrepancies
- **Issue**: Excel sheets named `Health Facilities`, `Health Fac Service Provision`, and `Health Training Institutions` failed lookup against Prisma models (`HFcilities`, `HFcilities_Service_Provision`, `HRH`) and were silently skipped.
- **Fix**: Implemented sheet alias mapping in `getPrismaModel()` and `uploadFromWorkbook()` in [`user.service.ts`](file:///Users/devclassik/Documents/NGF/health-backend/src/user/user.service.ts).

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
