// Test data initialization script
import { 
  signUpWithEmail,
  createBlog,
  updateUserRole 
} from './firebase.js';

// Test users
const testUsers = [
  { email: 'admin@test.com', password: 'Admin123!', name: 'Admin User', role: 'admin' },
  { email: 'author@test.com', password: 'Author123!', name: 'Test Author', role: 'user' },
  { email: 'reader@test.com', password: 'Reader123!', name: 'Test Reader', role: 'user' }
];

// Test blogs
const testBlogs = [
  { title: 'Getting Started with Firebase', content: 'Complete guide to Firebase setup...' },
  { title: 'Advanced React Patterns', content: 'Exploring complex React component architectures...' }
];

// Initialize test data
async function initializeTestData() {
  try {
    // Create test users
    for (const user of testUsers) {
      await signUpWithEmail(user.email, user.password, user.name);
      if (user.role === 'admin') {
        await updateUserRole(user.email, 'admin');
      }
    }

    // Create test blogs (as admin user)
    const admin = testUsers.find(u => u.role === 'admin');
    for (const blog of testBlogs) {
      await createBlog({
        ...blog,
        authorUID: admin.email // Will be replaced with actual UID
      });
    }

    console.log('Test data initialized successfully');
  } catch (error) {
    console.error('Error initializing test data:', error);
  }
}

// Run initialization
initializeTestData();