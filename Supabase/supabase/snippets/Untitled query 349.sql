-- Tout utilisateur connecté peut lire les services de SON PROPRE site
CREATE POLICY "Chacun voit les services de son propre site"
ON services
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM utilisateurs u
    WHERE u.auth_user_id = auth.uid()
    AND (u.role = 'pdg' OR u.site_id = services.site_id)
  )
);

-- RAF et PDG peuvent créer/modifier des services
CREATE POLICY "RAF et PDG gèrent les services"
ON services
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM mon_role_et_site() m
    WHERE m.role = 'pdg' OR (m.role = 'raf' AND m.site_id = services.site_id)
  )
);

CREATE POLICY "RAF et PDG modifient les services"
ON services
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM mon_role_et_site() m
    WHERE m.role = 'pdg' OR (m.role = 'raf' AND m.site_id = services.site_id)
  )
);