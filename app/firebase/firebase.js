// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // 추가

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCfs6qWinhdmnfOdoPnA_eeaa3KEkb-jQU",
  authDomain: "testdata2-174ea.firebaseapp.com",
  databaseURL: "https://testdata2-174ea-default-rtdb.firebaseio.com",
  projectId: "testdata2-174ea",
  storageBucket: "testdata2-174ea.appspot.com",
  messagingSenderId: "598912364446",
  appId: "1:598912364446:web:efbab44fbaad6b809e308f",
  measurementId: "G-02Y5004EVX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the initialized app and database
export const database = getDatabase(app);
export default app;
