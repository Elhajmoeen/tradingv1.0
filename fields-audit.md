# Field Inventory Audit Report

Generated on: 2025-10-18T15:17:24.832Z

## Summary

- **Total Fields**: 1390
- **Static Fields**: 167
- **Dynamic Fields**: 1223
- **Domains**: 9

| Domain | Static | Dynamic | Total |
|--------|--------|---------|-------|
| misc | 48 | 507 | 555 |
| leads | 16 | 233 | 249 |
| positions | 37 | 125 | 162 |
| clients | 19 | 141 | 160 |
| transactions | 24 | 84 | 108 |
| users | 3 | 60 | 63 |
| emailTemplates | 2 | 36 | 38 |
| gateways | 9 | 22 | 31 |
| allowIp | 9 | 15 | 24 |

---

## Transactions Domain

| Field | Type | Classification | Sources |
|-------|------|----------------|---------|
| `accountId` | string | 🔒 Static | src\features\transactions_next\types\transaction.schema.ts:12, src\features\transactions_next\types\transaction.schema.ts:22, src\features\transactions_next\types\transaction.schema.ts:27 (+2 more) |
| `actionType` | enum | 🔒 Static | src\features\transactions_next\types\transaction.schema.ts:14, src\features\transactions_next\types\transaction.schema.ts:29 |
| `amount` | number | 🔒 Static | src\features\transactions_next\types\transaction.schema.ts:16, src\features\transactions_next\types\transaction.schema.ts:31, src\config\transactionColumns.ts:71 (+3 more) |
| `AMOUNT` | unknown | 🔒 Static | src\features\transactions_next\adapters\TransactionsAdapter.tsx:38 |
| `byClientId` | unknown | 🔒 Static | src\state\transactionsSlice.ts:7 |
| `clientId` | string | 🔒 Static | src\features\transactions_next\types\transaction.schema.ts:13, src\features\transactions_next\types\transaction.schema.ts:28, src\components\TransactionHistoryTable.tsx:6 (+2 more) |
| `createdAt` | string | 🔒 Static | src\features\transactions_next\types\transaction.schema.ts:18, src\features\transactions_next\types\transaction.schema.ts:33 |
| `createdAtISO` | unknown | 🔒 Static | src\state\transactionsSlice.ts:52, src\state\transactionsSlice.ts:58, src\state\transactionsSlice.ts:64 (+3 more) |
| `currency` | string | 🔒 Static | src\features\transactions_next\types\transaction.schema.ts:17, src\features\transactions_next\types\transaction.schema.ts:32 |
| `description` | unknown | 🔒 Static | src\config\transactionColumns.ts:73, src\state\transactionsSlice.ts:212 |
| `id` | string | 🔒 Static | src\features\transactions_next\types\transaction.schema.ts:11, src\features\transactions_next\types\transaction.schema.ts:26 |
| `initialState` | unknown | 🔒 Static | src\state\transactionsSlice.ts:10 |
| `kycStatus` | unknown | 🔒 Static | src\config\transactionColumns.ts:32, src\state\transactionsSlice.ts:163 |
| `leadStatus` | unknown | 🔒 Static | src\config\transactionColumns.ts:33, src\state\transactionsSlice.ts:164 |
| `netDeposits` | unknown | 🔒 Static | src\config\transactionColumns.ts:44, src\state\transactionsSlice.ts:179 |
| `paymentGateway` | unknown | 🔒 Static | src\config\transactionColumns.ts:48 |
| `paymentMethod` | unknown | 🔒 Static | src\config\transactionColumns.ts:74, src\state\transactionsSlice.ts:213 |
| `profileCreatedAt` | unknown | 🔒 Static | src\config\transactionColumns.ts:7, src\state\transactionsSlice.ts:138 |
| `retentionStatus` | unknown | 🔒 Static | src\config\transactionColumns.ts:31, src\state\transactionsSlice.ts:162 |
| `state` | unknown | 🔒 Static | src\state\transactionsSlice.ts:33, src\state\transactionsSlice.ts:34, src\state\transactionsSlice.ts:116 (+1 more) |
| `status` | unknown | 🔒 Static | src\config\transactionColumns.ts:8 |
| `subType` | enum | 🔒 Static | src\features\transactions_next\types\transaction.schema.ts:15, src\features\transactions_next\types\transaction.schema.ts:30 |
| `totalFtd` | unknown | 🔒 Static | src\config\transactionColumns.ts:37, src\state\transactionsSlice.ts:169 |
| `transactionType` | unknown | 🔒 Static | src\config\transactionColumns.ts:70, src\state\transactionsSlice.ts:209 |
| `800` | unknown | 🔧 Dynamic | src\features\transactions_next\adapters\TransactionsAdapter.tsx:205, src\features\transactions_next\adapters\TransactionsAdapter.tsx:206, src\features\transactions_next\adapters\TransactionsAdapter.tsx:207 (+2 more) |
| `accountType` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:14, src\state\transactionsSlice.ts:145 |
| `action` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:76, src\state\transactionsSlice.ts:18 |
| `addTransaction` | unknown | 🔧 Dynamic | src\state\transactionsSlice.ts:18 |
| `allowDeposit` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:63, src\state\transactionsSlice.ts:202 |
| `allowWithdraw` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:65, src\state\transactionsSlice.ts:204 |
| `allRows` | unknown | 🔧 Dynamic | src\state\transactionsSlice.ts:120 |
| `array` | unknown | 🔧 Dynamic | src\features\transactions_next\types\transaction.schema.ts:51 |
| `clearAllTransactions` | unknown | 🔧 Dynamic | src\state\transactionsSlice.ts:23 |
| `Client` | unknown | 🔧 Dynamic | src\state\transactionsSlice.ts:54, src\state\transactionsSlice.ts:59 |
| `comment` | string | 🔧 Dynamic | src\features\transactions_next\types\transaction.schema.ts:21, src\features\transactions_next\types\transaction.schema.ts:36 |
| `conversationAssignedAt` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:29, src\state\transactionsSlice.ts:160 |
| `conversationOwner` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:11, src\state\transactionsSlice.ts:142 |
| `createdBy` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:75, src\state\transactionsSlice.ts:214 |
| `createdById` | string | 🔧 Dynamic | src\features\transactions_next\types\transaction.schema.ts:19, src\features\transactions_next\types\transaction.schema.ts:34 |
| `createdByName` | string | 🔧 Dynamic | src\features\transactions_next\types\transaction.schema.ts:20, src\features\transactions_next\types\transaction.schema.ts:35 |
| `creditsOut` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:59, src\state\transactionsSlice.ts:198 |
| `customDocuments` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:110 |
| `data` | unknown | 🔧 Dynamic | src\features\transactions_next\adapters\TransactionsAdapter.tsx:54 |
| `dateConverted` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:28, src\state\transactionsSlice.ts:159 |
| `daysToDeposit` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:47, src\state\transactionsSlice.ts:182 |
| `daysToFtd` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:41, src\state\transactionsSlice.ts:174 |
| `daysToWithdrawal` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:53, src\state\transactionsSlice.ts:190 |
| `defaultVisible` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:6, src\config\transactionColumns.ts:7, src\config\transactionColumns.ts:8 (+67 more) |
| `depositLimit` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:64, src\state\transactionsSlice.ts:203 |
| `desk` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:9, src\state\transactionsSlice.ts:140 |
| `docCardBack` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:82, src\state\transactionsSlice.ts:225 |
| `docCardFront` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:81, src\state\transactionsSlice.ts:223 |
| `docIdPassport` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:79, src\state\transactionsSlice.ts:219 |
| `docProofOfAddress` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:80, src\state\transactionsSlice.ts:221 |
| `email` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:18, src\state\transactionsSlice.ts:149 |
| `false` | unknown | 🔧 Dynamic | src\state\transactionsSlice.ts:173 |
| `firstDepositDate` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:45, src\state\transactionsSlice.ts:180 |
| `firstLoginAt` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:22, src\state\transactionsSlice.ts:153 |
| `firstName` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:16, src\state\transactionsSlice.ts:147 |
| `firstTradedAt` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:26, src\state\transactionsSlice.ts:157 |
| `firstWithdrawalDate` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:51, src\state\transactionsSlice.ts:188 |
| `followUpAt` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:25, src\state\transactionsSlice.ts:156 |
| `fontFamily` | unknown | 🔧 Dynamic | src\components\TransactionHistoryTable.tsx:14, src\components\TransactionHistoryTable.tsx:18 |
| `ftd` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:39, src\state\transactionsSlice.ts:171 |
| `ftdDate` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:38, src\state\transactionsSlice.ts:170 |
| `ftdFirstConversation` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:42, src\state\transactionsSlice.ts:175 |
| `ftdSelf` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:40, src\state\transactionsSlice.ts:172 |
| `ftwDate` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:55, src\state\transactionsSlice.ts:192 |
| `ftwSelf` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:56, src\state\transactionsSlice.ts:193 |
| `hover` | unknown | 🔧 Dynamic | src\features\transactions_next\adapters\TransactionsAdapter.tsx:131, src\features\transactions_next\adapters\TransactionsAdapter.tsx:202, src\components\TransactionHistoryTable.tsx:40 (+3 more) |
| `last` | unknown | 🔧 Dynamic | src\components\TransactionHistoryTable.tsx:31 |
| `lastActivityAt` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:24, src\state\transactionsSlice.ts:155 |
| `lastCommentAt` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:21, src\state\transactionsSlice.ts:152 |
| `lastContactAt` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:20, src\state\transactionsSlice.ts:151 |
| `lastDepositDate` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:46, src\state\transactionsSlice.ts:181 |
| `lastLoginAt` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:23, src\state\transactionsSlice.ts:154 |
| `lastName` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:17, src\state\transactionsSlice.ts:148 |
| `lastTradedAt` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:27, src\state\transactionsSlice.ts:158 |
| `lastWithdrawalDate` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:52, src\state\transactionsSlice.ts:189 |
| `length` | unknown | 🔧 Dynamic | src\features\transactions_next\adapters\TransactionsAdapter.tsx:95 |
| `miniDeposit` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:66, src\state\transactionsSlice.ts:205 |
| `netCredits` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:58, src\state\transactionsSlice.ts:197 |
| `netWithdrawals` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:50, src\state\transactionsSlice.ts:187 |
| `NEXT` | unknown | 🔧 Dynamic | src\features\transactions_next\adapters\TransactionsAdapter.tsx:177 |
| `phoneNumber` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:19, src\state\transactionsSlice.ts:150 |
| `regulation` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:15, src\state\transactionsSlice.ts:146 |
| `result` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:87, src\config\transactionColumns.ts:95, src\config\transactionColumns.ts:103 |
| `retentionManager` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:13, src\state\transactionsSlice.ts:144 |
| `retentionOwner` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:12, src\state\transactionsSlice.ts:143 |
| `retentionReview` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:30, src\state\transactionsSlice.ts:161 |
| `salesManager` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:10, src\state\transactionsSlice.ts:141 |
| `salesReview` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:34, src\state\transactionsSlice.ts:165 |
| `TIME` | unknown | 🔧 Dynamic | src\features\transactions_next\adapters\TransactionsAdapter.tsx:39 |
| `totalChargebacks` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:60 |
| `totalCredits` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:57, src\state\transactionsSlice.ts:196 |
| `totalDeposits` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:43, src\state\transactionsSlice.ts:178 |
| `totalWithdrawals` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:49, src\state\transactionsSlice.ts:186 |
| `transaction` | unknown | 🔧 Dynamic | src\features\transactions_next\types\transaction.schema.ts:65 |
| `transactionFtd` | unknown | 🔧 Dynamic | src\state\transactionsSlice.ts:230 |
| `transactionFtw` | unknown | 🔧 Dynamic | src\state\transactionsSlice.ts:231 |
| `transactionId` | unknown | 🔧 Dynamic | src\state\transactionsSlice.ts:229 |
| `transactionsEntityColumns` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:4 |
| `true` | unknown | 🔧 Dynamic | src\state\transactionsSlice.ts:173 |
| `txDate` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:72 |
| `TYPE` | unknown | 🔧 Dynamic | src\features\transactions_next\adapters\TransactionsAdapter.tsx:35, src\features\transactions_next\adapters\TransactionsAdapter.tsx:36 |
| `withdrawFromDeposit` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:54 |
| `withdrawLimit` | unknown | 🔧 Dynamic | src\config\transactionColumns.ts:67, src\state\transactionsSlice.ts:206 |
| `Yes` | unknown | 🔧 Dynamic | src\components\TransactionHistoryTable.tsx:54 |

## Clients Domain

| Field | Type | Classification | Sources |
|-------|------|----------------|---------|
| `accountId` | unknown | 🔒 Static | src\config\clientColumns.ts:6 |
| `balance` | unknown | 🔒 Static | src\config\clientColumns.ts:158 |
| `clientId` | string | 🔒 Static | src\features\profile_next\types\client.schema.ts:52 |
| `createdAt` | string | 🔒 Static | src\features\profile_next\types\client.schema.ts:24, src\config\clientColumns.ts:7 |
| `id` | string | 🔒 Static | src\features\profile_next\types\client.schema.ts:16, src\features\profile_next\types\client.schema.ts:51 |
| `kycStatus` | unknown | 🔒 Static | src\config\clientColumns.ts:54 |
| `leadStatus` | unknown | 🔒 Static | src\features\profile_next\types\client.schema.ts:26, src\features\profile_next\types\client.schema.ts:46, src\config\clientColumns.ts:55 |
| `netDeposits` | unknown | 🔒 Static | src\config\clientColumns.ts:69 |
| `openPnl` | unknown | 🔒 Static | src\config\clientColumns.ts:160 |
| `paymentGateway` | unknown | 🔒 Static | src\config\clientColumns.ts:73 |
| `registeredIp` | unknown | 🔒 Static | src\config\clientColumns.ts:17 |
| `retentionStatus` | unknown | 🔒 Static | src\config\clientColumns.ts:51 |
| `state` | unknown | 🔒 Static | src\config\clientColumns.ts:96, src\fieldkit\useProfileField.ts:18 |
| `status` | enum | 🔒 Static | src\features\profile_next\types\client.schema.ts:55, src\config\clientColumns.ts:15 |
| `swapType` | unknown | 🔒 Static | src\config\clientColumns.ts:148 |
| `totalFtd` | unknown | 🔒 Static | src\config\clientColumns.ts:60 |
| `totalPnl` | unknown | 🔒 Static | src\config\clientColumns.ts:161 |
| `utmAccountId` | unknown | 🔒 Static | src\config\clientColumns.ts:129 |
| `zipCode` | unknown | 🔒 Static | src\config\clientColumns.ts:94 |
| `accountType` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:14 |
| `address` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:92 |
| `address1` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:93 |
| `age` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:28 |
| `allowDeposit` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:143 |
| `allowed2fa` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:144 |
| `allowedToTrade` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:139 |
| `allowWithdraw` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:141 |
| `blockNotifications` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:138 |
| `callAttempts` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:44 |
| `campaignId` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:109 |
| `campaignSource` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:114 |
| `citizen` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:30 |
| `city` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:95 |
| `clientColumnDefinitions` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:4 |
| `clients` | unknown | 🔧 Dynamic | src\features\profile_next\types\client.schema.ts:67 |
| `closedPositionsCount` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:168 |
| `closedVolume` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:170 |
| `closedVolumeCount` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:169 |
| `commodities` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:153 |
| `conversationAssignedAt` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:47 |
| `conversationOwner` | string | 🔧 Dynamic | src\features\profile_next\types\client.schema.ts:11, src\config\clientColumns.ts:10 |
| `country` | string | 🔧 Dynamic | src\features\profile_next\types\client.schema.ts:22, src\features\profile_next\types\client.schema.ts:36, src\config\clientColumns.ts:25 |
| `countryAddress` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:97 |
| `countryCode` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:26 |
| `creditCardBack` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:106 |
| `creditCardFront` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:105 |
| `creditsOut` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:88 |
| `crypto` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:152 |
| `data` | unknown | 🔧 Dynamic | src\features\profile_next\types\client.schema.ts:74, src\features\profile_next\types\client.schema.ts:75, src\features\profile_next\types\client.schema.ts:76 (+2 more) |
| `dateConverted` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:46 |
| `dateOfBirth` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:27 |
| `dateOfBirthDuplicate` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:99 |
| `daysToDeposit` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:72 |
| `daysToFtd` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:64 |
| `daysToWithdrawal` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:80 |
| `defaultVisible` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:6, src\config\clientColumns.ts:7, src\config\clientColumns.ts:8 (+133 more) |
| `depositLimit` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:142 |
| `desk` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:8 |
| `dob` | string | 🔧 Dynamic | src\features\profile_next\types\client.schema.ts:23, src\features\profile_next\types\client.schema.ts:37 |
| `dod` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:100 |
| `email` | string | 🔧 Dynamic | src\features\profile_next\types\client.schema.ts:19, src\features\profile_next\types\client.schema.ts:33, src\config\clientColumns.ts:22 |
| `enableLogin` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:137 |
| `equity` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:164 |
| `firstConversationOwner` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:11 |
| `firstDepositDate` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:70 |
| `firstLoginAt` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:35 |
| `firstName` | string | 🔧 Dynamic | src\features\profile_next\types\client.schema.ts:17, src\features\profile_next\types\client.schema.ts:31, src\config\clientColumns.ts:20 |
| `firstTradedAt` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:39 |
| `firstWithdrawalDate` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:78 |
| `followUpAt` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:38 |
| `forex` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:151 |
| `freeMargin` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:162 |
| `ftd` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:62 |
| `ftdDate` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:61 |
| `ftdFirstConversation` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:65 |
| `ftdSelf` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:63 |
| `ftwDate` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:82 |
| `ftwSelf` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:83 |
| `gclid` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:122 |
| `gender` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:29 |
| `idPassport` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:103 |
| `indices` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:154 |
| `key` | unknown | 🔧 Dynamic | src\fieldkit\useProfileField.ts:30, src\fieldkit\useProfileField.ts:41 |
| `language` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:31 |
| `lastActivityAt` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:37 |
| `lastContactAt` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:34 |
| `lastDepositDate` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:71 |
| `lastLogin` | string | 🔧 Dynamic | src\features\profile_next\types\client.schema.ts:25 |
| `lastLoginAt` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:36 |
| `lastName` | string | 🔧 Dynamic | src\features\profile_next\types\client.schema.ts:18, src\features\profile_next\types\client.schema.ts:32, src\config\clientColumns.ts:21 |
| `lastTradedAt` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:40 |
| `lastWithdrawalDate` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:79 |
| `leadSource` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:111 |
| `limit` | number | 🔧 Dynamic | src\features\profile_next\types\client.schema.ts:70 |
| `loginCount` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:45 |
| `margin` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:163 |
| `marginCall` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:145 |
| `marginLevel` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:159 |
| `miniDeposit` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:146 |
| `name` | string | 🔧 Dynamic | src\features\profile_next\types\client.schema.ts:54 |
| `nationality` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:98 |
| `netCredits` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:87 |
| `netWithdrawals` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:77 |
| `newValue` | unknown | 🔧 Dynamic | src\fieldkit\useProfileField.ts:24, src\fieldkit\useProfileField.ts:36 |
| `noAnswerCount` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:43 |
| `notes` | string | 🔧 Dynamic | src\features\profile_next\types\client.schema.ts:58 |
| `openPositionsCount` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:167 |
| `openVolume` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:171 |
| `owner` | string | 🔧 Dynamic | src\features\profile_next\types\client.schema.ts:10 |
| `owners` | unknown | 🔧 Dynamic | src\features\profile_next\types\client.schema.ts:27, src\features\profile_next\types\client.schema.ts:47 |
| `page` | number | 🔧 Dynamic | src\features\profile_next\types\client.schema.ts:69 |
| `phoneCC` | string | 🔧 Dynamic | src\features\profile_next\types\client.schema.ts:20, src\features\profile_next\types\client.schema.ts:34 |
| `phoneNumber` | string | 🔧 Dynamic | src\features\profile_next\types\client.schema.ts:21, src\features\profile_next\types\client.schema.ts:35, src\config\clientColumns.ts:23 |
| `phoneNumber2` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:24 |
| `platform` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:133 |
| `proofOfAddress` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:104 |
| `regulation` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:16 |
| `requirementText` | string | 🔧 Dynamic | src\features\profile_next\types\client.schema.ts:63 |
| `retentionAssignedAt` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:48 |
| `retentionManager` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:13 |
| `retentionOwner` | string | 🔧 Dynamic | src\features\profile_next\types\client.schema.ts:12, src\config\clientColumns.ts:12 |
| `retentionReview` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:52 |
| `reviewedAt` | string | 🔧 Dynamic | src\features\profile_next\types\client.schema.ts:57 |
| `salesManager` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:9 |
| `salesReview` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:56 |
| `salesSecondHand` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:57 |
| `secondHandRetention` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:53 |
| `setValue` | unknown | 🔧 Dynamic | src\fieldkit\useProfileField.ts:51 |
| `setValueOptimistic` | unknown | 🔧 Dynamic | src\fieldkit\useProfileField.ts:52 |
| `stocks` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:155 |
| `stopOut` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:147 |
| `tag` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:110 |
| `total` | number | 🔧 Dynamic | src\features\profile_next\types\client.schema.ts:68 |
| `totalChargebacks` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:89 |
| `totalCredits` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:86 |
| `totalDeposits` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:68 |
| `totalWithdrawals` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:76 |
| `type` | enum | 🔧 Dynamic | src\features\profile_next\types\client.schema.ts:53, src\features\profile_next\types\client.schema.ts:62 |
| `uploadedAt` | string | 🔧 Dynamic | src\features\profile_next\types\client.schema.ts:56 |
| `utmAccount` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:128 |
| `utmAdGroupId` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:117 |
| `utmAdGroupName` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:132 |
| `utmAdPosition` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:118 |
| `utmCampaign` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:130 |
| `utmCampaignId` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:131 |
| `utmContent` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:126 |
| `utmCountry` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:119 |
| `utmCreative` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:115 |
| `utmDevice` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:134 |
| `utmFeedItemId` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:120 |
| `utmKeyword` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:112 |
| `utmLandingPage` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:125 |
| `utmLanguage` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:124 |
| `utmMatchType` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:123 |
| `utmMedium` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:113 |
| `utmSource` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:127 |
| `utmTargetId` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:121 |
| `utmTerm` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:116 |
| `withdrawFromDeposit` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:81 |
| `withdrawLimit` | unknown | 🔧 Dynamic | src\config\clientColumns.ts:140 |

