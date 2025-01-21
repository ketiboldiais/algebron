import { Img } from "./Fig";
import tetrahedral_die_roll1 from "../../public/diagrams/tetrahedral_die_roll1.svg";
import tetrahedral_die_roll2 from "../../public/diagrams/tetrahedral_die_roll2.svg";
import tetrahedral_tree from "../../public/diagrams/tetrahedral_tree.svg";
import unit_square from "../../public/diagrams/unit_square.svg";
import bullseye from "../../public/diagrams/bullseye.svg";
import events from "../../public/diagrams/events.svg";

export const Tetrahedral1 = () => (
  <Img width={120} url={tetrahedral_die_roll1} alt="tetrahedral die roll grid" />
);

export const Tetrahedral2 = () => (
  <Img width={120} url={tetrahedral_die_roll2} alt="tetrahedral die roll, rolled 2 then a 3" />
);

export const TetraTree = () => (
  <Img width={400} url={tetrahedral_tree} alt="tetrahedral die roll, rolled 2 then a 3, tree diagram" />
);

export const UnitSquare = () => (
  <Img width={180} url={unit_square} alt="tetrahedral die roll, rolled 2 then a 3, tree diagram" />
);

export const BullsEye = () => (
  <Img width={100} url={bullseye} alt="circular target, bull's eye" />
);

export const Events = () => (
  <Img width={150} url={events} alt="events as subsets" />
);



