"use client";
import Header from "@/components/header";
import useAuth from "../hooks/useAuth";
import {useState, useEffect} from "react";
import {
  collection,
  query,
  where,
  addDoc,
  setDoc,
  doc,
  updateDoc,
  arrayUnion,
  DocumentData,
  getDocs,
} from "firebase/firestore";
import {db} from "../firebase";
import Link from "next/link";

type Item = {
  name: string;
  location: string;
  total: number;
  threshold: number;
  stock: number;
  lastUsed: Date;
  user: string;
  id: string;
}[];

export default function Home() {
  const {isLoggedIn, user} = useAuth();
  const [items, setItems] = useState<Item>([]);

  useEffect(() => {
    refreshItems();
  }, [user]);

  const refreshItems = async () => {
    if (user !== "" && user !== null) {
      let ar: Item = [];
      const q = query(
        collection(db, "items"),
        where("user", "==", (user as any).uid)
      );
      try {
        const docSnap = await getDocs(q);
        docSnap.forEach((doc) => {
          ar.push({
            name: doc.data().name,
            location: doc.data().location,
            total: doc.data().total,
            threshold: doc.data().threshold,
            stock: doc.data().stock,
            lastUsed: doc.data().lastUsed,
            user: doc.data().user,
            id: doc.id,
          });
        });
      } catch (err) {
        console.log(err);
      } finally {
        console.log(items);
        setItems(ar);
      }
    }
  };

  const handleCreatePantryItem = async (e: any) => {
    console.log(e.value);
    try {
      const newItemRef = doc(collection(db, "items"));

      // TODO: Fix the data object to be a pantry item
      const data = {
        createdAt: Date.now(),
        description: "",
        title: e.value,
        user: (user as any).uid,
        color: "4444cc",
      };

      await setDoc(newItemRef, data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center">
      <Header page={1} />
      <h2 className="mt-4 text-xl">Your Groceries</h2>
      {items.map((item) => {
        const {name, location, total, threshold, stock, lastUsed, user, id} =
          item;
        return (
          <div key={id}>
            <Link
              href={
                "/itemDetail/" +
                id +
                "?n=" +
                name +
                "&l=" +
                location +
                "&to=" +
                total +
                "&th=" +
                threshold +
                "&s=" +
                stock +
                "&u=" +
                lastUsed
              }
            >
              {name}
            </Link>
          </div>
        );
      })}
      <Link href="/itemDetail/add"></Link>
    </main>
  );
}
