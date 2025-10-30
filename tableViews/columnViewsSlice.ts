// Column-driven table views store
// Views are scoped per table and define visible columns, column order, and have scoped filters

export interface ColumnView {
  id: string;
  name: string;
  tableId: string;
  selectedColumnIds: string[];
  columnOrder: string[];
  createdAt: string;
  isFavorite?: boolean;
}

export interface ColumnViewsState {
  views: ColumnView[];
  activeViewIds: Record<string, string | null>; // tableId -> viewId
}

// Initial state
const initialState: ColumnViewsState = {
  views: [],
  activeViewIds: {}
};

// Storage keys
const STORAGE_KEYS = {
  views: (tableId: string) => `views.${tableId}.v1`,
  activeId: (tableId: string) => `views.${tableId}.activeId`
};

// Load views for a specific table
export const loadViewsForTable = (tableId: string): ColumnView[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.views(tableId));
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save views for a specific table
export const saveViewsForTable = (tableId: string, views: ColumnView[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.views(tableId), JSON.stringify(views));
  } catch {
    // Silent fail
  }
};

// Load active view ID for a table
export const loadActiveViewId = (tableId: string): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.activeId(tableId));
  } catch {
    return null;
  }
};

// Save active view ID for a table
export const saveActiveViewId = (tableId: string, viewId: string | null): void => {
  try {
    if (viewId) {
      localStorage.setItem(STORAGE_KEYS.activeId(tableId), viewId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.activeId(tableId));
    }
  } catch {
    // Silent fail
  }
};

// Generate unique ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Actions
export const createColumnView = (params: {
  tableId: string;
  name: string;
  selectedColumnIds: string[];
  columnOrder: string[];
  isFavorite?: boolean;
}): ColumnView => {
  // Load existing views first
  let existingViews = loadViewsForTable(params.tableId);
  
  // If this view is being marked as favorite, remove favorite from other views
  if (params.isFavorite) {
    existingViews = existingViews.map(view => ({
      ...view,
      isFavorite: false
    }));
  }

  const newView: ColumnView = {
    id: generateId(),
    name: params.name,
    tableId: params.tableId,
    selectedColumnIds: [...params.selectedColumnIds],
    columnOrder: [...params.columnOrder],
    createdAt: new Date().toISOString(),
    isFavorite: params.isFavorite || false
  };

  // Add new view and save
  const updatedViews = [...existingViews, newView];
  saveViewsForTable(params.tableId, updatedViews);

  return newView;
};

export const updateColumnView = (params: {
  id: string;
  tableId: string;
  patch: Partial<Pick<ColumnView, 'name' | 'selectedColumnIds' | 'columnOrder'>>;
}): ColumnView | null => {
  const existingViews = loadViewsForTable(params.tableId);
  const viewIndex = existingViews.findIndex(v => v.id === params.id);
  
  if (viewIndex === -1) return null;

  const updatedView = {
    ...existingViews[viewIndex],
    ...params.patch
  };

  const updatedViews = [...existingViews];
  updatedViews[viewIndex] = updatedView;
  saveViewsForTable(params.tableId, updatedViews);

  return updatedView;
};

export const deleteColumnView = (params: {
  id: string;
  tableId: string;
}): void => {
  const existingViews = loadViewsForTable(params.tableId);
  const updatedViews = existingViews.filter(v => v.id !== params.id);
  saveViewsForTable(params.tableId, updatedViews);

  // If this was the active view, clear it
  const activeViewId = loadActiveViewId(params.tableId);
  if (activeViewId === params.id) {
    saveActiveViewId(params.tableId, null);
  }
};

export const setActiveColumnView = (params: {
  tableId: string;
  viewId: string | null;
}): void => {
  saveActiveViewId(params.tableId, params.viewId);
};

// Get active view for a table
export const getActiveColumnView = (tableId: string): ColumnView | null => {
  const activeViewId = loadActiveViewId(tableId);
  if (!activeViewId) return null;

  const views = loadViewsForTable(tableId);
  return views.find(v => v.id === activeViewId) || null;
};

// Set a view as favorite (only one per table)
export const setFavoriteView = (params: {
  tableId: string;
  viewId: string | null;
}): void => {
  const views = loadViewsForTable(params.tableId);
  
  // Remove favorite status from all views
  const updatedViews = views.map(view => ({
    ...view,
    isFavorite: false
  }));
  
  // Set the selected view as favorite if viewId is provided
  if (params.viewId) {
    const viewIndex = updatedViews.findIndex(v => v.id === params.viewId);
    if (viewIndex >= 0) {
      updatedViews[viewIndex].isFavorite = true;
    }
  }
  
  saveViewsForTable(params.tableId, updatedViews);
};

// Get favorite view for a table
export const getFavoriteView = (tableId: string): ColumnView | null => {
  const views = loadViewsForTable(tableId);
  return views.find(v => v.isFavorite) || null;
};

// Hook-like functions for easy integration
export const useColumnViews = (tableId: string) => {
  const views = loadViewsForTable(tableId);
  const activeViewId = loadActiveViewId(tableId);
  const activeView = activeViewId ? views.find(v => v.id === activeViewId) || null : null;

  return {
    views,
    activeView,
    activeViewId,
    favoriteView: getFavoriteView(tableId),
    createView: (name: string, selectedColumnIds: string[], columnOrder: string[], isFavorite?: boolean) => 
      createColumnView({ tableId, name, selectedColumnIds, columnOrder, isFavorite }),
    updateView: (id: string, patch: Partial<Pick<ColumnView, 'name' | 'selectedColumnIds' | 'columnOrder'>>) =>
      updateColumnView({ id, tableId, patch }),
    deleteView: (id: string) => deleteColumnView({ id, tableId }),
    setActiveView: (viewId: string | null) => setActiveColumnView({ tableId, viewId }),
    setFavorite: (viewId: string | null) => setFavoriteView({ tableId, viewId }),
    getActiveView: () => getActiveColumnView(tableId),
    getFavoriteView: () => getFavoriteView(tableId)
  };
};