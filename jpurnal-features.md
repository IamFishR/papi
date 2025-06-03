# Trading Journal API - Task Checklist (Express.js)

This checklist outlines the tasks required to implement backend support for the Trading Journal feature in your Express.js API.

---

## Phase 1: Core Journal Entry & Tag Management

### 1.1. Database Modeling (`/src/database/models/`)

#### TradeJournalEntry Model (`tradeJournalEntry.js`)

**Identifiers & Core Info:**
- `id`: `DataTypes.UUID` (Primary Key, default: `DataTypes.UUIDV4`)
- `userId`: `DataTypes.UUID` (ForeignKey to User model, `allowNull: false`)
- `tradeIdString`: `DataTypes.STRING` (Optional, e.g., `"20250516-AAPL-001"`)
- `executionDate`: `DataTypes.DATEONLY` (e.g., `"2025-05-16"`)
- `instrument`: `DataTypes.STRING` (e.g., `"AAPL (Apple Inc.)"`, `allowNull: false`)
- `assetClass`: `DataTypes.ENUM('Equity', 'Crypto', 'Forex', 'Futures', 'Options', 'Other')`
- `direction`: `DataTypes.ENUM('Long', 'Short')` (`allowNull: false`)

**Pre-Trade Plan & Hypothesis:**
- `planDateTime`: `DataTypes.DATE`
- `instrumentsWatched`: `DataTypes.JSONB` (Array of strings) or `DataTypes.TEXT`
- `marketContextBias`: `DataTypes.ENUM('Bullish', 'Bearish', 'Neutral', 'Range-bound', 'Uncertain')`
- `tradeThesisCatalyst`: `DataTypes.TEXT`
- `setupConditions`: `DataTypes.JSONB` (Array of strings/objects)
- `plannedEntryZonePrice`: `DataTypes.DECIMAL(10, 4)`
- `plannedStopLossPrice`: `DataTypes.DECIMAL(10, 4)`
- `plannedTargetPrices`: `DataTypes.JSONB` (Array of objects) or `DataTypes.TEXT`
- `plannedPositionSizeValue`: `DataTypes.DECIMAL(10, 4)`
- `plannedPositionSizeType`: `DataTypes.ENUM('Shares/Units', 'Percentage Account', 'Fixed Risk Amount', 'Lots')`
- `calculatedMaxRiskOnPlan`: `DataTypes.DECIMAL(10, 2)`
- `calculatedPotentialRewardTp1`: `DataTypes.DECIMAL(10, 2)`
- `plannedRiskRewardRatioTp1`: `DataTypes.DECIMAL(10, 2)`
- `confidenceInPlan`: `DataTypes.INTEGER` (1-5 scale)
- `invalidationConditions`: `DataTypes.TEXT`

**Trade Execution Metadata:**
- `strategyTags`: `DataTypes.JSONB` (Array of strings)
- `primaryAnalysisTimeframe`: `DataTypes.STRING`
- `secondaryAnalysisTimeframes`: `DataTypes.JSONB` (Array of strings)
- `screenshotSetupUrl`: `DataTypes.STRING` (URL)

**Entry & Exit Execution Details:**
- `entryDateTime`: `DataTypes.DATE` (`allowNull: false`)
- `actualEntryPrice`: `DataTypes.DECIMAL(10, 4)` (`allowNull: false`)
- `quantity`: `DataTypes.DECIMAL(10, 4)` (`allowNull: false`)
- `feesEntry`: `DataTypes.DECIMAL(10, 2)`
- `screenshotEntryUrl`: `DataTypes.STRING`
- `exitDateTime`: `DataTypes.DATE`
- `actualExitPrice`: `DataTypes.DECIMAL(10, 4)`
- `feesExit`: `DataTypes.DECIMAL(10, 2)`
- `screenshotExitUrl`: `DataTypes.STRING`
- `totalQuantityTraded`: `DataTypes.DECIMAL(10, 4)`
- `averageEntryPrice`: `DataTypes.DECIMAL(10, 4)`
- `averageExitPrice`: `DataTypes.DECIMAL(10, 4)`
- `grossPnlPerUnit`: `DataTypes.DECIMAL(10, 4)`
- `grossPnl`: `DataTypes.DECIMAL(10, 2)`
- `totalFees`: `DataTypes.DECIMAL(10, 2)`
- `netPnl`: `DataTypes.DECIMAL(10, 2)` (`allowNull: false` if trade is closed)
- `actualInitialRisk`: `DataTypes.DECIMAL(10, 2)`
- `rMultipleAchieved`: `DataTypes.DECIMAL(10, 2)`
- `tradeDurationMinutes`: `DataTypes.INTEGER`

