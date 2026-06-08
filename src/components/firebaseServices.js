// src/firebaseService.js
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

const CUSTOMERS_COLLECTION = "customers";

// ─── CREATE ─────────────────────────────
export const addCustomerToFirestore = async (customerData, userId) => {
  try {
    // Remove any existing id (Firestore will generate new one)
    const { id, ...dataWithoutId } = customerData;

    const docRef = await addDoc(collection(db, CUSTOMERS_COLLECTION), {
      ...dataWithoutId,
      userId, // ✅ CRITICAL: attach user ID for security
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { id: docRef.id, ...dataWithoutId };
  } catch (error) {
    console.error("Error adding customer:", error);
    throw error;
  }
};

// ─── READ (all customers for a specific user) ─────
export const getCustomersByUser = async (userId) => {
  try {
    const q = query(
      collection(db, CUSTOMERS_COLLECTION),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );
    const querySnapshot = await getDocs(q);

    const customers = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      customers.push({
        id: doc.id,
        ...data,
        createdAt:
          data.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
      });
    });
    return customers;
  } catch (error) {
    console.error("Error getting customers:", error);
    throw error;
  }
};

// ─── UPDATE ─────────────────────────────
export const updateCustomerInFirestore = async (id, updatedData, userId) => {
  try {
    const docRef = doc(db, CUSTOMERS_COLLECTION, id);
    // First verify that this document belongs to the user (optional but recommended)
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists() || docSnap.data().userId !== userId) {
      throw new Error("Unauthorized or document not found");
    }

    const { id: _, createdAt, userId: __, ...dataToUpdate } = updatedData;

    await updateDoc(docRef, {
      ...dataToUpdate,
      updatedAt: serverTimestamp(),
    });

    return { id, ...updatedData };
  } catch (error) {
    console.error("Error updating customer:", error);
    throw error;
  }
};

// ─── DELETE ─────────────────────────────
export const deleteCustomerFromFirestore = async (id, userId) => {
  try {
    const docRef = doc(db, CUSTOMERS_COLLECTION, id);
    // Verify ownership before deleting
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists() || docSnap.data().userId !== userId) {
      throw new Error("Unauthorized or document not found");
    }
    await deleteDoc(docRef);
    return id;
  } catch (error) {
    console.error("Error deleting customer:", error);
    throw error;
  }
};