## Positions Domain

| Field | Type | Classification | Sources |
|-------|------|----------------|---------|
| `accountId` | string | 🔒 Static | src\features\positions_next\types\position.schema.ts:13, src\features\positions_next\types\position.schema.ts:31, src\config\testPositionColumns.ts:5 (+9 more) |
| `accountIdFilter` | unknown | 🔒 Static | src\state\positionsSlice.ts:456, src\state\positionsSlice.ts:541, src\state\positionsSlice.ts:601 |
| `amount` | unknown | 🔒 Static | src\features\positions_next\types\position.schema.ts:87, src\config\positionColumns.ts:18, src\config\positionColumns.ts:37 (+23 more) |
| `amountUnits` | number | 🔒 Static | src\features\positions_next\types\position.schema.ts:17 |
| `balance` | unknown | 🔒 Static | src\config\positionColumns.ts:129, src\config\positionColumns.ts:197, src\state\positionsSlice.ts:430 (+1 more) |
| `clientId` | string | 🔒 Static | src\features\positions_next\types\position.schema.ts:14, src\state\positionsSlice.ts:46, src\state\positionsSlice.ts:66 (+12 more) |
| `closedAt` | unknown | 🔒 Static | src\features\positions_next\types\position.schema.ts:102, src\config\positionColumns.ts:220, src\components\positions\OpenPositionsTable.tsx:321 (+4 more) |
| `closedPrice` | unknown | 🔒 Static | src\features\positions_next\types\position.schema.ts:90, src\config\positionColumns.ts:39, src\config\positionColumns.ts:160 (+8 more) |
| `closeIp` | unknown | 🔒 Static | src\config\positionColumns.ts:51, src\config\positionColumns.ts:172, src\config\positionColumns.ts:221 (+5 more) |
| `closePrice` | number | 🔒 Static | src\features\positions_next\types\position.schema.ts:27 |
| `commission` | number | 🔒 Static | src\features\positions_next\types\position.schema.ts:22, src\features\positions_next\types\position.schema.ts:97, src\config\positionColumns.ts:27 (+16 more) |
| `createdAt` | unknown | 🔒 Static | src\config\positionColumns.ts:111, src\config\positionColumns.ts:179, src\state\positionsSlice.ts:412 (+2 more) |
| `currentPrice` | number | 🔒 Static | src\features\positions_next\types\position.schema.ts:21, src\features\positions_next\types\position.schema.ts:89, src\config\positionColumns.ts:21 (+16 more) |
| `id` | string | 🔒 Static | src\features\positions_next\types\position.schema.ts:12, src\config\positionColumns.ts:15, src\config\positionColumns.ts:34 (+2 more) |
| `initialState` | unknown | 🔒 Static | src\state\positionsSlice.ts:42 |
| `instrument` | string | 🔒 Static | src\features\positions_next\types\position.schema.ts:15, src\features\positions_next\types\position.schema.ts:85, src\config\testPositionColumns.ts:8 (+23 more) |
| `kycStatus` | unknown | 🔒 Static | src\config\positionColumns.ts:91, src\config\positionColumns.ts:126, src\config\positionColumns.ts:194 (+3 more) |
| `limitPrice` | unknown | 🔒 Static | src\config\positionColumns.ts:98 |
| `openedAt` | unknown | 🔒 Static | src\features\positions_next\types\position.schema.ts:101, src\config\positionColumns.ts:66, src\components\positions\PendingPositionsTable.tsx:239 (+11 more) |
| `openIp` | unknown | 🔒 Static | src\config\positionColumns.ts:26, src\config\positionColumns.ts:50, src\config\positionColumns.ts:147 (+10 more) |
| `openPnl` | unknown | 🔒 Static | src\config\positionColumns.ts:146 |
| `openPnL` | unknown | 🔒 Static | src\features\positions_next\types\position.schema.ts:95, src\config\positionColumns.ts:25, src\components\positions\OpenPositionsTable.tsx:247 (+5 more) |
| `openPrice` | number | 🔒 Static | src\features\positions_next\types\position.schema.ts:18, src\features\positions_next\types\position.schema.ts:88, src\config\positionColumns.ts:20 (+24 more) |
| `pnlWithout` | unknown | 🔒 Static | src\features\positions_next\types\position.schema.ts:96, src\config\positionColumns.ts:42, src\config\positionColumns.ts:163 (+5 more) |
| `positionAmount` | unknown | 🔒 Static | src\state\positionsSlice.ts:589 |
| `positionCreatedAt` | unknown | 🔒 Static | src\config\positionColumns.ts:104 |
| `positionCurrentPrice` | unknown | 🔒 Static | src\state\positionsSlice.ts:591 |
| `positionOpenedAt` | unknown | 🔒 Static | src\state\positionsSlice.ts:596 |
| `positionOpenPrice` | unknown | 🔒 Static | src\state\positionsSlice.ts:590 |
| `profileCreatedAt` | unknown | 🔒 Static | src\config\positionColumns.ts:73 |
| `retentionStatus` | unknown | 🔒 Static | src\config\positionColumns.ts:90, src\config\positionColumns.ts:128, src\config\positionColumns.ts:196 (+3 more) |
| `side` | enum | 🔒 Static | src\features\positions_next\types\position.schema.ts:16, src\components\positions\PendingPositionsTable.tsx:74, src\components\positions\PendingPositionsTable.tsx:97 (+2 more) |
| `state` | unknown | 🔒 Static | src\features\positions_next\adapters\PendingPositionsAdapter.tsx:63, src\features\positions_next\adapters\OpenPositionsAdapter.tsx:63, src\features\positions_next\adapters\ClosedPositionsAdapter.tsx:63 (+15 more) |
| `status` | enum | 🔒 Static | src\features\positions_next\types\position.schema.ts:26, src\features\positions_next\types\position.schema.ts:100, src\state\positionsSlice.ts:30 (+10 more) |
| `swap` | number | 🔒 Static | src\features\positions_next\types\position.schema.ts:23, src\features\positions_next\types\position.schema.ts:98, src\config\positionColumns.ts:28 (+16 more) |
| `totalPnl` | unknown | 🔒 Static | src\config\positionColumns.ts:150 |
| `totalPnL` | unknown | 🔒 Static | src\features\positions_next\types\position.schema.ts:99, src\config\positionColumns.ts:29, src\config\positionColumns.ts:43 (+12 more) |
| `100` | unknown | 🔧 Dynamic | src\components\positions\PendingPositionsTable.tsx:412, src\components\positions\PendingPositionsTable.tsx:440, src\components\positions\OpenPositionsTable.tsx:445 (+3 more) |
| `10T08` | unknown | 🔧 Dynamic | src\state\positionsSlice.ts:152 |
| `11T14` | unknown | 🔧 Dynamic | src\state\positionsSlice.ts:127 |
| `11T16` | unknown | 🔧 Dynamic | src\state\positionsSlice.ts:153 |
| `12T09` | unknown | 🔧 Dynamic | src\state\positionsSlice.ts:62, src\state\positionsSlice.ts:128 |
| `12T10` | unknown | 🔧 Dynamic | src\state\positionsSlice.ts:82 |
| `12T11` | unknown | 🔧 Dynamic | src\state\positionsSlice.ts:101 |
| `12T15` | unknown | 🔧 Dynamic | src\state\positionsSlice.ts:169 |
| `13T09` | unknown | 🔧 Dynamic | src\state\positionsSlice.ts:184 |
| `13T14` | unknown | 🔧 Dynamic | src\state\positionsSlice.ts:199 |
| `15T23` | unknown | 🔧 Dynamic | src\state\positionsSlice.ts:170 |
| `16T18` | unknown | 🔧 Dynamic | src\state\positionsSlice.ts:185 |
| `17T12` | unknown | 🔧 Dynamic | src\state\positionsSlice.ts:200 |
| `600` | unknown | 🔧 Dynamic | src\components\positions\PendingPositionsTable.tsx:128, src\components\positions\OpenPositionsTable.tsx:128, src\components\positions\OpenPositionsTable.tsx:401 (+3 more) |
| `900` | unknown | 🔧 Dynamic | src\components\positions\PendingPositionsTable.tsx:366, src\components\positions\OpenPositionsTable.tsx:386 |
| `accountType` | unknown | 🔧 Dynamic | src\config\positionColumns.ts:77, src\config\positionColumns.ts:114, src\config\positionColumns.ts:182 (+3 more) |
| `active` | unknown | 🔧 Dynamic | src\components\positions\PendingPositionsTable.tsx:76, src\components\positions\OpenPositionsTable.tsx:76 |
| `addPosition` | unknown | 🔧 Dynamic | src\state\positionsSlice.ts:212 |
| `bulkUpdatePositions` | unknown | 🔧 Dynamic | src\state\positionsSlice.ts:249 |
| `Buy` | unknown | 🔧 Dynamic | src\features\positions_next\types\position.schema.ts:86 |
| `checked` | unknown | 🔧 Dynamic | src\components\positions\PendingPositionsTable.tsx:256, src\components\positions\PendingPositionsTable.tsx:266, src\components\positions\OpenPositionsTable.tsx:262 (+3 more) |
| `children` | unknown | 🔧 Dynamic | src\components\positions\PendingPositionsTable.tsx:46, src\components\positions\OpenPositionsTable.tsx:46, src\components\positions\ClosedPositionsTable.tsx:66 |
| `clearAllPositions` | unknown | 🔧 Dynamic | src\state\positionsSlice.ts:244 |
| `closed` | unknown | 🔧 Dynamic | src\state\positionsSlice.ts:38, src\state\positionsSlice.ts:104, src\state\positionsSlice.ts:218 |
| `closedId` | unknown | 🔧 Dynamic | src\config\positionColumns.ts:204, src\state\positionsSlice.ts:519 |
| `closedPositionsAllColumns` | unknown | 🔧 Dynamic | src\config\positionColumns.ts:176 |
| `closedPositionsColumns` | unknown | 🔧 Dynamic | src\config\positionColumns.ts:33 |
| `closedPositionsEntityColumns` | unknown | 🔧 Dynamic | src\config\positionColumns.ts:154 |
| `closeReason` | string | 🔧 Dynamic | src\features\positions_next\types\position.schema.ts:29, src\features\positions_next\types\position.schema.ts:94, src\config\positionColumns.ts:47 (+7 more) |
| `closeTime` | string | 🔧 Dynamic | src\features\positions_next\types\position.schema.ts:28 |
| `closeVolume` | unknown | 🔧 Dynamic | src\config\positionColumns.ts:49, src\config\positionColumns.ts:170, src\config\positionColumns.ts:211 (+7 more) |
| `colId` | unknown | 🔧 Dynamic | src\components\positions\ClosedPositionsTable.tsx:186, src\components\positions\ClosedPositionsTable.tsx:238 |
| `columnId` | unknown | 🔧 Dynamic | src\components\positions\PendingPositionsTable.tsx:28, src\components\positions\PendingPositionsTable.tsx:48, src\components\positions\PendingPositionsTable.tsx:282 (+14 more) |
| `columns` | unknown | 🔧 Dynamic | src\config\testPositionColumns.ts:15 |
| `contains` | unknown | 🔧 Dynamic | src\components\positions\PendingPositionsTable.tsx:205, src\components\positions\OpenPositionsTable.tsx:195, src\components\positions\ClosedPositionsTable.tsx:260 |
| `coordinateGetter` | unknown | 🔧 Dynamic | src\components\positions\PendingPositionsTable.tsx:181, src\components\positions\OpenPositionsTable.tsx:171 |
| `count` | unknown | 🔧 Dynamic | src\features\positions_next\adapters\ConfirmClosePositionsModalAdapter.tsx:12 |
| `data` | unknown | 🔧 Dynamic | src\features\positions_next\types\position.schema.ts:71, src\features\positions_next\types\position.schema.ts:72, src\features\positions_next\adapters\PendingPositionsAdapter.tsx:16 (+2 more) |
| `day` | unknown | 🔧 Dynamic | src\components\positions\PendingPositionsTable.tsx:149, src\components\positions\PendingPositionsTable.tsx:304, src\components\positions\ClosedPositionsTable.tsx:53 |
| `default` | unknown | 🔧 Dynamic | src\components\positions\PendingPositionsTable.tsx:221, src\components\positions\PendingPositionsTable.tsx:472, src\components\positions\OpenPositionsTable.tsx:211 (+4 more) |
| `defaultVisible` | unknown | 🔧 Dynamic | src\config\testPositionColumns.ts:5, src\config\testPositionColumns.ts:6, src\config\testPositionColumns.ts:7 (+176 more) |
| `desk` | unknown | 🔧 Dynamic | src\config\positionColumns.ts:74, src\config\positionColumns.ts:112, src\config\positionColumns.ts:180 (+3 more) |
| `distance` | unknown | 🔧 Dynamic | src\components\positions\PendingPositionsTable.tsx:180, src\components\positions\OpenPositionsTable.tsx:170 |
| `element` | unknown | 🔧 Dynamic | src\components\positions\PendingPositionsTable.tsx:48, src\components\positions\PendingPositionsTable.tsx:282, src\components\positions\OpenPositionsTable.tsx:48 (+3 more) |
| `email` | unknown | 🔧 Dynamic | src\config\positionColumns.ts:81, src\config\positionColumns.ts:119, src\config\positionColumns.ts:187 (+3 more) |
| `endsWith` | unknown | 🔧 Dynamic | src\components\positions\PendingPositionsTable.tsx:211, src\components\positions\OpenPositionsTable.tsx:201, src\components\positions\ClosedPositionsTable.tsx:266 |
| `entityNamePlural` | unknown | 🔧 Dynamic | src\config\testPositionColumns.ts:14 |
| `entityNameSingular` | unknown | 🔧 Dynamic | src\config\testPositionColumns.ts:13 |
| `entityType` | unknown | 🔧 Dynamic | src\config\testPositionColumns.ts:12 |
| `equals` | unknown | 🔧 Dynamic | src\components\positions\PendingPositionsTable.tsx:207, src\components\positions\OpenPositionsTable.tsx:197, src\components\positions\ClosedPositionsTable.tsx:262 |
| `equity` | unknown | 🔧 Dynamic | src\config\positionColumns.ts:133, src\config\positionColumns.ts:201, src\state\positionsSlice.ts:434 (+1 more) |
| `event` | unknown | 🔧 Dynamic | src\components\positions\PendingPositionsTable.tsx:184, src\components\positions\OpenPositionsTable.tsx:174 |
| `expirationDate` | unknown | 🔧 Dynamic | src\features\positions_next\types\position.schema.ts:103, src\config\positionColumns.ts:65, src\config\positionColumns.ts:103 (+5 more) |
| `expirationTime` | string | 🔧 Dynamic | src\features\positions_next\types\position.schema.ts:30 |
| `filter` | unknown | 🔧 Dynamic | src\components\positions\PendingPositionsTable.tsx:287, src\components\positions\OpenPositionsTable.tsx:293, src\components\positions\ClosedPositionsTable.tsx:292 |
| `firstName` | unknown | 🔧 Dynamic | src\config\testPositionColumns.ts:6, src\config\positionColumns.ts:79, src\config\positionColumns.ts:117 (+4 more) |
| `firstTradedAt` | unknown | 🔧 Dynamic | src\config\positionColumns.ts:87, src\config\positionColumns.ts:122, src\config\positionColumns.ts:190 (+3 more) |
| `focus` | unknown | 🔧 Dynamic | src\components\positions\PendingPositionsTable.tsx:334, src\components\positions\PendingPositionsTable.tsx:361, src\components\positions\OpenPositionsTable.tsx:354 (+3 more) |
| `followUpAt` | unknown | 🔧 Dynamic | src\config\positionColumns.ts:86, src\config\positionColumns.ts:125, src\config\positionColumns.ts:193 (+3 more) |
| `freeMargin` | unknown | 🔧 Dynamic | src\config\positionColumns.ts:131, src\config\positionColumns.ts:199, src\state\positionsSlice.ts:432 (+1 more) |
| `hour` | unknown | 🔧 Dynamic | src\components\positions\PendingPositionsTable.tsx:150, src\components\positions\PendingPositionsTable.tsx:305, src\components\positions\ClosedPositionsTable.tsx:54 |
| `hover` | unknown | 🔧 Dynamic | src\components\positions\PendingPositionsTable.tsx:81, src\components\positions\PendingPositionsTable.tsx:104, src\components\positions\PendingPositionsTable.tsx:353 (+18 more) |
| `ids` | unknown | 🔧 Dynamic | src\components\positions\PendingPositionsTable.tsx:30, src\components\positions\OpenPositionsTable.tsx:30 |
| `lastActivityAt` | unknown | 🔧 Dynamic | src\config\positionColumns.ts:85, src\config\positionColumns.ts:124, src\config\positionColumns.ts:192 (+3 more) |
| `lastCommentAt` | unknown | 🔧 Dynamic | src\config\positionColumns.ts:84, src\state\positionsSlice.ts:576 |
| `lastContactAt` | unknown | 🔧 Dynamic | src\config\positionColumns.ts:83, src\config\positionColumns.ts:121, src\config\positionColumns.ts:189 (+3 more) |
| `lastName` | unknown | 🔧 Dynamic | src\config\positionColumns.ts:80, src\config\positionColumns.ts:118, src\config\positionColumns.ts:186 (+3 more) |
| `lastTradedAt` | unknown | 🔧 Dynamic | src\config\positionColumns.ts:88, src\config\positionColumns.ts:123, src\config\positionColumns.ts:191 (+3 more) |
| `length` | unknown | 🔧 Dynamic | src\components\positions\PendingPositionsTable.tsx:422, src\components\positions\OpenPositionsTable.tsx:455, src\components\positions\ClosedPositionsTable.tsx:444 |
| `marginLevel` | unknown | 🔧 Dynamic | src\config\positionColumns.ts:130, src\config\positionColumns.ts:198, src\state\positionsSlice.ts:431 (+1 more) |
| `maximumFractionDigits` | unknown | 🔧 Dynamic | src\components\positions\PendingPositionsTable.tsx:118, src\components\positions\OpenPositionsTable.tsx:118, src\components\positions\ClosedPositionsTable.tsx:22 |
| `minimumFractionDigits` | unknown | 🔧 Dynamic | src\components\positions\PendingPositionsTable.tsx:118, src\components\positions\OpenPositionsTable.tsx:118, src\components\positions\ClosedPositionsTable.tsx:22 |
| `minute` | unknown | 🔧 Dynamic | src\components\positions\PendingPositionsTable.tsx:151, src\components\positions\PendingPositionsTable.tsx:306, src\components\positions\ClosedPositionsTable.tsx:55 |
| `minWidth` | unknown | 🔧 Dynamic | src\components\positions\PendingPositionsTable.tsx:69, src\components\positions\PendingPositionsTable.tsx:366, src\components\positions\OpenPositionsTable.tsx:69 (+2 more) |
| `month` | unknown | 🔧 Dynamic | src\components\positions\PendingPositionsTable.tsx:148, src\components\positions\PendingPositionsTable.tsx:303, src\components\positions\ClosedPositionsTable.tsx:52 |
| `newOrder` | unknown | 🔧 Dynamic | src\components\positions\PendingPositionsTable.tsx:27, src\components\positions\OpenPositionsTable.tsx:27, src\components\positions\ClosedPositionsTable.tsx:9 |
| `number` | unknown | 🔧 Dynamic | src\state\positionsSlice.ts:574 |
| `onCancel` | unknown | 🔧 Dynamic | src\features\positions_next\adapters\ConfirmClosePositionsModalAdapter.tsx:13 |
| `onClose` | unknown | 🔧 Dynamic | src\features\positions_next\adapters\NewPositionModalAdapter.tsx:12, src\features\positions_next\adapters\EditPositionModalAdapter.tsx:12 |
| `onConfirm` | unknown | 🔧 Dynamic | src\features\positions_next\adapters\ConfirmClosePositionsModalAdapter.tsx:14 |
| `onFilterClick` | unknown | 🔧 Dynamic | src\components\positions\ClosedPositionsTable.tsx:68 |
| `opacity` | unknown | 🔧 Dynamic | src\components\positions\PendingPositionsTable.tsx:62, src\components\positions\OpenPositionsTable.tsx:62 |
| `open` | unknown | 🔧 Dynamic | src\features\positions_next\adapters\NewPositionModalAdapter.tsx:11, src\features\positions_next\adapters\EditPositionModalAdapter.tsx:11, src\features\positions_next\adapters\ConfirmClosePositionsModalAdapter.tsx:11 (+3 more) |
| `openPositionsColumns` | unknown | 🔧 Dynamic | src\config\positionColumns.ts:14 |
| `openPositionsEntityColumns` | unknown | 🔧 Dynamic | src\config\positionColumns.ts:108 |
| `openReason` | string | 🔧 Dynamic | src\features\positions_next\types\position.schema.ts:24, src\features\positions_next\types\position.schema.ts:93, src\config\positionColumns.ts:24 (+20 more) |
| `openTime` | string | 🔧 Dynamic | src\features\positions_next\types\position.schema.ts:25 |
| `openVolume` | unknown | 🔧 Dynamic | src\config\positionColumns.ts:19, src\config\positionColumns.ts:48, src\config\positionColumns.ts:140 (+15 more) |
| `operator` | unknown | 🔧 Dynamic | src\components\positions\PendingPositionsTable.tsx:34, src\components\positions\OpenPositionsTable.tsx:34, src\components\positions\ClosedPositionsTable.tsx:16 |
| `pending` | unknown | 🔧 Dynamic | src\state\positionsSlice.ts:39, src\state\positionsSlice.ts:156, src\state\positionsSlice.ts:221 |
| `pendingPositionsColumns` | unknown | 🔧 Dynamic | src\config\positionColumns.ts:55 |
| `pendingPositionsEntityColumns` | unknown | 🔧 Dynamic | src\config\positionColumns.ts:70 |
| `phone` | unknown | 🔧 Dynamic | src\config\positionColumns.ts:82, src\config\positionColumns.ts:120, src\state\positionsSlice.ts:574 |
| `phoneNumber` | unknown | 🔧 Dynamic | src\config\positionColumns.ts:188, src\state\positionsSlice.ts:421, src\state\positionsSlice.ts:503 |
| `position` | unknown | 🔧 Dynamic | src\components\positions\ClosedPositionsTable.tsx:186 |
| `positionExpirationDate` | unknown | 🔧 Dynamic | src\state\positionsSlice.ts:595 |
| `positionId` | unknown | 🔧 Dynamic | src\config\testPositionColumns.ts:7, src\config\positionColumns.ts:94, src\config\positionColumns.ts:136 (+6 more) |
| `positionIds` | unknown | 🔧 Dynamic | src\features\positions_next\adapters\EditPositionModalAdapter.tsx:13 |
| `positionOpenReason` | unknown | 🔧 Dynamic | src\state\positionsSlice.ts:594 |
| `positions` | unknown | 🔧 Dynamic | src\features\positions_next\adapters\PendingPositionsAdapter.tsx:34, src\features\positions_next\adapters\OpenPositionsAdapter.tsx:34, src\features\positions_next\adapters\ConfirmClosePositionsModalAdapter.tsx:35 (+1 more) |
| `positionStopLoss` | unknown | 🔧 Dynamic | src\state\positionsSlice.ts:593 |
| `positionTakeProfit` | unknown | 🔧 Dynamic | src\state\positionsSlice.ts:592 |
| `positionType` | unknown | 🔧 Dynamic | src\config\positionColumns.ts:206, src\state\positionsSlice.ts:439, src\state\positionsSlice.ts:521 (+1 more) |
| `regulation` | unknown | 🔧 Dynamic | src\config\positionColumns.ts:78, src\config\positionColumns.ts:115, src\config\positionColumns.ts:183 (+3 more) |
| `removePosition` | unknown | 🔧 Dynamic | src\state\positionsSlice.ts:238 |
| `result` | unknown | 🔧 Dynamic | src\state\positionsSlice.ts:335 |
| `retentionManager` | unknown | 🔧 Dynamic | src\config\positionColumns.ts:75, src\config\positionColumns.ts:113, src\config\positionColumns.ts:181 (+3 more) |
| `retentionOwner` | unknown | 🔧 Dynamic | src\config\positionColumns.ts:76, src\config\positionColumns.ts:116, src\config\positionColumns.ts:184 (+3 more) |
| `retentionReview` | unknown | 🔧 Dynamic | src\config\positionColumns.ts:89, src\config\positionColumns.ts:127, src\config\positionColumns.ts:195 (+3 more) |
| `rows` | unknown | 🔧 Dynamic | src\components\positions\PendingPositionsTable.tsx:24, src\components\positions\OpenPositionsTable.tsx:24, src\components\positions\ClosedPositionsTable.tsx:6 |
| `selectedIds` | unknown | 🔧 Dynamic | src\components\positions\ClosedPositionsTable.tsx:12 |
| `setOpenPositions` | unknown | 🔧 Dynamic | src\state\positionsSlice.ts:209 |
| `startsWith` | unknown | 🔧 Dynamic | src\components\positions\PendingPositionsTable.tsx:209, src\components\positions\OpenPositionsTable.tsx:199, src\components\positions\ClosedPositionsTable.tsx:264 |
| `stopLoss` | number | 🔧 Dynamic | src\features\positions_next\types\position.schema.ts:20, src\features\positions_next\types\position.schema.ts:92, src\config\positionColumns.ts:23 (+23 more) |
| `storageKey` | unknown | 🔧 Dynamic | src\config\testPositionColumns.ts:16 |
| `takeProfit` | number | 🔧 Dynamic | src\features\positions_next\types\position.schema.ts:19, src\features\positions_next\types\position.schema.ts:91, src\config\positionColumns.ts:22 (+22 more) |
| `testPositionColumns` | unknown | 🔧 Dynamic | src\config\testPositionColumns.ts:4 |
| `testPositionConfig` | unknown | 🔧 Dynamic | src\config\testPositionColumns.ts:11 |
| `total` | unknown | 🔧 Dynamic | src\state\positionsSlice.ts:273 |
| `totalMargin` | unknown | 🔧 Dynamic | src\config\positionColumns.ts:132, src\config\positionColumns.ts:200, src\state\positionsSlice.ts:433 (+1 more) |
| `transform` | unknown | 🔧 Dynamic | src\components\positions\PendingPositionsTable.tsx:60, src\components\positions\OpenPositionsTable.tsx:60 |
| `type` | unknown | 🔧 Dynamic | src\config\positionColumns.ts:17, src\config\positionColumns.ts:36, src\config\positionColumns.ts:58 (+3 more) |
| `updateClosedPositionFields` | unknown | 🔧 Dynamic | src\state\positionsSlice.ts:279 |
| `updatePosition` | unknown | 🔧 Dynamic | src\state\positionsSlice.ts:226 |
| `year` | unknown | 🔧 Dynamic | src\components\positions\PendingPositionsTable.tsx:147, src\components\positions\PendingPositionsTable.tsx:302, src\components\positions\ClosedPositionsTable.tsx:51 |

