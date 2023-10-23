import Link from "next/link";
import Auth from "./auth";

type headerProps = {
  page: number;
};

const Header = (props: headerProps) => {
  const renderLink = () => {
    switch (props.page) {
      case 1: {
        return (
          <Link href="/settings" className="basis-1/4 text-main-white px-4">
            <svg
              className="bg-shadow-white rounded-lg p-2"
              xmlns="http://www.w3.org/2000/svg"
              height="50"
              viewBox="0 -960 960 960"
              width="50"
              fill="currentColor"
            >
              <path d="M480-120q-17 0-28.5-11.5T440-160v-160q0-17 11.5-28.5T480-360q17 0 28.5 11.5T520-320v40h280q17 0 28.5 11.5T840-240q0 17-11.5 28.5T800-200H520v40q0 17-11.5 28.5T480-120Zm-320-80q-17 0-28.5-11.5T120-240q0-17 11.5-28.5T160-280h160q17 0 28.5 11.5T360-240q0 17-11.5 28.5T320-200H160Zm160-160q-17 0-28.5-11.5T280-400v-40H160q-17 0-28.5-11.5T120-480q0-17 11.5-28.5T160-520h120v-40q0-17 11.5-28.5T320-600q17 0 28.5 11.5T360-560v160q0 17-11.5 28.5T320-360Zm160-80q-17 0-28.5-11.5T440-480q0-17 11.5-28.5T480-520h320q17 0 28.5 11.5T840-480q0 17-11.5 28.5T800-440H480Zm160-160q-17 0-28.5-11.5T600-640v-160q0-17 11.5-28.5T640-840q17 0 28.5 11.5T680-800v40h120q17 0 28.5 11.5T840-720q0 17-11.5 28.5T800-680H680v40q0 17-11.5 28.5T640-600Zm-480-80q-17 0-28.5-11.5T120-720q0-17 11.5-28.5T160-760h320q17 0 28.5 11.5T520-720q0 17-11.5 28.5T480-680H160Z" />
            </svg>
          </Link>
        );
      }
      case 2: {
        return (
          <Link href="/" className="basis-1/4 text-main-white px-4">
            <svg
              className="bg-shadow-white rounded-lg p-2"
              xmlns="http://www.w3.org/2000/svg"
              height="50"
              viewBox="0 -960 960 960"
              width="50"
              fill="currentColor"
            >
              <path d="M160-200v-295l-40 31q-14 10-30 8t-26-16q-10-14-8-30t15-26l89-68v-84q0-17 11.5-28.5T200-720q17 0 28.5 11.5T240-680v23l191-146q22-17 49-17t49 17l360 275q13 10 15 26t-8 30q-10 13-26 15t-29-8l-41-30v295q0 33-23.5 56.5T720-120H240q-33 0-56.5-23.5T160-200Zm80 0h200v-120q0-17 11.5-28.5T480-360q17 0 28.5 11.5T520-320v120h200v-356L480-739 240-556v356Zm0 0h480-480Zm-28-560q-23 0-35.5-19t-1.5-39q17-29 44.5-45.5T280-880q11 0 21-5.5t15-15.5q5-9 13.5-14t19.5-5q23 0 35 19t1 39q-17 29-44.5 45.5T280-800q-11 0-21 5t-15 16q-5 9-13 14t-19 5Z" />
            </svg>
          </Link>
        );
      }
    }
  };

  return (
    <>
      <header className="bg-main-black w-full flex flex-row items-center">
        {renderLink()}
        <h1 className="text-3xl text-main-green basis-1/2 text-center text-main-white">
          Pantry Portal
        </h1>
        <div className="basis-1/4">
          <div className="bg-main-pink">
            <div className="bg-main-green rounded-tr-3xl">
              <div className=" py-2 bg-main-black rounded-tr-full">
                <Auth />
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
