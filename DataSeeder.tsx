import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { upsertMany, selectAllEntities, Entity } from '@/state/entitiesSlice'
import { addTransaction } from '@/state/transactionsSlice'

export function DataSeeder() {
  const dispatch = useDispatch()
  const entities = useSelector(selectAllEntities)

  useEffect(() => {
    // Only seed if there are no entities (development only)
    if (entities.length === 0) {
      const sampleData: Entity[] = [
        // Sample clients with deposit data for dashboard testing
        {
          id: 'CLIENT-001',
          type: 'client' as const,
          accountId: 'CLIENT-001',
          createdAt: '2024-01-10T10:00:00Z',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phoneNumber: '+1-555-0123',
          country: 'United States',
          countryCode: 'US',
          accountType: 'gold',
          regulation: true,
          desk: 'sales desk a',
          salesManager: 'John Smith',
          conversationOwner: 'Sarah Johnson',
          finance: {
            ftd: { isFTD: true, totalFTD: 1000 },
            deposit: {
              totalDeposit: 5500.00,
              netDeposit: 5500.00,
              firstDepositDateISO: '2024-01-15T10:00:00Z',
              lastDepositDateISO: '2024-02-01T14:00:00Z'
            }
          }
        },
        {
          id: 'CLIENT-002',
          type: 'client' as const,
          accountId: 'CLIENT-002',
          createdAt: '2024-01-12T09:00:00Z',
          firstName: 'Sarah',
          lastName: 'Wilson',
          email: 'sarah.wilson@example.com',
          phoneNumber: '+44-20-7946-0958',
          country: 'United Kingdom',
          countryCode: 'GB',
          accountType: 'vip',
          regulation: true,
          desk: 'english desk',
          salesManager: 'Emma Davis',
          conversationOwner: 'Mike Johnson',
          finance: {
            ftd: { isFTD: true, totalFTD: 2500 },
            deposit: {
              totalDeposit: 12750.00,
              netDeposit: 12750.00,
              firstDepositDateISO: '2024-01-18T11:30:00Z',
              lastDepositDateISO: '2024-02-15T16:45:00Z'
            }
          }
        },
        {
          id: 'CLIENT-003',
          type: 'client' as const,
          accountId: 'CLIENT-003',
          createdAt: '2024-01-20T15:30:00Z',
          firstName: 'Ahmed',
          lastName: 'Al-Rashid',
          email: 'ahmed.alrashid@example.com',
          phoneNumber: '+971-55-123-4567',
          country: 'United Arab Emirates',
          countryCode: 'AE',
          accountType: 'diamond',
          regulation: true,
          desk: 'arabic desk',
          salesManager: 'Omar Hassan',
          conversationOwner: 'Lisa Ahmed',
          finance: {
            ftd: { isFTD: true, totalFTD: 5000 },
            deposit: {
              totalDeposit: 25000.00,
              netDeposit: 25000.00,
              firstDepositDateISO: '2024-01-25T09:15:00Z',
              lastDepositDateISO: '2024-03-01T12:20:00Z'
            }
          }
        },
        // Original sample leads continue...
        {
          id: 'lead-1',
          type: 'lead' as const,
          accountId: 'ACC001',
          createdAt: '2024-01-15T10:30:00Z',
          desk: 'english desk',
          salesManager: 'John Smith',
          firstConversationOwner: 'Sarah Johnson',
          accountType: 'vip',
          regulation: true,
          firstName: 'Michael',
          lastName: 'Thompson',
          email: 'michael.thompson@email.com',
          phoneNumber: '+1-555-0123',
          phoneNumber2: '+1-555-0124',
          country: 'United States',
          countryCode: 'US',
          dateOfBirth: '1985-05-15',
          gender: 'male',
          citizen: 'US',
          language: 'english',
          lastContactAt: '2024-01-20T14:15:00Z',
          lastCommentAt: '2024-01-19T16:30:00Z',
          firstLoginAt: '2024-01-16T09:45:00Z',
          lastLoginAt: '2024-01-21T11:20:00Z',
          lastActivityAt: '2024-01-21T11:25:00Z',
          followUpAt: '2024-01-25T10:00:00Z',
          noAnswerCount: 2,
          callAttempts: 5,
          loginCount: 12,
          conversationAssignedAt: '2024-01-15T11:00:00Z',
          leadStatus: 'Qualified',
          salesReview: 4,
          salesSecondHand: false,
          totalCredits: 100,
          docs: {
            idPassportVerified: true,
            proofOfAddressVerified: true,
            ccFrontVerified: false,
            ccBackVerified: false
          },
          dod: false,
          mkt: {
            campaignId: 'CAM001',
            tag: 'forex-beginner',
            leadSource: 'Google Ads',
            utmKeyword: 'forex trading',
            utmTerm: 'forex platform',
            utmCreative: 'ad-creative-001',
            campaignSource: 'google',
            utmMedium: 'cpc',
            utmAdGroupId: 'ag001',
            utmAdPosition: '1',
            utmCountry: 'US',
            utmFeedItemId: 'feed001',
            utmLandingPage: '/forex-landing',
            utmLanguage: 'en',
            utmMatchType: 'exact',
            utmTargetId: 'target001',
            gclid: 'gclid123456',
            utmContent: 'forex-banner',
            utmSource: 'google',
            utmAccount: 'google-ads-account',
            utmAccountId: 'acc123',
            utmCampaignId: 'camp001',
            utmAdGroupName: 'Forex Beginners',
            platform: 'Google',
            utmCampaign: 'forex-acquisition',
            utmDevice: 'desktop'
          },
          settings: {
            enableLogin: true,
            blockNotifications: false,
            allowedToTrade: true,
            withdrawLimit: 10000,
            allow2fa: true,
            allowDeposit: true,
            depositLimit: 50000,
            allowWithdraw: true,
            marginCallPct: 80,
            miniDeposit: 250,
            stopOutPct: 50,
            swapType: 'daily',
            leverageForex: '1:500',
            leverageCrypto: '1:10',
            leverageCommodities: '1:400',
            leverageIndices: '1:50',
            leverageStocks: '1:50'
          }
        },
        {
          id: 'lead-2',
          type: 'lead' as const,
          accountId: 'ACC002',
          createdAt: '2024-01-16T14:20:00Z',
          desk: 'french desk',
          salesManager: 'Emma Davis',
          firstConversationOwner: 'Mike Wilson',
          conversationOwnerId: 'mike-wilson',
          retentionOwner: 'David Brown',
          retentionOwnerId: 'david-brown',
          accountType: 'diamond',
          regulation: false,
          firstName: 'Jennifer',
          lastName: 'Martinez',
          email: 'jennifer.martinez@company.com',
          phoneNumber: '+1-555-0234',
          country: 'Canada',
          countryCode: 'CA',
          dateOfBirth: '1990-08-22',
          gender: 'female',
          citizen: 'CA',
          language: 'English',
          lastContactAt: '2024-01-22T09:30:00Z',
          noAnswerCount: 1,
          callAttempts: 3,
          loginCount: 7,
          conversationAssignedAt: '2024-01-16T15:00:00Z',
          leadStatus: 'New',
          salesReview: 3,
          salesSecondHand: false,
          totalCredits: 0,
          docs: {
            idPassportVerified: false,
            proofOfAddressVerified: false,
            ccFrontVerified: false,
            ccBackVerified: false
          },
          dod: false,
          mkt: {
            campaignId: 'CAM002',
            tag: 'crypto-investor',
            leadSource: 'Facebook Ads',
            utmKeyword: 'cryptocurrency',
            utmTerm: 'crypto trading',
            utmCreative: 'crypto-video-ad',
            campaignSource: 'facebook',
            utmMedium: 'social',
            platform: 'Facebook',
            utmCampaign: 'crypto-awareness',
            utmDevice: 'mobile'
          },
          settings: {
            enableLogin: false,
            blockNotifications: false,
            allowedToTrade: false,
            withdrawLimit: 5000,
            allow2fa: false,
            allowDeposit: true,
            depositLimit: 25000,
            allowWithdraw: false,
            marginCallPct: 75,
            miniDeposit: 500,
            stopOutPct: 40,
            swapType: 'weekly',
            leverageForex: '1:200',
            leverageCrypto: '1:5',
            leverageCommodities: '1:100',
            leverageIndices: '1:20',
            leverageStocks: '1:20'
          }
        },
        {
          id: 'lead-3',
          type: 'lead' as const,
          accountId: 'ACC003',
          createdAt: '2024-01-17T08:45:00Z',
          desk: 'sales desk a',
          salesManager: 'John Smith',
          firstConversationOwner: 'Lisa Chen',
          accountType: 'standard',
          regulation: true,
          firstName: 'Robert',
          lastName: 'Anderson',
          email: 'robert.anderson@gmail.com',
          phoneNumber: '+44-20-7946-0958',
          country: 'United Kingdom',
          countryCode: 'GB',
          dateOfBirth: '1978-12-03',
          gender: 'male',
          citizen: 'GB',
          language: 'English',
          lastContactAt: '2024-01-23T16:45:00Z',
          firstLoginAt: '2024-01-18T10:15:00Z',
          lastLoginAt: '2024-01-23T17:00:00Z',
          noAnswerCount: 0,
          callAttempts: 8,
          loginCount: 25,
          conversationAssignedAt: '2024-01-17T09:00:00Z',
          leadStatus: 'Hot',
          salesReview: 5,
          salesSecondHand: true,
          totalCredits: 250,
          docs: {
            idPassportVerified: true,
            proofOfAddressVerified: true,
            ccFrontVerified: true,
            ccBackVerified: true
          },
          dod: false,
          mkt: {
            campaignId: 'CAM003',
            tag: 'experienced-trader',
            leadSource: 'Organic Search',
            utmKeyword: 'best forex broker',
            utmTerm: 'forex broker uk',
            campaignSource: 'google',
            utmMedium: 'organic',
            platform: 'Google',
            utmCampaign: 'seo-organic',
            utmDevice: 'desktop'
          },
          settings: {
            enableLogin: true,
            blockNotifications: false,
            allowedToTrade: true,
            withdrawLimit: 25000,
            allow2fa: true,
            allowDeposit: true,
            depositLimit: 100000,
            allowWithdraw: true,
            marginCallPct: 85,
            miniDeposit: 1000,
            stopOutPct: 60,
            swapType: 'daily',
            leverageForex: '1:400',
            leverageCrypto: '1:20',
            leverageCommodities: '1:500',
            leverageIndices: '1:100',
            leverageStocks: '1:100'
          }
        },
        {
          id: 'lead-4',
          type: 'lead' as const,
          accountId: 'ACC004',
          createdAt: '2024-01-18T13:10:00Z',
          desk: 'sales desk c',
          salesManager: 'David Brown',
          firstConversationOwner: 'Anna Rodriguez',
          accountType: 'Individual',
          regulation: false,
          firstName: 'Sophie',
          lastName: 'Mueller',
          email: 'sophie.mueller@web.de',
          phoneNumber: '+49-30-12345678',
          country: 'Germany',
          countryCode: 'DE',
          dateOfBirth: '1995-03-28',
          gender: 'female',
          citizen: 'DE',
          language: 'German',
          lastContactAt: '2024-01-24T12:20:00Z',
          noAnswerCount: 3,
          callAttempts: 6,
          loginCount: 4,
          conversationAssignedAt: '2024-01-18T14:00:00Z',
          leadStatus: 'Cold',
          salesReview: 2,
          salesSecondHand: false,
          totalCredits: 50,
          docs: {
            idPassportVerified: false,
            proofOfAddressVerified: true,
            ccFrontVerified: false,
            ccBackVerified: false
          },
          dod: false,
          mkt: {
            campaignId: 'CAM004',
            tag: 'young-professional',
            leadSource: 'Instagram Ads',
            utmKeyword: 'investment app',
            utmTerm: 'trading platform',
            utmCreative: 'mobile-trading-ad',
            campaignSource: 'instagram',
            utmMedium: 'social',
            platform: 'Instagram',
            utmCampaign: 'millennial-trading',
            utmDevice: 'mobile'
          },
          settings: {
            enableLogin: false,
            blockNotifications: true,
            allowedToTrade: false,
            withdrawLimit: 1000,
            allow2fa: false,
            allowDeposit: false,
            depositLimit: 5000,
            allowWithdraw: false,
            marginCallPct: 70,
            miniDeposit: 100,
            stopOutPct: 30,
            swapType: 'none',
            leverageForex: '1:50',
            leverageCrypto: '1:2',
            leverageCommodities: '1:50',
            leverageIndices: '1:10',
            leverageStocks: '1:10'
          }
        },
        {
          id: 'lead-5',
          type: 'lead' as const,
          accountId: 'ACC005',
          createdAt: '2024-01-19T11:25:00Z',
          desk: 'sales desk b',
          salesManager: 'Emma Davis',
          firstConversationOwner: 'Tom Jackson',
          accountType: 'Individual',
          regulation: true,
          firstName: 'Carlos',
          lastName: 'Rodriguez',
          email: 'carlos.rodriguez@outlook.com',
          phoneNumber: '+34-91-123-4567',
          country: 'Spain',
          countryCode: 'ES',
          dateOfBirth: '1982-07-14',
          gender: 'male',
          citizen: 'ES',
          language: 'spanish',
          lastContactAt: '2024-01-25T10:15:00Z',
          followUpAt: '2024-01-28T14:00:00Z',
          noAnswerCount: 1,
          callAttempts: 4,
          loginCount: 15,
          conversationAssignedAt: '2024-01-19T12:00:00Z',
          leadStatus: 'Warm',
          salesReview: 4,
          salesSecondHand: false,
          totalCredits: 75,
          docs: {
            idPassportVerified: true,
            proofOfAddressVerified: false,
            ccFrontVerified: true,
            ccBackVerified: false
          },
          dod: false,
          mkt: {
            campaignId: 'CAM005',
            tag: 'spanish-market',
            leadSource: 'Email Marketing',
            utmKeyword: 'inversiones forex',
            utmTerm: 'trading españa',
            campaignSource: 'email',
            utmMedium: 'email',
            platform: 'Email',
            utmCampaign: 'spain-expansion',
            utmDevice: 'desktop'
          },
          settings: {
            enableLogin: true,
            blockNotifications: false,
            allowedToTrade: true,
            withdrawLimit: 15000,
            allow2fa: true,
            allowDeposit: true,
            depositLimit: 75000,
            allowWithdraw: true,
            marginCallPct: 80,
            miniDeposit: 500,
            stopOutPct: 50,
            swapType: 'daily',
            leverageForex: '1:300',
            leverageCrypto: '1:15',
            leverageCommodities: '1:300',
            leverageIndices: '1:75',
            leverageStocks: '1:75'
          }
        },
        
        // Test lead with no owners (for testing Unassigned state)
        {
          id: 'lead-unassigned',
          type: 'lead' as const,
          accountId: 'ACC999',
          createdAt: '2024-03-01T10:00:00Z',
          desk: 'sales desk a',
          accountType: 'Individual',
          regulation: true,
          firstName: 'Test',
          lastName: 'Unassigned',
          email: 'test.unassigned@email.com',
          phoneNumber: '+1-555-9999',
          country: 'United States',
          countryCode: 'US',
          dateOfBirth: '1990-01-01',
          gender: 'male',
          citizen: 'US',
          language: 'English',
          leadStatus: 'New',
          // Deliberately leaving conversationOwner, conversationOwnerId, retentionOwner, retentionOwnerId undefined
          // to test the "Unassigned" state
        }
      ]

      dispatch(upsertMany(sampleData))

      // Also seed some sample transactions
      setTimeout(() => {
        seedSampleTransactions(dispatch)
      }, 100) // Small delay to ensure entities are created first
    }
  }, [dispatch, entities.length])

  return null // This component doesn't render anything
}

