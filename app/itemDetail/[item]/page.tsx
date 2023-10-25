"use client";
import Header from "@/components/header";
import useAuth from "../../../hooks/useAuth";
import {useState, useEffect, FormEvent} from "react";
import {useSearchParams, useRouter} from "next/navigation";
import {
  collection,
  query,
  where,
  addDoc,
  setDoc,
  deleteDoc,
  getDoc,
  doc,
  updateDoc,
  arrayUnion,
  DocumentData,
  getDocs,
} from "firebase/firestore";
import {db} from "../../../firebase";
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

export default function Page({params}: {params: {item: string}}) {
  const {isLoggedIn, user} = useAuth();
  const [items, setItems] = useState<Item>([]);
  const [error, setError] = useState("");
  const [dialog, setDialog] = useState(false);
  const [edit, setEdit] = useState(false);
  const [save, setSave] = useState(false);
  const [locations, setLocations] = useState([]);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Input Field States
  const [itemName, setItemName] = useState<string>(() => {
    const name = searchParams.get("n");
    return name !== null ? name : "";
  });
  const [itemLocation, setItemLocation] = useState<string>(() => {
    const location = searchParams.get("l");
    return location !== null ? location : "";
  });
  const [itemTotal, setItemTotal] = useState<number>(() => {
    const total = searchParams.get("to");
    return total !== null ? +total : 0;
  });
  const [itemThreshold, setItemThreshold] = useState<number>(() => {
    const threshold = searchParams.get("th");
    return threshold !== null ? +threshold : 0;
  });
  const [itemStock, setItemStock] = useState<number>(() => {
    const stock = searchParams.get("s");
    return stock !== null ? +stock : 0;
  });
  const [itemUsed, setItemUsed] = useState<string>(() => {
    const used = searchParams.get("u");
    return used !== null ? used : "";
  });

  const [itemUnits, setItemUnits] = useState<string>(() => {
    const units = searchParams.get("un");
    return units !== null ? units : "";
  });

  useEffect(() => {
    setStateVariables();
    refreshSpace();
    refreshLocations();
  }, [user]);

  const setStateVariables = () => {
    if (params.item == "add") {
      setEdit(true);
    }
    // Set States
    const name = searchParams.get("n");
    if (name !== null) {
      setItemName(name);
    }

    const location = searchParams.get("l");
    if (location !== null) {
      setItemLocation(location);
    }

    const total = searchParams.get("to");
    if (total !== null) {
      setItemTotal(+total);
    }

    const threshold = searchParams.get("th");
    if (threshold !== null) {
      setItemThreshold(+threshold);
    }

    const stock = searchParams.get("s");
    if (stock !== null) {
      setItemStock(+stock);
    }

    const used = searchParams.get("u");
    if (used !== null) {
      setItemUsed(used);
    }
  };

  const refreshSpace = async () => {
    const itemId = params.item;
    if (itemId != null) {
      let ar: Item = [];

      const itemRef = doc(db, "items", itemId);
      try {
        const docSnap = await getDoc(itemRef);
        if (docSnap != null) {
          ar.push({
            name: docSnap.data()?.name,
            location: docSnap.data()?.location,
            total: docSnap.data()?.total,
            threshold: docSnap.data()?.threshold,
            stock: docSnap.data()?.stock,
            lastUsed: docSnap.data()?.lastUsed,
            units: docSnap.data()?.units,
            user: docSnap.data()?.user,
            id: docSnap.data()?.id,
          });
        }
      } catch (error) {
        console.log(error);
      } finally {
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
      }
    }
  };

  const getFormattedDate = (): string => {
    console.log("itemUsed: " + itemUsed);
    const itemDate = new Date(+itemUsed);
    console.log("itemDate: " + itemDate);

    const year = itemDate.toISOString().slice(0, 4);
    const month = itemDate.toISOString().slice(5, 7);
    const day = itemDate.toISOString().slice(8, 10);
    return month + "/" + day + "/" + year;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (user !== "" && user !== null) {
      if (itemName !== "" && itemName !== null) {
        setError("");
        if (params.item == "add") {
          const itemsRef = doc(collection(db, "items"));
          const locInput = (
            document.getElementById("locInput") as HTMLSelectElement | null
          )?.value;
          try {
            await setDoc(itemsRef, {
              name: itemName,
              location: locInput,
              total: itemTotal,
              threshold: itemThreshold,
              stock: itemStock,
              lastUsed: Date.now(),
              units: itemUnits,
              user: (user as any).uid,
            });
          } catch (err) {
            console.log(err);
          } finally {
            router.push("/");
          }
        } else {
          try {
            await setDoc(doc(db, "items", params.item), {
              name: itemName,
              location: itemLocation,
              total: itemTotal,
              threshold: itemThreshold,
              stock: itemStock,
              lastUsed: Date.now(),
              units: itemUnits,
              user: (user as any).uid,
            });
          } catch (err) {
            console.log(err);
          } finally {
            // router.push("/");
            setEdit(false);
          }
        }
      } else {
        setError("Error: Please enter an item name.");
      }
    }
  };

  const handleDelete = async () => {
    if (user !== "" && user !== null) {
      try {
        await deleteDoc(doc(db, "items", params.item));
      } catch (err) {
        console.log(err);
      } finally {
        router.push("/");
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center">
      <Header page={2} />
      {isLoggedIn && user != null && user != "" ? (
        <>
          {dialog && (
            <div className="fixed w-full h-full bg-shadow-white-trans pt-24 text-main-black flex justify-center">
              <div className="flex flex-col bg-main-pink h-min text-center p-4 rounded-xl">
                <h2 className="text-lg">Delete Item</h2>
                <p className="text-sm">
                  Are you sure you want to delete this pantry item?
                </p>
                <div className="flex justify-around mt-4">
                  <button
                    className="border border-shadow-white-trans py-1 px-4 rounded-full"
                    onClick={() => setDialog(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="border border-shadow-white-trans py-1 px-4 rounded-full"
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          <form
            className="flex flex-col items-center mt-4 gap-2 bg-main-black py-4 px-6 rounded-xl text-main-white shadow-lg relative"
            onSubmit={handleSubmit}
          >
            <div className="relative">
              {edit ? (
                <input
                  name="name"
                  value={itemName}
                  className="bg-transparent border-shadow-white border rounded-md px-1 text-xl w-full mb-2 text-center"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setItemName(e.target.value);
                  }}
                ></input>
              ) : (
                <>
                  <motion.button
                    className="absolute -right-16 shadow-lg bg-shadow-white p-2 rounded-r-xl"
                    onClick={() => {
                      setEdit(true);
                      setSave(false);
                    }}
                    initial={{translateX: -10}}
                    animate={{translateX: 0}}
                    transition={{
                      duration: 0.2,
                      ease: easeInOut,
                      scale: {
                        type: "spring",
                        damping: 5,
                        stiffness: 90,
                      },
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24"
                      viewBox="0 -960 960 960"
                      width="24"
                      fill="currentColor"
                    >
                      <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
                    </svg>
                  </motion.button>
                  <h2 className="text-2xl">{itemName}</h2>
                </>
              )}
            </div>

            <div className="flex gap-1 justify-between w-full">
              {edit ? (
                <>
                  <label htmlFor="location">Location:</label>
                  <select
                    name="location"
                    value={itemLocation}
                    id="locInput"
                    className="bg-transparent border border-shadow-white rounded-md px-1"
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      setItemLocation(e.target.value);
                    }}
                  >
                    {locations.map((loc) => {
                      return (
                        <option
                          key={loc}
                          value={loc}
                          className="bg-main-black border px-1"
                        >
                          {loc}
                        </option>
                      );
                    })}
                  </select>
                </>
              ) : (
                <>
                  <p className="text-sm">Location: </p>
                  <p className="text-sm">{itemLocation}</p>
                </>
              )}
            </div>

            <div className="flex flex-col text-center w-full border-y border-shadow-white py-4 my-2">
              {edit ? (
                <div className="flex justify-center gap-2">
                  <label htmlFor="stock">Stock: {itemStock}</label>
                  <select
                    className="bg-transparent border border-shadow-white rounded-md"
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      setItemUnits(e.target.value);
                    }}
                  >
                    <option value="tsp">tsp</option>
                    <option value="tbsp">tbsp</option>
                    <option value="c">c</option>
                    <option value="pt">pt</option>
                    <option value="qt">qt</option>
                    <option value="gal">gal</option>
                    <option value="oz">oz</option>
                    <option value="fl oz">fl oz</option>
                    <option value="lb">lb</option>
                    <option value="mL">mL</option>
                    <option value="l">l</option>
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                  </select>
                </div>
              ) : (
                <p>
                  Stock:&emsp;{itemStock}&ensp;{itemUnits}
                </p>
              )}

              {+itemStock <= +itemThreshold ? (
                <input
                  name="stock"
                  type="range"
                  value={itemStock}
                  min={0}
                  max={itemTotal}
                  className="bg-transparent border border-shadow-white rounded-md px-1 text-center accent-main-pink"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (itemStock !== +e.target.value) {
                      setItemStock(+e.target.value);
                      setSave(true);
                    } else {
                      setSave(false);
                    }
                  }}
                ></input>
              ) : (
                <input
                  name="stock"
                  type="range"
                  value={itemStock}
                  min={0}
                  max={itemTotal}
                  className="bg-transparent border border-shadow-white rounded-md px-1 text-center accent-main-green"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (itemStock !== +e.target.value) {
                      setItemStock(+e.target.value);
                      setSave(true);
                    }
                  }}
                ></input>
              )}

              {edit && (
                <div className="flex justify-between mt-2">
                  <div className="flex flex-col place-items-center">
                    <input
                      name="threshold"
                      type="number"
                      min={0}
                      max={itemTotal}
                      value={itemThreshold}
                      className="bg-transparent border border-shadow-white rounded-md px-1 w-10 text-center"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setItemThreshold(+e.target.value);
                      }}
                    ></input>
                    <label htmlFor="threshold" className="text-xs">
                      Threshold
                    </label>
                  </div>
                  <div className="flex flex-col place-items-center">
                    <input
                      name="total"
                      type="number"
                      min={0}
                      value={itemTotal}
                      className="bg-transparent border border-shadow-white rounded-md px-1 w-10 text-center"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setItemTotal(+e.target.value);
                      }}
                    ></input>
                    <label htmlFor="total" className="text-xs">
                      Total
                    </label>
                  </div>
                </div>
              )}
            </div>

            <p>Last updated: {getFormattedDate()}</p>
            {edit && (
              <>
                <button
                  type="submit"
                  className="text-lg bg-main-green py-2 px-4 rounded-full"
                >
                  Save
                </button>
                <p className="text-md text-main-pink">{error}</p>
              </>
            )}
            {save && (
              <div className="absolute -bottom-24 -z-10">
                <motion.div
                  className="absolute bg-dark-pink w-16 h-24 bottom-8 -z-10"
                  initial={{translateY: -100}}
                  animate={{translateY: 0}}
                  transition={{
                    duration: 0.4,
                    ease: easeInOut,
                    scale: {
                      type: "spring",
                      damping: 15,
                      stiffness: 100,
                    },
                  }}
                ></motion.div>
                <motion.button
                  className="bg-main-pink text-main-black w-16 h-16 rounded-full border-4 border-dark-pink"
                  initial={{translateY: -100}}
                  animate={{translateY: 0}}
                  transition={{
                    duration: 0.4,
                    ease: easeInOut,
                    scale: {
                      type: "spring",
                      damping: 15,
                      stiffness: 100,
                    },
                  }}
                >
                  Save
                </motion.button>
              </div>
            )}
          </form>
          {params.item !== "add" && edit && (
            <button
              className="flex text-xs bg-main-pink mt-12 py-2 px-4 rounded-full"
              onClick={() => {
                setDialog(true);
              }}
            >
              Delete&emsp;
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="16"
                viewBox="0 -960 960 960"
                width="16"
                fill="currentColor"
              >
                <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
              </svg>
            </button>
          )}
        </>
      ) : (
        <div>
          <h2>Please log in to view pantry</h2>
        </div>
      )}
    </main>
  );
}
