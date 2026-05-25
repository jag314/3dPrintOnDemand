import {
  mobile,
  backend,
  creator,
  web,
  javascript,
  typescript,
  html,
  css,
  reactjs,
  redux,
  tailwind,
  nodejs,
  mongodb,
  git,
  figma,
  docker,
  //tesla,
  a360,
  street,
  pi,
  amazon,
  eat_project,
  threejs,
  _360_project,
  pi_project,
  street_project,
  quiz_project,
  movie_project,
} from "../assets";

export const navLinks = [
  {
    id: "about",
    title: "About",
  },
  {
    id: "work",
    title: "Work",
  },
  {
    id: "contact",
    title: "Contact",
  },
];

const services = [
  {
    title: " Front-end Web Developer",
    icon: web,
  },
  {
    title: "React Developer",
    icon: mobile,
  },
  {
    title: "3D Designer",
    icon: backend,
  },
  {
    title: "Teacher of 3D Print & Design",
    icon: creator,
  },
];

const technologies = [
  {
    name: "HTML 5",
    icon: html,
  },
  {
    name: "CSS 3",
    icon: css,
  },
  {
    name: "JavaScript",
    icon: javascript,
  },
  {
    name: "TypeScript",
    icon: typescript,
  },
  {
    name: "React JS",
    icon: reactjs,
  },
  {
    name: "Redux Toolkit",
    icon: redux,
  },
  {
    name: "Tailwind CSS",
    icon: tailwind,
  },
  {
    name: "Node JS",
    icon: nodejs,
  },
  {
    name: "MongoDB",
    icon: mongodb,
  },
  {
    name: "Three JS",
    icon: threejs,
  },
  {
    name: "git",
    icon: git,
  },
  {
    name: "figma",
    icon: figma,
  },
  {
    name: "docker",
    icon: docker,
  },
];

const experiences = [
  {
    title: " Scalations Specialist ",
    company_name: "Amazon",
    icon: amazon,
    iconBg: "#383E56",
    date: "Jul 2021 - Sep 2023",
    points: [
      "Handling and resolving high-level customer complaints and issues that have been escalated from the frontline customer service team, ensuring customer satisfaction and loyalty.",
      "Leading the customer service team by providing guidance, training, and mentorship, especially in handling difficult situations or complex issues.",
      "Working closely with other departments, such as product, sales, and marketing, to address root causes of customer complaints and implement long-term solutions.1wi",
    ],
  },
  {
    title: " Front-end Developer - Freelancer ",
    company_name: "Pi Design Studios",
    icon: pi,
    iconBg: "#383E56",
    date: "Dec 2021 - Apr 2022",
    points: [
      "Developing an intuitive user interface that guides visitors seamlessly from video selection to purchase, ensuring an excellent user experience.",
      "Setting up and maintaining an eCommerce platform using tools like Shopify or WooCommerce, integrating payment gateways, and ensuring secure transaction processes for customers purchasing explainer videos.",
      "Collaborating with cross-functional teams including SEO experts, marketing strategists, and content producers to enhance the website's visibility and sales potential.",
    ],
  },

  {
    title: " Front-end Developer - Freelancer ",
    company_name: "Ambiente 360",
    icon: a360,
    iconBg: "#E6DEDD",
    date: "Jun 2022 - Nov 2022",
    points: [
      "Leveraging technologies like HTML5, CSS3, jQuery, and JavaScript/TypeScript/React to ensure a dynamic and interactive site interface.",
      "Testing and troubleshooting the website for potential bugs, ensuring secure and smooth transactions for customers.",
      "Implementing responsive design and ensuring cross-browser compatibility.",
      "Tailoring the 360° tour interface to align with brand guidelines, including custom icons, colors, and logos.",
    ],
  },
  {
    title: "Full Stack Developer - Freelancer",
    company_name: "Street Visual",
    icon: street,
    iconBg: "#383E56",
    date: "July 2023 - Currently Working on it",
    points: [
      "Designing and implementing the e-commerce platform using WordPress CMS, Shopify, or other specialized solutions.",
      "Integrating product listings, inventory management, and payment gateways to facilitate online transactions.",
      "Implementing responsive design and ensuring cross-browser compatibility.",
      "Working closely with UX/UI designers to create an intuitive and user-friendly shopping experience for customers.",
    ],
  },
];

