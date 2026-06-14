// ─── Firebase — Conexão da Secagem H2 ────────────────────────────────────────
// Projeto: app-secagem (modo TESTE — uso interno, sem aprovação TI ainda)
import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDiyYNLjW_KIZ6YNeqxVhvx-IiH0EfzdDg",
  authDomain: "app-secagem.firebaseapp.com",
  projectId: "app-secagem",
  storageBucket: "app-secagem.firebasestorage.app",
  messagingSenderId: "113464802837",
  appId: "1:113464802837:web:e506c6b81893a3f439581c",
};

const app = initializeApp(firebaseConfig);

// Persistência offline: salva no aparelho quando sem internet
// e sobe sozinho para a nuvem quando a conexão volta.
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

// Coleção única onde cada chave do app vira um documento
const COL = collection(db, "secagem_h2");

export { db, COL, doc, setDoc, getDoc };