## Leads Domain

| Field | Type | Classification | Sources |
|-------|------|----------------|---------|
| `clientId` | unknown | 🔒 Static | src\features\profile_next\adapters\ClientProfileAdapter.tsx:63 |
| `conversationOwnerId` | unknown | 🔒 Static | src\components\LeadsTable.tsx:2128 |
| `createdAt` | string | 🔒 Static | src\features\leads_next\types\lead.schema.ts:18, src\features\leads_next\components\LeadsTableAdapter.tsx:28 |
| `creditCardBackStatus` | unknown | 🔒 Static | src\components\LeadsTable.tsx:2816 |
| `creditCardFrontStatus` | unknown | 🔒 Static | src\components\LeadsTable.tsx:2815 |
| `id` | string | 🔒 Static | src\features\leads_next\types\lead.schema.ts:10 |
| `idPassportStatus` | unknown | 🔒 Static | src\components\LeadsTable.tsx:2813 |
| `initialStates` | unknown | 🔒 Static | src\components\LeadsTable.tsx:3645 |
| `kycStatus` | unknown | 🔒 Static | src\components\LeadsTable.tsx:2748 |
| `leadStatus` | unknown | 🔒 Static | src\components\LeadsTable.tsx:2754 |
| `paymentGateway` | unknown | 🔒 Static | src\components\LeadsTable.tsx:2765 |
| `proofOfAddressStatus` | unknown | 🔒 Static | src\components\LeadsTable.tsx:2814 |
| `skip` | unknown | 🔒 Static | src\features\profile_next\adapters\ClientProfileAdapter.tsx:80, src\features\leads_next\components\LeadsTableAdapter.tsx:78 |
| `state` | unknown | 🔒 Static | src\components\LeadsTable.tsx:2690 |
| `status` | unknown | 🔒 Static | src\features\leads_next\types\lead.schema.ts:15, src\features\leads_next\types\lead.schema.ts:27, src\features\leads_next\types\lead.schema.ts:38 (+3 more) |
| `timestamp` | unknown | 🔒 Static | src\components\LeadsTable.tsx:1537, src\components\LeadsTable.tsx:1543 |
| `111827` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:812, src\components\LeadsTable.tsx:832 |
| `200` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:214, src\components\LeadsTable.tsx:215 |
| `22c55e` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:138 |
| `2563eb` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:3595, src\components\LeadsTable.tsx:3596 |
| `320` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1160 |
| `374151` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1189 |
| `3b82f6` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:3147, src\components\LeadsTable.tsx:3592 |
| `400` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1161 |
| `475569` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:3571, src\components\LeadsTable.tsx:3572 |
| `500` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:192 |
| `600` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:755 |
| `64748b` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:2905, src\components\LeadsTable.tsx:3568 |
| `accessorFn` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:119 |
| `accountType` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:2717 |
| `alignItems` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1218, src\components\LeadsTable.tsx:1243, src\components\LeadsTable.tsx:2994 (+13 more) |
| `all` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1915, src\components\LeadsTable.tsx:1931 |
| `anchorEl` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:247 |
| `asc` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:2560 |
| `background` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:3866, src\components\LeadsTable.tsx:3935, src\components\LeadsTable.tsx:3974 (+2 more) |
| `backgroundColor` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:472, src\components\LeadsTable.tsx:486, src\components\LeadsTable.tsx:491 (+100 more) |
| `before` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:2482 |
| `betweenDate` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1598 |
| `betweenNumber` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1590 |
| `bool` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1745 |
| `boolean` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:134, src\components\LeadsTable.tsx:229, src\components\LeadsTable.tsx:332 (+3 more) |
| `border` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:488, src\components\LeadsTable.tsx:504, src\components\LeadsTable.tsx:536 (+35 more) |
| `borderBottom` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1318, src\components\LeadsTable.tsx:2302, src\components\LeadsTable.tsx:2316 |
| `borderColor` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:493, src\components\LeadsTable.tsx:499, src\components\LeadsTable.tsx:541 (+34 more) |
| `borderRadius` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:487, src\components\LeadsTable.tsx:535, src\components\LeadsTable.tsx:588 (+50 more) |
| `borderTop` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1029, src\components\LeadsTable.tsx:3936 |
| `borderWidth` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:500, src\components\LeadsTable.tsx:548, src\components\LeadsTable.tsx:601 (+7 more) |
| `boxShadow` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:813, src\components\LeadsTable.tsx:833, src\components\LeadsTable.tsx:1165 (+18 more) |
| `cell` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:95, src\components\LeadsTable.tsx:129, src\components\LeadsTable.tsx:2588 |
| `checkbox` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:174, src\components\LeadsTable.tsx:231, src\components\LeadsTable.tsx:1927 |
| `citizen` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:2771 |
| `className` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:3724 |
| `clear` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:2144, src\components\LeadsTable.tsx:2625, src\components\LeadsTable.tsx:3695 |
| `cleared` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:3916 |
| `client` | unknown | 🔧 Dynamic | src\features\profile_next\adapters\ClientProfileAdapter.tsx:111 |
| `ClientProfileAdapter` | unknown | 🔧 Dynamic | src\features\profile_next\adapters\ClientProfileAdapter.tsx:62 |
| `cmp` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1718 |
| `color` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:138, src\components\LeadsTable.tsx:475, src\components\LeadsTable.tsx:523 (+82 more) |
| `columnId` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1531, src\components\LeadsTable.tsx:2454, src\components\LeadsTable.tsx:2455 |
| `columnResizeMode` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1568 |
| `comments` | unknown | 🔧 Dynamic | src\features\profile_next\adapters\ClientProfileAdapter.tsx:54 |
| `contained` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:3557, src\components\LeadsTable.tsx:3581, src\components\LeadsTable.tsx:3605 |
| `contains` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1706 |
| `content` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:3259, src\components\LeadsTable.tsx:3309 |
| `conversationOwner` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:2123 |
| `country` | unknown | 🔧 Dynamic | src\features\profile_next\adapters\ClientProfileAdapter.tsx:120, src\features\leads_next\components\LeadsTableAdapter.tsx:38, src\components\LeadsTable.tsx:2711 |
| `countryCode` | string | 🔧 Dynamic | src\features\leads_next\types\lead.schema.ts:14, src\features\leads_next\types\lead.schema.ts:26, src\features\leads_next\types\lead.schema.ts:37 (+2 more) |
| `countryPhoneCodes` | unknown | 🔧 Dynamic | src\features\profile_next\adapters\ClientProfileAdapter.tsx:121 |
| `currentFilterValue` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1878 |
| `dark` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:2295, src\components\LeadsTable.tsx:2301, src\components\LeadsTable.tsx:2316 |
| `data` | unknown | 🔧 Dynamic | src\features\leads_next\types\lead.schema.ts:52, src\features\leads_next\types\lead.schema.ts:53, src\features\leads_next\types\lead.schema.ts:54 (+6 more) |
| `date` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:145, src\components\LeadsTable.tsx:226, src\components\LeadsTable.tsx:328 (+4 more) |
| `datetime` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:148, src\components\LeadsTable.tsx:227, src\components\LeadsTable.tsx:329 (+3 more) |
| `dc2626` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:3619, src\components\LeadsTable.tsx:3620, src\components\LeadsTable.tsx:3913 |
| `default` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:197, src\components\LeadsTable.tsx:234, src\components\LeadsTable.tsx:338 (+8 more) |
| `desc` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:361, src\components\LeadsTable.tsx:364, src\components\LeadsTable.tsx:369 (+4 more) |
| `desk` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:2778 |
| `display` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:472, src\components\LeadsTable.tsx:573, src\components\LeadsTable.tsx:731 (+23 more) |
| `documents` | unknown | 🔧 Dynamic | src\features\profile_next\adapters\ClientProfileAdapter.tsx:50 |
| `ef4444` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:138, src\components\LeadsTable.tsx:3616 |
| `elevation` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:2412 |
| `email` | string | 🔧 Dynamic | src\features\leads_next\types\lead.schema.ts:12, src\features\leads_next\types\lead.schema.ts:24, src\features\leads_next\types\lead.schema.ts:35 (+5 more) |
| `enableHiding` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:105 |
| `enableRowSelection` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1762 |
| `enableSorting` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:104, src\components\LeadsTable.tsx:213 |
| `enableSortingRemoval` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1774 |
| `ends` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1712 |
| `enhanced` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1671 |
| `equals` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1585 |
| `equalsBoolean` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1579 |
| `error` | unknown | 🔧 Dynamic | src\features\leads_next\components\LeadsTableAdapter.tsx:66, src\components\LeadsTable.tsx:2177 |
| `f0f9ff` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:769 |
| `f9fafb` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1191 |
| `failed` | unknown | 🔧 Dynamic | src\features\leads_next\components\NewLeadDrawerAdapter.tsx:57 |
| `false` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1915 |
| `ffffff` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:811, src\components\LeadsTable.tsx:815, src\components\LeadsTable.tsx:831 (+2 more) |
| `field` | unknown | 🔧 Dynamic | src\features\leads_next\components\NewLeadDrawerAdapter.tsx:83 |
| `fieldKey` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:2703, src\components\LeadsTable.tsx:3654, src\components\LeadsTable.tsx:3670 (+1 more) |
| `fieldType` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:2703 |
| `file` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:171, src\components\LeadsTable.tsx:232, src\components\LeadsTable.tsx:1928 |
| `filterFn` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:216 |
| `finance` | unknown | 🔧 Dynamic | src\features\profile_next\adapters\ClientProfileAdapter.tsx:48 |
| `first` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:2482 |
| `flex` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:804, src\components\LeadsTable.tsx:824, src\components\LeadsTable.tsx:1367 (+1 more) |
| `flexDirection` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:472, src\components\LeadsTable.tsx:573, src\components\LeadsTable.tsx:731 (+2 more) |
| `flexShrink` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:3000, src\components\LeadsTable.tsx:3111, src\components\LeadsTable.tsx:3148 (+3 more) |
| `fontFamily` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:475, src\components\LeadsTable.tsx:484, src\components\LeadsTable.tsx:509 (+72 more) |
| `fontSize` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:140, src\components\LeadsTable.tsx:489, src\components\LeadsTable.tsx:510 (+62 more) |
| `fontStyle` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:2904, src\components\LeadsTable.tsx:3013, src\components\LeadsTable.tsx:3093 (+2 more) |
| `fontWeight` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:139, src\components\LeadsTable.tsx:690, src\components\LeadsTable.tsx:706 (+41 more) |
| `formattedValue` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:131 |
| `from` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:330, src\components\LeadsTable.tsx:431, src\components\LeadsTable.tsx:802 (+6 more) |
| `ftd` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:2788 |
| `ftdSelf` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:2794 |
| `fullName` | string | 🔧 Dynamic | src\features\leads_next\types\lead.schema.ts:11, src\features\leads_next\types\lead.schema.ts:23, src\features\leads_next\types\lead.schema.ts:34 (+1 more) |
| `gap` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:472, src\components\LeadsTable.tsx:573, src\components\LeadsTable.tsx:684 (+17 more) |
| `gender` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:2727 |
| `general` | unknown | 🔧 Dynamic | src\features\profile_next\adapters\ClientProfileAdapter.tsx:47 |
| `getCoreRowModel` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1569 |
| `getFilteredRowModel` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1571 |
| `getPaginationRowModel` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1572 |
| `getRowId` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1763 |
| `getSortedRowModel` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1570 |
| `getValue` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1035, src\components\LeadsTable.tsx:1040, src\components\LeadsTable.tsx:1049 (+1 more) |
| `globalFilterFn` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1775 |
| `gridTemplateColumns` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1033 |
| `height` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1325, src\components\LeadsTable.tsx:2334, src\components\LeadsTable.tsx:2535 (+7 more) |
| `horizontal` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1155, src\components\LeadsTable.tsx:1156, src\components\LeadsTable.tsx:2410 (+3 more) |
| `hover` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:159, src\components\LeadsTable.tsx:188, src\components\LeadsTable.tsx:204 (+3 more) |
| `includesAny` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:222, src\components\LeadsTable.tsx:1574 |
| `initial` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1447 |
| `isDateOnly` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1549 |
| `isEmpty` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1679, src\components\LeadsTable.tsx:1696 |
| `isLoading` | unknown | 🔧 Dynamic | src\features\profile_next\adapters\ClientProfileAdapter.tsx:82, src\features\leads_next\components\NewLeadDrawerAdapter.tsx:27, src\features\leads_next\components\NewLeadDrawerAdapter.tsx:28 (+1 more) |
| `italic` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:2904 |
| `justifyContent` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1217, src\components\LeadsTable.tsx:1242 |
| `key` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:2123, src\components\LeadsTable.tsx:2128, src\components\LeadsTable.tsx:2154 (+3 more) |
| `kind` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:330, src\components\LeadsTable.tsx:802, src\components\LeadsTable.tsx:822 (+4 more) |
| `language` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:2734 |
| `last` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:3537 |
| `lead` | unknown | 🔧 Dynamic | src\features\leads_next\components\NewLeadDrawerAdapter.tsx:78, src\features\leads_next\components\LeadsTableAdapter.tsx:17 |
| `Lead` | unknown | 🔧 Dynamic | src\features\leads_next\components\NewLeadDrawerAdapter.tsx:94, src\features\leads_next\components\NewLeadDrawerAdapter.tsx:206 |
| `leads` | unknown | 🔧 Dynamic | src\features\leads_next\types\lead.schema.ts:45 |
| `LeadsTableAdapter` | unknown | 🔧 Dynamic | src\features\leads_next\components\LeadsTableAdapter.tsx:46 |
| `left` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:3262, src\components\LeadsTable.tsx:3312 |
| `letterSpacing` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:3742, src\components\LeadsTable.tsx:3809, src\components\LeadsTable.tsx:3823 (+1 more) |
| `limit` | number | 🔧 Dynamic | src\features\leads_next\types\lead.schema.ts:48 |
| `lineHeight` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:3316 |
| `local` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:902, src\components\LeadsTable.tsx:947, src\components\LeadsTable.tsx:990 |
| `logs` | unknown | 🔧 Dynamic | src\features\profile_next\adapters\ClientProfileAdapter.tsx:53 |
| `margin` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:695, src\components\LeadsTable.tsx:711, src\components\LeadsTable.tsx:762 |
| `marginLeft` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:2256 |
| `marketing` | unknown | 🔧 Dynamic | src\features\profile_next\adapters\ClientProfileAdapter.tsx:51 |
| `max` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:635, src\components\LeadsTable.tsx:1958, src\components\LeadsTable.tsx:1973 (+1 more) |
| `maxHeight` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:727, src\components\LeadsTable.tsx:794, src\components\LeadsTable.tsx:1162 (+1 more) |
| `maxSize` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:108 |
| `maxWidth` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1161, src\components\LeadsTable.tsx:2412 |
| `min` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:635, src\components\LeadsTable.tsx:1957, src\components\LeadsTable.tsx:1972 (+2 more) |
| `minHeight` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:3056, src\components\LeadsTable.tsx:3172, src\components\LeadsTable.tsx:3381 (+1 more) |
| `minSize` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:107, src\components\LeadsTable.tsx:214 |
| `minWidth` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:794, src\components\LeadsTable.tsx:1160, src\components\LeadsTable.tsx:1323 (+4 more) |
| `mixed` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:2687 |
| `mode` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:322, src\components\LeadsTable.tsx:339, src\components\LeadsTable.tsx:482 (+5 more) |
| `NewLeadDrawerAdapter` | unknown | 🔧 Dynamic | src\features\leads_next\components\NewLeadDrawerAdapter.tsx:21 |
| `none` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:3566, src\components\LeadsTable.tsx:3590, src\components\LeadsTable.tsx:3614 |
| `notEmpty` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1677, src\components\LeadsTable.tsx:1692 |
| `notes` | string | 🔧 Dynamic | src\features\leads_next\types\lead.schema.ts:19, src\features\leads_next\types\lead.schema.ts:30, src\features\leads_next\types\lead.schema.ts:41 (+2 more) |
| `null` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1528 |
| `number` | unknown | 🔧 Dynamic | src\features\leads_next\components\LeadsTableAdapter.tsx:36, src\components\LeadsTable.tsx:151, src\components\LeadsTable.tsx:223 (+4 more) |
| `onClose` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:248, src\components\LeadsTable.tsx:2623 |
| `onColumnFiltersChange` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1757 |
| `onColumnOrderChange` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1773 |
| `onColumnVisibilityChange` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1759 |
| `onGlobalFilterChange` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1758 |
| `Online` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:194 |
| `onModeChange` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:2685 |
| `onOpenChange` | unknown | 🔧 Dynamic | src\features\leads_next\components\NewLeadDrawerAdapter.tsx:17 |
| `onOpenColumnEditor` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:2454 |
| `onOpenFilterMenu` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:2455 |
| `onPaginationChange` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1760 |
| `onRowSelectionChange` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1761 |
| `onSave` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:2625 |
| `onSortingChange` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1756 |
| `onValueChange` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:2686 |
| `opacity` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:561, src\components\LeadsTable.tsx:666, src\components\LeadsTable.tsx:1140 (+5 more) |
| `open` | unknown | 🔧 Dynamic | src\features\leads_next\components\NewLeadDrawerAdapter.tsx:16, src\features\leads_next\components\NewLeadDrawerAdapter.tsx:17, src\components\LeadsTable.tsx:246 (+1 more) |
| `opt` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1867 |
| `option` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1902 |
| `options` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:2693 |
| `overflow` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1163 |
| `overflowY` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:727, src\components\LeadsTable.tsx:794 |
| `ownerName` | string | 🔧 Dynamic | src\features\leads_next\types\lead.schema.ts:17, src\features\leads_next\types\lead.schema.ts:29, src\features\leads_next\types\lead.schema.ts:40 (+1 more) |
| `padding` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:508, src\components\LeadsTable.tsx:556, src\components\LeadsTable.tsx:609 (+7 more) |
| `page` | number | 🔧 Dynamic | src\features\leads_next\types\lead.schema.ts:47 |
| `pageIndex` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1408 |
| `pageSize` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1409 |
| `patch` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:2144, src\components\LeadsTable.tsx:2625, src\components\LeadsTable.tsx:3694 |
| `phone` | string | 🔧 Dynamic | src\features\leads_next\types\lead.schema.ts:13, src\features\leads_next\types\lead.schema.ts:25, src\features\leads_next\types\lead.schema.ts:36 (+5 more) |
| `phoneNumber` | unknown | 🔧 Dynamic | src\features\leads_next\components\LeadsTableAdapter.tsx:33 |
| `position` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:2471, src\components\LeadsTable.tsx:2596, src\components\LeadsTable.tsx:3257 (+3 more) |
| `positions` | unknown | 🔧 Dynamic | src\features\profile_next\adapters\ClientProfileAdapter.tsx:49 |
| `Preview` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:3882 |
| `primary` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:204 |
| `rating` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:154, src\components\LeadsTable.tsx:224, src\components\LeadsTable.tsx:325 (+3 more) |
| `regulation` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:2800 |
| `rel` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:326, src\components\LeadsTable.tsx:330, src\components\LeadsTable.tsx:583 (+5 more) |
| `resize` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:3507 |
| `right` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:203 |
| `row` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:72, src\components\LeadsTable.tsx:79 |
| `rows` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:71 |
| `salesManager` | unknown | 🔧 Dynamic | src\features\leads_next\components\LeadsTableAdapter.tsx:41 |
| `salesSecondHand` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:2806 |
| `select` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:85, src\components\LeadsTable.tsx:177, src\components\LeadsTable.tsx:220 (+4 more) |
| `selectColumn` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:84 |
| `selectedRows` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:2624, src\components\LeadsTable.tsx:2688 |
| `settings` | unknown | 🔧 Dynamic | src\features\profile_next\adapters\ClientProfileAdapter.tsx:52 |
| `shrink` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:2013, src\components\LeadsTable.tsx:2022, src\components\LeadsTable.tsx:2037 (+3 more) |
| `size` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:106, src\components\LeadsTable.tsx:215 |
| `sort` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:355, src\components\LeadsTable.tsx:379 |
| `source` | string | 🔧 Dynamic | src\features\leads_next\types\lead.schema.ts:16, src\features\leads_next\types\lead.schema.ts:28, src\features\leads_next\types\lead.schema.ts:39 (+2 more) |
| `stars` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:162 |
| `starts` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1710 |
| `step` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:635, src\components\LeadsTable.tsx:3339 |
| `style` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:2469, src\components\LeadsTable.tsx:2594 |
| `T00` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1038, src\components\LeadsTable.tsx:1046, src\components\LeadsTable.tsx:1055 (+1 more) |
| `T23` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1056, src\components\LeadsTable.tsx:1066 |
| `text` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:318, src\components\LeadsTable.tsx:467, src\components\LeadsTable.tsx:1700 (+1 more) |
| `textAlign` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:776, src\components\LeadsTable.tsx:3009 |
| `textarea` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:321, src\components\LeadsTable.tsx:470, src\components\LeadsTable.tsx:1853 (+1 more) |
| `textTransform` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:809, src\components\LeadsTable.tsx:829, src\components\LeadsTable.tsx:1080 (+11 more) |
| `Time` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:898, src\components\LeadsTable.tsx:943, src\components\LeadsTable.tsx:986 |
| `top` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:3261, src\components\LeadsTable.tsx:3311 |
| `total` | number | 🔧 Dynamic | src\features\leads_next\types\lead.schema.ts:46 |
| `transform` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:2472, src\components\LeadsTable.tsx:2597, src\components\LeadsTable.tsx:2986 (+8 more) |
| `transition` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:2837, src\components\LeadsTable.tsx:2983, src\components\LeadsTable.tsx:3061 (+7 more) |
| `true` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:682, src\components\LeadsTable.tsx:1915, src\components\LeadsTable.tsx:1918 |
| `tsA` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1549 |
| `tsB` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1549 |
| `undefined` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1918, src\components\LeadsTable.tsx:1934 |
| `updates` | unknown | 🔧 Dynamic | src\features\profile_next\adapters\ClientProfileAdapter.tsx:93 |
| `Uploaded` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:172 |
| `val` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:322, src\components\LeadsTable.tsx:326, src\components\LeadsTable.tsx:333 (+5 more) |
| `vals` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:336, src\components\LeadsTable.tsx:742 |
| `Value` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:627 |
| `vertical` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1155, src\components\LeadsTable.tsx:1156, src\components\LeadsTable.tsx:2410 (+3 more) |
| `white` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:3567, src\components\LeadsTable.tsx:3591, src\components\LeadsTable.tsx:3615 |
| `whiteSpace` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:2474 |
| `width` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:763, src\components\LeadsTable.tsx:1324, src\components\LeadsTable.tsx:2334 (+10 more) |
| `zIndex` | unknown | 🔧 Dynamic | src\components\LeadsTable.tsx:1164, src\components\LeadsTable.tsx:2476, src\components\LeadsTable.tsx:2600 |

