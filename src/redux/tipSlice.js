import { createAsyncThunk, createSlice, createEntityAdapter, createSelector } from '@reduxjs/toolkit';
import api from './apiConfig';

export const STATUS = {
  IDLE: 'IDLE',
  LOADING: 'LOADING',
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED',
};

export const getTipsByUser = createAsyncThunk(
  'tips/getTipsByUser',
  async (queryParams, thunkAPI) => {
    try {
      const response = await api.get('tip', { params: { ...queryParams } });
      const ids = response.data.reduce((prev, curr) => [...prev, curr.txHash], []);
      return { tips: response.data, ids };
    } catch (error) {
      console.log(error);
      return thunkAPI.rejectWithValue(error.response.data);
    }
  },
  {
    condition: (queryParams, { getState, extra }) => {
      const { tips } = getState();
      return tips.pagination?.pages[queryParams.page]?.status !== STATUS.LOADING;
    },
  },
);

const tipsAdapter = createEntityAdapter({
  // sortComparer: (a, b) => b.date.localeCompare(a.date)
  selectId: (tip) => tip.txHash,
});

const initialState = tipsAdapter.getInitialState({
  currentPage: 0,
  fetchedPage: [],
  status: STATUS.IDLE, //'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  pagination: {
    pages: {},
  },
  // elementsCount: 800,
});

const tipsSlice = createSlice({
  name: 'tips',
  initialState,
  reducers: {
    // search: (state) => {
    //     // state.user = null;
    // },
    resetError: (state) => {
      state.error = null;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getTipsByUser.pending, (state, arg) => {
      // console.log(arg.meta.arg.page);
      state.pagination.pages[arg.meta.arg.page] = {
        status: STATUS.LOADING,
        ids: [],
      };
      state.status = STATUS.LOADING;
    });
    builder.addCase(getTipsByUser.fulfilled, (state, action, arg) => {
      tipsAdapter.upsertMany(state, action.payload.tips);
      state.error = null;
      state.status = STATUS.SUCCEEDED;
      state.currentPage = action.meta.arg.page;
      state.fetchedPage.push(action.meta.arg.page);
      state.pagination.pages[action.meta.arg.page] = {
        // lastUpdateTime: 1516177824891,
        status: STATUS.SUCCEEDED,
        ids: action.payload.ids,
      };
    });
    builder.addCase(getTipsByUser.rejected, (state, action) => {
      state.error = action.payload.error;
      state.status = STATUS.FAILED;
    });
  },
});

export const { resetError, setCurrentPage } = tipsSlice.actions;

export const tipsSelectors = tipsAdapter.getSelectors((state) => {
  return state.tips;
});

// export const selectIdsPerPage = (page) => (state) => state.tips.pagination?.pages[page].ids;

export const selectIdsPerPage = createSelector(
  [(state) => state.tips.pagination, (state) => state.tips.currentPage],
  (pagination, currentPage) => pagination?.pages[currentPage]?.ids ?? [],
);

export const selectTipsPerPage = createSelector([(state) => state.tips.entities, selectIdsPerPage], (entities, idsForPage) =>
  idsForPage.reduce((previousValue, id) => [...previousValue, entities[id]], []),
);

// export const selectPage = (start, end) => (state) => state.tips.entities.slice(start, end);

export default tipsSlice.reducer;
