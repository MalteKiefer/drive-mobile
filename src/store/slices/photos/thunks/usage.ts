import { ActionReducerMapBuilder, createAsyncThunk } from '@reduxjs/toolkit';
import { PhotosState } from '..';
import { RootState } from '../../..';
import photosService from '../../../../services/photos';

export const getUsageThunk = createAsyncThunk<number, void, { state: RootState }>('photos/getUsage', async () => {
  return photosService.getUsage();
});

export const usageExtraReducers = (builder: ActionReducerMapBuilder<PhotosState>) => {
  builder
    .addCase(getUsageThunk.pending, () => undefined)
    .addCase(getUsageThunk.fulfilled, (state, action) => {
      state.usage = action.payload;
    })
    .addCase(getUsageThunk.rejected, () => undefined);
};
