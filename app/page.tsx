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
import {AnimatePresence, easeInOut, motion} from "framer-motion";

type Item = {
  name: string;
  location: string;
  total: number;
  threshold: number;
  stock: number;
  lastUsed: Date;
  units: string;
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
            units: doc.data().units,
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
    <main className="flex min-h-screen flex-col items-center pb-4">
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
                      units,
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
                              lastUsed +
                              "&un=" +
                              units
                            }
                          >
                            <div className="w-full border-t py-1 border-shadow-white">
                              <p className="lg:text-xl">{name}</p>
                              <div className="bg-main-white w-full rounded-full border-4 border-main-white">
                                {stock <= threshold ? (
                                  <motion.div
                                    className="bg-main-pink h-3 rounded-full lg:h-5 origin-left"
                                    style={{
                                      width: (stock / total) * 100 + "%",
                                    }}
                                    initial={{scaleX: 0}}
                                    animate={{scaleX: 1}}
                                    transition={{
                                      duration: stock / total,
                                      type: "spring",
                                    }}
                                  ></motion.div>
                                ) : (
                                  <motion.div
                                    className="bg-main-green h-3 rounded-full lg:h-5 origin-left"
                                    style={{width: (stock / total) * 100 + "%"}}
                                    initial={{scaleX: 0}}
                                    animate={{scaleX: 1}}
                                    transition={{
                                      duration: (stock / total) * 2,
                                      type: "spring",
                                    }}
                                  ></motion.div>
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

          <motion.div
            className="fixed bg-dark-pink px-7 py-10 bottom-0 right-7 rounded-t-full"
            initial={{transform: "translateY(50px)"}}
            animate={{transform: "translateY(0)"}}
            transition={{
              duration: 0.1,
              type: "spring",
            }}
          >
            <Link
              href="/itemDetail/add"
              className="absolute top-0 -left-1 flex rounded-full justify-center items-center text-3xl pointer p-7 w-12 h-12 bg-main-pink text-main-black shadow-lg border-dark-pink border-4"
            >
              +
            </Link>
          </motion.div>
        </>
      ) : (
        <div>
          <h2>Please log in to view pantry</h2>
        </div>
      )}
    </main>
  );
}