## Misc Domain

| Field | Type | Classification | Sources |
|-------|------|----------------|---------|
| `accountId` | unknown | 🔒 Static | src\config\complianceColumns.ts:13, src\config\columns.ts:44, src\fieldkit\types.ts:16 (+5 more) |
| `amount` | unknown | 🔒 Static | src\components\EntityTable.tsx:1789, src\state\entitiesSlice.ts:941, src\state\entitiesSlice.ts:1006 (+5 more) |
| `Amount` | unknown | 🔒 Static | src\state\entitiesSlice.ts:1030, src\state\entitiesSlice.ts:1118, src\state\entitiesSlice.ts:1150 (+1 more) |
| `balance` | unknown | 🔒 Static | src\fieldkit\types.ts:121, src\fieldkit\normalize.ts:54, src\state\entitiesSlice.ts:294 |
| `ccBackStatus` | unknown | 🔒 Static | src\state\entitiesSlice.ts:326, src\state\entitiesSlice.ts:392 |
| `ccFrontStatus` | unknown | 🔒 Static | src\state\entitiesSlice.ts:325, src\state\entitiesSlice.ts:391 |
| `clientCreatedAtISO` | unknown | 🔒 Static | src\state\entitiesSlice.ts:944, src\state\entitiesSlice.ts:1008, src\state\entitiesSlice.ts:1037 (+3 more) |
| `clientId` | unknown | 🔒 Static | src\state\notesSlice.ts:5, src\state\notesSlice.ts:75, src\state\entitiesSlice.ts:940 (+10 more) |
| `commissionType` | unknown | 🔒 Static | src\state\accountTypeAssetRulesSlice.ts:174 |
| `commissionValue` | unknown | 🔒 Static | src\state\accountTypeAssetRulesSlice.ts:15, src\state\accountTypeAssetRulesSlice.ts:175 |
| `conversationOwnerId` | unknown | 🔒 Static | src\fieldkit\types.ts:66, src\state\entitiesSlice.ts:274 |
| `conversationOwnerStatus` | unknown | 🔒 Static | src\fieldkit\options.ts:102, src\config\fields.ts:395 |
| `createdAt` | unknown | 🔒 Static | src\config\complianceColumns.ts:14, src\config\columns.ts:45, src\fieldkit\types.ts:36 (+13 more) |
| `creditCardBackStatus` | unknown | 🔒 Static | src\components\EntityTable.tsx:2438 |
| `creditCardFrontStatus` | unknown | 🔒 Static | src\components\EntityTable.tsx:2437 |
| `description` | unknown | 🔒 Static | src\state\entitiesSlice.ts:155, src\state\entitiesSlice.ts:258, src\state\entitiesSlice.ts:1210 (+13 more) |
| `ftdAmount` | unknown | 🔒 Static | src\config\complianceColumns.ts:68 |
| `idPassportStatus` | unknown | 🔒 Static | src\components\EntityTable.tsx:2435, src\state\entitiesSlice.ts:323, src\state\entitiesSlice.ts:389 |
| `initialState` | unknown | 🔒 Static | src\state\notesSlice.ts:19, src\state\entitiesSlice.ts:262, src\state\commentsSlice.ts:21 (+4 more) |
| `initialStates` | unknown | 🔒 Static | src\components\EntityTable.tsx:2926 |
| `instrument` | unknown | 🔒 Static | src\components\EntityTable.tsx:1787 |
| `isFTD` | unknown | 🔒 Static | src\state\entitiesSlice.ts:406, src\state\entitiesSlice.ts:985, src\state\entitiesSlice.ts:1070 |
| `isFTW` | unknown | 🔒 Static | src\state\entitiesSlice.ts:1072 |
| `kycStatus` | unknown | 🔒 Static | src\config\complianceColumns.ts:41, src\config\columns.ts:84, src\fieldkit\options.ts:25 (+6 more) |
| `leadStatus` | unknown | 🔒 Static | src\config\columns.ts:83, src\fieldkit\types.ts:57, src\fieldkit\options.ts:21 (+11 more) |
| `netDeposit` | unknown | 🔒 Static | src\state\entitiesSlice.ts:415 |
| `openPnl` | unknown | 🔒 Static | src\fieldkit\types.ts:123, src\fieldkit\normalize.ts:56, src\state\entitiesSlice.ts:296 |
| `paymentGateway` | unknown | 🔒 Static | src\config\complianceColumns.ts:69, src\config\columns.ts:94, src\state\complianceSlice.ts:139 |
| `proofOfAddressStatus` | unknown | 🔒 Static | src\components\EntityTable.tsx:2436, src\state\entitiesSlice.ts:324, src\state\entitiesSlice.ts:390 |
| `registeredIp` | unknown | 🔒 Static | src\config\columns.ts:52, src\fieldkit\types.ts:33, src\fieldkit\normalize.ts:24 (+1 more) |
| `requestedAmount` | unknown | 🔒 Static | src\state\entitiesSlice.ts:1176 |
| `retentionOwnerId` | unknown | 🔒 Static | src\fieldkit\types.ts:68, src\state\entitiesSlice.ts:276, src\state\entitiesSlice.ts:811 (+3 more) |
| `retentionOwnerStatus` | unknown | 🔒 Static | src\config\fields.ts:472 |
| `retentionStatus` | unknown | 🔒 Static | src\fieldkit\types.ts:70, src\state\entitiesSlice.ts:292, src\state\entitiesSlice.ts:353 (+2 more) |
| `setEntityStatus` | unknown | 🔒 Static | src\state\entitiesSlice.ts:1233 |
| `state` | unknown | 🔒 Static | src\config\complianceColumns.ts:49, src\fieldkit\types.ts:136, src\fieldkit\options.ts:238 (+31 more) |
| `status` | unknown | 🔒 Static | src\config\columns.ts:50, src\components\EntityTable.tsx:398, src\state\entitiesSlice.ts:270 (+3 more) |
| `swapLong` | unknown | 🔒 Static | src\state\accountTypeAssetRulesSlice.ts:176 |
| `swapShort` | unknown | 🔒 Static | src\state\accountTypeAssetRulesSlice.ts:177 |
| `swapType` | unknown | 🔒 Static | src\config\columns.ts:146, src\fieldkit\types.ts:112, src\fieldkit\options.ts:53 (+1 more) |
| `totalFtd` | unknown | 🔒 Static | src\config\complianceColumns.ts:66, src\config\columns.ts:90, src\fieldkit\types.ts:76 (+9 more) |
| `totalFTD` | unknown | 🔒 Static | src\state\entitiesSlice.ts:406, src\state\entitiesSlice.ts:986, src\state\entitiesSlice.ts:1070 |
| `totalPnl` | unknown | 🔒 Static | src\fieldkit\types.ts:124, src\fieldkit\normalize.ts:57, src\state\entitiesSlice.ts:297 |
| `totalPnL` | unknown | 🔒 Static | src\components\EntityTable.tsx:1790 |
| `updatedAt` | unknown | 🔒 Static | src\fieldkit\normalize.ts:134, src\fieldkit\normalize.ts:206, src\state\entitiesSlice.ts:935 (+6 more) |
| `userId` | unknown | 🔒 Static | src\state\authSlice.ts:59 |
| `utmAccountId` | unknown | 🔒 Static | src\config\columns.ts:127, src\config\fields.ts:294 |
| `zip` | unknown | 🔒 Static | src\config\complianceColumns.ts:47, src\fieldkit\types.ts:134, src\fieldkit\normalize.ts:27 (+1 more) |
| `_select` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:285 |
| `_tr` | unknown | 🔧 Dynamic | src\components\ui\table.tsx:34 |
| `001` | unknown | 🔧 Dynamic | src\state\accountTypeAssetRulesSlice.ts:171, src\state\accountTypeAssetRulesSlice.ts:172 |
| `01T08` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:308 |
| `059669` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:2243 |
| `05T09` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:306 |
| `05T10` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:307 |
| `07T18` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:309, src\state\entitiesSlice.ts:310 |
| `1` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:825 |
| `100` | unknown | 🔧 Dynamic | src\state\accountTypeAssetRulesSlice.ts:168, src\state\accountTypeAssetRulesSlice.ts:173 |
| `1000` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:719 |
| `10b981` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:2721 |
| `10T10` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:311 |
| `15T12` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:269 |
| `16T08` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:339 |
| `18T10` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:368 |
| `2` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:826 |
| `2563eb` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:2871, src\components\EntityTable.tsx:2872 |
| `3` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:827 |
| `374151` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1303 |
| `3b82f6` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:2647, src\components\EntityTable.tsx:2867 |
| `4` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:828 |
| `40px` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:804 |
| `475569` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:2844, src\components\EntityTable.tsx:2845 |
| `5` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:829 |
| `500` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:435, src\components\EntityTable.tsx:642 |
| `600` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:469, src\components\EntityTable.tsx:546, src\components\EntityTable.tsx:786 (+1 more) |
| `64748b` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:2545, src\components\EntityTable.tsx:2840 |
| `6px` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:722 |
| `ACC001` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:336 |
| `ACC002` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:365 |
| `ACC9001` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:266 |
| `accessorFn` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:417 |
| `accessorKey` | unknown | 🔧 Dynamic | src\components\tables\GenericTable.tsx:173 |
| `accountType` | unknown | 🔧 Dynamic | src\config\complianceColumns.ts:20, src\config\columns.ts:49, src\fieldkit\types.ts:40 (+9 more) |
| `accountTypeId` | unknown | 🔧 Dynamic | src\state\accountTypeAssetRulesSlice.ts:31, src\state\accountTypeAssetRulesSlice.ts:44, src\state\accountTypeAssetRulesSlice.ts:57 (+5 more) |
| `action` | unknown | 🔧 Dynamic | src\state\notesSlice.ts:30, src\state\notesSlice.ts:48, src\state\notesSlice.ts:56 (+37 more) |
| `active` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:744 |
| `addComment` | unknown | 🔧 Dynamic | src\state\commentsSlice.ts:30 |
| `addEntity` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:919 |
| `addGlobalCustomDocument` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:1210 |
| `addNote` | unknown | 🔧 Dynamic | src\state\notesSlice.ts:28 |
| `address` | unknown | 🔧 Dynamic | src\config\complianceColumns.ts:45, src\state\complianceSlice.ts:116 |
| `address1` | unknown | 🔧 Dynamic | src\config\complianceColumns.ts:46, src\state\complianceSlice.ts:117 |
| `age` | unknown | 🔧 Dynamic | src\config\columns.ts:63, src\fieldkit\types.ts:29, src\fieldkit\normalize.ts:42 (+9 more) |
| `alignItems` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1332, src\components\EntityTable.tsx:1357, src\components\EntityTable.tsx:2235 (+8 more) |
| `allColumns` | unknown | 🔧 Dynamic | src\config\columns.ts:178, src\config\columns.ts:189, src\components\EntityTable.tsx:411 |
| `allHidden` | unknown | 🔧 Dynamic | src\components\tables\GenericTable.tsx:219 |
| `allIds` | unknown | 🔧 Dynamic | src\state\notesSlice.ts:16, src\state\notesSlice.ts:21, src\state\commentsSlice.ts:18 (+1 more) |
| `allKeys` | unknown | 🔧 Dynamic | src\config\fields.ts:362 |
| `allowDeposit` | unknown | 🔧 Dynamic | src\config\columns.ts:140, src\fieldkit\types.ts:103, src\fieldkit\options.ts:178 (+8 more) |
| `allowed2fa` | unknown | 🔧 Dynamic | src\config\columns.ts:139, src\fieldkit\types.ts:102, src\fieldkit\options.ts:173 (+2 more) |
| `allowedToTrade` | unknown | 🔧 Dynamic | src\config\columns.ts:137, src\fieldkit\types.ts:99, src\fieldkit\options.ts:158 (+6 more) |
| `allowWithdraw` | unknown | 🔧 Dynamic | src\config\columns.ts:142, src\fieldkit\types.ts:105, src\fieldkit\options.ts:183 (+8 more) |
| `allRules` | unknown | 🔧 Dynamic | src\state\accountTypeAssetRulesSlice.ts:148 |
| `allVisible` | unknown | 🔧 Dynamic | src\components\tables\GenericTable.tsx:211 |
| `anchorEl` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:823 |
| `applyCreditForClient` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:1122, src\state\entitiesSlice.ts:1131 |
| `applyCreditOutForClient` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:1154, src\state\entitiesSlice.ts:1163 |
| `applyFTDForClient` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:939 |
| `applyFTWForClient` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:1032 |
| `applyNonFTDDepositForClient` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:1004 |
| `applyNonFTWWithdrawalForClient` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:1091 |
| `asset` | unknown | 🔧 Dynamic | src\state\assetsSlice.ts:63 |
| `assetId` | unknown | 🔧 Dynamic | src\state\accountTypeAssetRulesSlice.ts:5, src\state\accountTypeAssetRulesSlice.ts:44, src\state\accountTypeAssetRulesSlice.ts:57 (+4 more) |
| `assetName` | unknown | 🔧 Dynamic | src\state\accountTypeAssetRulesSlice.ts:162 |
| `assets` | unknown | 🔧 Dynamic | src\state\accountTypeAssetRulesSlice.ts:183 |
| `authorId` | unknown | 🔧 Dynamic | src\state\commentsSlice.ts:85 |
| `authorName` | unknown | 🔧 Dynamic | src\state\commentsSlice.ts:86 |
| `availableCredit` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:1177 |
| `avatar` | unknown | 🔧 Dynamic | src\state\authSlice.ts:53, src\state\authSlice.ts:105 |
| `avatarUrl` | unknown | 🔧 Dynamic | src\fieldkit\types.ts:120, src\fieldkit\normalize.ts:23, src\state\entitiesSlice.ts:825 (+4 more) |
| `background` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:3147, src\components\EntityTable.tsx:3216, src\components\EntityTable.tsx:3255 (+7 more) |
| `backgroundColor` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:720, src\components\EntityTable.tsx:1049, src\components\EntityTable.tsx:1063 (+73 more) |
| `baseColumns` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:231 |
| `baseLeadColumnDefinitions` | unknown | 🔧 Dynamic | src\config\columns.ts:42 |
| `bbf7d0` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:2227 |
| `blockNotifications` | unknown | 🔧 Dynamic | src\config\columns.ts:136, src\fieldkit\types.ts:98, src\fieldkit\options.ts:153 (+5 more) |
| `bool` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:160 |
| `boolean` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:394, src\components\EntityTable.tsx:908, src\components\EntityTable.tsx:2659 |
| `border` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1065, src\components\EntityTable.tsx:1081, src\components\EntityTable.tsx:1113 (+22 more) |
| `borderBottom` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1432, src\components\EntityTable.tsx:2022, src\components\EntityTable.tsx:2030 (+4 more) |
| `borderColor` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1070, src\components\EntityTable.tsx:1076, src\components\EntityTable.tsx:1118 (+24 more) |
| `borderRadius` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:722, src\components\EntityTable.tsx:1064, src\components\EntityTable.tsx:1112 (+36 more) |
| `borderTop` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:2258, src\components\EntityTable.tsx:3217, src\components\tables\GenericTable.tsx:323 |
| `borderWidth` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1077, src\components\EntityTable.tsx:1125, src\components\EntityTable.tsx:1241 |
| `boxShadow` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:721, src\components\EntityTable.tsx:1279, src\components\EntityTable.tsx:2186 (+20 more) |
| `byId` | unknown | 🔧 Dynamic | src\state\notesSlice.ts:15, src\state\commentsSlice.ts:17 |
| `callAttempts` | unknown | 🔧 Dynamic | src\config\columns.ts:77, src\fieldkit\types.ts:53, src\fieldkit\normalize.ts:44 (+2 more) |
| `campaignId` | unknown | 🔧 Dynamic | src\config\columns.ts:107, src\fieldkit\types.ts:91, src\fieldkit\options.ts:213 (+2 more) |
| `campaignSource` | unknown | 🔧 Dynamic | src\config\columns.ts:113, src\config\fields.ts:270 |
| `category` | unknown | 🔧 Dynamic | src\state\assetsSlice.ts:18, src\state\assetsSlice.ts:19, src\state\assetsSlice.ts:20 (+21 more) |
| `ccBack` | unknown | 🔧 Dynamic | src\config\columns.ts:103, src\fieldkit\types.ts:87, src\fieldkit\normalize.ts:81 (+3 more) |
| `ccBackRef` | unknown | 🔧 Dynamic | src\config\complianceColumns.ts:56 |
| `ccFront` | unknown | 🔧 Dynamic | src\config\columns.ts:102, src\fieldkit\types.ts:86, src\fieldkit\normalize.ts:80 (+3 more) |
| `ccFrontRef` | unknown | 🔧 Dynamic | src\config\complianceColumns.ts:55 |
| `cell` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:304, src\components\EntityTable.tsx:419, src\components\tables\GenericTable.tsx:153 (+1 more) |
| `changes` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:922 |
| `checkbox` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:396, src\components\EntityTable.tsx:909, src\components\EntityTable.tsx:2660 |
| `citizen` | unknown | 🔧 Dynamic | src\config\complianceColumns.ts:31, src\config\columns.ts:65, src\fieldkit\types.ts:31 (+5 more) |
| `city` | unknown | 🔧 Dynamic | src\config\complianceColumns.ts:48, src\fieldkit\types.ts:135, src\fieldkit\normalize.ts:28 (+1 more) |
| `className` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:341, src\components\EntityTable.tsx:346, src\components\EntityTable.tsx:366 (+7 more) |
| `clear` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:112, src\components\EntityTable.tsx:1820, src\components\EntityTable.tsx:2976 |
| `cleared` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:3197 |
| `clearError` | unknown | 🔧 Dynamic | src\state\authSlice.ts:125 |
| `client` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:404, src\state\entitiesSlice.ts:410, src\state\entitiesSlice.ts:420 (+11 more) |
| `cmp` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:147 |
| `codes` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:721 |
| `col` | unknown | 🔧 Dynamic | src\config\columns.ts:170, src\config\columns.ts:181, src\config\columns.ts:192 |
| `color` | unknown | 🔧 Dynamic | src\fieldkit\FieldRenderer.tsx:226, src\components\EntityTable.tsx:1052, src\components\EntityTable.tsx:1100 (+68 more) |
| `column` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:415 |
| `Column` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:671 |
| `columnDefinitions` | unknown | 🔧 Dynamic | src\components\tables\GenericTable.tsx:40 |
| `columnId` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:118, src\components\EntityTable.tsx:208, src\components\tables\GenericTable.tsx:226 |
| `columnResizeMode` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1661 |
| `columns` | unknown | 🔧 Dynamic | src\config\columns.ts:24, src\components\EntityTable.tsx:86, src\components\tables\GenericTable.tsx:134 (+1 more) |
| `comment` | unknown | 🔧 Dynamic | src\state\commentsSlice.ts:37, src\state\commentsSlice.ts:131, src\state\commentsSlice.ts:141 |
| `comments` | unknown | 🔧 Dynamic | src\config\complianceColumns.ts:73 |
| `commodities` | unknown | 🔧 Dynamic | src\config\columns.ts:151, src\fieldkit\types.ts:115, src\fieldkit\options.ts:70 (+1 more) |
| `complianceColumnDefinitions` | unknown | 🔧 Dynamic | src\config\complianceColumns.ts:11 |
| `componentName` | unknown | 🔧 Dynamic | src\fieldkit\index.ts:14 |
| `compute` | unknown | 🔧 Dynamic | src\config\fields.ts:99, src\config\fields.ts:177, src\config\fields.ts:178 (+1 more) |
| `conditions` | unknown | 🔧 Dynamic | src\components\tables\GenericTable.tsx:66 |
| `config` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:92, src\components\EntityTable.tsx:114, src\components\EntityTable.tsx:252 (+1 more) |
| `contained` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:2828, src\components\EntityTable.tsx:2855, src\components\EntityTable.tsx:2882 |
| `conversationAssignedAt` | unknown | 🔧 Dynamic | src\config\columns.ts:82, src\fieldkit\types.ts:65, src\fieldkit\normalize.ts:101 (+1 more) |
| `conversationOwner` | unknown | 🔧 Dynamic | src\config\complianceColumns.ts:17, src\config\columns.ts:48, src\fieldkit\types.ts:39 (+7 more) |
| `conversationOwnerAssignedAt` | unknown | 🔧 Dynamic | src\config\fields.ts:456 |
| `conversationOwnerEmail` | unknown | 🔧 Dynamic | src\config\fields.ts:408 |
| `conversationOwnerFields` | unknown | 🔧 Dynamic | src\config\fields.ts:393 |
| `conversationOwnerLastActive` | unknown | 🔧 Dynamic | src\config\fields.ts:450 |
| `conversationOwnerNotes` | unknown | 🔧 Dynamic | src\config\fields.ts:462 |
| `conversationOwnerRole` | unknown | 🔧 Dynamic | src\fieldkit\options.ts:118, src\config\fields.ts:427 |
| `conversationOwnerTeam` | unknown | 🔧 Dynamic | src\fieldkit\options.ts:110, src\config\fields.ts:415 |
| `conversationOwnerWorkload` | unknown | 🔧 Dynamic | src\fieldkit\options.ts:126, src\config\fields.ts:439 |
| `conversion` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:861 |
| `convertedAt` | unknown | 🔧 Dynamic | src\fieldkit\normalize.ts:103, src\state\entitiesSlice.ts:840, src\state\entitiesSlice.ts:853 (+3 more) |
| `count` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1793 |
| `country` | unknown | 🔧 Dynamic | src\config\complianceColumns.ts:28, src\config\columns.ts:60, src\fieldkit\types.ts:26 (+12 more) |
| `countryCode` | unknown | 🔧 Dynamic | src\config\columns.ts:61, src\fieldkit\types.ts:27, src\fieldkit\normalize.ts:109 (+10 more) |
| `countryIsoOrName` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:664 |
| `createdBy` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:943, src\state\entitiesSlice.ts:1036, src\state\commentsSlice.ts:95 (+1 more) |
| `creditCardBack` | unknown | 🔧 Dynamic | src\state\complianceSlice.ts:128 |
| `creditCardBackUpload` | unknown | 🔧 Dynamic | src\config\complianceColumns.ts:63, src\state\complianceSlice.ts:134 |
| `creditCardFront` | unknown | 🔧 Dynamic | src\state\complianceSlice.ts:127 |
| `creditCardFrontUpload` | unknown | 🔧 Dynamic | src\config\complianceColumns.ts:62, src\state\complianceSlice.ts:133 |
| `creditDateISO` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:1125 |
| `creditOutDateISO` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:1157 |
| `credits` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:1175 |
| `crypto` | unknown | 🔧 Dynamic | src\config\columns.ts:150, src\fieldkit\types.ts:114, src\fieldkit\options.ts:64 (+1 more) |
| `currentFTD` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:780 |
| `currentUser` | unknown | 🔧 Dynamic | src\state\authSlice.ts:15, src\state\authSlice.ts:22 |
| `cursor` | unknown | 🔧 Dynamic | src\components\tables\GenericTable.tsx:269 |
| `customDocuments` | unknown | 🔧 Dynamic | src\config\columns.ts:29 |
| `dark` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:2010, src\components\EntityTable.tsx:2017, src\components\EntityTable.tsx:2019 (+2 more) |
| `data` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1659, src\components\tables\GenericTable.tsx:39, src\components\tables\GenericTable.tsx:193 |
| `Data` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:964, src\state\entitiesSlice.ts:1057 |
| `date` | unknown | 🔧 Dynamic | src\fieldkit\FieldRenderer.tsx:173, src\fieldkit\FieldRenderer.tsx:268, src\components\EntityTable.tsx:167 (+3 more) |
| `dateConverted` | unknown | 🔧 Dynamic | src\config\complianceColumns.ts:38, src\state\entitiesSlice.ts:841, src\state\entitiesSlice.ts:867 (+3 more) |
| `dateOfBirth` | unknown | 🔧 Dynamic | src\config\columns.ts:62, src\fieldkit\types.ts:28, src\fieldkit\normalize.ts:92 (+10 more) |
| `datetime` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:382, src\components\EntityTable.tsx:905 |
| `daysToFtd` | unknown | 🔧 Dynamic | src\config\columns.ts:96, src\fieldkit\types.ts:81, src\fieldkit\normalize.ts:48 (+1 more) |
| `dc2626` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:2898, src\components\EntityTable.tsx:2899, src\components\EntityTable.tsx:3194 |
| `default` | unknown | 🔧 Dynamic | src\fieldkit\normalize.ts:142, src\fieldkit\normalize.ts:218, src\components\EntityTable.tsx:158 (+7 more) |
| `DEFAULT_ASSETS` | unknown | 🔧 Dynamic | src\state\assetsSlice.ts:16 |
| `defaultColumns` | unknown | 🔧 Dynamic | src\config\columns.ts:167 |
| `defaultSize` | unknown | 🔧 Dynamic | src\state\accountTypeAssetRulesSlice.ts:170 |
| `defaultValue` | unknown | 🔧 Dynamic | src\config\fields.ts:80, src\config\fields.ts:131, src\config\fields.ts:132 (+33 more) |
| `defaultVisible` | unknown | 🔧 Dynamic | src\config\complianceColumns.ts:13, src\config\complianceColumns.ts:14, src\config\complianceColumns.ts:15 (+139 more) |
| `delay` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1697 |
| `deleteComment` | unknown | 🔧 Dynamic | src\state\commentsSlice.ts:58 |
| `deleteNote` | unknown | 🔧 Dynamic | src\state\notesSlice.ts:56 |
| `depositDateISO` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:1007 |
| `depositLimit` | unknown | 🔧 Dynamic | src\config\columns.ts:141, src\fieldkit\types.ts:104, src\fieldkit\normalize.ts:49 (+4 more) |
| `desc` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:938, src\components\EntityTable.tsx:941, src\components\EntityTable.tsx:946 (+3 more) |
| `desk` | unknown | 🔧 Dynamic | src\config\complianceColumns.ts:15, src\config\columns.ts:46, src\fieldkit\types.ts:37 (+9 more) |
| `details` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:849 |
| `digits` | unknown | 🔧 Dynamic | src\fieldkit\normalize.ts:165 |
| `display` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1049, src\components\EntityTable.tsx:1156, src\components\EntityTable.tsx:1330 (+13 more) |
| `displayValue` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:529, src\components\EntityTable.tsx:548 |
| `dob` | unknown | 🔧 Dynamic | src\config\complianceColumns.ts:29 |
| `dobISO` | unknown | 🔧 Dynamic | src\config\fields.ts:42 |
| `documents` | unknown | 🔧 Dynamic | src\config\fields.ts:229 |
| `dod` | unknown | 🔧 Dynamic | src\config\complianceColumns.ts:57, src\config\columns.ts:104, src\fieldkit\types.ts:88 (+4 more) |
| `dynamicOptionsMap` | unknown | 🔧 Dynamic | src\fieldkit\options.ts:199 |
| `editComment` | unknown | 🔧 Dynamic | src\state\commentsSlice.ts:47 |
| `editNote` | unknown | 🔧 Dynamic | src\state\notesSlice.ts:46 |
| `ef4444` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:2735, src\components\EntityTable.tsx:2894 |
| `elevation` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:2126 |
| `email` | unknown | 🔧 Dynamic | src\config\complianceColumns.ts:25, src\config\columns.ts:57, src\fieldkit\types.ts:21 (+22 more) |
| `enableColumnResizing` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1684 |
| `enabled` | unknown | 🔧 Dynamic | src\state\assetsSlice.ts:8, src\state\assetsSlice.ts:18, src\state\assetsSlice.ts:19 (+21 more) |
| `enableGlobalFilter` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1685 |
| `enableHiding` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:324, src\components\EntityTable.tsx:687 |
| `enableLogin` | unknown | 🔧 Dynamic | src\config\columns.ts:135, src\fieldkit\types.ts:97, src\fieldkit\options.ts:148 (+4 more) |
| `enableResizing` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:325 |
| `enableRowSelection` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1683 |
| `enableSorting` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:323, src\components\EntityTable.tsx:686 |
| `endISO` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:441 |
| `entities` | unknown | 🔧 Dynamic | src\fieldkit\types.ts:144, src\fieldkit\options.ts:201, src\fieldkit\options.ts:205 (+6 more) |
| `entity` | unknown | 🔧 Dynamic | src\config\fields.ts:11, src\config\fields.ts:99, src\config\fields.ts:177 (+2 more) |
| `entityId` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:644, src\state\entitiesSlice.ts:730, src\state\entitiesSlice.ts:769 (+1 more) |
| `entityType` | unknown | 🔧 Dynamic | src\components\tables\GenericTable.tsx:38 |
| `equity` | unknown | 🔧 Dynamic | src\fieldkit\types.ts:128, src\fieldkit\normalize.ts:61, src\state\entitiesSlice.ts:300 |
| `error` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:203, src\components\EntityTable.tsx:224, src\components\EntityTable.tsx:1813 (+1 more) |
| `extraReducers` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:1240, src\state\authSlice.ts:129 |
| `f0f9ff` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1194 |
| `f0fdf4` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:2226 |
| `f8fafc` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:720 |
| `f9fafb` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1305 |
| `ffffff` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:3259 |
| `field` | unknown | 🔧 Dynamic | src\state\accountTypeAssetRulesSlice.ts:98 |
| `fieldKey` | unknown | 🔧 Dynamic | src\fieldkit\FieldRenderer.tsx:11, src\components\EntityTable.tsx:2337, src\components\EntityTable.tsx:2935 (+2 more) |
| `FieldRenderer` | unknown | 🔧 Dynamic | src\fieldkit\FieldRenderer.tsx:35 |
| `fields` | unknown | 🔧 Dynamic | src\config\fields.ts:16, src\config\fields.ts:37, src\config\fields.ts:64 (+17 more) |
| `fieldType` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:2337 |
| `filter` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:348 |
| `filterFn` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:688 |
| `filterValue` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:118, src\components\EntityTable.tsx:208 |
| `finance` | unknown | 🔧 Dynamic | src\config\fields.ts:169 |
| `firstConversationOwner` | unknown | 🔧 Dynamic | src\config\columns.ts:81, src\fieldkit\types.ts:64, src\fieldkit\normalize.ts:17 (+1 more) |
| `firstLoginAt` | unknown | 🔧 Dynamic | src\config\columns.ts:70, src\fieldkit\types.ts:46, src\fieldkit\normalize.ts:96 (+2 more) |
| `firstName` | unknown | 🔧 Dynamic | src\config\complianceColumns.ts:23, src\config\columns.ts:55, src\fieldkit\types.ts:19 (+8 more) |
| `firstTradedAt` | unknown | 🔧 Dynamic | src\config\complianceColumns.ts:35, src\fieldkit\types.ts:72, src\fieldkit\normalize.ts:104 (+2 more) |
| `flex` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1481, src\components\EntityTable.tsx:1489 |
| `flexDirection` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1049, src\components\EntityTable.tsx:1156, src\components\EntityTable.tsx:2235 |
| `flexGrow` | unknown | 🔧 Dynamic | src\components\tables\GenericTableHeader.tsx:176 |
| `followUpAt` | unknown | 🔧 Dynamic | src\config\complianceColumns.ts:37, src\config\columns.ts:73, src\fieldkit\types.ts:49 (+4 more) |
| `fontFamily` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1052, src\components\EntityTable.tsx:1061, src\components\EntityTable.tsx:1086 (+46 more) |
| `fontSize` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1066, src\components\EntityTable.tsx:1087, src\components\EntityTable.tsx:1114 (+48 more) |
| `fontStyle` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:2544 |
| `fontWeight` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1180, src\components\EntityTable.tsx:1302, src\components\EntityTable.tsx:1328 (+43 more) |
| `forex` | unknown | 🔧 Dynamic | src\config\columns.ts:149, src\fieldkit\types.ts:113, src\fieldkit\options.ts:58 (+1 more) |
| `formattedValue` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:682 |
| `found` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:1001, src\state\entitiesSlice.ts:1088, src\state\entitiesSlice.ts:1131 (+1 more) |
| `freeMargin` | unknown | 🔧 Dynamic | src\fieldkit\types.ts:125, src\fieldkit\normalize.ts:58, src\state\entitiesSlice.ts:298 |
| `from` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:906, src\components\EntityTable.tsx:1008 |
| `ftd` | unknown | 🔧 Dynamic | src\config\columns.ts:92, src\fieldkit\types.ts:78, src\fieldkit\options.ts:30 (+10 more) |
| `ftdDate` | unknown | 🔧 Dynamic | src\config\complianceColumns.ts:67, src\config\columns.ts:91, src\fieldkit\types.ts:77 (+6 more) |
| `ftdDateISO` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:942 |
| `ftdFirstConversation` | unknown | 🔧 Dynamic | src\config\columns.ts:95, src\fieldkit\types.ts:80, src\fieldkit\options.ts:143 (+2 more) |
| `ftdSelf` | unknown | 🔧 Dynamic | src\config\columns.ts:93, src\fieldkit\types.ts:79, src\fieldkit\options.ts:133 (+4 more) |
| `ftwDateISO` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:1035 |
| `fullName` | unknown | 🔧 Dynamic | src\state\authSlice.ts:9, src\state\authSlice.ts:51, src\state\authSlice.ts:103 |
| `gap` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1049, src\components\EntityTable.tsx:1156, src\components\EntityTable.tsx:2235 (+10 more) |
| `gclid` | unknown | 🔧 Dynamic | src\config\columns.ts:123, src\fieldkit\types.ts:93, src\fieldkit\normalize.ts:21 (+1 more) |
| `gender` | unknown | 🔧 Dynamic | src\config\complianceColumns.ts:30, src\config\columns.ts:64, src\fieldkit\types.ts:30 (+7 more) |
| `general` | unknown | 🔧 Dynamic | src\config\fields.ts:59 |
| `getCoreRowModel` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1663, src\components\tables\GenericTable.tsx:199 |
| `getFilteredRowModel` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1665 |
| `getPaginationRowModel` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1666 |
| `getRowId` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1662 |
| `getSortedRowModel` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1664, src\components\tables\GenericTable.tsx:200 |
| `globalCustomDocuments` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:255, src\state\entitiesSlice.ts:400 |
| `gte` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:155, src\components\EntityTable.tsx:178 |
| `height` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1439, src\components\EntityTable.tsx:2048, src\components\EntityTable.tsx:2645 (+5 more) |
| `horizontal` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1269, src\components\EntityTable.tsx:1270, src\components\EntityTable.tsx:2124 (+5 more) |
| `hover` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:366, src\components\EntityTable.tsx:426, src\components\EntityTable.tsx:447 (+13 more) |
| `idDoc` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:317, src\state\entitiesSlice.ts:355, src\state\entitiesSlice.ts:384 |
| `idPassport` | unknown | 🔧 Dynamic | src\config\columns.ts:100, src\fieldkit\types.ts:84, src\fieldkit\normalize.ts:78 (+2 more) |
| `idPassportNumber` | unknown | 🔧 Dynamic | src\config\complianceColumns.ts:53 |
| `idPassportUpload` | unknown | 🔧 Dynamic | src\config\complianceColumns.ts:60, src\state\complianceSlice.ts:131 |
| `indices` | unknown | 🔧 Dynamic | src\config\columns.ts:152, src\fieldkit\types.ts:116, src\fieldkit\options.ts:76 (+1 more) |
| `initial` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1587 |
| `isActive` | unknown | 🔧 Dynamic | src\state\notesSlice.ts:39, src\state\accountTypesSlice.ts:48, src\state\accountTypesSlice.ts:74 (+1 more) |
| `isAuthenticated` | unknown | 🔧 Dynamic | src\state\authSlice.ts:16, src\state\authSlice.ts:23 |
| `isCustomDocument` | unknown | 🔧 Dynamic | src\config\columns.ts:36 |
| `isEmpty` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:130 |
| `isLoading` | unknown | 🔧 Dynamic | src\state\authSlice.ts:17, src\state\authSlice.ts:24 |
| `italic` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:2544 |
| `items` | unknown | 🔧 Dynamic | src\state\assetsSlice.ts:12, src\state\assetsSlice.ts:46, src\state\accountTypesSlice.ts:21 (+1 more) |
| `justifyContent` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1331, src\components\EntityTable.tsx:1356, src\components\EntityTable.tsx:2221 (+1 more) |
| `key` | unknown | 🔧 Dynamic | src\fieldkit\types.ts:149, src\fieldkit\options.ts:266, src\fieldkit\normalize.ts:225 (+193 more) |
| `kind` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:906 |
| `language` | unknown | 🔧 Dynamic | src\config\complianceColumns.ts:32, src\config\columns.ts:66, src\fieldkit\types.ts:32 (+6 more) |
| `last` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:2808, src\components\ui\table.tsx:45, src\components\ui\table.tsx:84 |
| `lastActivityAt` | unknown | 🔧 Dynamic | src\config\columns.ts:72, src\fieldkit\types.ts:48, src\fieldkit\normalize.ts:98 (+2 more) |
| `lastCommentAt` | unknown | 🔧 Dynamic | src\fieldkit\types.ts:45, src\fieldkit\normalize.ts:95, src\state\entitiesSlice.ts:307 (+2 more) |
| `lastContactAt` | unknown | 🔧 Dynamic | src\config\columns.ts:69, src\fieldkit\types.ts:44, src\fieldkit\normalize.ts:94 (+4 more) |
| `lastLoginAt` | unknown | 🔧 Dynamic | src\config\columns.ts:71, src\fieldkit\types.ts:47, src\fieldkit\normalize.ts:97 (+4 more) |
| `lastModified` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:11 |
| `lastName` | unknown | 🔧 Dynamic | src\config\complianceColumns.ts:24, src\config\columns.ts:56, src\fieldkit\types.ts:20 (+8 more) |
| `lastTradedAt` | unknown | 🔧 Dynamic | src\config\complianceColumns.ts:36, src\fieldkit\types.ts:73, src\fieldkit\normalize.ts:105 (+2 more) |
| `lead` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:883 |
| `leadSource` | unknown | 🔧 Dynamic | src\config\complianceColumns.ts:72, src\config\columns.ts:109, src\fieldkit\types.ts:61 (+4 more) |
| `left` | unknown | 🔧 Dynamic | src\components\tables\GenericTableHeader.tsx:179 |
| `letterSpacing` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:2236, src\components\EntityTable.tsx:3023, src\components\EntityTable.tsx:3090 (+3 more) |
| `leverage` | unknown | 🔧 Dynamic | src\state\accountTypeAssetRulesSlice.ts:168 |
| `lightNormalized` | unknown | 🔧 Dynamic | src\fieldkit\normalize.ts:158, src\fieldkit\normalize.ts:212 |
| `line1` | unknown | 🔧 Dynamic | src\fieldkit\types.ts:132, src\fieldkit\normalize.ts:25 |
| `line2` | unknown | 🔧 Dynamic | src\fieldkit\types.ts:133, src\fieldkit\normalize.ts:26 |
| `loginCount` | unknown | 🔧 Dynamic | src\config\columns.ts:78, src\fieldkit\types.ts:54, src\fieldkit\normalize.ts:45 (+2 more) |
| `logout` | unknown | 🔧 Dynamic | src\state\authSlice.ts:118 |
| `lte` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:157, src\components\EntityTable.tsx:180 |
| `manualCC` | unknown | 🔧 Dynamic | src\fieldkit\normalize.ts:281 |
| `margin` | unknown | 🔧 Dynamic | src\fieldkit\types.ts:126, src\fieldkit\normalize.ts:59, src\components\EntityTable.tsx:1187 (+3 more) |
| `marginCall` | unknown | 🔧 Dynamic | src\config\columns.ts:143, src\fieldkit\types.ts:107, src\fieldkit\normalize.ts:51 (+4 more) |
| `marginLeft` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1971 |
| `marginLevel` | unknown | 🔧 Dynamic | src\fieldkit\types.ts:122, src\fieldkit\normalize.ts:55, src\state\entitiesSlice.ts:295 |
| `marketing` | unknown | 🔧 Dynamic | src\config\fields.ts:258 |
| `maxHeight` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1152, src\components\EntityTable.tsx:1276 |
| `maxSize` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:328, src\state\accountTypeAssetRulesSlice.ts:173 |
| `maxWidth` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1275, src\components\EntityTable.tsx:2126, src\components\EntityTable.tsx:2188 (+2 more) |
| `miniDeposit` | unknown | 🔧 Dynamic | src\config\columns.ts:144, src\fieldkit\types.ts:108, src\fieldkit\normalize.ts:52 (+2 more) |
| `minSize` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:327, src\state\accountTypeAssetRulesSlice.ts:172 |
| `minWidth` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:804, src\components\EntityTable.tsx:1274, src\components\EntityTable.tsx:1437 (+7 more) |
| `mixed` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:2321 |
| `mode` | unknown | 🔧 Dynamic | src\fieldkit\normalize.ts:227, src\components\EntityTable.tsx:104, src\components\EntityTable.tsx:898 (+6 more) |
| `money` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:380 |
| `nationality` | unknown | 🔧 Dynamic | src\config\complianceColumns.ts:50, src\state\complianceSlice.ts:121, src\config\fields.ts:241 |
| `netCredit` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:436 |
| `netWithdrawal` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:425 |
| `newLead` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:496 |
| `newOrder` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:96 |
| `newValue` | unknown | 🔧 Dynamic | src\fieldkit\FieldRenderer.tsx:57 |
| `noAnswerCount` | unknown | 🔧 Dynamic | src\config\columns.ts:76, src\fieldkit\types.ts:52, src\fieldkit\normalize.ts:43 (+2 more) |
| `none` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:716, src\components\EntityTable.tsx:2838, src\components\EntityTable.tsx:2865 (+1 more) |
| `note` | unknown | 🔧 Dynamic | src\state\notesSlice.ts:35, src\state\notesSlice.ts:79 |
| `notEmpty` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:128 |
| `number` | unknown | 🔧 Dynamic | src\fieldkit\normalize.ts:280, src\components\EntityTable.tsx:386, src\components\EntityTable.tsx:900 (+1 more) |
| `obj` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:332, src\components\EntityTable.tsx:1513, src\config\fields.ts:387 |
| `onChange` | unknown | 🔧 Dynamic | src\fieldkit\FieldRenderer.tsx:13 |
| `onClearSelection` | unknown | 🔧 Dynamic | src\components\tables\GenericTableHeader.tsx:28 |
| `onClick` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:358, src\components\EntityTable.tsx:562, src\components\EntityTable.tsx:580 |
| `onClose` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:110, src\components\EntityTable.tsx:824 |
| `onColumnFiltersChange` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1677 |
| `onColumnOrderChange` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1681 |
| `onColumnsClick` | unknown | 🔧 Dynamic | src\components\tables\GenericTableHeader.tsx:26 |
| `onColumnVisibilityChange` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1678 |
| `onExportClick` | unknown | 🔧 Dynamic | src\components\tables\GenericTableHeader.tsx:23, src\components\tables\GenericTable.tsx:43 |
| `onFilterClick` | unknown | 🔧 Dynamic | src\components\tables\GenericTableHeader.tsx:24 |
| `onGlobalFilterChange` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1682 |
| `onImportClick` | unknown | 🔧 Dynamic | src\components\tables\GenericTableHeader.tsx:22, src\components\tables\GenericTable.tsx:42 |
| `online` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:825, src\state\entitiesSlice.ts:826, src\state\entitiesSlice.ts:827 (+2 more) |
| `Online` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:437 |
| `onMassChangesClick` | unknown | 🔧 Dynamic | src\components\tables\GenericTableHeader.tsx:27 |
| `onModeChange` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:2319 |
| `onNewClick` | unknown | 🔧 Dynamic | src\components\tables\GenericTableHeader.tsx:21, src\components\tables\GenericTable.tsx:41 |
| `onOpenColumnEditor` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:704 |
| `onOpenFilterMenu` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:705 |
| `onPaginationChange` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1680 |
| `onRowSelectionChange` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1679 |
| `onSave` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:112 |
| `onSearchChange` | unknown | 🔧 Dynamic | src\components\tables\GenericTableHeader.tsx:20 |
| `onSortingChange` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1676, src\components\tables\GenericTable.tsx:198 |
| `onValueChange` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:2320 |
| `onViewsClick` | unknown | 🔧 Dynamic | src\components\tables\GenericTableHeader.tsx:25 |
| `opacity` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:713, src\components\EntityTable.tsx:1138, src\components\EntityTable.tsx:1254 (+1 more) |
| `open` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:109, src\components\EntityTable.tsx:822 |
| `openVolume` | unknown | 🔧 Dynamic | src\fieldkit\types.ts:129, src\fieldkit\normalize.ts:62, src\state\entitiesSlice.ts:301 |
| `options` | unknown | 🔧 Dynamic | src\config\complianceColumns.ts:20, src\config\complianceColumns.ts:30, src\config\complianceColumns.ts:31 (+20 more) |
| `outline` | unknown | 🔧 Dynamic | src\components\tables\GenericTableHeader.tsx:201 |
| `overflow` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1277 |
| `overflowY` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1152 |
| `padding` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1085, src\components\EntityTable.tsx:1133, src\components\EntityTable.tsx:1249 (+2 more) |
| `pageIndex` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1548 |
| `pageSize` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1549 |
| `passport` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:318, src\state\entitiesSlice.ts:356, src\state\entitiesSlice.ts:385 |
| `password` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:482 |
| `passwordPlain` | unknown | 🔧 Dynamic | src\state\authSlice.ts:30 |
| `patch` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:112, src\components\EntityTable.tsx:1820, src\components\EntityTable.tsx:2975 (+1 more) |
| `pattern` | unknown | 🔧 Dynamic | src\fieldkit\FieldRenderer.tsx:197 |
| `payload` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:490 |
| `percentage` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:390 |
| `permission` | unknown | 🔧 Dynamic | src\state\authSlice.ts:10, src\state\authSlice.ts:52, src\state\authSlice.ts:104 |
| `phone` | unknown | 🔧 Dynamic | src\config\complianceColumns.ts:26, src\components\EntityTable.tsx:337, src\components\EntityTable.tsx:402 (+6 more) |
| `phone2` | unknown | 🔧 Dynamic | src\config\complianceColumns.ts:27, src\state\entitiesSlice.ts:703, src\state\entitiesSlice.ts:717 (+2 more) |
| `phoneKey` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:337 |
| `phoneNumber` | unknown | 🔧 Dynamic | src\config\columns.ts:58, src\fieldkit\types.ts:22, src\fieldkit\normalize.ts:37 (+7 more) |
| `phoneNumber2` | unknown | 🔧 Dynamic | src\config\columns.ts:59, src\fieldkit\types.ts:23, src\fieldkit\normalize.ts:38 (+2 more) |
| `platform` | unknown | 🔧 Dynamic | src\config\columns.ts:130, src\fieldkit\types.ts:94, src\fieldkit\options.ts:89 (+3 more) |
| `pointer` | unknown | 🔧 Dynamic | src\components\tables\GenericTable.tsx:269 |
| `position` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:714, src\components\tables\GenericTableHeader.tsx:176, src\components\tables\GenericTableHeader.tsx:178 (+1 more) |
| `positions` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1785 |
| `Preview` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:3163 |
| `profileTabs` | unknown | 🔧 Dynamic | src\config\fields.ts:57 |
| `proofOfAddress` | unknown | 🔧 Dynamic | src\config\columns.ts:101, src\fieldkit\types.ts:85, src\fieldkit\normalize.ts:79 (+5 more) |
| `proofOfAddressRef` | unknown | 🔧 Dynamic | src\config\complianceColumns.ts:54 |
| `proofOfAddressUpload` | unknown | 🔧 Dynamic | src\config\complianceColumns.ts:61, src\state\complianceSlice.ts:132 |
| `query` | unknown | 🔧 Dynamic | src\components\tables\GenericTableHeader.tsx:20, src\state\complianceSlice.ts:146 |
| `quote` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:388 |
| `rating` | unknown | 🔧 Dynamic | src\fieldkit\normalize.ts:89, src\components\EntityTable.tsx:392, src\components\EntityTable.tsx:901 |
| `regulation` | unknown | 🔧 Dynamic | src\config\complianceColumns.ts:42, src\config\columns.ts:51, src\fieldkit\types.ts:41 (+12 more) |
| `rel` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:902, src\components\EntityTable.tsx:906 |
| `removeGlobalCustomDocument` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:1217 |
| `removeOne` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:916 |
| `Result` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:671 |
| `retentionAssignedAt` | unknown | 🔧 Dynamic | src\fieldkit\types.ts:69, src\fieldkit\normalize.ts:102, src\state\entitiesSlice.ts:842 (+2 more) |
| `retentionManager` | unknown | 🔧 Dynamic | src\config\complianceColumns.ts:19, src\state\complianceSlice.ts:93, src\config\fields.ts:72 |
| `retentionOwner` | unknown | 🔧 Dynamic | src\config\complianceColumns.ts:18, src\fieldkit\types.ts:67, src\fieldkit\normalize.ts:16 (+8 more) |
| `retentionOwnerAssignedAt` | unknown | 🔧 Dynamic | src\config\fields.ts:545 |
| `retentionOwnerEmail` | unknown | 🔧 Dynamic | src\config\fields.ts:485 |
| `retentionOwnerFields` | unknown | 🔧 Dynamic | src\config\fields.ts:470 |
| `retentionOwnerLastActive` | unknown | 🔧 Dynamic | src\config\fields.ts:539 |
| `retentionOwnerNotes` | unknown | 🔧 Dynamic | src\config\fields.ts:551 |
| `retentionOwnerRole` | unknown | 🔧 Dynamic | src\config\fields.ts:516 |
| `retentionOwnerTeam` | unknown | 🔧 Dynamic | src\config\fields.ts:504 |
| `retentionOwnerTier` | unknown | 🔧 Dynamic | src\config\fields.ts:492 |
| `retentionOwnerWorkload` | unknown | 🔧 Dynamic | src\config\fields.ts:528 |
| `retentionReview` | unknown | 🔧 Dynamic | src\config\columns.ts:86, src\fieldkit\normalize.ts:87, src\fieldkit\normalize.ts:117 (+3 more) |
| `right` | unknown | 🔧 Dynamic | src\components\tables\GenericTableHeader.tsx:216 |
| `role` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:825, src\state\entitiesSlice.ts:826, src\state\entitiesSlice.ts:827 (+2 more) |
| `row` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:93, src\components\EntityTable.tsx:118, src\components\EntityTable.tsx:208 (+1 more) |
| `rows` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:91, src\state\complianceSlice.ts:146 |
| `rule` | unknown | 🔧 Dynamic | src\state\accountTypeAssetRulesSlice.ts:31, src\state\accountTypeAssetRulesSlice.ts:151 |
| `rules` | unknown | 🔧 Dynamic | src\state\accountTypeAssetRulesSlice.ts:66, src\state\accountTypeAssetRulesSlice.ts:186 |
| `salesManager` | unknown | 🔧 Dynamic | src\config\complianceColumns.ts:16, src\config\columns.ts:47, src\fieldkit\types.ts:38 (+7 more) |
| `salesReview` | unknown | 🔧 Dynamic | src\config\columns.ts:85, src\fieldkit\normalize.ts:86, src\fieldkit\normalize.ts:116 (+3 more) |
| `salesSecondHand` | unknown | 🔧 Dynamic | src\config\columns.ts:87, src\fieldkit\types.ts:60, src\fieldkit\options.ts:138 (+3 more) |
| `searchQuery` | unknown | 🔧 Dynamic | src\components\tables\GenericTableHeader.tsx:19 |
| `secondHandRetention` | unknown | 🔧 Dynamic | src\config\fields.ts:149 |
| `sections` | unknown | 🔧 Dynamic | src\config\fields.ts:24, src\config\fields.ts:61, src\config\fields.ts:171 (+3 more) |
| `seeded` | unknown | 🔧 Dynamic | src\state\assetsSlice.ts:13, src\state\assetsSlice.ts:47, src\state\accountTypesSlice.ts:22 (+1 more) |
| `select` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:404, src\components\EntityTable.tsx:912, src\components\EntityTable.tsx:1147 (+2 more) |
| `selectColumn` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:284 |
| `selectedCount` | unknown | 🔧 Dynamic | src\components\tables\GenericTableHeader.tsx:18 |
| `selectedRows` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:111, src\components\EntityTable.tsx:2322 |
| `selectFilterFn` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:688 |
| `setEntities` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:895 |
| `setEntityField` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:928 |
| `settings` | unknown | 🔧 Dynamic | src\config\fields.ts:305 |
| `shrink` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:2774 |
| `size` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:326, src\components\EntityTable.tsx:369, src\components\EntityTable.tsx:590 (+3 more) |
| `sort` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:932, src\components\EntityTable.tsx:956 |
| `spread` | unknown | 🔧 Dynamic | src\state\accountTypeAssetRulesSlice.ts:169 |
| `stars` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:393, src\components\EntityTable.tsx:449 |
| `startAdornment` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:2757, src\components\EntityTable.tsx:2777, src\components\EntityTable.tsx:2796 |
| `startISO` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:441 |
| `staticOptionsMap` | unknown | 🔧 Dynamic | src\fieldkit\options.ts:19 |
| `step` | unknown | 🔧 Dynamic | src\fieldkit\FieldRenderer.tsx:144 |
| `stepSize` | unknown | 🔧 Dynamic | src\state\accountTypeAssetRulesSlice.ts:171 |
| `stocks` | unknown | 🔧 Dynamic | src\config\columns.ts:153, src\fieldkit\types.ts:117, src\fieldkit\options.ts:82 (+1 more) |
| `stopOut` | unknown | 🔧 Dynamic | src\config\columns.ts:145, src\fieldkit\types.ts:109, src\fieldkit\normalize.ts:53 (+2 more) |
| `style` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:712, src\components\EntityTable.tsx:802 |
| `tag` | unknown | 🔧 Dynamic | src\config\columns.ts:108, src\fieldkit\types.ts:92, src\fieldkit\options.ts:217 (+2 more) |
| `team` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:825, src\state\entitiesSlice.ts:826, src\state\entitiesSlice.ts:827 (+2 more) |
| `tel` | unknown | 🔧 Dynamic | src\fieldkit\FieldRenderer.tsx:269 |
| `text` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:132, src\components\EntityTable.tsx:403, src\components\EntityTable.tsx:894 (+4 more) |
| `textAlign` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1201, src\components\EntityTable.tsx:2207 |
| `textarea` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:897, src\components\EntityTable.tsx:1047 |
| `textTransform` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1915, src\components\EntityTable.tsx:1935, src\components\EntityTable.tsx:1953 (+12 more) |
| `tier` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:825, src\state\entitiesSlice.ts:826, src\state\entitiesSlice.ts:827 (+2 more) |
| `title` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:367, src\components\EntityTable.tsx:589, src\components\tables\GenericTableHeader.tsx:15 (+27 more) |
| `toggleActive` | unknown | 🔧 Dynamic | src\state\notesSlice.ts:62 |
| `togglePin` | unknown | 🔧 Dynamic | src\state\commentsSlice.ts:64 |
| `tolerance` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1698 |
| `top` | unknown | 🔧 Dynamic | src\components\tables\GenericTableHeader.tsx:180, src\components\tables\GenericTableHeader.tsx:217 |
| `totalChargebacks` | unknown | 🔧 Dynamic | src\config\fields.ts:222 |
| `totalCount` | unknown | 🔧 Dynamic | src\components\tables\GenericTableHeader.tsx:17 |
| `totalCredit` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:434, src\state\entitiesSlice.ts:1178 |
| `totalCreditOut` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:435, src\state\entitiesSlice.ts:1179 |
| `totalCredits` | unknown | 🔧 Dynamic | src\config\columns.ts:97 |
| `totalDeposit` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:414 |
| `totalFTW` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:1073 |
| `totalMargin` | unknown | 🔧 Dynamic | src\fieldkit\types.ts:127, src\fieldkit\normalize.ts:60 |
| `totalWithdrawal` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:424 |
| `tradeOut` | unknown | 🔧 Dynamic | src\state\accountTypesSlice.ts:15, src\state\accountTypesSlice.ts:56, src\state\accountTypesSlice.ts:82 |
| `transform` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:715, src\components\EntityTable.tsx:2465, src\components\EntityTable.tsx:2471 (+6 more) |
| `transition` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:716, src\components\EntityTable.tsx:2460, src\components\EntityTable.tsx:2502 (+8 more) |
| `true` | unknown | 🔧 Dynamic | src\fieldkit\FieldRenderer.tsx:108, src\components\EntityTable.tsx:1592 |
| `twoFAEnabled` | unknown | 🔧 Dynamic | src\fieldkit\types.ts:101, src\fieldkit\options.ts:168, src\fieldkit\normalize.ts:74 |
| `type` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:837, src\state\entitiesSlice.ts:875 |
| `update` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:998, src\state\entitiesSlice.ts:1085 |
| `updateGlobalCustomDocument` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:1221 |
| `updateOne` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:922 |
| `updates` | unknown | 🔧 Dynamic | src\state\assetsSlice.ts:74 |
| `upsertMany` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:898 |
| `upsertOne` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:908 |
| `url` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:12 |
| `userSelect` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:350 |
| `utmAccount` | unknown | 🔧 Dynamic | src\config\columns.ts:126, src\config\fields.ts:293 |
| `utmAdGroupId` | unknown | 🔧 Dynamic | src\config\columns.ts:115, src\config\fields.ts:277 |
| `utmAdGroupName` | unknown | 🔧 Dynamic | src\config\columns.ts:129, src\config\fields.ts:297 |
| `utmAdPosition` | unknown | 🔧 Dynamic | src\config\columns.ts:116, src\config\fields.ts:278 |
| `utmCampaign` | unknown | 🔧 Dynamic | src\config\columns.ts:131, src\config\fields.ts:295 |
| `utmCampaignId` | unknown | 🔧 Dynamic | src\config\columns.ts:128, src\config\fields.ts:296 |
| `utmContent` | unknown | 🔧 Dynamic | src\config\columns.ts:124, src\config\fields.ts:291 |
| `utmCountry` | unknown | 🔧 Dynamic | src\config\columns.ts:117, src\config\fields.ts:279 |
| `utmCreative` | unknown | 🔧 Dynamic | src\config\columns.ts:112, src\config\fields.ts:269 |
| `utmDevice` | unknown | 🔧 Dynamic | src\config\columns.ts:132, src\config\fields.ts:299 |
| `utmFeedItemId` | unknown | 🔧 Dynamic | src\config\columns.ts:118, src\config\fields.ts:280 |
| `utmKeyword` | unknown | 🔧 Dynamic | src\config\columns.ts:110, src\config\fields.ts:267 |
| `utmLandingPage` | unknown | 🔧 Dynamic | src\config\columns.ts:119, src\config\fields.ts:281 |
| `utmLanguage` | unknown | 🔧 Dynamic | src\config\columns.ts:120, src\config\fields.ts:282 |
| `utmMatchType` | unknown | 🔧 Dynamic | src\config\columns.ts:121, src\config\fields.ts:283 |
| `utmMedium` | unknown | 🔧 Dynamic | src\config\columns.ts:114, src\config\fields.ts:271 |
| `utmSource` | unknown | 🔧 Dynamic | src\config\columns.ts:125, src\config\fields.ts:292 |
| `utmTargetId` | unknown | 🔧 Dynamic | src\config\columns.ts:122, src\config\fields.ts:284 |
| `utmTerm` | unknown | 🔧 Dynamic | src\config\columns.ts:111, src\config\fields.ts:268 |
| `val` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:164, src\components\EntityTable.tsx:898, src\components\EntityTable.tsx:902 (+4 more) |
| `vals` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:913, src\components\EntityTable.tsx:1167 |
| `Value` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:671 |
| `Verified` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:466 |
| `vertical` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:1269, src\components\EntityTable.tsx:1270, src\components\EntityTable.tsx:2124 (+5 more) |
| `View` | unknown | 🔧 Dynamic | src\components\tables\GenericTableHeader.tsx:119 |
| `visibility` | unknown | 🔧 Dynamic | src\components\tables\GenericTable.tsx:78, src\components\tables\GenericTable.tsx:94 |
| `WebkitFilter` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:349 |
| `white` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:2839, src\components\EntityTable.tsx:2866, src\components\EntityTable.tsx:2893 |
| `whiteSpace` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:717 |
| `width` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:718, src\components\EntityTable.tsx:803, src\components\EntityTable.tsx:1188 (+7 more) |
| `withdrawalDateISO` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:1094 |
| `withdrawFromDeposit` | unknown | 🔧 Dynamic | src\config\fields.ts:223 |
| `withdrawLimit` | unknown | 🔧 Dynamic | src\config\columns.ts:138, src\fieldkit\types.ts:106, src\fieldkit\normalize.ts:50 (+4 more) |
| `withdrawLimitAllowed` | unknown | 🔧 Dynamic | src\fieldkit\types.ts:100, src\fieldkit\options.ts:163, src\fieldkit\normalize.ts:73 |
| `workload` | unknown | 🔧 Dynamic | src\state\entitiesSlice.ts:825, src\state\entitiesSlice.ts:826, src\state\entitiesSlice.ts:827 (+2 more) |
| `Yes` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:395, src\state\entitiesSlice.ts:779, src\config\fields.ts:177 (+2 more) |
| `zIndex` | unknown | 🔧 Dynamic | src\components\EntityTable.tsx:719, src\components\EntityTable.tsx:1278 |

