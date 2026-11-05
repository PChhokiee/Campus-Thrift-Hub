import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useData } from '@/hooks/useData';
import { toggleLike, toggleSave } from '@/services/listingService';
import { showError } from '@/store/toastStore';
import { errorMessage } from '@/lib/utils';

/** Like / save toggles with shared error handling. */
export function useActions() {
  const { profile } = useAuth();
  const { saved, liked } = useData();

  const isSaved = useCallback((id) => !!saved[id], [saved]);
  const isLiked = useCallback((id) => liked.has(id), [liked]);

  const doToggleSave = useCallback(async (listing) => {
    try { await toggleSave(profile, listing, !!saved[listing.id]); } catch (e) { showError(errorMessage(e)); }
  }, [profile, saved]);

  const doToggleLike = useCallback(async (listing) => {
    try { await toggleLike(profile, listing, liked.has(listing.id)); } catch (e) { showError(errorMessage(e)); }
  }, [profile, liked]);

  return { isSaved, isLiked, toggleSave: doToggleSave, toggleLike: doToggleLike };
}
