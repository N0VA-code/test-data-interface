// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // 추가

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDyq8BD0I5vSP3MMV8hUIwC6hqfXSW6460",
  authDomain: "testdata-6b032.firebaseapp.com",
  databaseURL: "https://testdata-6b032-default-rtdb.firebaseio.com",
  projectId: "testdata-6b032",
  storageBucket: "testdata-6b032.appspot.com",
  messagingSenderId: "923954076033",
  appId: "1:923954076033:web:7728f3f209177677a7f080",
  measurementId: "G-W13SZTXZF6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the initialized app and database
export const database = getDatabase(app);
export default app;