## Users Domain

| Field | Type | Classification | Sources |
|-------|------|----------------|---------|
| `initialState` | unknown | 🔒 Static | src\state\usersSlice.ts:28 |
| `state` | unknown | 🔒 Static | src\state\usersSlice.ts:184, src\state\usersSlice.ts:185, src\state\usersSlice.ts:196 (+4 more) |
| `status` | unknown | 🔒 Static | src\components\UsersTable.tsx:52 |
| `01T10` | unknown | 🔧 Dynamic | src\state\usersSlice.ts:57 |
| `05T13` | unknown | 🔧 Dynamic | src\state\usersSlice.ts:83 |
| `08T15` | unknown | 🔧 Dynamic | src\state\usersSlice.ts:98 |
| `1` | unknown | 🔧 Dynamic | src\state\usersSlice.ts:36 |
| `10T08` | unknown | 🔧 Dynamic | src\state\usersSlice.ts:70 |
| `10T11` | unknown | 🔧 Dynamic | src\state\usersSlice.ts:59 |
| `12T16` | unknown | 🔧 Dynamic | src\state\usersSlice.ts:72 |
| `15T09` | unknown | 🔧 Dynamic | src\state\usersSlice.ts:44 |
| `15T14` | unknown | 🔧 Dynamic | src\state\usersSlice.ts:46 |
| `2` | unknown | 🔧 Dynamic | src\state\usersSlice.ts:49 |
| `20T11` | unknown | 🔧 Dynamic | src\state\usersSlice.ts:96 |
| `3` | unknown | 🔧 Dynamic | src\state\usersSlice.ts:62 |
| `30T09` | unknown | 🔧 Dynamic | src\state\usersSlice.ts:85 |
| `4` | unknown | 🔧 Dynamic | src\state\usersSlice.ts:75 |
| `5` | unknown | 🔧 Dynamic | src\state\usersSlice.ts:88 |
| `action` | unknown | 🔧 Dynamic | src\state\usersSlice.ts:141, src\state\usersSlice.ts:148 |
| `avatar` | unknown | 🔧 Dynamic | src\state\usersSlice.ts:114 |
| `columns` | unknown | 🔧 Dynamic | src\components\UsersTable.tsx:66 |
| `columnSizing` | unknown | 🔧 Dynamic | src\components\UsersTable.tsx:73 |
| `createdBy` | unknown | 🔧 Dynamic | src\state\usersSlice.ts:19, src\state\usersSlice.ts:45, src\state\usersSlice.ts:58 (+4 more) |
| `createdOn` | unknown | 🔧 Dynamic | src\state\usersSlice.ts:17, src\state\usersSlice.ts:44, src\state\usersSlice.ts:57 (+4 more) |
| `data` | unknown | 🔧 Dynamic | src\components\UsersTable.tsx:65 |
| `demoUsers` | unknown | 🔧 Dynamic | src\state\usersSlice.ts:34 |
| `desc` | unknown | 🔧 Dynamic | src\components\UsersTable.tsx:33, src\components\UsersTable.tsx:72 |
| `disabled` | unknown | 🔧 Dynamic | src\components\UsersTable.tsx:190, src\components\UsersTable.tsx:205 |
| `email` | unknown | 🔧 Dynamic | src\state\usersSlice.ts:10, src\state\usersSlice.ts:38, src\state\usersSlice.ts:51 (+7 more) |
| `enabled` | unknown | 🔧 Dynamic | src\components\UsersTable.tsx:50 |
| `enableRowSelection` | unknown | 🔧 Dynamic | src\components\UsersTable.tsx:83 |
| `extraReducers` | unknown | 🔧 Dynamic | src\state\usersSlice.ts:157 |
| `fullName` | unknown | 🔧 Dynamic | src\state\usersSlice.ts:9, src\state\usersSlice.ts:37, src\state\usersSlice.ts:50 (+5 more) |
| `getCoreRowModel` | unknown | 🔧 Dynamic | src\components\UsersTable.tsx:80 |
| `getPaginationRowModel` | unknown | 🔧 Dynamic | src\components\UsersTable.tsx:82 |
| `getSortedRowModel` | unknown | 🔧 Dynamic | src\components\UsersTable.tsx:81 |
| `hover` | unknown | 🔧 Dynamic | src\components\UsersTable.tsx:114, src\components\UsersTable.tsx:138, src\components\UsersTable.tsx:190 (+1 more) |
| `isActive` | unknown | 🔧 Dynamic | src\components\UsersTable.tsx:47, src\components\UsersTable.tsx:49, src\state\usersSlice.ts:16 (+7 more) |
| `items` | unknown | 🔧 Dynamic | src\state\usersSlice.ts:23, src\state\usersSlice.ts:29 |
| `loading` | unknown | 🔧 Dynamic | src\state\usersSlice.ts:24, src\state\usersSlice.ts:30 |
| `meta` | unknown | 🔧 Dynamic | src\components\UsersTable.tsx:84 |
| `newPasswordPlain` | unknown | 🔧 Dynamic | src\state\usersSlice.ts:126 |
| `newUser` | unknown | 🔧 Dynamic | src\state\usersSlice.ts:107 |
| `null` | unknown | 🔧 Dynamic | src\components\UsersTable.tsx:110 |
| `onOpenEdit` | unknown | 🔧 Dynamic | src\components\UsersTable.tsx:59 |
| `onRowSelectionChange` | unknown | 🔧 Dynamic | src\components\UsersTable.tsx:79 |
| `onSortingChange` | unknown | 🔧 Dynamic | src\components\UsersTable.tsx:78 |
| `onToggleActive` | unknown | 🔧 Dynamic | src\components\UsersTable.tsx:60 |
| `pageSize` | unknown | 🔧 Dynamic | src\components\UsersTable.tsx:75 |
| `password` | unknown | 🔧 Dynamic | src\state\usersSlice.ts:105 |
| `passwordHash` | unknown | 🔧 Dynamic | src\state\usersSlice.ts:15 |
| `patch` | unknown | 🔧 Dynamic | src\state\usersSlice.ts:141 |
| `permission` | unknown | 🔧 Dynamic | src\state\usersSlice.ts:41, src\state\usersSlice.ts:54, src\state\usersSlice.ts:67 (+3 more) |
| `phone` | unknown | 🔧 Dynamic | src\state\usersSlice.ts:40, src\state\usersSlice.ts:53, src\state\usersSlice.ts:66 (+3 more) |
| `query` | unknown | 🔧 Dynamic | src\state\usersSlice.ts:185 |
| `seedIfEmpty` | unknown | 🔧 Dynamic | src\state\usersSlice.ts:136 |
| `setUserActive` | unknown | 🔧 Dynamic | src\state\usersSlice.ts:148 |
| `sorting` | unknown | 🔧 Dynamic | src\components\UsersTable.tsx:72 |
| `startDate` | unknown | 🔧 Dynamic | src\state\usersSlice.ts:39, src\state\usersSlice.ts:52, src\state\usersSlice.ts:65 (+3 more) |
| `updatedOn` | unknown | 🔧 Dynamic | src\components\UsersTable.tsx:33, src\components\UsersTable.tsx:72, src\state\usersSlice.ts:46 (+5 more) |
| `updateUser` | unknown | 🔧 Dynamic | src\state\usersSlice.ts:141 |
| `user` | unknown | 🔧 Dynamic | src\components\UsersTable.tsx:42 |
| `width` | unknown | 🔧 Dynamic | src\components\UsersTable.tsx:108, src\components\UsersTable.tsx:143 |

