import { 
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  getDocs,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';

interface Rating {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  rating: number;
  title: string;
  posterPath: string | null;
  voteAverage: number;
  releaseDate: string;
  ratedAt: Date;
}

export const addRating = async (userId: string, mediaId: number, rating: Rating) => {
  // TODO: Implement rating storage logic
};

export const getRating = async (userId: string, mediaId: number): Promise<number | null> => {
  // TODO: Implement rating retrieval logic
  return null;
};

export const removeRating = async (userId: string, mediaId: number) => {
  // TODO: Implement rating removal logic
};

export const getUserRatings = async (userId: string) => {
  const ratingsRef = collection(db, `users/${userId}/ratings`);
  const q = query(ratingsRef, orderBy('ratedAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
  }));
};