# Trading Journal API - Phased Task Checklist (Express.js)

This checklist breaks down the API implementation into manageable phases with specific tasks.

---

## Phase 1: Core Journal Entry & Tag Management MVP

### 1.1. Database Setup

- **TradeJournalEntry Model** (`/src/database/models/tradeJournalEntry.model.js`)
    - **Identifiers & Core Info**
        - [x] `id`: `DataTypes.UUID` (Primary Key, default: `DataTypes.UUIDV4`)
        - [x] `userId`: `DataTypes.UUID` (ForeignKey to User model, `allowNull: false`)
        - [x] `tradeIdString`: `DataTypes.STRING`
        - [x] `executionDate`: `DataTypes.DATEONLY`
        - [x] `instrument`: `DataTypes.STRING` (`allowNull: false`)
        - [x] `assetClass`: `DataTypes.ENUM('Equity', 'Crypto', 'Forex', 'Futures', 'Options', 'Other')`
        - [x] `direction`: `DataTypes.ENUM('Long', 'Short')` (`allowNull: false`)    - **Pre-Trade Plan & Hypothesis (Section 0)**
        - [x] `planDateTime`: `DataTypes.DATE`
        - [x] `instrumentsWatched`: `DataTypes.JSONB` or `DataTypes.TEXT`
        - [x] `marketContextBias`: `DataTypes.ENUM('Bullish', 'Bearish', 'Neutral', 'Range-bound', 'Uncertain')`
        - [x] `tradeThesisCatalyst`: `DataTypes.TEXT`
        - [x] `setupConditions`: `DataTypes.JSONB`
        - [x] `plannedEntryZonePrice`: `DataTypes.DECIMAL(10, 4)`
        - [x] `plannedStopLossPrice`: `DataTypes.DECIMAL(10, 4)`
        - [x] `plannedTargetPrices`: `DataTypes.JSONB` or `DataTypes.TEXT`
        - [x] `plannedPositionSizeValue`: `DataTypes.DECIMAL(10, 4)`
        - [x] `plannedPositionSizeType`: `DataTypes.ENUM('Shares/Units', 'Percentage Account', 'Fixed Risk Amount', 'Lots')`
        - [x] `calculatedMaxRiskOnPlan`: `DataTypes.DECIMAL(10, 2)`
        - [x] `calculatedPotentialRewardTp1`: `DataTypes.DECIMAL(10, 2)`
        - [x] `plannedRiskRewardRatioTp1`: `DataTypes.DECIMAL(10, 2)`
        - [x] `confidenceInPlan`: `DataTypes.INTEGER`
        - [x] `invalidationConditions`: `DataTypes.TEXT`    - **Trade Execution Metadata (Section 1)**
        - [x] `strategyTags`: `DataTypes.JSONB`
        - [x] `primaryAnalysisTimeframe`: `DataTypes.STRING`
        - [x] `secondaryAnalysisTimeframes`: `DataTypes.JSONB`
        - [x] `screenshotSetupUrl`: `DataTypes.STRING`    - **Entry & Exit Execution Details (Section 2)**
        - [x] `entryDateTime`: `DataTypes.DATE` (`allowNull: false`)
        - [x] `actualEntryPrice`: `DataTypes.DECIMAL(10, 4)` (`allowNull: false`)
        - [x] `quantity`: `DataTypes.DECIMAL(10, 4)` (`allowNull: false`)
        - [x] `feesEntry`: `DataTypes.DECIMAL(10, 2)`
        - [x] `screenshotEntryUrl`: `DataTypes.STRING`
        - [x] `exitDateTime`: `DataTypes.DATE`
        - [x] `actualExitPrice`: `DataTypes.DECIMAL(10, 4)`
        - [x] `feesExit`: `DataTypes.DECIMAL(10, 2)`
        - [x] `screenshotExitUrl`: `DataTypes.STRING`
        - [x] `totalQuantityTraded`: `DataTypes.DECIMAL(10, 4)`
        - [x] `averageEntryPrice`: `DataTypes.DECIMAL(10, 4)`
        - [x] `averageExitPrice`: `DataTypes.DECIMAL(10, 4)`
        - [x] `grossPnlPerUnit`: `DataTypes.DECIMAL(10, 4)`
        - [x] `grossPnl`: `DataTypes.DECIMAL(10, 2)`
        - [x] `totalFees`: `DataTypes.DECIMAL(10, 2)`
        - [x] `netPnl`: `DataTypes.DECIMAL(10, 2)`
        - [x] `actualInitialRisk`: `DataTypes.DECIMAL(10, 2)`
        - [x] `rMultipleAchieved`: `DataTypes.DECIMAL(10, 2)`
        - [x] `tradeDurationMinutes`: `DataTypes.INTEGER`    - **Trade Outcome & Objective Review (Section 3)**
        - [x] `outcome`: `DataTypes.ENUM('Win', 'Loss', 'Breakeven', 'Pending')`
        - [x] `exitReasonTag`: `DataTypes.STRING`
        - [x] `initialSlHit`: `DataTypes.BOOLEAN`
        - [x] `initialTpHit`: `DataTypes.BOOLEAN`
        - [x] `maxAdverseExcursion`: `DataTypes.DECIMAL(10, 4)`
        - [x] `maxAdverseExcursionPercentage`: `DataTypes.DECIMAL(6, 4)`
        - [x] `maxFavorableExcursion`: `DataTypes.DECIMAL(10, 4)`
        - [x] `maxFavorableExcursionPercentage`: `DataTypes.DECIMAL(6, 4)`    - **Psychological & Behavioral Review (Section 4)**
        - [x] `confidenceInExecution`: `DataTypes.INTEGER`
        - [x] `dominantEmotionsPreTrade`: `DataTypes.JSONB`
        - [x] `dominantEmotionsDuringTrade`: `DataTypes.JSONB`
        - [x] `focusLevelDuringTrade`: `DataTypes.INTEGER`
        - [x] `followedPreTradePlan`: `DataTypes.BOOLEAN`
        - [x] `deviationType`: `DataTypes.ENUM('Entry', 'StopLoss', 'TargetProfit', 'PositionSize', 'EarlyExit', 'LateExit', 'Other', 'None')`
        - [x] `reasonForDeviation`: `DataTypes.TEXT`
        - [x] `impulseActionTaken`: `DataTypes.BOOLEAN`
        - [x] `impulseActionDescription`: `DataTypes.TEXT`
        - [x] `hesitationOn`: `DataTypes.ENUM('None', 'Entry', 'Exit', 'Both')`
        - [x] `reasonForHesitation`: `DataTypes.TEXT`
        - [x] `tradedPnlInsteadOfPlan`: `DataTypes.BOOLEAN`
        - [x] `dominantEmotionsPostTrade`: `DataTypes.JSONB`
        - [x] `satisfactionWithExecution`: `DataTypes.INTEGER`
        - [x] `externalStressorsImpact`: `DataTypes.BOOLEAN`
        - [x] `generalPsychologyNotes`: `DataTypes.TEXT`    - **Analysis, Learning & Improvement (Section 5)**
        - [x] `whatWentWell`: `DataTypes.TEXT`
        - [x] `whatWentWrong`: `DataTypes.TEXT`
        - [x] `primaryMistakeTags`: `DataTypes.JSONB`
        - [x] `rootCauseOfMistakes`: `DataTypes.TEXT`
        - [x] `keyLessonLearned`: `DataTypes.TEXT`
        - [x] `actionableImprovement`: `DataTypes.TEXT`
        - [x] `overallTradeRating`: `DataTypes.INTEGER`
        - [x] `additionalNotes`: `DataTypes.TEXT`
        - [x] `externalAnalysisLink`: `DataTypes.STRING`
    - [x] Define `userId` ForeignKey and association to User model.

