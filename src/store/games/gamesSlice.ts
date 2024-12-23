import { createSlice } from '@reduxjs/toolkit';

export interface Player {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
}

export interface Table {
  id: string;
  tableNumber: number;
  players: Player[];
}

export interface Round {
  id: string;
  roundNumber: number;
  tables: Table[];
}

export interface Game {
  id: string;
  name: string;
  status: 'SETUP' | 'IN_PROGRESS' | 'COMPLETED';
  teams: Team[];
  rounds: Round[];
}

export interface GamesState {
  games: Game[];
  activeGameId: string | null;
}

const initialState: GamesState = {
  games: [],
  activeGameId: null,
};

const gamesSlice = createSlice({
  name: 'games',
  initialState: initialState,
  reducers: {},
});

export default gamesSlice.reducer;
