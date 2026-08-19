CREATE POLICY "Chacun peut lire sa propre ligne"
ON utilisateurs
FOR SELECT
USING (auth.uid() = auth_user_id);