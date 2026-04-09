import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Product {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  barcodeType: string;
  imageUrl: string | null;
  sellPrice: number;
  wholesalePrice: number;
  minPrice: number;
  category: { id: string; name: string } | null;
  folder: { id: string; name: string } | null;
  unit: { id: string; name: string; shortName: string } | null;
  stockEntries: Array<{
    id: string;
    quantity: number;
    reserved: number;
    costPrice: number;
    warehouse: { id: string; name: string };
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface InventoryState {
  items: Product[];
  pagination: PaginationData | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: InventoryState = {
  items: [],
  pagination: null,
  status: 'idle',
  error: null,
};

// Async thunk to fetch products from the API
export const fetchProducts = createAsyncThunk(
  'inventory/fetchProducts',
  async (params?: { page?: number; limit?: number; search?: string; categoryId?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);
    if (params?.categoryId) query.append('categoryId', params.categoryId);

    const response = await fetch(`/api/products?${query.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    const data = await response.json();
    return data; // { data: Product[], pagination: PaginationData }
  }
);

// Delete product
export const deleteProduct = createAsyncThunk(
  'inventory/deleteProduct',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to delete product');
      }
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'An error occurred';
      })
      // Delete Product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      });
  },
});

export default inventorySlice.reducer;