- **UserCustomTag Model** (`/src/database/models/userCustomTag.model.js`)
    - [x] Fields: `id`, `userId`, `tagName`, `tagType` (`ENUM: 'strategy', 'emotion', 'mistake', 'exitReason', 'instrumentWatchlist', 'setupCondition'`)
    - [x] Define `userId` ForeignKey and association to User model.
    - [x] Add unique constraint on (`userId`, `tagName`, `tagType`).

- **Database Migrations** (`/src/database/migrations/`)
    - [x] Generate and run migration for `TradeJournalEntries` table.
    - [x] Generate and run migration for `UserCustomTags` table.

---

### 1.2. API Routes & Basic Structure (`/src/api/v1/journal/`)

- [x] Create new route module: `/src/api/v1/journal/index.js`
- [x] Define placeholder routes for Trade Journal Entries (POST, GET list, GET by ID, PUT, DELETE)
- [x] Define placeholder routes for User Custom Tags (GET by type, POST)
- [x] Integrate journal routes into the main API router (`/src/api/v1/index.js`)
- [x] Create placeholder controller files (e.g., `journal.controller.js`) and service files (e.g., `journal.service.js`)

---

### 1.3. Authentication & Authorization

- [x] Apply existing authentication middleware (JWT) to all new journal routes
- [x] Implement basic authorization middleware/checks to ensure users can only access/modify their own data (initial pass)

