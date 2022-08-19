import {
  Github,
  Linkedin,
  Twitter,
  Youtube,
} from "@icons-pack/react-simple-icons";

const navigation = [
  {
    name: "GitHub",
    href: "https://github.com/raheelrjunaid",
    icon: Github,
  },
  {
    name: "Twitter",
    href: "https://twitter.com/raheelrjunaid",
    icon: Twitter,
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/c/raheeljunaid",
    icon: Youtube,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/raheel-junaid/",
    icon: Linkedin,
  },
];

export const Footer = () => {
  return (
    <footer className="bg-gray-50">
      <div className="container mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-gray-400 !ring-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-offset-2"
            >
              <span className="sr-only">{item.name}</span>
              <item.icon className="h-6 w-6" aria-hidden="true" />
            </a>
          ))}
        </div>
        <div className="mt-8 md:order-1 md:mt-0">
          <p className="text-center text-base text-gray-400">
            &copy; {new Date().getFullYear()} Raheel Junaid. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
