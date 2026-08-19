import { useContext } from 'react';
import { OfflineContext } from '../context/OfflineContext';

export function useOfflineSync() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOfflineSync doit être utilisé à l\'intérieur d\'un OfflineProvider');
  }
  return context;
}
