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

export async function rateMedia(
  userId: string,
  mediaId: number,
  mediaType: 'movie' | 'tv',
  rating: number
) {
  const ratingRef = doc(db, `users/${userId}/ratings/${mediaId}`);
  await setDoc(ratingRef, {
    mediaId,
    mediaType,
    rating,
    ratedAt: serverTimestamp(),
  });
}

export async function getUserRating(userId: string, mediaId: number) {
  const ratingRef = doc(db, `users/${userId}/ratings/${mediaId}`);
  const docSnap = await getDoc(ratingRef);
  return docSnap.exists() ? docSnap.data() : null;
}

export async function getUserRatings(userId: string) {
  const ratingsRef = collection(db, `users/${userId}/ratings`);
  const q = query(ratingsRef, orderBy('ratedAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
  }));
}