**Trade Outcome & Objective Review:**
- `outcome`: `DataTypes.ENUM('Win', 'Loss', 'Breakeven', 'Pending')`
- `exitReasonTag`: `DataTypes.STRING`
- `initialSlHit`: `DataTypes.BOOLEAN`
- `initialTpHit`: `DataTypes.BOOLEAN`
- `maxAdverseExcursion`: `DataTypes.DECIMAL(10, 4)`
- `maxAdverseExcursionPercentage`: `DataTypes.DECIMAL(6, 4)`
- `maxFavorableExcursion`: `DataTypes.DECIMAL(10, 4)`
- `maxFavorableExcursionPercentage`: `DataTypes.DECIMAL(6, 4)`

**Psychological & Behavioral Review:**
- `confidenceInExecution`: `DataTypes.INTEGER` (1-5 scale)
- `dominantEmotionsPreTrade`: `DataTypes.JSONB` (Array of strings)
- `dominantEmotionsDuringTrade`: `DataTypes.JSONB` (Array of strings)
- `focusLevelDuringTrade`: `DataTypes.INTEGER` (1-5 scale)
- `followedPreTradePlan`: `DataTypes.BOOLEAN`
- `deviationType`: `DataTypes.ENUM('Entry', 'StopLoss', 'TargetProfit', 'PositionSize', 'EarlyExit', 'LateExit', 'Other', 'None')`
- `reasonForDeviation`: `DataTypes.TEXT`
- `impulseActionTaken`: `DataTypes.BOOLEAN`
- `impulseActionDescription`: `DataTypes.TEXT`
- `hesitationOn`: `DataTypes.ENUM('None', 'Entry', 'Exit', 'Both')`
- `reasonForHesitation`: `DataTypes.TEXT`
- `tradedPnlInsteadOfPlan`: `DataTypes.BOOLEAN`
- `dominantEmotionsPostTrade`: `DataTypes.JSONB` (Array of strings)
- `satisfactionWithExecution`: `DataTypes.INTEGER` (1-5 scale)
- `externalStressorsImpact`: `DataTypes.BOOLEAN`
- `generalPsychologyNotes`: `DataTypes.TEXT`

**Analysis, Learning & Improvement:**
- `whatWentWell`: `DataTypes.TEXT`
- `whatWentWrong`: `DataTypes.TEXT`
- `primaryMistakeTags`: `DataTypes.JSONB` (Array of strings)
- `rootCauseOfMistakes`: `DataTypes.TEXT`
- `keyLessonLearned`: `DataTypes.TEXT`
- `actionableImprovement`: `DataTypes.TEXT`
- `overallTradeRating`: `DataTypes.INTEGER` (1-5 scale)
- `additionalNotes`: `DataTypes.TEXT`
- `externalAnalysisLink`: `DataTypes.STRING` (URL)

**Associations:**
- `TradeJournalEntry.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });`

#### UserCustomTag Model (`userCustomTag.js`) (Recommended for Scalability)

- `id`: `DataTypes.UUID` (Primary Key, default: `DataTypes.UUIDV4`)
- `userId`: `DataTypes.UUID` (ForeignKey to User model, `allowNull: false`)
- `tagName`: `DataTypes.STRING` (`allowNull: false`)
- `tagType`: `DataTypes.ENUM('strategy', 'emotion', 'mistake', 'exitReason', 'instrumentWatchlist', 'setupCondition')` (`allowNull: false`)

**Indexes:**
- Unique constraint on (`userId`, `tagName`, `tagType`)

**Associations:**
- `UserCustomTag.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });`

**Note:**  
Fields like `strategyTags`, `dominantEmotionsPreTrade`, `primaryMistakeTags`, `exitReasonTag` in `TradeJournalEntry` can store an array of `UserCustomTag` IDs or tag names. Storing IDs is more robust for renaming tags.

---

### 1.2. Database Migrations (`/src/database/migrations/`)

- [ ] Create migration for `TradeJournalEntries` table (reflecting all fields above).
- [ ] Create migration for `UserCustomTags` table (if implementing separate model).

---

### 1.3. API Routes (`/src/api/v1/`)

