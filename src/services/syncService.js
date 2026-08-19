/**
 * Service de Synchronisation Supabase <-> IndexedDB (Slot Synchro)
 * Ce fichier gère la file d'attente des modifications effectuées hors-ligne.
 */

export const syncService = {
  async processPendingQueue() {
    console.log('[SyncService Slot] Traitement de la file d\'attente de synchro...');
    return { synced: 0, pending: 0 };
  }
};