// Function to seed sample transactions
function seedSampleTransactions(dispatch: any) {
  
  const sampleTransactions = [
    // Transactions for ACC9001 (Mariam Haddad) - matches main entity
    {
      id: 'TXN-001',
      clientId: 'ACC9001',
      kind: 'Deposit' as const,
      amount: 1000,
      description: 'Initial FTD deposit',
      paymentMethod: 'Credit Card' as const,
      ftd: true,
      createdBy: 'Client' as const,
      createdByName: 'Mariam Haddad',
      createdAtISO: '2024-01-15T10:00:00Z'
    },
    {
      id: 'TXN-002',
      clientId: 'ACC9001',
      kind: 'Deposit' as const,
      amount: 2500,
      description: 'Additional deposit',
      paymentMethod: 'Bank Transfer' as const,
      ftd: false,
      createdBy: 'Client' as const,
      createdByName: 'Mariam Haddad',
      createdAtISO: '2024-01-20T14:30:00Z'
    },
    {
      id: 'TXN-003',
      clientId: 'ACC9001',
      kind: 'Withdraw' as const,
      amount: 500,
      description: 'Partial withdrawal',
      paymentMethod: 'Bank Transfer' as const,
      ftd: false,
      createdBy: 'Client' as const,
      createdByName: 'Mariam Haddad',
      createdAtISO: '2024-01-22T11:45:00Z'
    },
    {
      id: 'TXN-004',
      clientId: 'ACC9001',
      kind: 'Credit' as const,
      amount: 100,
      description: 'Bonus credit',
      paymentMethod: 'Other' as const,
      ftd: false,
      createdBy: 'CRM' as const,
      createdByName: 'Admin',
      createdAtISO: '2024-01-25T16:20:00Z'
    },
    // Transactions for other sample leads/clients
    {
      id: 'TXN-005',
      clientId: 'ACC001',
      kind: 'Deposit' as const,
      amount: 750,
      description: 'First time deposit',
      paymentMethod: 'Credit Card' as const,
      ftd: true,
      createdBy: 'Client' as const,
      createdByName: 'Michael Thompson',
      createdAtISO: '2024-01-16T09:15:00Z'
    },
    {
      id: 'TXN-006',
      clientId: 'ACC002',
      kind: 'Deposit' as const,
      amount: 1200,
      description: 'Initial deposit',
      paymentMethod: 'Crypto' as const,
      ftd: true,
      createdBy: 'Client' as const,
      createdByName: 'Jennifer Martinez',
      createdAtISO: '2024-01-18T13:00:00Z'
    }
  ]

  sampleTransactions.forEach(transaction => {
    dispatch(addTransaction(transaction))
  })
  
  console.log('🔧 Seeded', sampleTransactions.length, 'sample transactions')
}