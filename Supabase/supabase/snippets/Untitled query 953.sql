-- ====================================================================
-- SYSTEME DE SUIVI DE COURRIER ENTRANT - SCRIPT COMPLET
-- TrackMail Enterprise - Schéma Supabase / PostgreSQL
-- ====================================================================

-- 1. ENUMERATIONS
CREATE TYPE statut_courrier AS ENUM ('recu', 'distribue');
CREATE TYPE role_utilisateur AS ENUM ('agent', 'responsable', 'raf', 'pdg');

-- 2. TABLE : SITES
CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  code_court VARCHAR(10) NOT NULL UNIQUE,
  adresse TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. TABLE : SERVICES
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE RESTRICT,
  nom TEXT NOT NULL,
  actif BOOLEAN NOT NULL DEFAULT true,
  date_desactivation TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. TABLE : UTILISATEURS
CREATE TABLE utilisateurs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  role role_utilisateur NOT NULL,
  site_id UUID REFERENCES sites(id) ON DELETE RESTRICT,
  service_id UUID REFERENCES services(id) ON DELETE RESTRICT,
  actif BOOLEAN NOT NULL DEFAULT true,
  date_desactivation TIMESTAMPTZ,
  historique JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT check_role_affectation CHECK (
    (role = 'pdg'         AND site_id IS NULL     AND service_id IS NULL) OR
    (role = 'raf'         AND site_id IS NOT NULL AND service_id IS NULL) OR
    (role = 'agent'       AND site_id IS NOT NULL AND service_id IS NULL) OR
    (role = 'responsable' AND site_id IS NOT NULL AND service_id IS NOT NULL)
  )
);

-- Un seul RAF actif par site
CREATE UNIQUE INDEX idx_unique_raf_actif_per_site
ON utilisateurs (site_id)
WHERE role = 'raf' AND actif = true;

-- 5. TABLE : COURRIERS
CREATE TABLE courriers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cotation TEXT NOT NULL UNIQUE,
  statut statut_courrier NOT NULL DEFAULT 'recu',
  agent_id UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE RESTRICT,
  agent_nom TEXT NOT NULL,
  date_reception TIMESTAMPTZ NOT NULL DEFAULT now(),
  decharge_par_id UUID REFERENCES utilisateurs(id) ON DELETE RESTRICT,
  decharge_par_nom TEXT,
  date_distribution TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT check_decharge_coherence CHECK (
    statut != 'distribue' OR (
      decharge_par_id IS NOT NULL AND
      decharge_par_nom IS NOT NULL AND
      date_distribution IS NOT NULL
    )
  )
);

-- 6. TABLE DE JONCTION : COURRIER_SERVICES (Many-to-Many)
CREATE TABLE courrier_services (
  courrier_id UUID NOT NULL REFERENCES courriers(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (courrier_id, service_id)
);

-- 7. TABLE : COMPTEURS_COTATION
CREATE TABLE compteurs_cotation (
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE RESTRICT,
  annee INTEGER NOT NULL,
  semaine INTEGER NOT NULL,
  dernier_numero INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (site_id, annee, semaine),
  CONSTRAINT check_annee_semaine_valides CHECK (
    annee >= 2020 AND semaine BETWEEN 1 AND 53 AND dernier_numero >= 0
  )
);

-- ====================================================================
-- 8. FONCTION : GENERATION ATOMIQUE DE LA COTATION
-- Format : [CODE_SITE]-[ANNEE]-S[SEMAINE]-[NUMERO SUR 3 CHIFFRES]
-- Ex: PAR-2026-S05-012
-- ====================================================================
CREATE OR REPLACE FUNCTION generer_prochaine_cotation(p_site_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_code_site VARCHAR(10);
  v_annee INTEGER := EXTRACT(ISOYEAR FROM now())::INTEGER;
  v_semaine INTEGER := EXTRACT(WEEK FROM now())::INTEGER;
  v_numero INTEGER;
BEGIN
  SELECT code_court INTO v_code_site FROM sites WHERE id = p_site_id;

  IF v_code_site IS NULL THEN
    RAISE EXCEPTION 'Site introuvable pour id %', p_site_id;
  END IF;

  INSERT INTO compteurs_cotation (site_id, annee, semaine, dernier_numero)
  VALUES (p_site_id, v_annee, v_semaine, 1)
  ON CONFLICT (site_id, annee, semaine)
  DO UPDATE SET
    dernier_numero = compteurs_cotation.dernier_numero + 1,
    updated_at = now()
  RETURNING dernier_numero INTO v_numero;

  RETURN format('%s-%s-S%s-%s',
    v_code_site,
    v_annee,
    lpad(v_semaine::text, 2, '0'),
    lpad(v_numero::text, 3, '0')
  );
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- 9. TRIGGER : REMPLISSAGE AUTOMATIQUE DE LA COTATION A L'INSERTION
-- ====================================================================
CREATE OR REPLACE FUNCTION trigger_generer_cotation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.cotation IS NULL OR NEW.cotation = '' THEN
    NEW.cotation := generer_prochaine_cotation(
      (SELECT site_id FROM utilisateurs WHERE id = NEW.agent_id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_courrier
BEFORE INSERT ON courriers
FOR EACH ROW
EXECUTE FUNCTION trigger_generer_cotation();