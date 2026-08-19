CREATE POLICY "RAF et PDG voient tout le personnel de leur site"
ON utilisateurs
FOR SELECT
USING (
  auth.uid() = auth_user_id
  OR
  EXISTS (
    SELECT 1 FROM utilisateurs u
    WHERE u.auth_user_id = auth.uid()
    AND (u.role = 'pdg' OR (u.role = 'raf' AND u.site_id = utilisateurs.site_id))
  )
);

CREATE POLICY "RAF et PDG voient les services de leur site"
ON services
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM utilisateurs u
    WHERE u.auth_user_id = auth.uid()
    AND (u.role = 'pdg' OR (u.role = 'raf' AND u.site_id = services.site_id))
  )
);