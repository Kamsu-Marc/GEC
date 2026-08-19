/**
 * Service Abstraction pour IndexedDB (Slot Hors-Ligne)
 * Ce fichier est destiné à accueillir votre implémentation IndexedDB (ex: Dexie.js / idb)
 */

export const offlineStorage = {
  async get(table) {
    console.log(`[OfflineStorage Slot] Lecture de la table local: ${table}`);
    return null;
  },

  async save(table, data) {
    console.log(`[OfflineStorage Slot] Sauvegarde local dans la table: ${table}`);
    return true;
  },

  async remove(table, id) {
    console.log(`[OfflineStorage Slot] Suppression dans la table: ${table}, id: ${id}`);
    return true;
  }
};