## Gateways Domain

| Field | Type | Classification | Sources |
|-------|------|----------------|---------|
| `addGateway` | unknown | 🔒 Static | src\state\paymentGatewaysSlice.ts:101 |
| `currency` | unknown | 🔒 Static | src\state\paymentGatewaysSlice.ts:40, src\state\paymentGatewaysSlice.ts:57, src\state\paymentGatewaysSlice.ts:72 (+1 more) |
| `demoGateways` | unknown | 🔒 Static | src\state\paymentGatewaysSlice.ts:35 |
| `initialState` | unknown | 🔒 Static | src\state\paymentGatewaysSlice.ts:29 |
| `newGateway` | unknown | 🔒 Static | src\state\paymentGatewaysSlice.ts:110 |
| `removeGateway` | unknown | 🔒 Static | src\state\paymentGatewaysSlice.ts:162 |
| `setGatewayActive` | unknown | 🔒 Static | src\state\paymentGatewaysSlice.ts:151 |
| `state` | unknown | 🔒 Static | src\state\paymentGatewaysSlice.ts:190, src\state\paymentGatewaysSlice.ts:192, src\state\paymentGatewaysSlice.ts:197 (+4 more) |
| `updateGateway` | unknown | 🔒 Static | src\state\paymentGatewaysSlice.ts:126 |
| `1` | unknown | 🔧 Dynamic | src\state\paymentGatewaysSlice.ts:37 |
| `10T08` | unknown | 🔧 Dynamic | src\state\paymentGatewaysSlice.ts:81 |
| `15T10` | unknown | 🔧 Dynamic | src\state\paymentGatewaysSlice.ts:49 |
| `18T09` | unknown | 🔧 Dynamic | src\state\paymentGatewaysSlice.ts:64 |
| `2` | unknown | 🔧 Dynamic | src\state\paymentGatewaysSlice.ts:54 |
| `20T14` | unknown | 🔧 Dynamic | src\state\paymentGatewaysSlice.ts:50 |
| `25T11` | unknown | 🔧 Dynamic | src\state\paymentGatewaysSlice.ts:65 |
| `3` | unknown | 🔧 Dynamic | src\state\paymentGatewaysSlice.ts:69 |
| `action` | unknown | 🔧 Dynamic | src\state\paymentGatewaysSlice.ts:101, src\state\paymentGatewaysSlice.ts:126, src\state\paymentGatewaysSlice.ts:151 (+3 more) |
| `createdBy` | unknown | 🔧 Dynamic | src\state\paymentGatewaysSlice.ts:51, src\state\paymentGatewaysSlice.ts:66, src\state\paymentGatewaysSlice.ts:82 |
| `createdOn` | unknown | 🔧 Dynamic | src\state\paymentGatewaysSlice.ts:49, src\state\paymentGatewaysSlice.ts:64, src\state\paymentGatewaysSlice.ts:81 (+1 more) |
| `isActive` | unknown | 🔧 Dynamic | src\state\paymentGatewaysSlice.ts:48, src\state\paymentGatewaysSlice.ts:63, src\state\paymentGatewaysSlice.ts:116 (+1 more) |
| `items` | unknown | 🔧 Dynamic | src\state\paymentGatewaysSlice.ts:24, src\state\paymentGatewaysSlice.ts:30 |
| `links` | unknown | 🔧 Dynamic | src\state\paymentGatewaysSlice.ts:115 |
| `loading` | unknown | 🔧 Dynamic | src\state\paymentGatewaysSlice.ts:25, src\state\paymentGatewaysSlice.ts:31 |
| `patch` | unknown | 🔧 Dynamic | src\state\paymentGatewaysSlice.ts:128 |
| `provider` | unknown | 🔧 Dynamic | src\state\paymentGatewaysSlice.ts:39, src\state\paymentGatewaysSlice.ts:56, src\state\paymentGatewaysSlice.ts:71 (+1 more) |
| `query` | unknown | 🔧 Dynamic | src\state\paymentGatewaysSlice.ts:197 |
| `seedIfEmpty` | unknown | 🔧 Dynamic | src\state\paymentGatewaysSlice.ts:94 |
| `setError` | unknown | 🔧 Dynamic | src\state\paymentGatewaysSlice.ts:173 |
| `setLoading` | unknown | 🔧 Dynamic | src\state\paymentGatewaysSlice.ts:168 |
| `updatedOn` | unknown | 🔧 Dynamic | src\state\paymentGatewaysSlice.ts:50, src\state\paymentGatewaysSlice.ts:65, src\state\paymentGatewaysSlice.ts:118 |

