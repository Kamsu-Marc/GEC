-- On supprime la policy problématique
DROP POLICY "RAF et PDG voient tout le personnel de leur site" ON utilisateurs;

-- On crée une fonction qui contourne RLS pour cette vérification précise
CREATE OR REPLACE FUNCTION mon_role_et_site()
RETURNS TABLE(role role_utilisateur, site_id UUID) AS $$
  SELECT role, site_id FROM utilisateurs WHERE auth_user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- On recrée la policy en utilisant cette fonction au lieu d'une sous-requête directe
CREATE POLICY "RAF et PDG voient tout le personnel de leur site"
ON utilisateurs
FOR SELECT
USING (
  auth.uid() = auth_user_id
  OR
  EXISTS (
    SELECT 1 FROM mon_role_et_site() m
    WHERE m.role = 'pdg' OR (m.role = 'raf' AND m.site_id = utilisateurs.site_id)
  )
);