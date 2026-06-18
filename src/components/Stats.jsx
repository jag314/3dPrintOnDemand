import { motion } from "framer-motion";

const stats = [

  {
    value: "500+",
    label: "Piezas Fabricadas",
  },

  {
    value: "40+",
    label: "Variantes de Material",
  },

  {
    value: "CR",
    label: "Entrega Nacional",
  },

];

const Stats = () => {

  return (

    <div className="grid grid-cols-3 gap-10 max-w-2xl">

      {stats.map((stat, index) => (

        <motion.div
          key={stat.label}
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.7,
            delay: index * 0.15,
            ease: "easeOut",
          }}
          className="group"
        >

          <h3 className="text-4xl font-black text-violet-400 tracking-tight">

            {stat.value}

          </h3>

          <p className="soft-text mt-2 group-hover:text-white/80 transition duration-300">

            {stat.label}

          </p>

        </motion.div>

      ))}

    </div>

  );

};

export default Stats;