import { TeamStore, TeamStoreState } from './teamStore.types';
declare const createTeamStore: (initialState?: Partial<TeamStoreState>, teamInstance?: any) => TeamStore;
export { createTeamStore };
