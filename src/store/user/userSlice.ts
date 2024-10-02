import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserState {
  user: {
    email: string;
    displayName: string;
    uid: string;
  } | null;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  error: null,
};

const userSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{
        email: string;
        displayName: string;
        uid: string;
      } | null>,
    ) => {
      if (!action.payload) {
        state.user = null;
        state.error = null;
      } else {
        state.user = {
          uid: action.payload.uid,
          email: action.payload.email,
          displayName: action.payload.displayName,
        };
        state.error = null;
      }
    },
    setUserFailed: (state, action: PayloadAction<string>) => {
      state.user = null;
      state.error = action.payload;
    },
  },
});

export const { setUser, setUserFailed } = userSlice.actions;

export default userSlice.reducer;
