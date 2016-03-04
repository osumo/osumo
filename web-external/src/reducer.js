
import { compose } from "./utils/reducer";
import globalNav from "./reducer/globalNav";

const root = compose({ globalNav });

export default root;