- [ ] Create a new route module: `/src/api/v1/journal/index.js`.
- [ ] Define routes for Trade Journal Entries:
    - `POST /api/v1/journal/trades` (Create a new trade entry)
    - `GET /api/v1/journal/trades` (Get list of user's trades with pagination, filtering, sorting)
    - `GET /api/v1/journal/trades/:tradeId` (Get a specific trade entry)
    - `PUT /api/v1/journal/trades/:tradeId` (Update a trade entry)
    - `DELETE /api/v1/journal/trades/:tradeId` (Delete a trade entry)
- [ ] Define routes for User Custom Tags:
    - `GET /api/v1/journal/tags?type={tagType}` (Get user's custom tags by type)
    - `POST /api/v1/journal/tags` (Add a new custom tag for the user)
- [ ] Integrate these routes into the main API router (`/src/api/v1/index.js`).

---

### 1.4. Controllers & Services

- [ ] **Journal Entry Controller & Service:**
    - Implement `createTradeEntry` function.
    - Implement `getTradeEntries` function (supports pagination, filtering, sorting).
    - Implement `getTradeEntryById` function.
    - Implement `updateTradeEntry` function.
    - Implement `deleteTradeEntry` function.
    - Ensure all operations are scoped to the authenticated `userId`.
- [ ] **Custom Tag Controller & Service:**
    - Implement `getUserCustomTags` function (filter by `tagType` and `userId`).
    - Implement `addUserCustomTag` function (ensure tag is unique per user per type).

---

### 1.5. Request Validation

- [ ] Define validation schema for creating a trade journal entry.
- [ ] Define validation schema for updating a trade journal entry.
- [ ] Define validation schema for query parameters in `GET /trades`.
- [ ] Define validation schema for creating a custom tag.

---

### 1.6. Authentication & Authorization

- [ ] Ensure all journal routes are protected by authentication middleware.
- [ ] Implement authorization logic:
    - Users can only CUD their own journal entries.
    - Users can only R/C their own custom tags.
    - For `GET /trades/:tradeId`, ensure the authenticated user owns the trade.

---

### 1.7. Image Handling (if storing screenshots on server)

- [ ] Configure multer for handling image uploads.
- [ ] Decide on storage strategy (local or cloud).
- [ ] Implement logic to save image paths/URLs to the model.
- [ ] Consider serving static files or ensuring URLs are correctly formed.
- [ ] Alternative: Frontend uploads to a dedicated image service, and API only stores the URL.

---

## Phase 2: Dashboard & Analytics Support

### 2.1. Aggregation Logic (in Services)

- [ ] Plan and implement service functions to calculate aggregated data for dashboards:
    - **Total Net P&L:** `SUM(netPnl)`
    - **Win/Loss Ratio:** `COUNT(CASE WHEN outcome = 'Win' THEN 1 END) / COUNT(CASE WHEN outcome = 'Loss' THEN 1 END)`
    - **Average R-Multiple:** `AVG(rMultipleAchieved)`
    - **P&L per Strategy Tag:** `SUM(netPnl) GROUP BY strategyTag`
    - **P&L per Instrument:** `SUM(netPnl) GROUP BY instrument`
    - **Count of trades by Outcome:** `COUNT(id) GROUP BY outcome`
    - **Most frequent Mistake Tags:** (Parsing JSON or querying junction table)
    - **Adherence to Plan %:** `AVG(CASE WHEN followedPreTradePlan = true THEN 1 ELSE 0 END) * 100`
    - **Equity Curve Data:** Ordered sum of `netPnl` by `executionDate`
    - **R-Multiple Distribution:** Bucketing `rMultipleAchieved` values

---

### 2.2. Dashboard API Endpoints (`/src/api/v1/journal/`)

- [ ] Define new routes for dashboard data:
    - `GET /api/v1/journal/stats/summary`
    - `GET /api/v1/journal/stats/pnl-by-strategy`
    - `GET /api/v1/journal/stats/equity-curve`
    - `GET /api/v1/journal/stats/r-multiple-distribution`
- [ ] Implement corresponding controller functions.
- [ ] Ensure endpoints respect `userId` for data scoping.
- [ ] Add validation for any query parameters (e.g., date ranges).

---

## Phase 3: Refinements & Testing

### 3.1. Error Handling

- [ ] Ensure consistent error responses with appropriate HTTP status codes.
- [ ] Implement centralized error handling middleware.

---

### 3.2. Logging (Winston)

- [ ] Add detailed logging for important operations, errors, and requests.

---

### 3.3. Performance Optimization

- [ ] Review complex Sequelize queries for performance.
- [ ] Add database indexes to `TradeJournalEntries` on frequently queried columns.
- [ ] Add database indexes to `UserCustomTags` table.

---

### 3.4. API Documentation

- [ ] Update API documentation (Swagger/OpenAPI, Postman collection) to include new journal endpoints.

---

### 3.5. Testing (`/src/tests/`)

- [ ] Write unit tests for service layer logic.
- [ ] Write integration tests for all new API endpoints:
    - Test CRUD operations for journal entries and custom tags.
    - Test dashboard/stats endpoints.
    - Test authentication and authorization.
    - Test request validation and error responses.
    - Test pagination, filtering, and sorting functionalities.

---

This checklist provides a structured approach for developing the Trading Journal API. Leverage your existing project patterns for consistency!