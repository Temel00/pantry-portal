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

type Values = {
  name: string;
  location: string;
  total: number;
  threshold: number;
  stock: number;
  lastUsed: string;
}[];

export default function Page({params}: {params: {item: string}}) {
  const {isLoggedIn, user} = useAuth();
  const [items, setItems] = useState<Item>([]);
  const [error, setError] = useState("");
  const [dialog, setDialog] = useState(false);
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

  useEffect(() => {
    setStateVariables();
    refreshSpace();
    refreshLocations();
  }, [user]);

  const setStateVariables = () => {
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
      // let newAr: Values = [];

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
              user: (user as any).uid,
            });
          } catch (err) {
            console.log(err);
          } finally {
            router.push("/");
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
            className="flex flex-col items-center mt-4 gap-2 bg-main-black p-4 rounded-xl text-main-white"
            onSubmit={handleSubmit}
          >
            <input
              name="name"
              value={itemName}
              className="bg-transparent border-shadow-white border rounded-md px-1 text-xl w-full mb-2 text-center"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setItemName(e.target.value);
              }}
            ></input>

            <div className="flex gap-1 justify-between w-full">
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
            </div>

            <div className="flex flex-col text-center w-full border-y border-shadow-white py-4 my-2">
              <label htmlFor="stock">Stock: {itemStock}</label>
              {+itemStock <= +itemThreshold ? (
                <input
                  name="stock"
                  type="range"
                  value={itemStock}
                  min={0}
                  max={itemTotal}
                  className="bg-transparent border border-shadow-white rounded-md px-1 text-center accent-main-pink"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setItemStock(+e.target.value);
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
                    setItemStock(+e.target.value);
                  }}
                ></input>
              )}
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
            </div>

            <p>Last updated: {getFormattedDate()}</p>
            <button
              type="submit"
              className="text-lg bg-main-green py-2 px-4 rounded-full"
            >
              Save
            </button>
            <p className="text-md text-main-pink">{error}</p>
          </form>
          {params.item !== "add" && (
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
