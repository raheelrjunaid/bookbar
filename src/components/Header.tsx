import {
  FilePlus,
  Logout,
  Map,
  Menu as MenuIcon,
  Search,
  Settings,
  User,
  UserPlus,
  X,
} from "tabler-icons-react";
import { Menu } from "@headlessui/react";
import Link from "next/link";
import { cloneElement, ReactElement, useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { trpc } from "../utils/trpc";
import Button from "./Button";
import classNames from "classnames";
import Image from "next/image";
import cloudinary from "../utils/cloudinary";

interface NavLinkProps {
  href?: string;
  icon: React.ReactNode;
  label: string;
  callback?: () => void;
}

export const Header = () => {
  const { data: session } = useSession();
  const [navLinks, setNavLinks] = useState<NavLinkProps[]>([]);
  const { data: userData } = trpc.useQuery(["user.getUser"], {
    enabled: !!session,
  });
  const router = useRouter();

  useEffect(() => {
    if (session) {
      setNavLinks([
        {
          label: "Explore",
          href: "/",
          icon: <Map />,
        },
        {
          label: "Add Collection",
          href: "/collection/add",
          icon: <FilePlus />,
        },
        {
          label: "Profile",
          href: `/user/${userData?.slug}`,
          icon: <User />,
        },
        {
          label: "Settings",
          href: "/user/manage",
          icon: <Settings />,
        },
        {
          label: "Logout",
          callback: () => signOut(),
          icon: <Logout />,
        },
      ] as NavLinkProps[]);
    } else {
      setNavLinks([
        {
          label: "Explore",
          href: "/",
          icon: <Map />,
        },
        {
          label: "Log In",
          href: "/auth/signin/",
          icon: <User />,
        },
        {
          label: "Sign Up",
          href: "/auth/signin",
          icon: <UserPlus />,
        },
      ] as NavLinkProps[]);
    }
  }, [session, userData?.slug]);

  return (
    <header className="border-b border-gray-100 bg-white shadow-xl shadow-gray-300/25 ">
      <div className="container flex items-center justify-between gap-5 px-5 py-3">
        <Menu as="div" className="relative md:hidden">
          <Menu.Button className="flex items-center rounded-md text-gray-900 focus:outline-purple-400">
            {({ open }) => (!open ? <MenuIcon /> : <X />)}
          </Menu.Button>

          <Menu.Items className="absolute top-11 z-50 w-max divide-y divide-gray-100 rounded-md border border-gray-100 bg-white shadow-lg shadow-gray-300/50 focus:outline-none">
            {navLinks.map(({ label, href, icon, callback }, index) => (
              <Menu.Item key={index}>
                <NavLink
                  href={href}
                  label={label}
                  icon={icon}
                  callback={callback}
                />
              </Menu.Item>
            ))}
          </Menu.Items>
        </Menu>

        <div className="flex items-center gap-7">
          <Link href="/">
            <div className="w-24 flex-none cursor-pointer">
              <svg
                viewBox="0 0 90 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.7812 17.6133C13.7812 18.5977 13.6133 19.4961 13.2773 20.3086C12.9414 21.1211 12.4844 21.8203 11.9062 22.4062C11.3281 22.9844 10.6484 23.4336 9.86719 23.7539C9.09375 24.0742 8.26172 24.2344 7.37109 24.2344C6.48828 24.2344 5.65625 24.0703 4.875 23.7422C4.10156 23.4141 3.42188 22.957 2.83594 22.3711C2.25781 21.7852 1.80078 21.0898 1.46484 20.2852C1.12891 19.4727 0.960938 18.582 0.960938 17.6133V6.45703H4.17188V12.3164C4.34375 12.0977 4.55078 11.9023 4.79297 11.7305C5.04297 11.5586 5.30859 11.418 5.58984 11.3086C5.87891 11.1992 6.17578 11.1172 6.48047 11.0625C6.78516 11 7.08203 10.9688 7.37109 10.9688C8.26172 10.9688 9.09375 11.1367 9.86719 11.4727C10.6484 11.8008 11.3281 12.2617 11.9062 12.8555C12.4844 13.4492 12.9414 14.1523 13.2773 14.9648C13.6133 15.7695 13.7812 16.6523 13.7812 17.6133ZM10.5586 17.6133C10.5586 17.1289 10.4727 16.6797 10.3008 16.2656C10.1367 15.8438 9.91016 15.4805 9.62109 15.1758C9.33203 14.8711 8.99219 14.6328 8.60156 14.4609C8.21875 14.2891 7.80859 14.2031 7.37109 14.2031C6.93359 14.2031 6.51953 14.3008 6.12891 14.4961C5.74609 14.6836 5.41016 14.9375 5.12109 15.2578C4.83203 15.5703 4.60547 15.9336 4.44141 16.3477C4.27734 16.7539 4.19531 17.1758 4.19531 17.6133C4.19531 18.0977 4.27734 18.5469 4.44141 18.9609C4.60547 19.375 4.83203 19.7344 5.12109 20.0391C5.41016 20.3438 5.74609 20.5859 6.12891 20.7656C6.51953 20.9375 6.93359 21.0234 7.37109 21.0234C7.80859 21.0234 8.21875 20.9375 8.60156 20.7656C8.99219 20.5859 9.33203 20.3438 9.62109 20.0391C9.91016 19.7344 10.1367 19.375 10.3008 18.9609C10.4727 18.5469 10.5586 18.0977 10.5586 17.6133ZM26.9714 17.6133C26.9714 18.5508 26.8034 19.4258 26.4675 20.2383C26.1316 21.043 25.6745 21.7422 25.0964 22.3359C24.5183 22.9219 23.8386 23.3867 23.0573 23.7305C22.2839 24.0664 21.4519 24.2344 20.5612 24.2344C19.6784 24.2344 18.8464 24.0664 18.0652 23.7305C17.2917 23.3867 16.612 22.9219 16.0261 22.3359C15.448 21.7422 14.9909 21.043 14.655 20.2383C14.3191 19.4258 14.1511 18.5508 14.1511 17.6133C14.1511 16.6602 14.3191 15.7773 14.655 14.9648C14.9909 14.1523 15.448 13.4531 16.0261 12.8672C16.612 12.2734 17.2917 11.8086 18.0652 11.4727C18.8464 11.1367 19.6784 10.9688 20.5612 10.9688C21.4519 10.9688 22.2839 11.1289 23.0573 11.4492C23.8386 11.7617 24.5183 12.2109 25.0964 12.7969C25.6745 13.375 26.1316 14.0742 26.4675 14.8945C26.8034 15.707 26.9714 16.6133 26.9714 17.6133ZM23.7487 17.6133C23.7487 17.0977 23.6628 16.6328 23.4909 16.2188C23.3269 15.7969 23.1003 15.4375 22.8112 15.1406C22.5222 14.8359 22.1823 14.6055 21.7917 14.4492C21.4089 14.2852 20.9987 14.2031 20.5612 14.2031C20.1237 14.2031 19.7097 14.2852 19.3191 14.4492C18.9362 14.6055 18.6003 14.8359 18.3112 15.1406C18.03 15.4375 17.8073 15.7969 17.6433 16.2188C17.4792 16.6328 17.3972 17.0977 17.3972 17.6133C17.3972 18.0977 17.4792 18.5469 17.6433 18.9609C17.8073 19.375 18.03 19.7344 18.3112 20.0391C18.6003 20.3438 18.9362 20.5859 19.3191 20.7656C19.7097 20.9375 20.1237 21.0234 20.5612 21.0234C20.9987 21.0234 21.4089 20.9414 21.7917 20.7773C22.1823 20.6133 22.5222 20.3828 22.8112 20.0859C23.1003 19.7891 23.3269 19.4297 23.4909 19.0078C23.6628 18.5859 23.7487 18.1211 23.7487 17.6133ZM40.1498 17.6133C40.1498 18.5508 39.9819 19.4258 39.6459 20.2383C39.31 21.043 38.853 21.7422 38.2748 22.3359C37.6967 22.9219 37.017 23.3867 36.2358 23.7305C35.4623 24.0664 34.6303 24.2344 33.7397 24.2344C32.8569 24.2344 32.0248 24.0664 31.2436 23.7305C30.4702 23.3867 29.7905 22.9219 29.2045 22.3359C28.6264 21.7422 28.1694 21.043 27.8334 20.2383C27.4975 19.4258 27.3295 18.5508 27.3295 17.6133C27.3295 16.6602 27.4975 15.7773 27.8334 14.9648C28.1694 14.1523 28.6264 13.4531 29.2045 12.8672C29.7905 12.2734 30.4702 11.8086 31.2436 11.4727C32.0248 11.1367 32.8569 10.9688 33.7397 10.9688C34.6303 10.9688 35.4623 11.1289 36.2358 11.4492C37.017 11.7617 37.6967 12.2109 38.2748 12.7969C38.853 13.375 39.31 14.0742 39.6459 14.8945C39.9819 15.707 40.1498 16.6133 40.1498 17.6133ZM36.9272 17.6133C36.9272 17.0977 36.8412 16.6328 36.6694 16.2188C36.5053 15.7969 36.2787 15.4375 35.9897 15.1406C35.7006 14.8359 35.3608 14.6055 34.9702 14.4492C34.5873 14.2852 34.1772 14.2031 33.7397 14.2031C33.3022 14.2031 32.8881 14.2852 32.4975 14.4492C32.1147 14.6055 31.7787 14.8359 31.4897 15.1406C31.2084 15.4375 30.9858 15.7969 30.8217 16.2188C30.6577 16.6328 30.5756 17.0977 30.5756 17.6133C30.5756 18.0977 30.6577 18.5469 30.8217 18.9609C30.9858 19.375 31.2084 19.7344 31.4897 20.0391C31.7787 20.3438 32.1147 20.5859 32.4975 20.7656C32.8881 20.9375 33.3022 21.0234 33.7397 21.0234C34.1772 21.0234 34.5873 20.9414 34.9702 20.7773C35.3608 20.6133 35.7006 20.3828 35.9897 20.0859C36.2787 19.7891 36.5053 19.4297 36.6694 19.0078C36.8412 18.5859 36.9272 18.1211 36.9272 17.6133ZM44.422 24H41.1994V6.45703H44.422V17.5195L49.1916 11.4727H52.8713L48.7111 16.6992L52.8713 24H49.1916L46.6486 19.4414L44.422 22.3945V24Z"
                  fill="#1F2937"
                />
                <path
                  d="M65.9794 17.6133C65.9794 18.5977 65.8114 19.4961 65.4755 20.3086C65.1395 21.1211 64.6825 21.8203 64.1044 22.4062C63.5262 22.9844 62.8466 23.4336 62.0653 23.7539C61.2919 24.0742 60.4598 24.2344 59.5692 24.2344C58.6864 24.2344 57.8544 24.0703 57.0731 23.7422C56.2997 23.4141 55.62 22.957 55.0341 22.3711C54.4559 21.7852 53.9989 21.0898 53.663 20.2852C53.327 19.4727 53.1591 18.582 53.1591 17.6133V6.45703H56.37V12.3164C56.5419 12.0977 56.7489 11.9023 56.9911 11.7305C57.2411 11.5586 57.5067 11.418 57.788 11.3086C58.077 11.1992 58.3739 11.1172 58.6786 11.0625C58.9833 11 59.2802 10.9688 59.5692 10.9688C60.4598 10.9688 61.2919 11.1367 62.0653 11.4727C62.8466 11.8008 63.5262 12.2617 64.1044 12.8555C64.6825 13.4492 65.1395 14.1523 65.4755 14.9648C65.8114 15.7695 65.9794 16.6523 65.9794 17.6133ZM62.7567 17.6133C62.7567 17.1289 62.6708 16.6797 62.4989 16.2656C62.3348 15.8438 62.1083 15.4805 61.8192 15.1758C61.5302 14.8711 61.1903 14.6328 60.7997 14.4609C60.4169 14.2891 60.0067 14.2031 59.5692 14.2031C59.1317 14.2031 58.7177 14.3008 58.327 14.4961C57.9442 14.6836 57.6083 14.9375 57.3192 15.2578C57.0302 15.5703 56.8036 15.9336 56.6395 16.3477C56.4755 16.7539 56.3934 17.1758 56.3934 17.6133C56.3934 18.0977 56.4755 18.5469 56.6395 18.9609C56.8036 19.375 57.0302 19.7344 57.3192 20.0391C57.6083 20.3438 57.9442 20.5859 58.327 20.7656C58.7177 20.9375 59.1317 21.0234 59.5692 21.0234C60.0067 21.0234 60.4169 20.9375 60.7997 20.7656C61.1903 20.5859 61.5302 20.3438 61.8192 20.0391C62.1083 19.7344 62.3348 19.375 62.4989 18.9609C62.6708 18.5469 62.7567 18.0977 62.7567 17.6133ZM79.193 24H78.4195L77.1773 22.2773C76.8727 22.5508 76.5484 22.8086 76.2047 23.0508C75.8688 23.2852 75.5133 23.4922 75.1383 23.6719C74.7633 23.8438 74.3766 23.9805 73.9781 24.082C73.5875 24.1836 73.1891 24.2344 72.7828 24.2344C71.9 24.2344 71.068 24.0859 70.2867 23.7891C69.5133 23.4922 68.8336 23.0625 68.2477 22.5C67.6695 21.9297 67.2125 21.2344 66.8766 20.4141C66.5406 19.5938 66.3727 18.6602 66.3727 17.6133C66.3727 16.6367 66.5406 15.7422 66.8766 14.9297C67.2125 14.1094 67.6695 13.4062 68.2477 12.8203C68.8336 12.2344 69.5133 11.7812 70.2867 11.4609C71.068 11.1328 71.9 10.9688 72.7828 10.9688C73.1891 10.9688 73.5914 11.0195 73.9898 11.1211C74.3883 11.2227 74.775 11.3633 75.15 11.543C75.525 11.7227 75.8805 11.9336 76.2164 12.1758C76.5602 12.418 76.8805 12.6797 77.1773 12.9609L78.4195 11.4727H79.193V24ZM75.9703 17.6133C75.9703 17.1758 75.8844 16.7539 75.7125 16.3477C75.5484 15.9336 75.3219 15.5703 75.0328 15.2578C74.7438 14.9375 74.4039 14.6836 74.0133 14.4961C73.6305 14.3008 73.2203 14.2031 72.7828 14.2031C72.3453 14.2031 71.9313 14.2773 71.5406 14.4258C71.1578 14.5742 70.8219 14.793 70.5328 15.082C70.2516 15.3711 70.0289 15.7305 69.8648 16.1602C69.7008 16.582 69.6188 17.0664 69.6188 17.6133C69.6188 18.1602 69.7008 18.6484 69.8648 19.0781C70.0289 19.5 70.2516 19.8555 70.5328 20.1445C70.8219 20.4336 71.1578 20.6523 71.5406 20.8008C71.9313 20.9492 72.3453 21.0234 72.7828 21.0234C73.2203 21.0234 73.6305 20.9297 74.0133 20.7422C74.4039 20.5469 74.7438 20.293 75.0328 19.9805C75.3219 19.6602 75.5484 19.2969 75.7125 18.8906C75.8844 18.4766 75.9703 18.0508 75.9703 17.6133ZM84.1214 24H80.9222V11.4492H81.6956L82.7503 12.9375C83.2659 12.4688 83.8519 12.1094 84.5081 11.8594C85.1644 11.6016 85.8441 11.4727 86.5472 11.4727H89.3714V14.6602H86.5472C86.2113 14.6602 85.8948 14.7227 85.598 14.8477C85.3011 14.9727 85.0433 15.1445 84.8245 15.3633C84.6058 15.582 84.4339 15.8398 84.3089 16.1367C84.1839 16.4336 84.1214 16.75 84.1214 17.0859V24Z"
                  fill="#9333EA"
                />
              </svg>
            </div>
          </Link>
          <Link href="/" passHref>
            <a
              className={classNames(
                router.pathname === "/"
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-900",
                "hidden md:block"
              )}
            >
              Explore
            </a>
          </Link>
          {!!session?.user && (
            <Link href="/collection/add" passHref>
              <a
                className={classNames(
                  router.pathname === "/collection/add"
                    ? "text-gray-900"
                    : "text-gray-500 hover:text-gray-900",
                  "hidden md:block"
                )}
              >
                Add Collection
              </a>
            </Link>
          )}
        </div>
        <div className="flex items-center gap-5">
          {router.pathname.startsWith("/search") ? (
            <div className="relative flex flex-shrink items-center justify-between">
              <input
                type="text"
                className="peer w-full border-0 border-b border-gray-600  py-1 pl-8 transition focus:ring-0"
                placeholder="Search"
                value={router.query.q ?? ""}
                onChange={(e) => {
                  router.push(
                    `/search?q=${encodeURIComponent(e.target.value)}`,
                    `/search?q=${encodeURIComponent(e.target.value)}`,
                    {
                      shallow: true,
                    }
                  );
                }}
              />
              <div className="absolute flex items-center text-gray-900 transition peer-focus:text-purple-500">
                <Search aria-hidden="true" size={22} />
              </div>
            </div>
          ) : (
            <Link href="/search">
              <Search className="cursor-pointer text-gray-800" />
            </Link>
          )}
          {!!session?.user ? (
            <Menu as="div" className="relative hidden md:block">
              <Menu.Button className="flex items-center rounded-md text-gray-900 focus:outline-purple-400">
                <div className="relative aspect-square w-8 cursor-pointer overflow-hidden rounded-full">
                  <Image
                    src={
                      session.user.image ||
                      cloudinary
                        .image(`bookbar/${session.user.id}-profile-image`)
                        .toURL() ||
                      "/image-not-found"
                    }
                    layout="fill"
                    objectPosition="center"
                    objectFit="cover"
                    alt={session.user.name || "User"}
                  />
                </div>
              </Menu.Button>

              <Menu.Items className="absolute right-0 top-11 z-50 w-max divide-y divide-gray-100 rounded-md border border-gray-100 bg-white shadow-lg shadow-gray-300/50 focus:outline-none">
                {navLinks
                  .slice(2)
                  .map(({ label, href, icon, callback }, index) => (
                    <Menu.Item key={index}>
                      <NavLink
                        href={href}
                        label={label}
                        icon={icon}
                        callback={callback}
                      />
                    </Menu.Item>
                  ))}
              </Menu.Items>
            </Menu>
          ) : (
            <div className="hidden items-center gap-3 md:flex">
              <Button variant="outline" onClick={() => signIn()}>
                Log In
              </Button>
              <Button onClick={() => signIn()}>Sign Up</Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const NavLink = ({ href, icon, label, callback }: NavLinkProps) =>
  href ? (
    <Link href={href} passHref>
      <a
        className="flex items-center gap-2 py-3 px-5 text-gray-900 hover:text-gray-700"
        onClick={callback}
      >
        {cloneElement(icon as ReactElement, {
          className: "text-gray-400",
          size: 20,
        })}
        {label}
      </a>
    </Link>
  ) : (
    <div
      className="flex cursor-pointer items-center gap-2 py-3 px-5 text-gray-900 hover:text-gray-700"
      onClick={callback}
    >
      {cloneElement(icon as ReactElement, {
        className: "text-gray-400",
        size: 20,
      })}
      {label}
    </div>
  );

export default Header;
