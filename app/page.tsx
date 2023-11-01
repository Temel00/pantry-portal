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
  const [startDialog, setStartDialog] = useState(false);

  useEffect(() => {
    refreshItems();
    refreshLocations();
  }, [user]);

  const userSetup = async () => {
    if (user !== "" && user !== null) {
      try {
        // Add Milk
        await setDoc(doc(collection(db, "items")), {
          name: "Milk",
          location: "Fridge",
          total: "8",
          stock: "4",
          lastUsed: Date.now().toString(),
          units: "qt",
          user: (user as any).uid,
        });

        // Add Butter
        await setDoc(doc(collection(db, "items")), {
          name: "Butter",
          location: "Fridge",
          total: "32",
          stock: "16",
          lastUsed: Date.now().toString(),
          units: "tbsp",
          user: (user as any).uid,
        });

        // Add Half and half
        await setDoc(doc(collection(db, "items")), {
          name: "Half and half",
          location: "Fridge",
          total: "4",
          stock: "2",
          lastUsed: Date.now().toString(),
          units: "qt",
          user: (user as any).uid,
        });

        // Add Lettuce
        await setDoc(doc(collection(db, "items")), {
          name: "Lettuce",
          location: "Fridge",
          total: "32",
          stock: "16",
          lastUsed: Date.now().toString(),
          units: "oz",
          user: (user as any).uid,
        });

        // Add Cereal
        await setDoc(doc(collection(db, "items")), {
          name: "Cereal",
          location: "Cabinet 1",
          total: "52",
          stock: "26",
          lastUsed: Date.now().toString(),
          units: "oz",
          user: (user as any).uid,
        });

        // Add Rice
        await setDoc(doc(collection(db, "items")), {
          name: "Rice",
          location: "Cabinet 2",
          total: "30",
          stock: "25",
          lastUsed: Date.now().toString(),
          units: "c",
          user: (user as any).uid,
        });

        // Add Tenders
        await setDoc(doc(collection(db, "items")), {
          name: "Chicken Tenders",
          location: "Freezer",
          total: "64",
          stock: "40",
          lastUsed: Date.now().toString(),
          units: "oz",
          user: (user as any).uid,
        });
      } catch (err) {
        console.log(err);
      } finally {
        console.log(items);
      }
    }
  };

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

        if (docSnap.empty) {
          console.log("The doc snap is empty");
          await setDoc(doc(collection(db, "locations")), {
            locs: ["Fridge", "Freezer", "Cabinet 1", "Cabinet 2", "Pantry"],
            user: (user as any).uid,
          });
          refreshLocations();
          setStartDialog(true);
          userSetup();
        }

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
          {startDialog && (
            <>
              <div className="fixed w-full min-h-screen startDialog flex flex-col gap-4 items-center justify-center p-16">
                <h1 className="text-xl bg-shadow-white text-main-white border border-main-pink p-8 shadow-xl rounded-full">
                  To add an item to your inventory press the add button in the
                  lower right corner.
                </h1>
              </div>
            </>
          )}
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
                      stock,
                      lastUsed,
                      units,
                      user,
                      id,
                    } = item;

                    let stockColor = "#86b69b";
                    if (stock < total / 2 && stock >= total / 4) {
                      stockColor = "#d0de4f";
                    } else if (stock < total / 4) {
                      stockColor = "#de5e50";
                    } else {
                      stockColor = "#86b69b";
                    }

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
                                <motion.div
                                  className="h-3 rounded-full lg:h-5 origin-left"
                                  style={{
                                    width: (stock / total) * 100 + "%",
                                    background: stockColor,
                                  }}
                                  initial={{scaleX: 0}}
                                  animate={{scaleX: 1}}
                                  transition={{
                                    duration: 2,
                                    type: "spring",
                                  }}
                                ></motion.div>
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
            initial={{transform: "translateY(50" + "px)"}}
            animate={{transform: "translateY(0" + "px)"}}
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
