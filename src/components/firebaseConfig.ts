import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDo40L_oxRMUlrZJniVQ4sISztmPJJTJLI",
  authDomain: "task-management-app-6e1c8.firebaseapp.com",
  databaseURL: "https://task-management-app-6e1c8-default-rtdb.firebaseio.com",
  projectId: "task-management-app-6e1c8",
  storageBucket: "task-management-app-6e1c8.appspot.com",
  messagingSenderId: "667482368445",
  appId: "1:667482368445:web:4432dab263f2fce29f8ad4",
  measurementId: "G-68BHWW1PGQ"
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database };