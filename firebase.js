// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDummyKey-1234567890",
  authDomain: "blog-website-12345.firebaseapp.com",
  projectId: "blog-website-12345",
  storageBucket: "blog-website-12345.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abc123def456"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Authentication functions
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    await createUserIfNotExists(userCredential.user);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const signUpWithEmail = async (email, password, displayName) => {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    await createUserProfile(userCredential.user, displayName);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const signInWithGoogle = async () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    const userCredential = await auth.signInWithPopup(provider);
    await createUserIfNotExists(userCredential.user);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const signOut = () => auth.signOut();

// User profile functions
const createUserIfNotExists = async (user) => {
  const userRef = db.collection('users').doc(user.uid);
  const doc = await userRef.get();
  if (!doc.exists) {
    await userRef.set({
      email: user.email,
      displayName: user.displayName || user.email.split('@')[0],
      role: 'user',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  }
};

const createUserProfile = async (user, displayName) => {
  await db.collection('users').doc(user.uid).set({
    email: user.email,
    displayName: displayName || user.email.split('@')[0],
    role: 'user',
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
};

// Blog functions
export const createBlog = async (blogData) => {
  try {
    await db.collection('blogs').add({
      ...blogData,
      authorUID: auth.currentUser.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateBlog = async (blogId, blogData) => {
  try {
    await db.collection('blogs').doc(blogId).update({
      ...blogData,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteBlog = async (blogId) => {
  try {
    await db.collection('blogs').doc(blogId).delete();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getBlog = async (blogId) => {
  try {
    const doc = await db.collection('blogs').doc(blogId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  } catch (error) {
    return { error: error.message };
  }
};

export const getUserBlogs = async () => {
  try {
    const snapshot = await db.collection('blogs')
      .where('authorUID', '==', auth.currentUser.uid)
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    return { error: error.message };
  }
};

export const getAllBlogs = async () => {
  try {
    const snapshot = await db.collection('blogs')
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    return { error: error.message };
  }
};

// Admin functions
export const getAllUsers = async () => {
  try {
    const snapshot = await db.collection('users').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    return { error: error.message };
  }
};

export const updateUserRole = async (userId, role) => {
  try {
    await db.collection('users').doc(userId).update({ role });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const checkAdminRole = async () => {
  try {
    if (!auth.currentUser) return false;
    const doc = await db.collection('users').doc(auth.currentUser.uid).get();
    return doc.exists && doc.data().role === 'admin';
  } catch (error) {
    return false;
  }
};
