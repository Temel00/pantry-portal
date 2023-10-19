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
    const itemDate = new Date(+itemUsed);

    return itemDate.toISOString().slice(0, 10);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (user !== "" && user !== null) {
      console.log("handle Submit clicked");
      try {
        await setDoc(doc(db, "items", params.item), {
          name: itemName,
          location: itemLocation,
          total: itemTotal,
          threshold: itemThreshold,
          stock: itemStock,
          lastUsed: itemUsed,
          user: (user as any).uid,
        });
      } catch (err) {
        console.log(err);
      } finally {
        router.push("/");
      }
    }
  };

  if (params.item == "add") {
  }

  return (
    <main className="flex min-h-screen flex-col items-center">
      <Header page={2} />
      <form
        className="flex flex-col items-center mt-4 gap-2"
        onSubmit={handleSubmit}
      >
        <input
          name="name"
          value={itemName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setItemName(e.target.value);
          }}
        ></input>
        <select
          name="location"
          value={itemLocation}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            setItemLocation(e.target.value);
          }}
        >
          {locations.map((loc) => {
            return (
              <option key={loc} value={loc}>
                {loc}
              </option>
            );
          })}
        </select>
        <input
          name="total"
          type="number"
          value={itemTotal}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setItemTotal(+e.target.value);
          }}
        ></input>
        <input
          name="threshold"
          type="number"
          value={itemThreshold}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setItemThreshold(+e.target.value);
          }}
        ></input>
        <input
          name="stock"
          type="number"
          value={itemStock}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setItemStock(+e.target.value);
          }}
        ></input>
        <input
          name="lastUsed"
          type="date"
          value={getFormattedDate()}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setItemUsed(e.target.value);
          }}
        ></input>
        <button type="submit">Save</button>
      </form>
    </main>
  );
}