---

### 1.4. Trade Journal Entry - CRUD Operations

- **Service (`journal.service.js`):**
    - [x] `createTradeEntry` (save to DB, associate with userId)
    - [x] `getTradeEntriesByUserId` (fetch user's trades, basic pagination)
    - [x] `getTradeEntryByIdAndUserId`
    - [x] `updateTradeEntry` (ensure user owns the entry)
    - [x] `deleteTradeEntry` (ensure user owns the entry)
- **Controller (`journal.controller.js`):**
    - [x] Implement controller functions to call the corresponding service methods for Trade Journal Entry CRUD
- **Request Validation (Joi/express-validator):**
    - [x] Validation schema for POST `/trades` (creating a trade entry) - cover essential fields first
    - [x] Validation schema for PUT `/trades/:tradeId`

---

### 1.5. User Custom Tag - Basic Management

- **Service (`journal.service.js` or dedicated `tag.service.js`):**
    - [x] `getUserCustomTags` (filter by userId and tagType)
    - [x] `addUserCustomTag` (create tag for userId, ensure no duplicates per type)
- **Controller (`journal.controller.js` or dedicated `tag.controller.js`):**
    - [x] Implement controller functions for getting and adding custom tags
- **Request Validation:**
    - [x] Validation schema for POST `/tags` (`tagName`, `tagType`)
    - [x] Validation schema for GET `/tags` query parameters (`type`)

---

### 1.6. Image Handling (Basic - URL Storage)

- [x] For MVP, assume frontend sends image URLs (e.g., from a cloud service like Cloudinary/S3)
- [x] Ensure `screenshotSetupUrl`, `screenshotEntryUrl`, `screenshotExitUrl` fields in TradeJournalEntry model store these URLs
- [ ] If server-side upload is required for MVP:
    - [ ] Configure multer for image uploads
    - [ ] Implement basic logic to save files and store paths/URLs

---

### 1.7. Initial Testing (Postman/Integration)

- [ ] Perform basic API testing for all implemented Phase 1 endpoints using Postman or similar
- [ ] Write initial integration tests for core CRUD operations

---

## Phase 2: Advanced Features & Dashboard Support

### 2.1. Advanced Trade Entry Features

- **Refine Request Validation:**
    - [ ] Ensure comprehensive validation for all fields in TradeJournalEntry creation and updates
- **Complex Field Handling (Service Logic):**
    - [ ] If UserCustomTag IDs are stored in JSONB arrays in TradeJournalEntry (e.g., for strategyTags), ensure service logic validates these IDs against the UserCustomTag table upon creation/update
- **Advanced Filtering & Sorting for GET `/trades`:**
    - [ ] Enhance `getTradeEntriesByUserId` service to support filtering by:
        - Date range (`executionDate`)
        - Instrument
        - Strategy Tag(s)
        - Outcome
    - [ ] Enhance service to support sorting by various fields (e.g., `executionDate`, `netPnl`)
    - [ ] Add validation for these new query parameters

---

### 2.2. Dashboard Aggregation Logic (Services)

- **Implement Service Functions for Key Stats:**
    - [ ] `calculateTotalNetPnl(userId, dateRange)`
    - [ ] `calculateWinLossRatio(userId, dateRange)`
    - [ ] `calculateAverageRMultiple(userId, dateRange)`
- **Implement Service Functions for Chart Data:**
    - [ ] `getPnlByStrategy(userId, dateRange)`
    - [ ] `getPnlByInstrument(userId, dateRange)`
    - [ ] `getTradeCountByOutcome(userId, dateRange)`
    - [ ] `getEquityCurveData(userId, dateRange)`
    - [ ] `getRMultipleDistribution(userId, dateRange)`
    - [ ] `getMostFrequentMistakeTags(userId, dateRange)`
    - [ ] `calculateAdherenceToPlanPercentage(userId, dateRange)`

---

### 2.3. Dashboard API Endpoints

- [ ] Define and Implement Routes (`/src/api/v1/journal/stats/`):
    - [ ] GET `/summary` (for P&L, Win Rate, Avg R)
    - [ ] GET `/pnl-by-strategy`
    - [ ] GET `/equity-curve`
    - [ ] GET `/r-multiple-distribution`
    - [ ] (Add other stat-specific endpoints as needed)
- [ ] Implement Controller Functions:
    - [ ] Call corresponding aggregation service methods
    - [ ] Ensure userId scoping and date range filtering
- [ ] Request Validation:
    - [ ] Validate query parameters for stats endpoints (e.g., `dateFrom`, `dateTo`)

---

### 2.4. Testing for Phase 2

- [ ] Write integration tests for advanced filtering/sorting of trade lists
- [ ] Write integration tests for all dashboard/stats API endpoints with various parameters
- [ ] Unit test complex aggregation logic in services

---

## Phase 3: Refinements, Optimization & Final Testing

### 3.1. Error Handling & Logging

- [ ] Review and enhance error handling across all journal-related services and controllers for consistency and clarity
- [ ] Ensure detailed logging (Winston) is in place for:
    - All API requests to journal endpoints
    - Significant service operations
    - All errors and exceptions

---

### 3.2. Performance Optimization

- **Database Indexing:**
    - [ ] Review queries generated by Sequelize for dashboard aggregations and list filtering
    - [ ] Add necessary database indexes to TradeJournalEntries on: `userId`, `executionDate`, `instrument`, `outcome`
    - [ ] If using JSONB for tags and filtering on them, consider GIN indexes (PostgreSQL) or equivalent strategies for MySQL JSON searching
- **Query Optimization:**
    - [ ] Optimize any slow-running queries identified during testing

---

### 3.3. Security Review

- [ ] Double-check all authorization logic to prevent data leaks between users
- [ ] Ensure input sanitization is happening correctly (Sequelize helps, but review custom query parts if any)
- [ ] Review file upload security if implemented server-side

---

### 3.4. API Documentation

- [ ] Create or update API documentation (e.g., Postman Collection, Swagger/OpenAPI specs) for all new journal and stats endpoints, including request/response schemas and query parameters

---

### 3.5. Comprehensive Testing

- [ ] Full Integration Testing: Test all API endpoints thoroughly, including edge cases and error conditions
- [ ] Stress Testing (Optional but Recommended): Test dashboard endpoints under load if expecting many trades per user
- [ ] Security Testing (Optional): Perform basic security checks

---

### 3.6. Code Cleanup & Refactoring

- [ ] Review all new code for clarity, consistency with existing project patterns, and maintainability
- [ ] Remove any dead code or unnecessary comments
- [ ] Ensure environment variables are used for any configurable aspects