## EmailTemplates Domain

| Field | Type | Classification | Sources |
|-------|------|----------------|---------|
| `initialState` | unknown | 🔒 Static | src\state\emailTemplatesSlice.ts:24 |
| `state` | unknown | 🔒 Static | src\state\emailTemplatesSlice.ts:217, src\state\emailTemplatesSlice.ts:219, src\state\emailTemplatesSlice.ts:224 (+4 more) |
| `1` | unknown | 🔧 Dynamic | src\state\emailTemplatesSlice.ts:32 |
| `10T08` | unknown | 🔧 Dynamic | src\state\emailTemplatesSlice.ts:69 |
| `12T12` | unknown | 🔧 Dynamic | src\state\emailTemplatesSlice.ts:93 |
| `15T10` | unknown | 🔧 Dynamic | src\state\emailTemplatesSlice.ts:45 |
| `18T16` | unknown | 🔧 Dynamic | src\state\emailTemplatesSlice.ts:70 |
| `2` | unknown | 🔧 Dynamic | src\state\emailTemplatesSlice.ts:50 |
| `20T14` | unknown | 🔧 Dynamic | src\state\emailTemplatesSlice.ts:46 |
| `3` | unknown | 🔧 Dynamic | src\state\emailTemplatesSlice.ts:74 |
| `action` | unknown | 🔧 Dynamic | src\state\emailTemplatesSlice.ts:110, src\state\emailTemplatesSlice.ts:139, src\state\emailTemplatesSlice.ts:153 (+4 more) |
| `addTemplate` | unknown | 🔧 Dynamic | src\state\emailTemplatesSlice.ts:110 |
| `bodyHtml` | unknown | 🔧 Dynamic | src\state\emailTemplatesSlice.ts:35, src\state\emailTemplatesSlice.ts:53, src\state\emailTemplatesSlice.ts:77 (+1 more) |
| `category` | unknown | 🔧 Dynamic | src\state\emailTemplatesSlice.ts:42, src\state\emailTemplatesSlice.ts:66, src\state\emailTemplatesSlice.ts:90 |
| `createdBy` | unknown | 🔧 Dynamic | src\state\emailTemplatesSlice.ts:12, src\state\emailTemplatesSlice.ts:44, src\state\emailTemplatesSlice.ts:68 (+2 more) |
| `createdOn` | unknown | 🔧 Dynamic | src\state\emailTemplatesSlice.ts:45, src\state\emailTemplatesSlice.ts:69, src\state\emailTemplatesSlice.ts:93 (+2 more) |
| `demoTemplates` | unknown | 🔧 Dynamic | src\state\emailTemplatesSlice.ts:30 |
| `documents` | unknown | 🔧 Dynamic | src\state\emailTemplatesSlice.ts:81 |
| `duplicated` | unknown | 🔧 Dynamic | src\state\emailTemplatesSlice.ts:173 |
| `duplicateTemplate` | unknown | 🔧 Dynamic | src\state\emailTemplatesSlice.ts:167 |
| `isActive` | unknown | 🔧 Dynamic | src\state\emailTemplatesSlice.ts:15, src\state\emailTemplatesSlice.ts:47, src\state\emailTemplatesSlice.ts:71 (+3 more) |
| `items` | unknown | 🔧 Dynamic | src\state\emailTemplatesSlice.ts:19, src\state\emailTemplatesSlice.ts:25 |
| `language` | unknown | 🔧 Dynamic | src\state\emailTemplatesSlice.ts:41, src\state\emailTemplatesSlice.ts:65, src\state\emailTemplatesSlice.ts:89 |
| `loading` | unknown | 🔧 Dynamic | src\state\emailTemplatesSlice.ts:20, src\state\emailTemplatesSlice.ts:26 |
| `newTemplate` | unknown | 🔧 Dynamic | src\state\emailTemplatesSlice.ts:121 |
| `patch` | unknown | 🔧 Dynamic | src\state\emailTemplatesSlice.ts:141 |
| `query` | unknown | 🔧 Dynamic | src\state\emailTemplatesSlice.ts:224 |
| `removeTemplate` | unknown | 🔧 Dynamic | src\state\emailTemplatesSlice.ts:188 |
| `Required` | unknown | 🔧 Dynamic | src\state\emailTemplatesSlice.ts:76 |
| `seedIfEmpty` | unknown | 🔧 Dynamic | src\state\emailTemplatesSlice.ts:103 |
| `setError` | unknown | 🔧 Dynamic | src\state\emailTemplatesSlice.ts:199 |
| `setLoading` | unknown | 🔧 Dynamic | src\state\emailTemplatesSlice.ts:194 |
| `setTemplateActive` | unknown | 🔧 Dynamic | src\state\emailTemplatesSlice.ts:153 |
| `subject` | unknown | 🔧 Dynamic | src\state\emailTemplatesSlice.ts:7, src\state\emailTemplatesSlice.ts:34, src\state\emailTemplatesSlice.ts:52 (+2 more) |
| `updatedOn` | unknown | 🔧 Dynamic | src\state\emailTemplatesSlice.ts:46, src\state\emailTemplatesSlice.ts:70, src\state\emailTemplatesSlice.ts:131 (+1 more) |
| `updateTemplate` | unknown | 🔧 Dynamic | src\state\emailTemplatesSlice.ts:139 |
| `variables` | unknown | 🔧 Dynamic | src\state\emailTemplatesSlice.ts:43, src\state\emailTemplatesSlice.ts:67, src\state\emailTemplatesSlice.ts:91 |
| `with` | unknown | 🔧 Dynamic | src\state\emailTemplatesSlice.ts:56 |

