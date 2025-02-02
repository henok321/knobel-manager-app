import { useContext } from 'react';

import { AuthContext, AuthContextValue } from './AuthContext.tsx';

export const useAuth = (): AuthContextValue => useContext(AuthContext);
