import { HomeIcon, UserIcon } from "@heroicons/react/24/solid";
import { signIn, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { trpc } from "../../utils/trpc";
import { CustomIcon } from "../utils";

const Links: { name: string; route: string; icon: CustomIcon }[] = [
  { name: "Home", route: "/", icon: HomeIcon },
];

const NavBar = () => {
  const size = useWindowSize();

  const user = trpc.user.getMe.useQuery();

  const router = useRouter();

  return (
    <nav className="fixed top-0 left-0 flex h-screen w-14 flex-col justify-between overflow-clip bg-gray-200 p-1 shadow-lg transition-width ease-in-out hover:w-36">
      <div>
        <Image src="/static/logo2.png" width={45} height={45} alt="logo" />
      </div>
      <ul className="w-36">
        {Links.map((link) => {
          const Icon = link.icon;
          return (
            <li key={link.name}>
              <Link href={link.route}>
                <div
                  className={`-ml-2 flex flex-row items-center space-x-4 py-2 px-4 transition-colors ease-in-out hover:cursor-pointer hover:bg-white ${
                    router.asPath === link.route && "bg-white"
                  }`}
                >
                  <Icon className="h-8 w-8 text-black" />
                  {size.width && size.width > 768 && <p>{link.name}</p>}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      <div></div>
      <div
        className="mb-5 -ml-2 flex w-36 flex-row items-center space-x-4 py-2 px-4 transition-colors ease-in-out hover:cursor-pointer hover:bg-white"
        onClick={() => (user?.data ? signOut() : signIn())}
      >
        <UserIcon className=" h-8 w-8 p-2 text-black" />
        <p>{user?.data ? "Logout" : "Login"}</p>
      </div>
    </nav>
  );
};

export default NavBar;

// Hook
function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState<{
    width?: number;
    height?: number;
  }>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    // only execute all the code below in client side
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount
  return windowSize;
}
