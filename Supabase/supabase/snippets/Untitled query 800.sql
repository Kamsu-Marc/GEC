INSERT INTO utilisateurs (id, nom, role, site_id, actif, historique)
VALUES (
  '75f4f51a-3a17-4dc4-87ad-7af58ae9f14a',   -- l’ID de ton utilisateur (copie-le depuis Auth → Users)
  'Marc-Anthony',          -- ton nom
  'agent',                 -- rôle choisi
  '1896aa53-d4e8-4bb8-8d26-bc4076dc118f',          -- prends un vrai site existant dans ta table sites
  true,
  '[]'::jsonb
);
