"use client";
import Header from "@/components/header";
import useAuth from "../../hooks/useAuth";
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
import {db} from "../../firebase";
import Link from "next/link";
import {motion} from "framer-motion";

export default function Settings() {
  const {isLoggedIn, user} = useAuth();
  const [locations, setLocations] = useState<string[]>([]);
  const [dialog, setDialog] = useState(false);
  const [id, setId] = useState("");

  useEffect(() => {
    refreshLocations();
  }, [user]);

  const refreshLocations = async () => {
    if (user !== "" && user !== null) {
      const q = query(
        collection(db, "locations"),
        where("user", "==", (user as any).uid)
      );
      try {
        const docSnap = await getDocs(q);
        docSnap.forEach((doc) => {
          setLocations(doc.data().locs);
          setId(doc.id);
        });
      } catch (err) {
        console.log(err);
      } finally {
        console.log(locations);
      }
    }
  };

  const handleAdd = async () => {
    if (user !== "" && user !== null) {
      const locName = (
        document.getElementById("locName") as HTMLInputElement | null
      )?.value!;
      let ar: string[] = [];
      ar.push(locName);
      locations.forEach((location) => {
        ar.push(location);
      });

      try {
        await setDoc(doc(db, "locations", id), {
          locs: ar,
          user: (user as any).uid,
        });
      } catch (err) {
        console.log(err);
      } finally {
        refreshLocations();
      }
    }
  };

  const handleDelete = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    if (user !== "" && user !== null) {
      const loc = e.currentTarget.parentElement?.firstElementChild?.textContent;
      let ar: string[] = [];
      locations.forEach((location) => {
        if (loc != location) {
          ar.push(location);
        }
      });
      try {
        await setDoc(doc(db, "locations", id), {
          locs: ar,
          user: (user as any).uid,
        });
      } catch (err) {
        console.log(err);
      } finally {
        refreshLocations();
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center">
      <Header page={2} />
      {isLoggedIn && user != null && user != "" ? (
        <>
          {dialog && (
            <motion.div
              className="fixed w-full h-full bg-shadow-white-trans pt-24 text-main-black flex justify-center"
              initial={{translateY: window.innerHeight}}
              animate={{translateY: 0}}
            >
              <div className="flex flex-col bg-main-pink h-min text-center p-4 rounded-xl">
                <h2 className="text-lg">Add Location</h2>
                <div className="flex gap-1 items-center">
                  <label htmlFor="locName">Name:</label>
                  <input
                    id="locName"
                    name="locName"
                    className="text-sm bg-transparent border border-shadow-white-trans rounded-lg px-1"
                  ></input>
                </div>

                <div className="flex justify-around mt-4">
                  <button
                    className="border border-shadow-white-trans py-1 px-4 rounded-full"
                    onClick={() => setDialog(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="border border-shadow-white-trans py-1 px-4 rounded-full"
                    onClick={handleAdd}
                  >
                    Add
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          <h1 className="text-3xl text-main-black mt-4">Settings</h1>
          <div className="bg-main-black p-4 rounded-xl text-main-white text-xl">
            {locations.map((loc) => {
              return (
                <div
                  key={loc}
                  className="flex justify-between items-center w-80 border-b border-shadow-white-trans mb-2"
                >
                  <p>{loc}</p>
                  <button
                    className="text-main-pink"
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      handleDelete(e);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="20"
                      viewBox="0 -960 960 960"
                      width="20"
                      fill="currentColor"
                    >
                      <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center rounded-b-full bg-dark-pink w-14">
            <button
              className="flex rounded-full justify-center items-center text-3xl p-7 w-12 h-12 bg-main-pink text-main-black shadow-xl border-4 border-dark-pink mt-8"
              onClick={() => setDialog(true)}
            >
              +
            </button>
          </div>
        </>
      ) : (
        <div>
          <h2>Please log in to view pantry</h2>
        </div>
      )}
    </main>
  );
}