const testimonials = [
  {
    testimonial:
      "I thought it was impossible to make a website as beautiful as our product, but Jonathan proved me wrong.",
    name: "Sara Lee",
    designation: "CFO",
    company: "Street Visual",
    image: "https://randomuser.me/api/portraits/women/4.jpg",
  },
  {
    testimonial:
      "I've never met a web developer who truly cares about their clients' success like Jonathan does.",
    name: "Chris Brown",
    designation: "COO",
    company: "Pi Design Studios",
    image: "https://randomuser.me/api/portraits/men/5.jpg",
  },
  {
    testimonial:
      "After Rick optimized our website, our traffic increased by 50%. We can't thank them enough!",
    name: "Lisa Wang",
    designation: "CTO",
    company: "Ambiente 360",
    image: "https://randomuser.me/api/portraits/women/6.jpg",
  },
];

const projects = [
  {
    name: "Street Visual Ecommerce",
    description:
      "I am currently working on the development of an online store for Street Visual, urban art supplies will be sold, so I am working on a modern and attractive design with all the features of an e-commerce.",

    tags: [
      {
        name: "react",
        color: "blue-text-gradient",
      },
      {
        name: "PHP",
        color: "blue-text-gradient",
      },
      {
        name: "Bootstrap",
        color: "blue-text-gradient",
      },
      {
        name: "Javascript",
        color: "green-text-gradient",
      },
      {
        name: "tailwind",
        color: "pink-text-gradient",
      },

      {
        name: "HTML",
        color: "pink-text-gradient",
      },
      {
        name: "git",
        color: "pink-text-gradient",
      },
    ],
    image: street_project,
    source_code_link: "https://streetvisualcr.com/inicio-2/",
  },
  {
    name: "Ambiente 360 - Virtual Tour",
    description:
      "My client wanted to give the dynamism of a 360 tour to his website, so I integrated a virtual tour using JavaScript and CSS.",
    tags: [
      {
        name: "Javascript",
        color: "blue-text-gradient",
      },
      {
        name: "git",
        color: "pink-text-gradient",
      },
      {
        name: "PHP",
        color: "green-text-gradient",
      },
      {
        name: "restapi",
        color: "green-text-gradient",
      },
      {
        name: "HTML",
        color: "pink-text-gradient",
      },
      {
        name: "CSS3",
        color: "pink-text-gradient",
      },
    ],
    image: _360_project,
    source_code_link: "https://www.ambiente360.com/",
  },
  {
    name: "Pi - Explainer Videos",
    description:
      "My client sells explainer videos for software companies so I designed and programmed the page to show the services in a versatile and intuitive way.",
    tags: [
      {
        name: "Javascript,",
        color: "blue-text-gradient",
      },
      {
        name: "git",
        color: "pink-text-gradient",
      },
      {
        name: "PHP",
        color: "green-text-gradient",
      },
      {
        name: "HTML",
        color: "pink-text-gradient",
      },

      {
        name: "PHP",
        color: "green-text-gradient",
      },
      {
        name: "Bootstrap",
        color: "pink-text-gradient",
      },
      {
        name: "tailwind",
        color: "pink-text-gradient",
      },
    ],
    image: pi_project,
    source_code_link: "https://pidesignstudios.com/",
  },
  {
    name: "Eat-Split",
    description:
      "This React project consists of a web application to divide the bill amount between friends.",
    tags: [
      {
        name: "HTML",
        color: "pink-text-gradient",
      },
      {
        name: "git",
        color: "pink-text-gradient",
      },
      {
        name: "react",
        color: "blue-text-gradient",
      },

      {
        name: "supabase",
        color: "green-text-gradient",
      },
      {
        name: "tailWind",
        color: "pink-text-gradient",
      },
    ],
    image: eat_project,
    source_code_link: "https://github.com/jag314/eat-n-split-.git",
  },
  {
    name: "React Quiz",
    description: "React Quiz for using at Schools or any major institution",
    tags: [
      {
        name: "react",
        color: "blue-text-gradient",
      },
      {
        name: "git",
        color: "pink-text-gradient",
      },

      {
        name: "HTML",
        color: "pink-text-gradient",
      },

      {
        name: "supabase",
        color: "green-text-gradient",
      },
      {
        name: "tailWind",
        color: "pink-text-gradient",
      },
    ],
    image: quiz_project,
    source_code_link: "https://github.com/jag314/react-quiz.git",
  },
  {
    name: "Pop Corn Movie- App",
    description: "React App for helping people rate and look for movies.",
    tags: [
      {
        name: "react",
        color: "blue-text-gradient",
      },
      {
        name: "git",
        color: "pink-text-gradient",
      },
      {
        name: "HTML",
        color: "pink-text-gradient",
      },

      {
        name: "supabase",
        color: "green-text-gradient",
      },
      {
        name: "tailWind",
        color: "pink-text-gradient",
      },
    ],
    image: movie_project,
    source_code_link: "https://github.com/jag314/react-quiz.git",
  },
];

export { services, technologies, experiences, testimonials, projects };
