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
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    refreshItems();
    refreshLocations();
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

  const refreshLocations = async () => {
    if (user !== "" && user !== null) {
      // let ar: string = [];
      console.log("userid: " + (user as any).uid);

      const q = query(
        collection(db, "locations"),
        where("user", "==", (user as any).uid)
      );
      try {
        const docSnap = await getDocs(q);
        docSnap.forEach((doc) => {
          setLocations(doc.data().locs);
        });
      } catch (err) {
        console.log(err);
      } finally {
        console.log(locations);
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center">
      <Header page={1} />
      {isLoggedIn && user != null && user != "" ? (
        <>
          <h2 className="mt-4 text-2xl mb-2 lg:text-3xl">Your Groceries</h2>
          <div className="flex flex-col gap-4 text-main-white w-4/5 md:w-3/5 lg:w-1/2 xl:w-2/5">
            {locations.map((loc) => {
              return (
                <div
                  key={loc.toString()}
                  className="bg-main-black py-1 px-4 rounded rounded-xl"
                >
                  <h2 className="text-xl text-center mb-2 lg:text-2xl">
                    {loc}
                  </h2>
                  {items.map((item) => {
                    const {
                      name,
                      location,
                      total,
                      threshold,
                      stock,
                      lastUsed,
                      user,
                      id,
                    } = item;
                    return (
                      <div key={id}>
                        {loc === location && (
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
                            <div className="w-full border-t py-1 border-shadow-white">
                              <p className="lg:text-xl">{name}</p>
                              <div className="bg-main-white w-full rounded-full">
                                {stock <= threshold ? (
                                  <div
                                    className="bg-main-pink h-3 rounded-full lg:h-5"
                                    style={{width: (stock / total) * 100 + "%"}}
                                  ></div>
                                ) : (
                                  <div
                                    className="bg-main-green h-3 rounded-full lg:h-5"
                                    style={{width: (stock / total) * 100 + "%"}}
                                  ></div>
                                )}
                              </div>
                            </div>
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <Link
            href="/itemDetail/add"
            className="flex rounded-full justify-center items-center text-3xl fixed bottom-8 right-8 pointer p-6 w-12 h-12 bg-main-pink text-main-black shadow-xl border border-shadow-white-trans"
          >
            +
          </Link>
        </>
      ) : (
        <div>
          <h2>Please log in to view pantry</h2>
        </div>
      )}
    </main>
  );
}
