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
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

const CUSTOMERS_COLLECTION = "customers";

// ─── CREATE ─────────────────────────────
export const addCustomerToFirestore = async (customerData) => {
  try {
    // crypto.randomUUID() hatayein, Firestore apna ID deta hai
    const { id, ...dataWithoutId } = customerData;

    const docRef = await addDoc(collection(db, CUSTOMERS_COLLECTION), {
      ...dataWithoutId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { id: docRef.id, ...dataWithoutId };
  } catch (error) {
    console.error("Error adding customer:", error);
    throw error;
  }
};

// ─── READ ─────────────────────────────
export const getAllCustomersFromFirestore = async () => {
  try {
    const q = query(
      collection(db, CUSTOMERS_COLLECTION),
      orderBy("createdAt", "desc"),
    );
    const querySnapshot = await getDocs(q);

    const customers = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      customers.push({
        id: doc.id,
        ...data,
        // Firestore timestamp ko ISO string mein convert
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
export const updateCustomerInFirestore = async (id, updatedData) => {
  try {
    const docRef = doc(db, CUSTOMERS_COLLECTION, id);

    // id aur createdAt remove karein taake overwrite na ho
    const { id: _, createdAt, ...dataToUpdate } = updatedData;

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
export const deleteCustomerFromFirestore = async (id) => {
  try {
    await deleteDoc(doc(db, CUSTOMERS_COLLECTION, id));
    return id;
  } catch (error) {
    console.error("Error deleting customer:", error);
    throw error;
  }
};
