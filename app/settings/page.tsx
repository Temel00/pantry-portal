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
  deleteDoc,
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
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteLoc, setDeleteLoc] = useState("");
  const [edit, setEdit] = useState(false);
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
        setDialog(false);
        refreshLocations();
      }
    }
  };

  const confirmDelete = async (location: string) => {
    if (user !== "" && user !== null) {
      const q = query(
        collection(db, "items"),
        where("user", "==", (user as any).uid),
        where("location", "==", location)
      );
      try {
        const docSnap = await getDocs(q);
        if (docSnap.empty) {
          handleDelete(location);
        } else {
          setDeleteDialog(true);
          setDeleteLoc(location);
        }
      } catch (err) {
        console.log(err);
      } finally {
        console.log(locations);
      }
    }
  };

  const handleDelete = async (e: string) => {
    if (user !== "" && user !== null) {
      const loc = e;
      let ar: string[] = [];

      const q = query(
        collection(db, "items"),
        where("user", "==", (user as any).uid),
        where("location", "==", e)
      );

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

        const docSnap = await getDocs(q);
        docSnap.forEach((doc) => {
          deleteDoc(doc.ref);
        });
      } catch (err) {
        console.log(err);
      } finally {
        refreshLocations();
        setDeleteLoc("");
        setDeleteDialog(false);
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

          {deleteDialog && (
            <motion.div
              className="fixed w-full h-full bg-shadow-white-trans pt-24 text-main-black flex justify-center"
              initial={{translateY: window.innerHeight}}
              animate={{translateY: 0}}
            >
              <div className="flex flex-col bg-main-pink h-min text-center p-4 rounded-xl">
                <h2 className="text-lg">
                  Are you sure you want to delete a location that has items?
                </h2>
                <h3 className="text-md">
                  This action will also delete the items in the location
                </h3>
                <div className="flex justify-around mt-4">
                  <button
                    className="border border-shadow-white-trans py-1 px-4 rounded-full"
                    onClick={() => {
                      setDeleteDialog(false);
                      setDeleteLoc("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="border border-shadow-white-trans py-1 px-4 rounded-full"
                    onClick={() => {
                      handleDelete(deleteLoc);
                    }}
                  >
                    Delete Anyway
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
                  {edit ? (
                    <>
                      <input
                        defaultValue={loc}
                        className="bg-transparent locNames"
                      ></input>
                      <button
                        onClick={async () => {
                          console.log(locations);
                          console.log("Mouse Event clicked");
                          const inputElements = document.querySelectorAll(
                            ".locNames"
                          ) as NodeListOf<HTMLInputElement>;
                          let nameArr: string[] = [];

                          // Iterate through the selected input elements and get their values
                          inputElements.forEach(async function (
                            input: HTMLInputElement
                          ) {
                            const value = input.value;
                            const index = nameArr.length;
                            nameArr.push(value);
                            if (locations[index] != value) {
                              console.log(
                                "At index: " + index + " - value: " + value
                              );

                              const q = query(
                                collection(db, "items"),
                                where("user", "==", (user as any).uid),
                                where("location", "==", locations[index])
                              );

                              try {
                                const docSnap = await getDocs(q);
                                docSnap.forEach(async (doc) => {
                                  await updateDoc(doc.ref, {
                                    location: value,
                                  });
                                });
                              } catch (err) {
                                console.log(err);
                              }
                            }
                          });
                          const q = query(
                            collection(db, "locations"),
                            where("user", "==", (user as any).uid)
                          );
                          try {
                            const docSnap = await getDocs(q);
                            docSnap.forEach(async (doc) => {
                              await updateDoc(doc.ref, {
                                locs: nameArr,
                              });
                            });
                          } catch (err) {
                            console.log(err);
                          } finally {
                            setLocations(nameArr);
                          }
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="20"
                          viewBox="0 -960 960 960"
                          width="20"
                          fill="currentColor"
                        >
                          <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
                        </svg>
                      </button>
                      <button
                        className="text-main-pink"
                        onClick={() => {
                          setEdit(false);
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="20"
                          viewBox="0 -960 960 960"
                          width="20"
                          fill="currentColor"
                        >
                          <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="basis-4/5">{loc}</p>
                      <button
                        onClick={() => {
                          setEdit(true);
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="20"
                          viewBox="0 -960 960 960"
                          width="20"
                          fill="currentColor"
                        >
                          <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
                        </svg>
                      </button>
                      <button
                        className="text-main-pink"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                          confirmDelete(
                            e.currentTarget.parentElement?.firstElementChild
                              ?.textContent!
                          );
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
                    </>
                  )}
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
          <video width="300px" autoPlay muted loop>
            <source src="./LoadingVideo_v1.5.webm" type="video/webm"></source>
          </video>
        </div>
      )}
    </main>
  );
}
