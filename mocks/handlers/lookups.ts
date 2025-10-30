// PATCH: begin lookups mock handlers
import { http, HttpResponse } from 'msw';
import { LookupCategoryKey, LookupValue } from '@/features/lookups/types';

// Mock data for each category
const mockLookupData: Record<LookupCategoryKey, LookupValue[]> = {
  kycStatus: [
    { id: '1', key: 'approved', label: 'Approved', color: '#10b981', order: 1, active: true },
    { id: '2', key: 'pending', label: 'Pending', color: '#f59e0b', order: 2, active: true },
    { id: '3', key: 'rejected', label: 'Rejected', color: '#ef4444', order: 3, active: true },
    { id: '4', key: 'expired', label: 'Expired', color: '#6b7280', order: 4, active: true },
  ],
  leadStatus: [
    { id: '5', key: 'new', label: 'New', color: '#3b82f6', order: 1, active: true },
    { id: '6', key: 'warm', label: 'Warm', color: '#f59e0b', order: 2, active: true },
    { id: '7', key: 'hot', label: 'Hot', color: '#ef4444', order: 3, active: true },
    { id: '8', key: 'nurture', label: 'Nurture', color: '#8b5cf6', order: 4, active: true },
    { id: '9', key: 'qualified', label: 'Qualified', color: '#10b981', order: 5, active: true },
    { id: '10', key: 'cold', label: 'Cold', color: '#6b7280', order: 6, active: true },
    { id: '11', key: 'disqualified', label: 'Disqualified', color: '#ef4444', order: 7, active: true },
  ],
  retentionStatus: [
    { id: '12', key: 'new', label: 'New', color: '#3b82f6', order: 1, active: true },
    { id: '13', key: 'active', label: 'Active', color: '#10b981', order: 2, active: true },
    { id: '14', key: 'at_risk', label: 'At Risk', color: '#f59e0b', order: 3, active: true },
    { id: '15', key: 'churned', label: 'Churned', color: '#ef4444', order: 4, active: true },
  ],
};

export const lookupsHandlers = [
  // List lookup values
  http.get('/lookups/:category/values', ({ params }) => {
    const category = params.category as LookupCategoryKey;
    const items = mockLookupData[category] || [];
    return HttpResponse.json({
      items,
      meta: { total: items.length },
    });
  }),

  // Create lookup value
  http.post('/lookups/:category/values', async ({ params, request }) => {
    console.log('🔧 MSW: POST /lookups/:category/values called', { params });
    const category = params.category as LookupCategoryKey;
    const body = await request.json() as any;
    console.log('🔧 MSW: Request body:', body);
    
    const newValue: LookupValue = {
      id: Math.random().toString(36).substr(2, 9),
      key: body.key,
      label: body.label,
      color: body.color || null,
      order: body.order || 0,
      active: body.active !== false,
    };
    
    mockLookupData[category].push(newValue);
    console.log('✅ MSW: Created new value:', newValue);
    return HttpResponse.json(newValue, { status: 201 });
  }),

  // Update lookup value
  http.put('/lookups/:category/values/:id', async ({ params, request }) => {
    const category = params.category as LookupCategoryKey;
    const id = params.id as string;
    const body = await request.json() as any;
    
    const items = mockLookupData[category];
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    items[index] = { ...items[index], ...body };
    return HttpResponse.json(items[index]);
  }),

  // Reorder lookup values
  http.put('/lookups/:category/reorder', async ({ params, request }) => {
    const category = params.category as LookupCategoryKey;
    const body = await request.json() as any;
    const { idsInOrder } = body;
    
    const items = mockLookupData[category];
    items.forEach((item, index) => {
      const newOrder = idsInOrder.indexOf(item.id);
      if (newOrder !== -1) {
        item.order = newOrder;
      }
    });
    
    return HttpResponse.json({ ok: true });
  }),

  // Toggle active status
  http.put('/lookups/:category/values/:id/active', async ({ params, request }) => {
    const category = params.category as LookupCategoryKey;
    const id = params.id as string;
    const body = await request.json() as any;
    
    const items = mockLookupData[category];
    const item = items.find(item => item.id === id);
    
    if (!item) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    item.active = body.active;
    return HttpResponse.json(item);
  }),

  // Deprecate lookup value
  http.put('/lookups/:category/values/:id/deprecate', ({ params }) => {
    const category = params.category as LookupCategoryKey;
    const id = params.id as string;
    
    const items = mockLookupData[category];
    const item = items.find(item => item.id === id);
    
    if (!item) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    item.deprecatedAt = new Date().toISOString();
    item.active = false;
    return HttpResponse.json(item);
  }),
];
// PATCH: end lookups mock handlers