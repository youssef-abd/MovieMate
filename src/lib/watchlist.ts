import { 
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  query,
  getDocs,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import type { MovieResult, TvResult } from '@/types/tmdb';

export async function addToWatchlist(
  userId: string,
  media: MovieResult | TvResult
) {
  const watchlistRef = doc(db, `users/${userId}/watchlist/${media.id}`);
  await setDoc(watchlistRef, {
    id: media.id,
    mediaType: media.media_type,
    title: media.media_type === 'movie' ? media.title : media.name,
    posterPath: media.poster_path,
    overview: media.overview,
    voteAverage: media.vote_average,
    releaseDate: media.media_type === 'movie' ? media.release_date : media.first_air_date,
    addedAt: serverTimestamp(),
  });
}

export async function removeFromWatchlist(userId: string, mediaId: number) {
  const watchlistRef = doc(db, `users/${userId}/watchlist/${mediaId}`);
  await deleteDoc(watchlistRef);
}

export async function isInWatchlist(userId: string, mediaId: number) {
  const watchlistRef = doc(db, `users/${userId}/watchlist/${mediaId}`);
  const docSnap = await getDoc(watchlistRef);
  return docSnap.exists();
}

export async function getWatchlist(userId: string) {
  const watchlistRef = collection(db, `users/${userId}/watchlist`);
  const q = query(watchlistRef, orderBy('addedAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
  }));
}