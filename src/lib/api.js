import { db, storage, hasFirebaseConfig } from './firebase';
import { collection, doc, getDocs, getDoc, addDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const isMockMode = !hasFirebaseConfig;

// Initial mock data
const defaultMockMeals = [];
const defaultMockProfiles = [
  { id: 'mock-pat-1', role: 'patient', full_name: 'Ana García (Paciente Prueba)' },
  { id: 'mock-pat-2', role: 'patient', full_name: 'Carlos Ruiz (Paciente Prueba)' }
];

let mockMeals = JSON.parse(localStorage.getItem('mockMeals'));
if (!mockMeals) {
  mockMeals = defaultMockMeals;
  localStorage.setItem('mockMeals', JSON.stringify(mockMeals));
}

let mockProfiles = JSON.parse(localStorage.getItem('mockProfiles'));
if (!mockProfiles) {
  mockProfiles = defaultMockProfiles;
  localStorage.setItem('mockProfiles', JSON.stringify(mockProfiles));
}

let mockComments = JSON.parse(localStorage.getItem('mockComments') || '[]');

export const api = {
  async getPatients() {
    if (isMockMode) {
      await new Promise(r => setTimeout(r, 600));
      return { data: mockProfiles.filter(p => p.role === 'patient'), error: null };
    }
    try {
      const q = query(collection(db, 'profiles'), where('role', '==', 'patient'));
      const querySnapshot = await getDocs(q);
      const patients = [];
      querySnapshot.forEach((doc) => {
        patients.push({ id: doc.id, ...doc.data() });
      });
      return { data: patients, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async getPatientInfo(patientId) {
    if (isMockMode) {
      await new Promise(r => setTimeout(r, 200));
      return { data: mockProfiles.find(p => p.id === patientId), error: null };
    }
    try {
      const docRef = doc(db, 'profiles', patientId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { data: { id: docSnap.id, ...docSnap.data() }, error: null };
      }
      return { data: null, error: new Error('Profile not found') };
    } catch (error) {
      return { data: null, error };
    }
  },

  async getMealsByDate(patientId, dateStr) {
    if (isMockMode) {
      await new Promise(r => setTimeout(r, 400));
      const meals = mockMeals
        .filter(m => m.patient_id === patientId && m.date === dateStr)
        .map(m => ({
          ...m,
          comments: mockComments.filter(c => c.meal_id === m.id)
        }));
      return { data: meals, error: null };
    }
    try {
      const mealsQuery = query(
        collection(db, 'meals'), 
        where('patient_id', '==', patientId), 
        where('date', '==', dateStr)
      );
      const mealsSnapshot = await getDocs(mealsQuery);
      let meals = [];
      
      // For each meal, we also need to fetch its comments
      // Firebase doesn't auto-join, so we do it manually
      for (const mealDoc of mealsSnapshot.docs) {
        const mealData = { id: mealDoc.id, ...mealDoc.data(), comments: [] };
        
        const commentsQuery = query(
          collection(db, 'comments'),
          where('meal_id', '==', mealDoc.id)
        );
        const commentsSnapshot = await getDocs(commentsQuery);
        commentsSnapshot.forEach((commentDoc) => {
          mealData.comments.push({ id: commentDoc.id, ...commentDoc.data() });
        });
        
        meals.push(mealData);
      }
      
      // Sort meals locally by created_at to bypass Firestore composite block
      meals.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
      
      return { data: meals, error: null };
    } catch (error) {
      console.error("Error fetching meals:", error);
      return { data: null, error };
    }
  },
  
  async createMeal(mealData) {
    if (isMockMode) {
      await new Promise(r => setTimeout(r, 800));
      const newMeal = { id: `meal-${Date.now()}`, ...mealData, created_at: new Date().toISOString() };
      mockMeals.push(newMeal);
      localStorage.setItem('mockMeals', JSON.stringify(mockMeals));
      return { data: { ...newMeal, comments: [] }, error: null };
    }
    try {
      const docData = { ...mealData, created_at: new Date().toISOString() };
      const docRef = await addDoc(collection(db, 'meals'), docData);
      return { data: { id: docRef.id, ...docData, comments: [] }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async updateMeal(mealId, data) {
    if (isMockMode) {
      await new Promise(r => setTimeout(r, 600));
      const idx = mockMeals.findIndex(m => m.id === mealId);
      if (idx !== -1) {
        mockMeals[idx] = { ...mockMeals[idx], ...data };
        localStorage.setItem('mockMeals', JSON.stringify(mockMeals));
        return { data: mockMeals[idx], error: null };
      }
      return { data: null, error: new Error('Meal not found') };
    }
    try {
      const docRef = doc(db, 'meals', mealId);
      await updateDoc(docRef, data);
      return { data: { id: mealId, ...data }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async deleteMeal(mealId) {
    if (isMockMode) {
      await new Promise(r => setTimeout(r, 400));
      mockMeals = mockMeals.filter(m => m.id !== mealId);
      mockComments = mockComments.filter(c => c.meal_id !== mealId);
      localStorage.setItem('mockMeals', JSON.stringify(mockMeals));
      localStorage.setItem('mockComments', JSON.stringify(mockComments));
      return { error: null };
    }
    try {
      await deleteDoc(doc(db, 'meals', mealId));
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  async addComment(mealId, content) {
    if (isMockMode) {
      await new Promise(r => setTimeout(r, 400));
      const newComment = { id: `cmt-${Date.now()}`, meal_id: mealId, content, created_at: new Date().toISOString() };
      mockComments.push(newComment);
      localStorage.setItem('mockComments', JSON.stringify(mockComments));
      return { data: newComment, error: null };
    }
    try {
      const commentData = { meal_id: mealId, content, created_at: new Date().toISOString() };
      const docRef = await addDoc(collection(db, 'comments'), commentData);
      return { data: { id: docRef.id, ...commentData }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async uploadPhoto(file) {
    if (isMockMode) {
      await new Promise(r => setTimeout(r, 1200));
      return { data: { url: URL.createObjectURL(file) || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=400' }, error: null };
    }
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `meal_photos/${fileName}`;
      
      const storageRef = ref(storage, filePath);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      return { data: { url: downloadURL }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async getWaterLog(patientId, dateStr) {
    if (isMockMode) {
      await new Promise(r => setTimeout(r, 200));
      const log = JSON.parse(localStorage.getItem('mockWaterLogs') || '{}');
      return { data: log[`${patientId}_${dateStr}`] || 0, error: null };
    }
    try {
      const docRef = doc(db, 'water_logs', `${patientId}_${dateStr}`);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { data: docSnap.data().glasses || 0, error: null };
      }
      return { data: 0, error: null };
    } catch (error) {
      return { data: 0, error };
    }
  },

  async setWaterLog(patientId, dateStr, glasses) {
    if (isMockMode) {
      await new Promise(r => setTimeout(r, 200));
      const logs = JSON.parse(localStorage.getItem('mockWaterLogs') || '{}');
      logs[`${patientId}_${dateStr}`] = glasses;
      localStorage.setItem('mockWaterLogs', JSON.stringify(logs));
      return { data: glasses, error: null };
    }
    try {
      const docRef = doc(db, 'water_logs', `${patientId}_${dateStr}`);
      await setDoc(docRef, { patient_id: patientId, date: dateStr, glasses });
      return { data: glasses, error: null };
    } catch (error) {
      return { data: 0, error };
    }
  }
};