## AllowIp Domain

| Field | Type | Classification | Sources |
|-------|------|----------------|---------|
| `addIp` | unknown | 🔒 Static | src\state\allowIpSlice.ts:89 |
| `demoIps` | unknown | 🔒 Static | src\state\allowIpSlice.ts:39 |
| `description` | unknown | 🔒 Static | src\state\allowIpSlice.ts:43, src\state\allowIpSlice.ts:52, src\state\allowIpSlice.ts:61 (+2 more) |
| `initialState` | unknown | 🔒 Static | src\state\allowIpSlice.ts:22 |
| `newIp` | unknown | 🔒 Static | src\state\allowIpSlice.ts:92 |
| `removeIp` | unknown | 🔒 Static | src\state\allowIpSlice.ts:126 |
| `setIpActive` | unknown | 🔒 Static | src\state\allowIpSlice.ts:116 |
| `state` | unknown | 🔒 Static | src\state\allowIpSlice.ts:154, src\state\allowIpSlice.ts:156, src\state\allowIpSlice.ts:159 (+2 more) |
| `updateIp` | unknown | 🔒 Static | src\state\allowIpSlice.ts:105 |
| `2001` | unknown | 🔧 Dynamic | src\state\allowIpSlice.ts:68 |
| `action` | unknown | 🔧 Dynamic | src\state\allowIpSlice.ts:89, src\state\allowIpSlice.ts:105, src\state\allowIpSlice.ts:116 (+3 more) |
| `createdBy` | unknown | 🔧 Dynamic | src\state\allowIpSlice.ts:45, src\state\allowIpSlice.ts:54, src\state\allowIpSlice.ts:63 (+2 more) |
| `createdOn` | unknown | 🔧 Dynamic | src\state\allowIpSlice.ts:44, src\state\allowIpSlice.ts:96 |
| `db8` | unknown | 🔧 Dynamic | src\state\allowIpSlice.ts:68 |
| `error` | unknown | 🔧 Dynamic | src\state\allowIpSlice.ts:25 |
| `isActive` | unknown | 🔧 Dynamic | src\state\allowIpSlice.ts:47, src\state\allowIpSlice.ts:56, src\state\allowIpSlice.ts:64 (+4 more) |
| `items` | unknown | 🔧 Dynamic | src\state\allowIpSlice.ts:16, src\state\allowIpSlice.ts:23 |
| `loading` | unknown | 🔧 Dynamic | src\state\allowIpSlice.ts:17, src\state\allowIpSlice.ts:24 |
| `patch` | unknown | 🔧 Dynamic | src\state\allowIpSlice.ts:105 |
| `query` | unknown | 🔧 Dynamic | src\state\allowIpSlice.ts:159 |
| `seedIfEmpty` | unknown | 🔧 Dynamic | src\state\allowIpSlice.ts:36 |
| `setError` | unknown | 🔧 Dynamic | src\state\allowIpSlice.ts:137 |
| `setLoading` | unknown | 🔧 Dynamic | src\state\allowIpSlice.ts:132 |
| `updatedOn` | unknown | 🔧 Dynamic | src\state\allowIpSlice.ts:46, src\state\allowIpSlice.ts:98 |

---

*Report generated by tools/fields-audit.ts*