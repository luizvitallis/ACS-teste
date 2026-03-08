import { entities } from './entities';

// Auth stub — o sistema usa autenticação própria via localStorage
const auth = {
  me: async () => null,
  logout: () => {},
  redirectToLogin: () => {},
};

// Exporta a mesma interface que o base44 SDK usava
export const base44 = {
  entities,
  auth,
};
