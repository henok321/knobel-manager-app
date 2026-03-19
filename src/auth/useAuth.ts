import { useContext } from 'react';

import { AuthContext, type AuthContextValue } from './AuthContext.tsx';

export const useAuth = (): AuthContextValue => useContext(AuthContext);
